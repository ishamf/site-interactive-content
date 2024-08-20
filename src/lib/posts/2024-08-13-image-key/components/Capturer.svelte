<script lang="ts">
  let video: HTMLVideoElement;
  let hasStartedTakingPhoto = false;
  let canvas: HTMLCanvasElement;

  const width = 320;
  let height = 0;

  let isUsingRearCamera = false;

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
<video bind:this={video} on:canplay={onCanPlay} class:-scale-x-100={!isUsingRearCamera}></video>
<canvas bind:this={canvas} class="hidden"></canvas>
