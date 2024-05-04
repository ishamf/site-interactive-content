<script lang="ts">
  import './lib/entries/2023-glowing-text'
  import './lib/entries/2023-input-styling';
  import './lib/entries/2023-url-tools';
  import './lib/entries/2024-timestamp-converter';
</script>

<main>
  <!-- Only used for testing -->
  <xif-url-tools></xif-url-tools>

  <xif-timestamp-converter></xif-timestamp-converter>

  <xif-input-styling-1></xif-input-styling-1>

  <xif-input-styling-2></xif-input-styling-2>

  <xif-input-styling-3></xif-input-styling-3>

  <xif-glowing-text></xif-glowing-text>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
</style>
