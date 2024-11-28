import { DateTime } from 'luxon';

export enum InputType {
  TimestampSeconds,
  TimestampMilliseconds,
  ISO,
  RFC2822,
  GuessedFromDate,
}

export const inputTypeLabels = {
  [InputType.TimestampSeconds]: 'timestamp (seconds)',
  [InputType.TimestampMilliseconds]: 'timestamp (milliseconds)',
  [InputType.ISO]: 'ISO 8601',
  [InputType.RFC2822]: 'RFC 2822',
  [InputType.GuessedFromDate]: 'parsable by native JS Date',
};

export function guessAndParseInput(input: string): null | [InputType, DateTime] {
  if (!input) {
    return null;
  }

  if (/^[0-9.]+$/.exec(input)) {
    const amount = parseFloat(input);
    const magnitude = Math.log10(amount);
    if (magnitude < 10) {
      return [InputType.TimestampSeconds, DateTime.fromMillis(amount * 1000)];
    } else {
      return [InputType.TimestampMilliseconds, DateTime.fromMillis(amount)];
    }
  } else {
    let parsed = DateTime.fromISO(input);
    if (parsed.isValid) {
      return [InputType.ISO, parsed];
    }

    parsed = DateTime.fromRFC2822(input);
    if (parsed.isValid) {
      return [InputType.RFC2822, parsed];
    }

    const guessed = new Date(input);
    if (!isNaN(guessed.getTime())) {
      return [InputType.GuessedFromDate, DateTime.fromJSDate(guessed)];
    }

    // Try adding the date, maybe the input is only hours and minutes

    const guessedWithDate = new Date(`${DateTime.now().toFormat('yyyy-LL-dd')} ${input}`);
    if (!isNaN(guessedWithDate.getTime())) {
      return [InputType.GuessedFromDate, DateTime.fromJSDate(guessedWithDate)];
    }

    return null;
  }
}
