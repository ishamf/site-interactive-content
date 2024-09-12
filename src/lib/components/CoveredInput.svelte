<script lang="ts">
  export let disabled = false;
  export let value: string;
  export let padding: 'small' | 'medium' = 'small';
  export let placeholder = 'Type stuff here!';
  export let rows = 1;
  export let caretColor: 'white' | 'auto' = 'auto';

  let textarea: HTMLTextAreaElement;
  let cover: HTMLDivElement;

  $: paddingClass = padding === 'small' ? 'p-1' : 'p-2';
</script>

<div class="flex relative dark:bg-neutral-900 bg-neutral-100">
  <div class={'cover ' + paddingClass} class:disabled bind:this={cover}>
    <slot />{' '}
  </div>

  <textarea
    {rows}
    {placeholder}
    class={'input bg-transparent ' + paddingClass}
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
