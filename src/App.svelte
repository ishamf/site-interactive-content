<script lang="ts">
  import './lib/app.css';
  import './lib/entries/2023-glowing-text';
  import './lib/entries/2023-input-styling';
  import './lib/entries/2023-url-tools';
  import './lib/entries/2024-timestamp-converter';
  import './lib/entries/2024-embeddings';
  import './lib/entries/2024-image-key';
</script>

<main class="max-w-3xl">
  <!-- Only used for testing -->
  <xif-url-tools></xif-url-tools>

  <xif-timestamp-converter></xif-timestamp-converter>

  <p class="time-display">
    Current times, in ISO-8601: <xif-current-time type="iso-8601">Not loaded</xif-current-time>
    Timestamp: <xif-current-time type="timestamp">Not loaded</xif-current-time>
    Timestamp-ms: <xif-current-time type="timestamp-ms">Not loaded</xif-current-time>
  </p>

  <xif-input-styling-1></xif-input-styling-1>

  <xif-input-styling-2></xif-input-styling-2>

  <xif-input-styling-3></xif-input-styling-3>

  <xif-glowing-text></xif-glowing-text>

  <xif-embeddings></xif-embeddings>

  <xif-embedding-figure
    sentences="good app,bad app,hard to use,easy to use,responsive,unresponsive,quick load times,slow load times"
  ></xif-embedding-figure>

  <xif-image-key></xif-image-key>
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
