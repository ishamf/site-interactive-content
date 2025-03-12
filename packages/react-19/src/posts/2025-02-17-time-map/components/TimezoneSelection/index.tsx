import { Autocomplete, createFilterOptions, IconButton, TextField } from '@mui/material';
import { DeleteOutline as DeleteIcon } from '@mui/icons-material';
import { SelectionData } from '../../assets';
import { DateTimePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';
import classNames from 'classnames';

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
    <>
      <Autocomplete
        className="col-start-1"
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
      ></Autocomplete>
      <DateTimePicker
        className={classNames('col-start-2', { 'col-span-2': !isShowingEditArea })}
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
        <div className="ml-[-0.75rem]">
          {shouldShowDeleteButton ? (
            <IconButton onClick={() => onChangeId(null, true)}>
              <DeleteIcon />
            </IconButton>
          ) : null}
        </div>
      ) : null}
    </>
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
