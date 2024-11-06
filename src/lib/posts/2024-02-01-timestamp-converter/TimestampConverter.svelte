<script lang="ts">
  import { run } from 'svelte/legacy';

  import Input from '$lib/components/Input.svelte';
  import { DateTime } from 'luxon';
  import { slide } from 'svelte/transition';
  import { circInOut } from 'svelte/easing';
  import TextButton from '$lib/components/TextButton.svelte';
  import { onMount } from 'svelte';
  import { mdiClose } from '@mdi/js';
  import Button from '$lib/components/Button.svelte';
  import CopyableIconButton from './CopyableIconButton.svelte';
  import { InputType, guessAndParseInput, inputTypeLabels } from './utils';

  const animationConfig = { duration: 150, easing: circInOut };

  let inputText = $state('');

  let now = $state(DateTime.now());

  let displayMode: 'local' | 'utc' = $state('local');

  let interval: ReturnType<typeof setInterval> | undefined;

  function resetInterval() {
    if (interval) {
      clearInterval(interval);
      interval = setInterval(() => {
        now = DateTime.now();
      }, 1000);
    }
    // Add 1 millisecond so the relative time is always in the past
    now = DateTime.now().plus({ milliseconds: 1 });
  }

  onMount(() => {
    interval = setInterval(() => {
      now = DateTime.now();
    }, 1000);

    return () => clearInterval(interval);
  });

  let inputType: InputType | undefined = $state();
  let result: DateTime | undefined = $state();

  run(() => {
    const parsed = guessAndParseInput((inputText || '').trim());

    if (parsed) {
      [inputType, result] = parsed;
    } else {
      inputType = undefined;
      result = undefined;
    }
  });

  let displayResult = $state(result);

  type DisplayItem = {
    label: string;
    value: string | number | null;
  };

  let displayItems: DisplayItem[] = $state([]);

  run(() => {
    displayResult = displayMode === 'utc' ? result?.setZone('utc') : result;

    if (displayResult) {
      displayItems = [
        {
          label: 'Timestamp (seconds)',
          value: Math.floor(displayResult.toSeconds()),
        },
        {
          label: 'Timestamp (milliseconds)',
          value: displayResult.toMillis(),
        },
        {
          label: 'ISO 8601',
          value: displayResult.toISO(),
        },
        {
          label: 'RFC 2822',
          value: displayResult.toRFC2822(),
        },
        {
          label: 'Local Format',
          value: displayResult.toLocaleString(DateTime.DATETIME_FULL),
        },
        {
          label: 'Relative Time',
          value: displayResult.toRelative({
            base: now,
            // Only round if the difference is less than 1 minute
            round: Math.abs(displayResult.valueOf() - now.valueOf()) < 60000,
          }),
        },
      ];
    } else {
      displayItems = [];
    }
  });
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
      resetInterval();
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
        {#each displayItems as item}
          <tr>
            <td>{item.label}</td>
            <td>{item.value}</td>
            <td><CopyableIconButton content={item.value?.toString() ?? ''}></CopyableIconButton></td
            >
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{:else if inputText}
  <div transition:slide={animationConfig}>
    <p>The input cannot be parsed as a datetime.</p>
  </div>
{/if}
