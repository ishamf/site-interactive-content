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

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

  const x1Axis = writable('food');
  const x2Axis = writable('fruit');
  const y1Axis = writable('food');
  const y2Axis = writable('meat');

  const sentences = writable([] as Sentence[]);

  // Create drafts if needed
  $: {
    if ($sentences.every((x) => !!x.value)) {
      // Automatically create draft sentences if all is filled
      $sentences = [
        ...$sentences,
        { label: alphabet.find((c) => !$sentences.some((s) => s.label === c)) || '?', value: '' },
      ];
    }
  }

  const projector = createProjector();

  const result = asyncDerived(
    [x1Axis, x2Axis, y1Axis, y2Axis, sentences],
    async ([x1, x2, y1, y2, text]) => {
      await new Promise((r) => setTimeout(r, 300));

      const validText = text.filter((s) => s.value);

      if (validText.length === 0 || !x1 || !x2 || !y1 || !y2) return [];

      const res = await projector.project(x1, x2, y1, y2, validText);

      return res;
    },
    { initial: [] }
  );
</script>

<div class="flex gap-4">
  <Input bind:value={$x1Axis} placeholder="X Axis..." />
  <Input bind:value={$x2Axis} placeholder="X Axis..." />
  <Input bind:value={$y1Axis} placeholder="Y Axis..." />
  <Input bind:value={$y2Axis} placeholder="Y Axis..." />
</div>

{#each $sentences as sentence, i}
  <div class="my-4">
    <Node
      bind:sentence
      isDraft={i === $sentences.length - 1}
      on:remove={() => {
        $sentences = $sentences.filter((s) => s !== sentence);
      }}
    />
  </div>
{/each}

<svg viewBox="-100 -100 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- A marker to be used as an arrowhead -->
    <marker
      id="arrow"
      viewBox="0 0 10 10"
      refX="5"
      refY="5"
      markerWidth="6"
      markerHeight="6"
      orient="auto-start-reverse"
    >
      <path d="M 0 0 L 10 5 L 0 10 z" />
    </marker>
  </defs>

  {#each $result as projection}
    <line
      x1="0"
      y1="0"
      x2={projection.x * 100}
      y2={projection.y * 100}
      stroke="black"
      marker-end="url(#arrow)"
    />
  {/each}
</svg>

<pre>
  {result ? JSON.stringify($result, null, 2) : 'No result'}
</pre>
