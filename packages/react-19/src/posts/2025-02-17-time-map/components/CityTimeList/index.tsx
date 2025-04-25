import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { INITIAL_DISPLAY_LENGTH, useTimeMapStore } from '../../store';
import { TimezoneSelection } from '../TimezoneSelection';
import { TimezoneSelectionSkeleton } from '../TimezoneSelectionSkeleton';
import { UseQueryResult } from '@tanstack/react-query';
import { LoadableSelectionData } from '../../assets';
import { TimeState } from '../../types';
import { DateTime } from 'luxon';
import { ComponentProps, useMemo } from 'react';

interface CityTimeListProps {
  selectionDataQuery: UseQueryResult<LoadableSelectionData>;
  timeState: TimeState;
  setTime: (time: TimeState) => void;
  slowlyChangingTime: DateTime;
}

export function CityTimeList({
  selectionDataQuery,
  timeState,
  setTime,
  slowlyChangingTime,
}: CityTimeListProps) {
  const selectedItems = useTimeMapStore((s) => s.selectedItems);
  const removeSelection = useTimeMapStore((s) => s.removeSelection);
  const updateSelection = useTimeMapStore((s) => s.updateSelection);
  const addNewSelection = useTimeMapStore((s) => s.addNewSelection);
  const reorderSelection = useTimeMapStore((s) => s.reorderSelection);

  const selectedItemsRenderElements = useMemo(() => {
    function createFunctionProps(
      rowId: string
    ): Pick<ComponentProps<typeof TimezoneSelection>, 'onChangeId' | 'onChangeTime'> {
      return {
        onChangeId: (newId, isDeleting) => {
          if (isDeleting) {
            removeSelection(rowId);
          } else {
            updateSelection(rowId, newId);
          }
        },
        onChangeTime: (time) => {
          setTime({ time, renderBehavior: 'animated', isRapidlyChanging: false });
        },
      };
    }

    const renderElements = selectedItems.map((item) => {
      const functionProps = createFunctionProps(item.rowId);
      return {
        item,
        functionProps,
        isNew: false,
      };
    });

    const newRowId = `newItem-${selectedItems.length}`;

    renderElements.push({
      item: { itemId: null, rowId: newRowId },
      functionProps: {
        ...createFunctionProps(newRowId),
        onChangeId: (newId) => {
          if (newId) {
            addNewSelection(newId);
          }
        },
      },
      isNew: true,
    });

    return renderElements;
  }, [addNewSelection, removeSelection, selectedItems, setTime, updateSelection]);

  const dndContextProps = useMemo(() => {
    const props: ComponentProps<typeof DndContext> = {
      onDragEnd: ({ active, over }) => {
        if (over && over.id !== active.id) {
          reorderSelection(active.id.toString(), over.id.toString());
        }
      },
    };

    return props;
  }, [reorderSelection]);

  const sortableContextItems = useMemo(
    () => selectedItems.map((item) => item.rowId),
    [selectedItems]
  );

  return selectionDataQuery.isSuccess ? (
    <>
      <DndContext {...dndContextProps}>
        <SortableContext items={sortableContextItems}>
          {selectedItemsRenderElements.map(({ item: { itemId, rowId }, functionProps, isNew }) => {
            return (
              <TimezoneSelection
                key={rowId}
                rowId={rowId}
                {...functionProps}
                selectionData={selectionDataQuery.data.selectionData}
                currentSelection={itemId ? selectionDataQuery.data.selectionDataById[itemId] : null}
                isDateTimeFrozen={timeState.isRapidlyChanging}
                time={slowlyChangingTime}
                isNew={isNew}
              ></TimezoneSelection>
            );
          })}
        </SortableContext>
      </DndContext>
    </>
  ) : (
    Array((selectedItems.length || INITIAL_DISPLAY_LENGTH) + 1)
      .fill(null)
      .map((_, index) => <TimezoneSelectionSkeleton key={index}></TimezoneSelectionSkeleton>)
  );
}
