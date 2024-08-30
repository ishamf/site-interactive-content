<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { mdiArrowDownThin, mdiCamera } from '@mdi/js';
  import { createEventDispatcher } from 'svelte';

  let video: HTMLVideoElement;
  let hasStartedTakingPhoto = false;
  let canvas: HTMLCanvasElement;

  const width = 320;
  let height = 0;

  let isUsingRearCamera = false;

  const dispatch = createEventDispatcher();

  async function getCameraStream() {
    try {
      // Try get rear camera if possible
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: 'environment' } },
        audio: false,
      });

      return {
        stream,
        isRear: true,
      };
    } catch (e) {
      if (e && typeof e === 'object' && 'constraint' in e && e.constraint === 'facingMode') {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        return {
          stream,
          isRear: false,
        };
      }

      throw e;
    }
  }

  export function takePhoto() {
    if (!hasStartedTakingPhoto) {
      getCameraStream().then(({ stream, isRear }) => {
        isUsingRearCamera = isRear;
        video.srcObject = stream;
        video.play();
      });
    } else {
      const context = canvas.getContext('2d');

      context?.drawImage(video, 0, 0, width, height);
      const data = canvas.toDataURL('image/jpg');

      return data;
    }
  }

  function onCanPlay() {
    if (!hasStartedTakingPhoto) {
      height = video.videoHeight / (video.videoWidth / width);

      canvas.width = width;
      canvas.height = height;

      hasStartedTakingPhoto = true;
    }
  }
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<!-- class="" -->
<div class="camera">
  <video bind:this={video} on:canplay={onCanPlay} class:-scale-x-100={!isUsingRearCamera}></video>
  <canvas bind:this={canvas} class="hidden"></canvas>

  <div
    class="absolute bottom-16 left-16 right-16
              flex flex-col items-center text-white text-center gap-4"
  >
    {#if !hasStartedTakingPhoto}
      <p>Press the button below to enable the camera.</p>
      <p>All images are processed and stored locally.</p>
      <p>
        If you take a photo, around 100MB of model data will be downloaded to process the image.
      </p>
      <div class="w-8 h-8">
        <Icon icon={mdiArrowDownThin} title="Arrow down" style="white"></Icon>
      </div>
    {/if}

    <Button
      fullWidth
      icon={mdiCamera}
      on:click={() => {
        const res = takePhoto();

        if (res) {
          dispatch('photo', res);
        }
      }}
      title="Take Photo"
    ></Button>
  </div>
</div>

<style lang="postcss">
  .camera {
    background-color: black;
    position: relative;
    height: min(40rem, 100svh);

    top: 0;

    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
    gap: 1rem;
  }
</style>
