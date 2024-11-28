<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { mdiPlus, mdiClose, mdiSetSplit } from '@mdi/js';
  import Input from '$lib/components/Input.svelte';
  import Button from '$lib/components/Button.svelte';
  import type { URLElement } from '../types';
  import { lenientParseUrl, lenientStringifyUrl, parseUrlToElement } from '../utils';

  export let key: string | null;
  export let url: URLElement;
  export let element: HTMLElement;
  export let disabled = false;
  export let isDraft = false;
  export let allowRemoveDraft = false;

  const dispatch = createEventDispatcher();

  let isValidURL = false;
  let hasEmbeddedParams = false;
  let parsedUrl: URL | null = null;

  // Refresh flags to control UI elements
  $: isRootNode = typeof key !== 'string';
  $: shouldShowAddButton =
    isValidURL && url.value && key && (!url.params || url.params.length === 0);
  $: shouldShowRemoveButton = typeof key === 'string' && (!isDraft || allowRemoveDraft);

  // Refresh parsed status and values
  $: {
    try {
      parsedUrl = lenientParseUrl(url.value);
      isValidURL = true;
      hasEmbeddedParams = parsedUrl.searchParams.size > 0;
    } catch (e) {
      parsedUrl = null;
      isValidURL = false;
      hasEmbeddedParams = false;
    }
  }

  // Create drafts if needed
  $: {
    if (url.params && url.params.every((x) => x.key)) {
      // Automatically create draft params if all params have key
      url.params = [...(url.params ?? []), { key: '', url: { value: '' } }];
    } else if (isRootNode && url.value && !url.params) {
      // For root node, it must have a draft
      url.params = [{ key: '', url: { value: '' } }];
    }
  }
</script>

<div class="my-4" bind:this={element}>
  <div class="flex flex-row justify-stretch">
    {#if typeof key === 'string'}
      <Input bind:value={key} {disabled} placeholder="Key..." />
      <div class="mr-4" />
    {/if}
    <Input
      bind:value={url.value}
      {disabled}
      placeholder={typeof key === 'string' ? 'Value...' : 'Enter URL...'}
    />
    {#if shouldShowAddButton}
      <div class="mr-4" />
      <Button
        title="Add parameter"
        icon={mdiPlus}
        disabled={disabled || !isValidURL}
        on:click={() => {
          if (!url.params) url.params = [];

          url.params = [
            ...url.params,
            {
              key: '',
              url: {
                value: '',
              },
            },
          ];
        }}
      />
    {/if}

    {#if hasEmbeddedParams}
      <div class="mr-4" />
      <Button
        title="Parse params"
        icon={mdiSetSplit}
        disabled={disabled || !isValidURL}
        on:click={() => {
          if (!parsedUrl) return;
          url.params = [
            ...(Array.from(parsedUrl.searchParams.entries()).map(([key, value]) => ({
              key,
              url: parseUrlToElement(value),
            })) ?? []),
            ...(url.params ?? []),
          ];
          const urlWithoutParams = new URL(parsedUrl);
          urlWithoutParams.search = '';
          url.value = lenientStringifyUrl(urlWithoutParams);
        }}
      />
    {/if}

    {#if shouldShowRemoveButton}
      <div class="mr-4" />
      <Button
        title="Remove parameter"
        icon={mdiClose}
        {disabled}
        on:click={() => {
          dispatch('remove', key);
        }}
      />
    {:else if !isRootNode}
      <div class="mr-16" />
    {/if}
  </div>

  {#if url.params}
    <div class="ml-4">
      {#each url.params as param, i}
        <svelte:self
          bind:key={param.key}
          bind:url={param.url}
          disabled={disabled || !isValidURL}
          isDraft={i === url.params.length - 1}
          allowRemoveDraft={url.params.length === 1 && !isRootNode}
          on:remove={() => {
            if (!url.params) return;

            // If it's the draft, clear the entire array
            if (i === url.params.length - 1) {
              url.params = undefined;
            } else {
              // else, just delete this item
              url.params = url.params.filter((x) => x !== param);
            }
          }}
        />
      {/each}
    </div>
  {/if}
</div>
