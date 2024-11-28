<script lang="ts">
  import QRCode from 'qrcode';

  import Node from './components/Node.svelte';
  import TextButton from '../../components/TextButton.svelte';

  import type { URLElement } from './types';
  import { lenientParseUrl, lenientStringifyUrl, parseUrlToElement } from './utils';
  import { onMount } from 'svelte';

  const testUrl =
    'https://archive.org/wayback/available?url=https%3A%2F%2Fen.wikipedia.org%2Fw%2Findex.php%3Ftitle%3DWayback_Machine%26action%3Dhistory';

  const initialPrefillUrl = (() => {
    let initialPrefillUrlFromQuery: string;
    let initialPrefillUrlFromHash: string;

    const currentURL = new URL(location.href);
    initialPrefillUrlFromQuery = currentURL.searchParams.get('url') || '';

    const hash = currentURL.hash;
    if (hash.startsWith('#url=')) {
      initialPrefillUrlFromHash = decodeURIComponent(hash.slice(5));
    } else {
      initialPrefillUrlFromHash = '';
    }

    return initialPrefillUrlFromHash || initialPrefillUrlFromQuery;
  })();

  onMount(() => {
    if (initialPrefillUrl) {
      const rect = outerNode?.getBoundingClientRect();

      if (rect) {
        window.scrollTo({
          top: rect.top + window.scrollY - 32,
        });
      }
    }
  });

  let outerNode: HTMLElement;

  let url: URLElement = initialPrefillUrl ? parseUrlToElement(initialPrefillUrl) : { value: '' };

  let result = '';

  function setUrl(newUrl: string) {
    url = parseUrlToElement(newUrl);
  }

  function parseURL(url: URLElement): string {
    let currentURL: URL;
    try {
      currentURL = lenientParseUrl(url.value);
    } catch (e) {
      return url.value;
    }

    if (url.params) {
      for (const { key, url: subURL } of url.params) {
        if (!key) continue;
        currentURL.searchParams.append(key, parseURL(subURL));
      }
    }

    return lenientStringifyUrl(currentURL);
  }

  $: {
    result = parseURL(url);
  }

  $: {
    const current = new URL(location.href);
    if (result) {
      if (current.searchParams.has('url')) {
        current.search = '';
      }
      current.hash = 'url=' + encodeURIComponent(result);

      history.replaceState(null, '', current.toString());
    } else {
      current.hash = '';

      history.replaceState(null, '', current.toString());
    }
  }

  let hasCopied = false;

  $: {
    if (hasCopied) {
      setTimeout(() => {
        hasCopied = false;
      }, 1000);
    }
  }

  let hasCopiedShareUrl = false;

  $: {
    if (hasCopiedShareUrl) {
      setTimeout(() => {
        hasCopiedShareUrl = false;
      }, 1000);
    }
  }

  let showQRCode = false;

  let currentQRCodeImage = '';

  $: {
    if (showQRCode && result) {
      QRCode.toDataURL(result, {
        type: 'image/png',
        errorCorrectionLevel: 'M',
      }).then((code) => {
        currentQRCodeImage = code;
      });
    }
  }
</script>

{#if !result}
  <TextButton
    on:click={() => {
      setUrl(testUrl);
    }}
  >
    Try it out with a complex url!
  </TextButton>
{/if}

<Node key={null} bind:url bind:element={outerNode} />

<p
  class="p-4 flex-1 bg-neutral-100 dark:bg-neutral-700 overflow-hidden break-all"
  class:text-neutral-400={!result}
  class:dark:text-neutral-400={!result}
>
  {result ? result : 'The results will appear here'}
</p>

<div class="flex flex-row flex-wrap gap-4">
  <a
    href={result}
    rel="nofollow noreferrer external"
    class="px-4 py-2 no-underline font-normal
             bg-neutral-100 hover:bg-neutral-200 text-neutral-800
             dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-300

              focus:outline-none focus:ring-2 focus:ring-neutral-500
         "
  >
    Open URL
  </a>
  <TextButton
    on:click={async () => {
      try {
        await navigator.clipboard.writeText(result);
        hasCopied = true;
      } catch (e) {
        console.error(e);
      }
    }}
  >
    {hasCopied ? 'Copied!' : 'Copy URL'}
  </TextButton>
  <TextButton
    on:click={async () => {
      showQRCode = !showQRCode;
    }}
  >
    {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
  </TextButton>
  <TextButton
    on:click={async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        hasCopiedShareUrl = true;
      } catch (e) {
        console.error(e);
      }
    }}
  >
    {hasCopiedShareUrl ? 'Shared URL copied!' : 'Share URL to this page'}
  </TextButton>
</div>

{#if showQRCode}
  <div class="mx-auto h-48 w-48 bg-white mt-4">
    {#if currentQRCodeImage}
      <img class="my-0 h-48" src={currentQRCodeImage} alt="QR Code" />
    {/if}
  </div>
{/if}
