<script lang="ts">
  interface Props {
    disabled?: boolean;
    value: string;
    padding?: 'small' | 'medium';
    placeholder?: string;
    rows?: number;
    caretColor?: 'white' | 'auto';
    children?: import('svelte').Snippet;
  }

  let {
    disabled = false,
    value = $bindable(),
    padding = 'small',
    placeholder = 'Type stuff here!',
    rows = 1,
    caretColor = 'auto',
    children,
  }: Props = $props();

  let textarea: HTMLTextAreaElement | undefined = $state();
  let cover: HTMLDivElement | undefined = $state();

  let paddingClass = $derived(padding === 'small' ? 'p-1' : 'p-2');
</script>

<div class="flex relative dark:bg-neutral-800 bg-neutral-100">
  <textarea
    {rows}
    {placeholder}
    class={'input focus:outline-none focus:ring-2 focus:ring-neutral-500 bg-transparent ' +
      paddingClass}
    class:disabled
    class:force-caret-white={caretColor === 'white'}
    bind:value
    bind:this={textarea}
    onscroll={() => {
      if (!cover || !textarea) return;
      cover.scrollTop = textarea.scrollTop;
      cover.scrollLeft = textarea.scrollLeft;
    }}
  ></textarea>

  <div class={'cover ' + paddingClass} class:disabled bind:this={cover}>
    {@render children?.()}{' '}
  </div>
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
