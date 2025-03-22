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
  labelPosition: LabelPosition;
  size: BoxSize;
};

interface CityDisplayStore {
  containerSize: BoxSize | null;
  displayItemById: Record<string, DisplayItem>;
  registerContainerSize(size: BoxSize): void;
  registerDisplayItem(rowId: string, item: { size: BoxSize; city: CitySelectionData } | null): void;
  recalculatePositions(): void;
}

function createStore() {
  return create<CityDisplayStore>()((set, get) => ({
    containerSize: null,

    displayItemById: {},

    registerContainerSize(size) {
      set({ containerSize: size });

      get().recalculatePositions();
    },

    registerDisplayItem(rowId, item) {
      set((state) => {
        if (item) {
          return {
            displayItemById: {
              ...state.displayItemById,
              [rowId]: { rowId, city: item.city, size: item.size, labelPosition: 'bottomright' },
            },
          };
        }
        const { [rowId]: _, ...rest } = state.displayItemById;

        return { displayItemById: rest };
      });

      get().recalculatePositions();
    },

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
  allItems: BoxRect[]
) {
  let cost = 0;

  // Cost to prefer bottom right display if there's no intersections
  if (currentItemPosition === 'topleft' || currentItemPosition === 'topright') {
    cost += 2;
  } else if (currentItemPosition === 'bottomleft') {
    cost += 1;
  }

  // Cost for intersection with other items
  for (let i = 0; i < allItems.length; i++) {
    if (i === currentItemIndex) {
      continue;
    }
    cost += getBoxIntersection(currentItem, allItems[i]) * 2;
  }

  // Cost for going out of bounds
  cost +=
    (currentItem.width * currentItem.height -
      getBoxIntersection(currentItem, { left: 0, top: 0, ...containerSize })) *
    100;

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
  const boxRects = items.map((item) => getLabelRect(containerSize, item, item.labelPosition));
  const itemLabelPositions = items.map((item) => item.labelPosition);

  const n = items.length;
  const maxIters = Math.max(n * 3, 20);
  let iter = 0;

  for (iter = 0; iter < maxIters; iter++) {
    let bestCandidateAction: CandidateAction | null = null;

    for (let i = 0; i < n; i++) {
      const currentPosition = itemLabelPositions[i];
      const currentCost = calculateItemCost(
        containerSize,
        boxRects[i],
        i,
        currentPosition,
        boxRects
      );

      if (currentCost === 0) continue;

      for (const candidatePosition of labelPositions) {
        if (candidatePosition === currentPosition) {
          continue;
        }

        const candidateCost = calculateItemCost(
          containerSize,
          getLabelRect(containerSize, items[i], candidatePosition),
          i,
          candidatePosition,
          boxRects
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
    boxRects[bestCandidateAction.index] = getLabelRect(
      containerSize,
      items[bestCandidateAction.index],
      bestCandidateAction.position
    );
  }

  return items.map((item, i) => ({
    ...item,
    labelPosition: itemLabelPositions[i],
  }));
}
