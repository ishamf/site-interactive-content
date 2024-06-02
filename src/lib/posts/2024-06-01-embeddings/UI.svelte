<svelte:options
  customElement={{ tag: 'xif-embeddings', mode: 'open', extend: addComponentStylesheet }}
/>

<script lang="ts">
  import { addComponentStylesheet } from '$lib/component';
  import { asyncDerived, writable } from '@square/svelte-store';
  import Node from './components/Node.svelte';
  import { createEmbedder } from './embedder';
  import type { Sentence } from './types';
  import Input from '$lib/components/Input.svelte';
  import { createProjector } from './projector';
  import Container from '$lib/components/Container.svelte';
  import Label from './components/Label.svelte';

  const sentences = writable(
    [
      'man',
      'woman',
      'king',
      'queen',
      'actor',
      'actress',
    ].map((x) => ({
      value: x,
      label: 't',
    })) as Sentence[]
  );

  // Create drafts if needed
  $: {
    if ($sentences.every((x) => !!x.value)) {
      // Automatically create draft sentences if all is filled
      $sentences = [...$sentences, { value: '' }];
    }
  }

  const projector = createProjector();

  const debouncedSentences = asyncDerived([sentences], async ([text]) => {
    await new Promise((r) => setTimeout(r, 500));

    return text;
  });

  const result = asyncDerived(
    [debouncedSentences],
    async ([text]) => {
      const validText = text.filter((s) => s.value);

      if (validText.length === 0) return [];

      const res = await projector.project(validText);

      return res;
    },
    { initial: [] }
  );
</script>

<div class="flex flex-wrap gap-y-4 text-neutral-800 dark:text-neutral-200 text-base max-w-4xl mx-auto">
  <div class="flex justify-center flex-grow">
    <div class="h-80 w-80 bg-neutral-100 dark:bg-neutral-800 text-sm sticky top-4">
      {#each $result as sentence, i (i)}
        <div
          class="absolute overflow-visible w-1 h-1 bg-neutral-800 dark:bg-neutral-200 rounded-full"
          style={`top: ${sentence.y * 100 + 50}%; left: ${sentence.x * 100 + 50}%`}
        ></div>
        <Label style={`top: ${sentence.y * 100 + 50}%; left: ${sentence.x * 100 + 50}%`}>
          {sentence.value}
        </Label>
      {/each}
    </div>
  </div>

  <div class="min-w-80 flex-1 flex-grow-[9999] px-4">
    {#each $sentences as sentence, i}
      <div class:my-4={i > 0}>
        <Node
          bind:sentence
          isDraft={i === $sentences.length - 1}
          on:remove={() => {
            $sentences = $sentences.filter((s) => s !== sentence);
          }}
        />
      </div>
    {/each}
  </div>
</div>
