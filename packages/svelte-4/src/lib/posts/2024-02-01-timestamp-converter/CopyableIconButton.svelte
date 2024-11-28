<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { mdiContentCopy, mdiCheckCircle } from '@mdi/js';

  export let content: string;

  let done = false;

  $: {
    if (done) {
      setTimeout(() => {
        done = false;
      }, 1000);
    }
  }
</script>

<div class="inline-block align-middle">
  {#if done}
    <div class="inline-block w-4 h-4">
      <Icon title="Copied" icon={mdiCheckCircle} style="text" />
    </div>
  {:else}
    <button
      class="w-4 h-4"
      on:click={async () => {
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
