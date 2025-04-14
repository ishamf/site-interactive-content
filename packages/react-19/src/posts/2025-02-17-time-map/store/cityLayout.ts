import { StateCreator } from 'zustand';
import {
  AppSelection,
  AppState,
  BoxRect,
  BoxRectKey,
  boxRectKeys,
  BoxSize,
  CityDisplayItem,
  CityDisplayState,
  LabelPosition,
  labelPositions,
  Mutators,
} from './types';
import { arrayMove } from '@dnd-kit/sortable';
import { offsetsByPosition } from '../constants';

export const createCityLayoutSlice: StateCreator<AppState, Mutators, [], CityDisplayState> = (
  set,
  get
) => ({
  containerSize: null,

  displayItemById: {},
  obstructions: [],

  setObstructions(obstructions) {
    set({ obstructions });

    get().queueRecalculatePositions();
  },

  registerContainerSize(size) {
    set({ containerSize: size });

    get().queueRecalculatePositions();
  },

  registerDisplayItem(rowId, item) {
    let isChanged = false;

    set((state) => {
      if (item) {
        const currentItem = state.displayItemById[rowId];

        if (currentItem && currentItem.city === item.city && currentItem.size === item.size) {
          return state;
        }

        isChanged = true;

        return {
          displayItemById: {
            ...state.displayItemById,
            [rowId]: {
              rowId,
              city: item.city,
              size: item.size,
              labelPosition: state.displayItemById[rowId]?.labelPosition ?? null,
              intersections: state.displayItemById[rowId]?.intersections ?? [],
              potentialSpaceIntersections:
                state.displayItemById[rowId]?.potentialSpaceIntersections ?? [],
            },
          },
        };
      } else {
        const { [rowId]: _, ...rest } = state.displayItemById;

        isChanged = true;

        return { displayItemById: rest };
      }
    });

    if (isChanged) {
      // console.log('Registering display item:', rowId, item);
      get().queueRecalculatePositions();
    }
  },

  // If the queueRecalculatePositions is called multiple times in a row,
  // we only want to call recalculatePositions twice, once at start and once at end
  queueRecalculatePositions: (() => {
    let state: 'idle' | 'calledOnce' | 'pendingEndCall' = 'idle';
    return () => {
      if (state === 'calledOnce') {
        state = 'pendingEndCall';
        return;
      }

      if (state === 'pendingEndCall') {
        return;
      }

      get().recalculatePositions();

      state = 'calledOnce';

      setTimeout(() => {
        if (state === 'pendingEndCall') {
          get().recalculatePositions();
        }
        state = 'idle';
      }, 0);
    };
  })(),

  recalculatePositions() {
    // const start = performance.now();
    const { obstructions, containerSize, selectedItems, displayItemById } = get();

    if (!containerSize) {
      return;
    }

    const newDisplayItemById = recalculatePositions({
      containerSize,
      obstructions,
      selectedItems,
      displayItemById,
    });

    // console.log('Recalculation done, time:', performance.now() - start);

    set({
      displayItemById: newDisplayItemById,
    });
  },
});

function recalculatePositions({
  containerSize,
  obstructions,
  selectedItems,
  displayItemById,
}: {
  selectedItems: AppSelection[];
  containerSize: BoxSize;
  displayItemById: Record<string, CityDisplayItem | undefined>;
  obstructions: BoxRect[];
}): Record<string, CityDisplayItem | undefined> {
  const newDisplayItems = selectedItems
    .filter((x) => x.itemId)
    .map((x) => displayItemById[x.rowId])
    .map(
      (x): CityDisplayItem | undefined =>
        x && { ...x, hidden: undefined, labelPosition: null, intersections: [] }
    );

  const newDisplayItemById = newDisplayItems.reduce(
    (acc, item) => {
      if (item) {
        acc[item.rowId] = item;
      }
      return acc;
    },
    {} as Record<string, CityDisplayItem | undefined>
  );

  // Hide based on duplicates
  const seenItemIds = new Set<string>();
  const duplicatedRowIds = new Set<string>();
  for (const item of newDisplayItems) {
    if (!item) continue;

    if (seenItemIds.has(item.city.id)) {
      duplicatedRowIds.add(item.rowId);
    } else {
      seenItemIds.add(item.city.id);
    }
  }

  const uniqueDisplayItems = newDisplayItems.filter(
    (item): item is CityDisplayItem => !!item && !duplicatedRowIds.has(item.rowId)
  );

  const { result, blockedItems } = iterativelyOptimizeLabelState({
    containerSize,
    items: uniqueDisplayItems,
    obstructions,
  });

  const resultItemByID = result.reduce(
    (acc, item) => {
      acc[item.rowId] = item;

      return acc;
    },
    {} as Record<string, CityDisplayItem | undefined>
  );

  const resolvedBlockedItems = resolveBlockedItems({
    blockedItems,
    containerSize,
    items: uniqueDisplayItems,
    obstructions,
  });

  for (const item of newDisplayItems) {
    if (!item) continue;

    const currentItem = resultItemByID[item.rowId];
    if (currentItem) {
      item.labelPosition = currentItem.labelPosition;
      item.intersections = currentItem.intersections;
    }

    if (resolvedBlockedItems.has(item.rowId)) {
      const reasonRowId = resolvedBlockedItems.get(item.rowId)?.reasonRowId;

      item.hidden = {
        reason: 'intersect',
        intersectingLabel: reasonRowId && newDisplayItemById[reasonRowId]?.city.label,
      };
    } else if (duplicatedRowIds.has(item.rowId)) {
      item.hidden = { reason: 'duplicate' };
    }
  }

  return newDisplayItemById;
}

function getLabelRect(
  containerSize: BoxSize,
  displayItem: Omit<CityDisplayItem, 'labelPosition'>,
  position: BoxRectKey
) {
  const cityX = (displayItem.city.longitude / 360 + 0.5) * containerSize.width;
  const cityY = (displayItem.city.latitude / -180 + 0.5) * containerSize.height;

  const {
    top: offsetTop = 0,
    left: offsetLeft = 0,
    right: offsetRight = 0,
    bottom: offsetBottom = 0,
  } = position === 'potential' ? {} : offsetsByPosition[position];

  const deltaX = offsetLeft - offsetRight;
  const deltaY = offsetTop - offsetBottom;

  switch (position) {
    case 'topleft':
      return {
        left: cityX - displayItem.size.width + deltaX,
        top: cityY - displayItem.size.height + deltaY,
        ...displayItem.size,
      };
    case 'topright':
      return {
        left: cityX + deltaX,
        top: cityY - displayItem.size.height + deltaY,
        ...displayItem.size,
      };
    case 'bottomleft':
      return {
        left: cityX - displayItem.size.width + deltaX,
        top: cityY + deltaY,
        ...displayItem.size,
      };
    case 'bottomright':
      return {
        left: cityX + deltaX,
        top: cityY + deltaY,
        ...displayItem.size,
      };
    case 'left':
      return {
        left: cityX - displayItem.size.width + deltaX,
        top: cityY - displayItem.size.height / 2 + deltaY,
        ...displayItem.size,
      };
    case 'top':
      return {
        left: cityX - displayItem.size.width / 2 + deltaX,
        top: cityY - displayItem.size.height + deltaY,
        ...displayItem.size,
      };
    case 'right':
      return {
        left: cityX + deltaX,
        top: cityY - displayItem.size.height / 2 + deltaY,
        ...displayItem.size,
      };
    case 'bottom':
      return {
        left: cityX - displayItem.size.width / 2 + deltaX,
        top: cityY + deltaY,
        ...displayItem.size,
      };
    case 'potential':
      return {
        left: cityX - displayItem.size.width,
        top: cityY - displayItem.size.height,
        width: displayItem.size.width * 2,
        height: displayItem.size.height * 2,
      };
  }
}

function getBoxIntersection(box1: BoxRect, box2: BoxRect): number {
  const xOverlap = Math.max(
    0,
    Math.min(box1.left + box1.width, box2.left + box2.width) - Math.max(box1.left, box2.left)
  );
  const yOverlap = Math.max(
    0,
    Math.min(box1.top + box1.height, box2.top + box2.height) - Math.max(box1.top, box2.top)
  );
  return xOverlap * yOverlap;
}

function calculateItemCost({
  containerSize,
  obstructions,
  currentItem,
  currentItemIndex,
  currentItemPosition,
  allItems,
  allItemPositions,
  ignorePotential,
}: {
  containerSize: BoxSize;
  obstructions: BoxRect[];
  currentItem: BoxRect;
  currentItemIndex: number;
  currentItemPosition: LabelPosition;
  allItems: Record<BoxRectKey, BoxRect[]>;
  allItemPositions: LabelPosition[];
  ignorePotential: boolean;
}) {
  let cost = 0;

  // Cost to prefer certain display positions if there's no intersections,
  // since they just look better (subjectively)
  if (
    currentItemPosition === 'left' ||
    currentItemPosition === 'top' ||
    currentItemPosition === 'bottom' ||
    currentItemPosition === 'right'
  ) {
    cost += 5;
  } else if (currentItemPosition === 'topleft' || currentItemPosition === 'topright') {
    cost += 2;
  }

  // Cost for intersection with other items. This has the biggest effect for
  // items that are actually intersecting with each other, but it
  // also has a lesser effect with the "potential position" of the other items,
  // to open up more positions for items that are actually intersecting
  for (let i = 0; i < allItemPositions.length; i++) {
    if (i === currentItemIndex) {
      continue;
    }

    const actualIntersection = getBoxIntersection(currentItem, allItems[allItemPositions[i]][i]);

    cost +=
      actualIntersection * 10 +
      (ignorePotential ? 0 : getBoxIntersection(currentItem, allItems['potential'][i]) * 1);
  }

  // Cost for intersection with obstructions
  for (const obstruction of obstructions) {
    const obstructionIntersection = getBoxIntersection(currentItem, obstruction);
    if (obstructionIntersection > 0) {
      cost += obstructionIntersection * 50;
    }
  }

  // Cost for going out of bounds
  cost +=
    (currentItem.width * currentItem.height -
      getBoxIntersection(currentItem, { left: 0, top: 0, ...containerSize })) *
    1000;

  return cost;
}

type CandidateAction = {
  costDelta: number;
  index: number;
  position: LabelPosition;
};

/**
 * Greedy algorithm to optimize label displays
 */
function optimizeLabelDisplays({
  containerSize,
  items,
  obstructions,
  resetPositionsAtStart = true,
  usePreferredPositionPass = true,
}: {
  containerSize: BoxSize;
  items: CityDisplayItem[];
  obstructions: BoxRect[];
  resetPositionsAtStart?: boolean;
  usePreferredPositionPass?: boolean;
}): CityDisplayItem[] {
  // const start = performance.now();

  const boxRectsByPosition = boxRectKeys.reduce(
    (acc, position) => {
      acc[position] = items.map((item) => getLabelRect(containerSize, item, position));
      return acc;
    },
    {} as Record<BoxRectKey, BoxRect[]>
  );
  const itemLabelPositions: LabelPosition[] = resetPositionsAtStart
    ? Array(items.length).fill('bottomright')
    : items.map((item) => item.labelPosition ?? 'bottomright');

  const n = items.length;
  const maxIters = Math.max(n * 3, 20);
  let iter = 0;
  let ignorePotential = false;

  for (iter = 0; iter < maxIters; iter++) {
    let bestCandidateAction: CandidateAction | null = null;

    for (let i = 0; i < n; i++) {
      const currentPosition = itemLabelPositions[i];
      const currentCost = calculateItemCost({
        containerSize,
        obstructions,
        currentItem: boxRectsByPosition[currentPosition][i],
        currentItemIndex: i,
        currentItemPosition: currentPosition,
        allItems: boxRectsByPosition,
        allItemPositions: itemLabelPositions,
        ignorePotential,
      });

      if (currentCost === 0) continue;

      for (const candidatePosition of labelPositions) {
        if (candidatePosition === currentPosition) {
          continue;
        }

        const candidateCost = calculateItemCost({
          containerSize,
          obstructions,
          currentItem: boxRectsByPosition[candidatePosition][i],
          currentItemIndex: i,
          currentItemPosition: candidatePosition,
          allItems: boxRectsByPosition,
          allItemPositions: itemLabelPositions,
          ignorePotential,
        });

        const costDelta = candidateCost - currentCost;

        // console.log(
        //   'Cost of moving ',
        //   items[i].city.label,
        //   'from',
        //   currentPosition,
        //   'to',
        //   candidatePosition,
        //   costDelta
        // );

        if (costDelta < 0 && (!bestCandidateAction || costDelta < bestCandidateAction.costDelta)) {
          bestCandidateAction = { costDelta, index: i, position: candidatePosition };
        }
      }
    }

    // console.log('Best candidate action:', bestCandidateAction);

    if (!bestCandidateAction) {
      // Run the algorithm again while ignoring potential intersections
      // to reduce the usage of non-preferred positions
      if (!ignorePotential && usePreferredPositionPass) {
        ignorePotential = true;
        continue;
      }

      break;
    }

    itemLabelPositions[bestCandidateAction.index] = bestCandidateAction.position;
  }

  // console.log('Optimization iterations:', iter, 'Time:', performance.now() - start);

  return items.map((item, i) => ({
    ...item,
    labelPosition: itemLabelPositions[i],
    intersections: items
      .filter((_, j) => {
        if (i === j) {
          return false;
        }

        const currentItem = boxRectsByPosition[itemLabelPositions[i]][i];
        const otherItemRect = boxRectsByPosition[itemLabelPositions[j]][j];

        return (
          getBoxIntersection(currentItem, otherItemRect) >
          currentItem.width * currentItem.height * 0.05
        );
      })
      .map((x) => x.rowId),
    potentialSpaceIntersections: items
      .filter((_, j) => {
        if (i === j) {
          return false;
        }

        const currentItem = boxRectsByPosition['potential'][i];
        const otherItemRect = boxRectsByPosition['potential'][j];

        return getBoxIntersection(currentItem, otherItemRect) > 0;
      })
      .map((x) => x.rowId),
  }));
}

function computeBlockedRowIds(displayItems: CityDisplayItem[]) {
  const renderedRowIds = new Set<string>();
  const blockedRowIds = new Set<string>();

  for (const item of displayItems) {
    if (item.intersections.filter((x) => renderedRowIds.has(x)).length > 0) {
      blockedRowIds.add(item.rowId);
    } else {
      renderedRowIds.add(item.rowId);
    }
  }

  return blockedRowIds;
}

type BlockedItems = Map<string, { reasonRowId?: string }>;

function iterativelyOptimizeLabelState({
  containerSize,
  items,
  obstructions,
}: {
  containerSize: BoxSize;
  items: CityDisplayItem[];
  obstructions: BoxRect[];
}): { result: CityDisplayItem[]; blockedItems: BlockedItems } {
  const blockedItems: BlockedItems = new Map();

  let currentItems: CityDisplayItem[] = [];

  const pastItems: CityDisplayItem[] = [];

  // Add items one by one, skip it if it causes a block
  for (const item of items) {
    const newCurrentItems = optimizeLabelDisplays({
      containerSize,
      items: [...currentItems, item],
      obstructions,
    });

    const blockedRowIds = computeBlockedRowIds(newCurrentItems);

    if (blockedRowIds.size > 0) {
      const computedItem = newCurrentItems.find((x) => x.rowId === item.rowId);

      const blockReason =
        computedItem &&
        pastItems.findLast((x) => computedItem.potentialSpaceIntersections.includes(x.rowId))
          ?.rowId;

      blockedItems.set(item.rowId, { reasonRowId: blockReason });
    } else {
      currentItems = newCurrentItems;
      pastItems.push(item);
    }
  }

  return {
    result: currentItems,
    blockedItems: blockedItems,
  };
}

/**
 * Resolve blocked items by trying the movement until they are unblocked
 */
function resolveBlockedItems({
  blockedItems,
  containerSize,
  items,
  obstructions,
}: {
  blockedItems: BlockedItems;
  containerSize: BoxSize;
  items: CityDisplayItem[];
  obstructions: BoxRect[];
}) {
  const newBlockedItems = new Map(blockedItems.entries());

  for (const [key, initialTarget] of blockedItems.entries()) {
    let target = initialTarget.reasonRowId;

    for (let iteration = 0; iteration < items.length; iteration++) {
      if (!target) break;

      const currentIndex = items.findIndex((item) => item.rowId === key);
      const targetIndex = items.findIndex((item) => item.rowId === target);

      if (currentIndex === -1 || targetIndex === -1) {
        break;
      }

      const newItems = arrayMove(items, currentIndex, targetIndex);

      const { blockedItems } = iterativelyOptimizeLabelState({
        containerSize,
        obstructions,
        items: newItems,
      });

      const newTarget = blockedItems.get(key);

      if (!newTarget) {
        break;
      } else {
        target = newTarget.reasonRowId;
      }
    }

    newBlockedItems.set(key, { reasonRowId: target });
  }

  return newBlockedItems;
}
