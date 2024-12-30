<svelte:options
  customElement={{ tag: 'xif-ip-range-calculator', extend: addComponentStylesheet }}
/>

<script lang="ts">
  import { slide } from 'svelte/transition';
  import { circInOut } from 'svelte/easing';

  import { addComponentStylesheet } from '$lib/component';
  import Input from '$lib/components/Input.svelte';
  import Text from '$lib/components/Text.svelte';

  import { subtractIPRanges, validateIPRanges } from './calculator';
  import { delayedValidator, type ValidationState } from './utils.svelte';

  const animationConfig = { duration: 150, easing: circInOut };

  let allowedIpString = $state('');

  let allowedIpState = delayedValidator(() => allowedIpString, validateIPRanges);

  let disallowedIpString = $state('');

  let disallowedIpState = delayedValidator(() => disallowedIpString, validateIPRanges);

  let combinedState: ValidationState['state'] = $derived(
    allowedIpState.state === 'empty' || disallowedIpState.state === 'empty'
      ? 'empty'
      : allowedIpState.state === 'invalid' || disallowedIpState.state === 'invalid'
        ? 'invalid'
        : allowedIpState.state === 'pending' || disallowedIpState.state === 'pending'
          ? 'pending'
          : 'valid'
  );

  let calculationResult = $derived(
    combinedState === 'valid'
      ? subtractIPRanges(allowedIpString, disallowedIpString).result
      : undefined
  );

  let lastNonErrorResult: string | undefined = $state(undefined);

  $effect(() => {
    if (combinedState === 'valid' && calculationResult != null) {
      lastNonErrorResult = calculationResult;
    } else if (combinedState !== 'pending' && lastNonErrorResult) {
      lastNonErrorResult = '';
    }
  });
</script>

<div class="area">
  <div class="label">
    <Text>Allowed IPs</Text>
  </div>
  <Input bind:value={allowedIpString} placeholder="0.0.0.0/0"></Input>
  {#if allowedIpState.state === 'invalid'}
    <div class="error" transition:slide={animationConfig}>
      <Text type="error">{allowedIpState.error}</Text>
    </div>
  {/if}

  <div class="label">
    <Text>Disallowed IPs</Text>
  </div>
  <Input bind:value={disallowedIpString} placeholder="10.0.0.0/8"></Input>
  {#if disallowedIpState.state === 'invalid'}
    <div class="error" transition:slide={animationConfig}>
      <Text type="error">{disallowedIpState.error}</Text>
    </div>
  {/if}

  {#if combinedState !== 'invalid' && combinedState !== 'empty' && lastNonErrorResult != null}
    <div
      class="result"
      class:pending={combinedState === 'pending'}
      transition:slide={animationConfig}
    >
      <Text>Result = {lastNonErrorResult}</Text>
    </div>
  {/if}
</div>

<style lang="postcss">
  .area {
    display: grid;
    grid-template-columns: auto 1fr;

    @apply p-2;
  }

  .area > :global(*) {
    /* Cannot just use gap because it causes animation issues when the errors are removed */
    @apply m-2;
  }

  .label {
    justify-self: end;
    align-self: center;

    @apply ps-4;
  }

  .error {
    grid-column: 2;

    @apply p-4 bg-red-100  dark:bg-red-900;
  }

  .result {
    grid-column: span 2;

    @apply p-4 bg-neutral-200 dark:bg-neutral-600;
  }

  .result.pending {
    opacity: 0.5;
  }
</style>
