<script lang="ts">
  import Input from '$lib/components/Input.svelte';
  import { DateTime } from 'luxon';
  import { slide } from 'svelte/transition';
  import { circInOut } from 'svelte/easing';
  import TextButton from '$lib/components/TextButton.svelte';
  import { onMount } from 'svelte';
  import { mdiClose } from '@mdi/js';
  import Button from '$lib/components/Button.svelte';

  const animationConfig = { duration: 150, easing: circInOut };

  let inputText = '';

  let now = DateTime.now();

  let displayMode: 'local' | 'utc' = 'local';

  onMount(() => {
    const interval = setInterval(() => {
      now = DateTime.now();
    }, 1000);

    return () => clearInterval(interval);
  });

  enum InputType {
    TimestampSeconds,
    TimestampMilliseconds,
    ISO,
    RFC2822,
    GuessedFromDate,
  }

  const inputTypeLabels = {
    [InputType.TimestampSeconds]: 'timestamp (seconds)',
    [InputType.TimestampMilliseconds]: 'timestamp (milliseconds)',
    [InputType.ISO]: 'ISO 8601',
    [InputType.RFC2822]: 'RFC 2822',
    [InputType.GuessedFromDate]: 'parsable by native JS Date',
  };

  let inputType: InputType | undefined;
  let result: DateTime | undefined;

  function guessAndParseInput(input: string): null | [InputType, DateTime] {
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

      return null;
    }
  }

  $: {
    const parsed = guessAndParseInput((inputText || '').trim());

    if (parsed) {
      [inputType, result] = parsed;
    } else {
      inputType = undefined;
      result = undefined;
    }
  }

  let displayResult = result;

  $: {
    displayResult = displayMode === 'utc' ? result?.setZone('utc') : result;
  }
</script>

<div class="flex flex-wrap flex-row gap-4">
  <div class="flex flex-1 min-w-64 gap-4">
    <Input bind:value={inputText} placeholder="Any datetime or timestamp..." />

    {#if inputText}
      <Button
        title="Clear input"
        icon={mdiClose}
        on:click={() => {
          inputText = '';
        }}
      ></Button>
    {/if}
  </div>

  <TextButton
    on:click={() => {
      inputText = DateTime.now().toISO();
    }}>Set to current time</TextButton
  >
</div>

{#if inputType != null && displayResult}
  <div transition:slide={animationConfig}>
    <p>The type of the input is <strong>{inputTypeLabels[inputType]}</strong>.</p>

    <fieldset>
      <p>
        <input type="radio" id="local" bind:group={displayMode} value="local" />
        <label for="local">Display in local time</label>
      </p>
      <p>
        <input type="radio" id="utc" bind:group={displayMode} value="utc" />
        <label for="utc">Display in UTC</label>
      </p>
    </fieldset>

    <table>
      <thead>
        <tr>
          <th>Format</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Timestamp (seconds)</td>
          <td>{displayResult.toSeconds()}</td>
        </tr>
        <tr>
          <td>Timestamp (milliseconds)</td>
          <td>{displayResult.toMillis()}</td>
        </tr>
        <tr>
          <td>ISO 8601</td>
          <td>{displayResult.toISO()}</td>
        </tr>
        <tr>
          <td>RFC 2822</td>
          <td>{displayResult.toRFC2822()}</td>
        </tr>
        <tr>
          <td>Local Format</td>
          <td>{displayResult.toLocaleString(DateTime.DATETIME_FULL)}</td>
        </tr>
        <tr>
          <td>Relative Time</td>
          <td
            >{displayResult.toRelative({
              base: now,
              // Only round if the difference is less than 1 minute
              round: Math.abs(displayResult.valueOf() - now.valueOf()) < 60000,
            })}</td
          >
        </tr>
      </tbody>
    </table>
  </div>
{:else if inputText}
  <div transition:slide={animationConfig}>
    <p>The input cannot be parsed as a datetime.</p>
  </div>
{/if}
