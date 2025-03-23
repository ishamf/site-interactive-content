import { Autocomplete, createFilterOptions, IconButton, TextField } from '@mui/material';
import { DeleteOutline as DeleteIcon } from '@mui/icons-material';
import { SelectionData } from '../../assets';
import { DateTimePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';
import { dayColors } from '../../constants';
import classNames from 'classnames';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useImperativeHandle, useRef, useState } from 'react';

interface TimezoneSelectionRef {
  scrollIntoView: () => void;
  focusSelector: () => void;
}

export function TimezoneSelection({
  rowId,
  time,
  currentSelection,
  selectionData,
  onChangeId,
  onChangeTime,
  isNew,
  ref,
}: {
  rowId: string;
  time: DateTime;
  currentSelection: SelectionData | null;
  selectionData: SelectionData[];
  onChangeId: (selectionId: string | null, isDeleting: boolean) => void;
  onChangeTime: (t: DateTime) => void;
  isNew?: boolean;
  ref?: React.Ref<TimezoneSelectionRef>;
}) {
  const shouldShowDeleteButton = !currentSelection && !isNew;
  const isShowingEditArea = shouldShowDeleteButton;

  const localTime = currentSelection ? time.setZone(currentSelection.timezone) : null;

  const { attributes, listeners, transform, transition, setNodeRef } = useSortable({ id: rowId });

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const datepickerRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    scrollIntoView: () => {
      datepickerRef.current?.scrollIntoView();
    },
    focusSelector: () => {
      setIsPickerOpen(true);
    },
  }));

  return (
    <div
      className="flex flex-row gap-4 items-center"
      ref={setNodeRef}
      {...attributes}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <div
        className={classNames('p-4 m-[-1rem] touch-none', {
          invisible: !localTime,
          'cursor-grab': !isNew,
        })}
        {...(isNew ? {} : listeners)}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: localTime ? dayColors[localTime.weekday] : `#999` }}
        ></div>
      </div>

      <Autocomplete
        className="flex-1"
        getOptionKey={(option) => option.id}
        filterOptions={createFilterOptions({
          limit: 20,
          stringify: (option) => {
            if (option.type === 'city' && option.isCapital) {
              return `${option.label} ${option.country}`;
            }

            return option.label;
          },
        })}
        renderOption={({ key, ...props }, option) => (
          <TimezoneOption key={key} {...props} option={option} />
        )}
        options={selectionData}
        renderInput={(params) => <TextField {...params} label="Time Zone" />}
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
          open={isPickerOpen}
          onOpen={() => setIsPickerOpen(true)}
          onClose={() => setIsPickerOpen(false)}
          className="flex-1"
          value={currentSelection ? time : null}
          disabled={!currentSelection}
          timezone={currentSelection?.timezone}
          ampm={false}
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
  );
}

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
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          {option.type === 'city' ? (
            option.isCapital ? (
              <>Capital of {option.country}</>
            ) : (
              <>City in {option.country}</>
            )
          ) : (
            <>Timezone</>
          )}
        </p>
      </div>
    </li>
  );
}
