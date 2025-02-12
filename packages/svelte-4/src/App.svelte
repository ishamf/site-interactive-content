<script lang="ts">
  import './lib/app.css';
  import './lib/entries/2023-glowing-text';
  import './lib/entries/2023-input-styling';
  import './lib/entries/2023-url-tools';
  import './lib/entries/2024-timestamp-converter';
  import './lib/entries/2024-embeddings';
  import './lib/entries/2024-image-key';
  import './lib/entries/2024-window-position';
  import './lib/entries/2024-parameterized-calculator';

  import TextButton from '$lib/components/TextButton.svelte';
  import Container from '$lib/components/Container.svelte';

  const appComponents = [
    'url-tools',
    'timestamp-converter',
    'input-styling',
    'glowing-text',
    'embeddings',
    'image-key',
    'window-display',
    'calculator',
  ] as const;

  type AppComponent = (typeof appComponents)[number];

  const appComponentLabels: Record<AppComponent, string> = {
    'url-tools': 'Url Tools',
    'timestamp-converter': 'Timestamp Converter',
    'input-styling': 'Input Styling',
    'glowing-text': 'Glowing Text',
    embeddings: 'Embeddings',
    'image-key': 'Image Key',
    'window-display': 'Window Display',
    calculator: 'Calculator',
  };

  let currentComponent: AppComponent = 'url-tools';
</script>

<main class="max-w-3xl">
  <Container>
    <div class="p-4 flex flex-row gap-4">
      {#each appComponents as appComponent}
        <TextButton
          on:click={() => {
            currentComponent = appComponent;
          }}
          selected={appComponent === currentComponent}
        >
          {appComponentLabels[appComponent]}
        </TextButton>
      {/each}
    </div>
  </Container>

  {#if currentComponent === 'url-tools'}
    <xif-url-tools></xif-url-tools>
  {/if}

  {#if currentComponent === 'timestamp-converter'}
    <xif-timestamp-converter></xif-timestamp-converter>
  {/if}

  {#if currentComponent === 'input-styling'}
    <p class="time-display">
      Current times, in ISO-8601: <xif-current-time type="iso-8601">Not loaded</xif-current-time>
      Timestamp: <xif-current-time type="timestamp">Not loaded</xif-current-time>
      Timestamp-ms: <xif-current-time type="timestamp-ms">Not loaded</xif-current-time>
    </p>
    <xif-input-styling-1></xif-input-styling-1>
    <xif-input-styling-2></xif-input-styling-2>
    <xif-input-styling-3></xif-input-styling-3>
  {/if}

  {#if currentComponent === 'glowing-text'}
    <xif-glowing-text></xif-glowing-text>
  {/if}

  {#if currentComponent === 'embeddings'}
    <xif-embeddings></xif-embeddings>
    <xif-embedding-figure
      sentences="good app,bad app,hard to use,easy to use,responsive,unresponsive,quick load times,slow load times"
    ></xif-embedding-figure>
  {/if}

  {#if currentComponent === 'image-key'}
    <xif-image-key></xif-image-key>
  {/if}

  {#if currentComponent === 'window-display'}
    <xif-window-display></xif-window-display>
  {/if}

  {#if currentComponent === 'calculator'}
    <xif-calculator></xif-calculator>
  {/if}
</main>

<style lang="postcss">
  main {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  .time-display {
    font-size: 16px;
  }

  @media (prefers-color-scheme: dark) {
    .time-display {
      color: white;
    }
  }
</style>
