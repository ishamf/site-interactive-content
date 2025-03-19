import { Autocomplete, createFilterOptions, IconButton, TextField } from '@mui/material';
import { DeleteOutline as DeleteIcon } from '@mui/icons-material';
import { SelectionData } from '../../assets';
import { DateTimePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';

export function TimezoneSelection({
  time,
  currentSelection,
  selectionData,
  onChangeId,
  onChangeTime,
  isNew,
}: {
  time: DateTime;
  currentSelection: SelectionData | null;
  selectionData: SelectionData[];
  onChangeId: (selectionId: string | null, isDeleting: boolean) => void;
  onChangeTime: (time: DateTime) => void;
  isNew?: boolean;
}) {
  const shouldShowDeleteButton = !currentSelection && !isNew;
  const isShowingEditArea = shouldShowDeleteButton;

  return (
    <div className="flex flex-row gap-4 items-center">
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
