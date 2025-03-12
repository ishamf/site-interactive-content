import { Autocomplete, createFilterOptions, TextField } from '@mui/material';
import { SelectionData } from '../../assets';
import { DateTimePicker } from '@mui/x-date-pickers';
import { DateTime } from 'luxon';

export function TimezoneSelection({
  time,
  currentSelection,
  selectionData,
  onChangeId,
  onChangeTime,
}: {
  time: DateTime;
  currentSelection: SelectionData | null;
  selectionData: SelectionData[];
  onChangeId: (selectionId: string | null) => void;
  onChangeTime: (time: DateTime) => void;
}) {
  return (
    <>
      <Autocomplete
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
          <TimezoneOption
            key={key}
            {...props}
            option={option}
            onClick={() => {
              onChangeId(option.id);
            }}
          />
        )}
        options={selectionData}
        renderInput={(params) => <TextField {...params} label="Time Zone" />}
        value={currentSelection}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(_e, value) => {
          onChangeId(value?.id ?? null);
        }}
      ></Autocomplete>
      <DateTimePicker
        value={currentSelection ? time : null}
        disabled={!currentSelection}
        timezone={currentSelection?.timezone}
        ampm={false}
        onChange={(value) => {
          if (value) {
            onChangeTime(value);
          }
        }}
      />
    </>
  );
}

function TimezoneOption({
  option,

  onClick,
  ...rest
}: {
  option: SelectionData;
  onClick: () => void;
}) {
  return (
    <li {...rest}>
      <button
        className="cursor-pointer p-4 w-full text-left"
        onClick={() => {
          onClick();
        }}
      >
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
      </button>
    </li>
  );
}
