import { useRef } from 'react';
import { create } from 'zustand';
import { CitySelectionData } from '../../assets';

const labelPositions = ['topleft', 'topright', 'bottomleft', 'bottomright'] as const;
export type LabelPosition = (typeof labelPositions)[number];

export type BoxSize = { width: number; height: number };

type BoxRect = BoxSize & { left: number; top: number };

type DisplayItem = {
  rowId: string;
  city: CitySelectionData;
  labelPosition: LabelPosition | null;
  size: BoxSize;
};

interface CityDisplayStore {
  containerSize: BoxSize | null;
  displayItemById: Record<string, DisplayItem>;
  registerContainerSize(size: BoxSize): void;
  registerDisplayItem(rowId: string, item: { size: BoxSize; city: CitySelectionData } | null): void;
  queueRecalculatePositions(): void;
  recalculatePositions(): void;
}

function createStore() {
  return create<CityDisplayStore>()((set, get) => ({
    containerSize: null,

    displayItemById: {},

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
      if (!this.containerSize) {
        return;
      }

      const optimizedDisplayItems = optimizeLabelDisplays(
        this.containerSize,
        Object.values(get().displayItemById)
      );

      set({
        displayItemById: optimizedDisplayItems.reduce(
          (acc, item) => {
            acc[item.rowId] = item;
            return acc;
          },
          {} as Record<string, DisplayItem>
        ),
      });
    },
  }));
}

export function useCityDisplayStore() {
  const storeRef = useRef<ReturnType<typeof createStore>>(null);

  if (!storeRef.current) {
    storeRef.current = createStore();
  }

  return storeRef.current();
}

function getLabelRect(
  containerSize: BoxSize,
  displayItem: Omit<DisplayItem, 'labelPosition'>,
  position: LabelPosition
) {
  const cityX = (displayItem.city.longitude / 360 + 0.5) * containerSize.width;
  const cityY = (displayItem.city.latitude / -180 + 0.5) * containerSize.height;

  switch (position) {
    case 'topleft':
      return {
        left: cityX - displayItem.size.width,
        top: cityY - displayItem.size.height,
        ...displayItem.size,
      };
    case 'topright':
      return {
        left: cityX,
        top: cityY - displayItem.size.height,
        ...displayItem.size,
      };
    case 'bottomleft':
      return {
        left: cityX - displayItem.size.width,
        top: cityY,
        ...displayItem.size,
      };
    case 'bottomright':
      return {
        left: cityX,
        top: cityY,
        ...displayItem.size,
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

function calculateItemCost(
  containerSize: BoxSize,
  currentItem: BoxRect,
  currentItemIndex: number,
  currentItemPosition: LabelPosition,
  allItems: Record<LabelPosition, BoxRect[]>,
  allItemPositions: LabelPosition[]
) {
  let cost = 0;

  // Cost to prefer bottom right display if there's no intersections
  if (currentItemPosition === 'topleft' || currentItemPosition === 'topright') {
    cost += 2;
  } else if (currentItemPosition === 'bottomleft') {
    cost += 1;
  }

  // Cost for intersection with other items. This has the biggest effect for
  // items that are actually intersecting with each other, but it
  // also has a lesser effect with the "potential position" of the other items,
  // to open up more positions for items that are actually intersecting
  for (const position of labelPositions) {
    for (let i = 0; i < allItemPositions.length; i++) {
      if (i === currentItemIndex) {
        continue;
      }
      cost +=
        getBoxIntersection(currentItem, allItems[position][i]) *
        (allItemPositions[i] === position ? 10 : 1);
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
function optimizeLabelDisplays(containerSize: BoxSize, items: DisplayItem[]): DisplayItem[] {
  // const start = performance.now();

  const boxRectsByPosition = labelPositions.reduce(
    (acc, position) => {
      acc[position] = items.map((item) => getLabelRect(containerSize, item, position));
      return acc;
    },
    {} as Record<LabelPosition, BoxRect[]>
  );
  const itemLabelPositions: LabelPosition[] = Array(items.length).fill('bottomright');

  const n = items.length;
  const maxIters = Math.max(n * 3, 20);
  let iter = 0;

  for (iter = 0; iter < maxIters; iter++) {
    let bestCandidateAction: CandidateAction | null = null;

    for (let i = 0; i < n; i++) {
      const currentPosition = itemLabelPositions[i];
      const currentCost = calculateItemCost(
        containerSize,
        boxRectsByPosition[currentPosition][i],
        i,
        currentPosition,
        boxRectsByPosition,
        itemLabelPositions
      );

      if (currentCost === 0) continue;

      for (const candidatePosition of labelPositions) {
        if (candidatePosition === currentPosition) {
          continue;
        }

        const candidateCost = calculateItemCost(
          containerSize,
          boxRectsByPosition[candidatePosition][i],
          i,
          candidatePosition,
          boxRectsByPosition,
          itemLabelPositions
        );

        const costDelta = candidateCost - currentCost;

        if (costDelta < 0 && (!bestCandidateAction || costDelta < bestCandidateAction.costDelta)) {
          bestCandidateAction = { costDelta, index: i, position: candidatePosition };
        }
      }
    }

    if (!bestCandidateAction) {
      break;
    }

    itemLabelPositions[bestCandidateAction.index] = bestCandidateAction.position;
  }

  // console.log('Optimization iterations:', iter, 'Time:', performance.now() - start);

  return items.map((item, i) => ({
    ...item,
    labelPosition: itemLabelPositions[i],
  }));
}
