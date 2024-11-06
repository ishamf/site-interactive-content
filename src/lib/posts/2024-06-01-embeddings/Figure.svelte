<svelte:options customElement={{ tag: 'xif-embedding-figure', extend: addComponentStylesheet }} />

<script lang="ts">
  import { run } from 'svelte/legacy';

  import { writable } from 'svelte/store';
  import type { Sentence } from './types';
  import { asyncDerived } from '@square/svelte-store';
  import { Projector } from './projector';
  import SentenceDisplay from './components/SentenceDisplay.svelte';
  import { addComponentStylesheet } from '$lib/component';

  interface Props {
    /**
     * Comma separated list of sentences to display
     */
    sentences: string;
  }

  let { sentences }: Props = $props();

  const sentencesArray = writable([] as Sentence[]);

  run(() => {
    $sentencesArray = sentences.split(',').map((x) => ({ value: x }));
  });

  const projector = new Projector();

  const result = asyncDerived(
    [sentencesArray],
    async ([text]) => {
      const validText = text.filter((s) => s.value);

      if (validText.length === 0) return [];

      const res = await projector.project(validText, true);

      return res;
    },
    { initial: [] }
  );
</script>

<div class="text-neutral-800 dark:text-neutral-200 text-base relative z-10 flex justify-center">
  <SentenceDisplay sentences={$result}></SentenceDisplay>
</div>
