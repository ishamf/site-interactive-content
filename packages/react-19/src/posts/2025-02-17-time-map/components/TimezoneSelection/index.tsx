/** @jsxImportSource @emotion/react */

import { Autocomplete, createFilterOptions, IconButton, TextField } from '@mui/material';
import { DeleteOutline as DeleteIcon, Warning } from '@mui/icons-material';
import { SelectionData } from '../../assets';
import { DateTimePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';
import { css } from '@emotion/react';
import { dayColors } from '../../constants';
import classNames from 'classnames';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useHiddenRowsStore } from '../../store';

interface TimezoneSelectionRef {
  scrollIntoView: () => void;
  focusSelector: () => void;
}

export const TimezoneSelection = memo(
  ({
    rowId,
    time,
    currentSelection,
    selectionData,
    onChangeId,
    onChangeTime,
    isNew,
    ref,
    isDateTimeFrozen,
  }: {
    rowId: string;
    time: DateTime;
    currentSelection: SelectionData | null;
    selectionData: SelectionData[];
    onChangeId: (selectionId: string | null, isDeleting: boolean) => void;
    onChangeTime: (t: DateTime) => void;
    isNew?: boolean;
    isDateTimeFrozen: boolean;
    ref?: React.Ref<TimezoneSelectionRef>;
  }) => {
    const shouldShowDeleteButton = !currentSelection && !isNew;
    const isShowingEditArea = shouldShowDeleteButton;

    const localTime = currentSelection ? time.setZone(currentSelection.timezone) : null;

    const { attributes, listeners, transform, transition, setNodeRef, isSorting } = useSortable({
      id: rowId,
    });

    const translateOnlyTransform = transform && { ...transform, scaleX: 1, scaleY: 1 };

    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const datepickerRef = useRef<HTMLInputElement>(null);

    const hiddenRows = useHiddenRowsStore((state) => state.hiddenRows);

    const currentRowHiddenData = hiddenRows.get(rowId);

    useEffect(() => {
      if (isPickerOpen && isDateTimeFrozen) {
        setIsPickerOpen(false);
      }
    }, [isDateTimeFrozen, isPickerOpen]);

    useImperativeHandle(ref, () => ({
      scrollIntoView: () => {
        datepickerRef.current?.scrollIntoView({
          block: 'nearest',
        });
      },
      focusSelector: () => {
        setIsPickerOpen(true);
      },
    }));

    return (
      <div
        className="flex flex-col gap-2"
        ref={setNodeRef}
        {...attributes}
        style={{ transform: CSS.Transform.toString(translateOnlyTransform), transition }}
      >
        <div className="flex flex-row gap-4 items-center">
          <div
            className={classNames('p-4 m-[-1rem] touch-none relative', {
              invisible: !localTime,
              'cursor-grab': !isNew,
            })}
            {...(isNew ? {} : listeners)}
          >
            <div
              className="w-2 h-2 rounded-full"
              css={css`
                background-color: ${localTime
                  ? `oklch(from ${dayColors[localTime.weekday]} min(l, 0.8) c h)`
                  : `#473636`};

                @media (prefers-color-scheme: dark) {
                  background-color: ${localTime ? dayColors[localTime.weekday] : `#999`};
                }
              `}
            ></div>
            {currentRowHiddenData ? (
              <Warning className="absolute top-0.5 right-0.5 text-yellow-600 dark:text-yellow-300 scale-50"></Warning>
            ) : null}
          </div>

          <Autocomplete
            className="flex-1"
            getOptionKey={(option) => option.id}
            filterOptions={createFilterOptions({
              limit: 20,
              stringify: (option) => {
                if (option.type === 'city') {
                  if (option.isCapital) {
                    return `${option.label} ${option.region ?? ''} ${option.country}`;
                  }

                  return `${option.label} ${option.region}`;
                }

                return option.label;
              },
            })}
            renderOption={({ key, ...props }, option) => (
              <TimezoneOption key={key} {...props} option={option} />
            )}
            options={selectionData}
            renderInput={(params) => (
              <TextField
                {...params}
                label={
                  !currentSelection
                    ? 'City / Time Zone'
                    : currentSelection.type === 'city'
                      ? 'City'
                      : 'Time Zone'
                }
              />
            )}
            value={currentSelection}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_e, value) => {
              onChangeId(value?.id ?? null, false);
            }}
            slotProps={{
              clearIndicator: {
                onClick: () => {
                  onChangeId(null, true);
                },
              },
            }}
          ></Autocomplete>

          <div className="flex-1 flex items-center gap-1">
            <DateTimePicker
              inputRef={datepickerRef}
              open={isPickerOpen && !isDateTimeFrozen}
              onOpen={() => setIsPickerOpen(true)}
              onClose={() => setIsPickerOpen(false)}
              className="flex-1"
              value={currentSelection ? time : null}
              disabled={!currentSelection || isDateTimeFrozen}
              timezone={currentSelection?.timezone}
              onChange={(value) => {
                if (value && value.isValid) {
                  onChangeTime(value);
                }
              }}
            />

            {isShowingEditArea ? (
              <div>
                <IconButton onClick={() => onChangeId(null, true)}>
                  <DeleteIcon />
                </IconButton>
              </div>
            ) : null}
          </div>
        </div>
        {currentRowHiddenData ? (
          <p
            className={classNames(
              'p-2 ml-6 text-sm bg-yellow-100 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-200',
              { invisible: isSorting }
            )}
          >
            {currentRowHiddenData.reason === 'intersect' ? (
              <>
                There's not enough space to show this city on the map! Drag it to the top to
                prioritize it over other cities.
              </>
            ) : (
              <>This row is duplicated with another row above.</>
            )}
          </p>
        ) : null}
      </div>
    );
  }
);

function TimezoneOption({
  option,

  ...rest
}: {
  option: SelectionData;
}) {
  return (
    <li {...rest}>
      <div className="py-2 w-full text-left">
        <p className="text-neutral-900 dark:text-neutral-100">{option.label}</p>
        <p className="text-xs text-neutral-700 dark:text-neutral-300">
          {option.type === 'city' ? (
            option.isCapital ? (
              <>
                Capital of {option.country}
                {option.region &&
                !option.label.includes(option.region) &&
                !option.country.includes(option.region) ? (
                  <>, in {option.region} region</>
                ) : null}
              </>
            ) : option.isRegionalCapital && option.region ? (
              <>
                Regional capital of {option.region}, {option.country}
              </>
            ) : (
              <>City in {option.region ? `${option.region}, ${option.country}` : option.country}</>
            )
          ) : (
            <>Timezone</>
          )}
        </p>
      </div>
    </li>
  );
}
