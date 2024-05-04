<script lang="ts">
  export let disabled = false;
  export let value: string;
  export let rows = 1;
  export let caretColor: 'white' | 'auto' = 'auto';

  let textarea: HTMLTextAreaElement;
  let cover: HTMLDivElement;
</script>

<div class="flex relative dark:bg-slate-900 bg-slate-100">
  <div class="p-1 cover" class:disabled bind:this={cover}>
    <slot />{' '}
  </div>

  <textarea
    {rows}
    placeholder="Type stuff here!"
    class="p-1 input bg-transparent"
    class:disabled
    class:force-caret-white={caretColor === 'white'}
    bind:value
    bind:this={textarea}
    on:scroll={() => {
      if (!cover || !textarea) return;
      cover.scrollTop = textarea.scrollTop;
      cover.scrollLeft = textarea.scrollLeft;
    }}
  />
</div>

<style>
  .input {
    width: 100%;
    color: rgba(0, 0, 0, 0);

    position: relative;
    resize: none;

    /* Not exactly the right font color, but close enough */
    caret-color: #000;
  }

  @media (prefers-color-scheme: dark) {
    .input {
      caret-color: #fff;
    }
  }

  .input.force-caret-white {
    caret-color: #fff;
  }

  .input.disabled {
    pointer-events: none;
  }

  .cover {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    white-space: pre-wrap;
    overflow-wrap: anywhere;

    /* Disable interactions */
    pointer-events: none;

    overflow: auto;
  }

  .cover.disabled {
    pointer-events: auto;
  }
</style>
