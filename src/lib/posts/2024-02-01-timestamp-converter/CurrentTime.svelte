<svelte:options customElement={{ tag: 'xif-current-time' }} />

<script lang="ts">
  import { DateTime } from 'luxon';
  import { onMount } from 'svelte';

  export let type: 'iso-8601' | 'timestamp' | 'timestamp-ms';

  let currentTime = DateTime.now();

  onMount(() => {
    const interval = setInterval(() => {
      currentTime = DateTime.now();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  });

  let resultText = '';

  $: {
    switch (type) {
      case 'iso-8601':
        resultText = currentTime.set({ millisecond: 0 }).toISO({ suppressMilliseconds: true });
        break;
      case 'timestamp':
        resultText = currentTime.toUnixInteger().toString();
        break;
      case 'timestamp-ms':
        resultText = currentTime.valueOf().toString();
        break;
    }
  }
</script>

<span>
  {resultText}
</span>
