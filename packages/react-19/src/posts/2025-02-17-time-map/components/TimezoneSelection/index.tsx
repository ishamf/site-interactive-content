import { Autocomplete, TextField } from '@mui/material';
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
        renderOption={(props, option, { selected }) => (
          <TimezoneOption
            {...props}
            option={option}
            selected={selected}
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
  selected,
  onClick,
}: {
  option: SelectionData;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        className={classNames('hover:bg-neutral-100 cursor-pointer p-4 w-full', {
          'bg-neutral-50': selected,
        })}
        onClick={() => {
          onClick();
        }}
      >
        <p>{option.label}</p>
        <p>
          {option.type === 'city' ? (
            <>City in {option.country}</>
          ) : option.type === 'countryCapital' ? (
            <>Country (Time at capital)</>
          ) : (
            <>Timezone</>
          )}
        </p>
      </button>
    </li>
  );
}
