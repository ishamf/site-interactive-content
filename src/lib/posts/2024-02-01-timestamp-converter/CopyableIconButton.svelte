<script lang="ts">
  import { run } from 'svelte/legacy';

  import Icon from '$lib/components/Icon.svelte';
  import { mdiContentCopy, mdiCheckCircle } from '@mdi/js';

  interface Props {
    content: string;
  }

  let { content }: Props = $props();

  let done = $state(false);

  run(() => {
    if (done) {
      setTimeout(() => {
        done = false;
      }, 1000);
    }
  });
</script>

<div class="inline-block align-middle">
  {#if done}
    <div class="inline-block w-4 h-4">
      <Icon title="Copied" icon={mdiCheckCircle} style="text" />
    </div>
  {:else}
    <button
      class="w-4 h-4"
      onclick={async () => {
        try {
          await navigator.clipboard.writeText(content);
          done = true;
        } catch (e) {
          console.error(e);
        }
      }}
    >
      <Icon title="Copy" icon={mdiContentCopy} style="text" />
    </button>
  {/if}
</div>
