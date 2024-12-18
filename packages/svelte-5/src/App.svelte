<script lang="ts">
  import './lib/app.css';
  import './lib/entries/2024-ip-range';
</script>

<main class="max-w-3xl">
  <!-- Only used for testing -->

  <xif-ip-range-calculator></xif-ip-range-calculator>
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
