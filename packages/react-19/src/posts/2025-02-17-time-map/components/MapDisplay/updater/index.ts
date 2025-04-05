import { RefObject, useEffect, useReducer, useRef } from 'react';
import { spring } from 'motion';
import { drawMap } from './drawMap';
import { getSunAndEarthStateAtTime, linearlyInterpolateSunAndEarthState } from '../../../math';
import { RenderBehavior, SunAndEarthState } from '../../../types';
import { loadImageData, loadSmallImageData, MapImageData } from '../../../assets';
import { waitForMs } from '../../../utils';

type RenderingState =
  | {
      state: 'idle';
      time: number;
    }
  | {
      state: 'animatingToTime';
      time: number;
    }
  | { state: 'renderingLowRes'; time: number }
  | { state: 'renderingHighRes'; time: number };

type ImageDataState =
  | {
      state: 'loading';
    }
  | {
      state: 'smallLoaded';
      imageData: MapImageData;
    }
  | {
      state: 'largeLoaded';
      imageData: MapImageData;
    };

type State = {
  renderingState: RenderingState;
  imageDataState: ImageDataState;
  hasRenderedOnce: boolean;
};

type Action =
  | { type: 'newTime'; time: number; skipLowRes: boolean }
  | { type: 'animateToTime'; time: number }
  | { type: 'doneAnimating'; time: number }
  | { type: 'doneRenderingLowRes'; time: number }
  | { type: 'doneRenderingHighRes'; time: number }
  | { type: 'doneLoadingSmallImages'; imageData: MapImageData }
  | { type: 'doneLoadingLargeImages'; imageData: MapImageData };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'newTime':
      return {
        ...state,
        renderingState: {
          state: action.skipLowRes ? 'renderingHighRes' : 'renderingLowRes',
          time: action.time,
        },
      };
    case 'animateToTime':
      return {
        ...state,
        renderingState: {
          state: 'animatingToTime',
          time: action.time,
        },
      };
    case 'doneAnimating':
      if (
        state.renderingState.state === 'animatingToTime' &&
        state.renderingState.time === action.time
      ) {
        return {
          ...state,
          renderingState: {
            state: 'renderingLowRes',
            time: state.renderingState.time,
          },
          hasRenderedOnce: true,
        };
      } else {
        return state;
      }
    case 'doneRenderingLowRes':
      if (
        state.renderingState.state === 'renderingLowRes' &&
        state.renderingState.time === action.time
      ) {
        return {
          ...state,
          renderingState: {
            state: 'renderingHighRes',
            time: state.renderingState.time,
          },
          hasRenderedOnce: true,
        };
      } else {
        return state;
      }
    case 'doneRenderingHighRes':
      if (
        state.renderingState.state === 'renderingHighRes' &&
        state.renderingState.time === action.time
      ) {
        return {
          ...state,
          renderingState: {
            state: 'idle',
            time: state.renderingState.time,
          },
          hasRenderedOnce: true,
        };
      } else {
        return state;
      }
    case 'doneLoadingSmallImages': {
      return {
        ...state,
        imageDataState: {
          state: 'smallLoaded',
          imageData: action.imageData,
        },
        renderingState: {
          ...state.renderingState,
          state: 'renderingLowRes',
        },
      };
    }
    case 'doneLoadingLargeImages': {
      return {
        ...state,
        imageDataState: {
          state: 'largeLoaded',
          imageData: action.imageData,
        },
        renderingState: {
          ...state.renderingState,
          state: 'renderingLowRes',
        },
      };
    }
  }
}

const ANIMATION_DURATION = 150;

export function useMapUpdater(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  time: number,
  renderBehavior: RenderBehavior
) {
  const [state, dispatch] = useReducer(reducer, {
    renderingState: {
      state: 'idle',
      time: 0,
    },
    imageDataState: {
      state: 'loading',
    },
    hasRenderedOnce: false,
  });

  const { renderingState, imageDataState } = state;

  useEffect(() => {
    (async () => {
      const smallImageDataPromise: Promise<Action> = loadSmallImageData().then((imageData) => ({
        type: 'doneLoadingSmallImages',
        imageData,
      }));
      const largeImageDataPromise: Promise<Action> = loadImageData().then((imageData) => ({
        type: 'doneLoadingLargeImages',
        imageData,
      }));

      // If the large image data finishes quickly enough (e.g. if it's cached), just use it
      const possiblyLargeImageData = await Promise.race([waitForMs(100), largeImageDataPromise]);

      if (possiblyLargeImageData) {
        dispatch(possiblyLargeImageData);
        return;
      }

      const earliestPromise = await Promise.race([smallImageDataPromise, largeImageDataPromise]);

      dispatch(earliestPromise);

      if (earliestPromise.type === 'doneLoadingSmallImages') {
        dispatch(await largeImageDataPromise);
      }
    })().catch((e) => {
      console.error(e);
    });
  }, []);

  useEffect(() => {
    if (time === renderingState.time) return;

    if (renderBehavior === 'animated') {
      dispatch({ type: 'animateToTime', time });
    } else {
      dispatch({ type: 'newTime', time, skipLowRes: renderBehavior === 'deferred' });
    }
  }, [time, renderingState.time, renderBehavior]);

  const currentRenderedSolarState = useRef<SunAndEarthState>(null);

  useEffect(() => {
    if (renderingState.state !== 'animatingToTime') return;
    if (imageDataState.state === 'loading') return;
    const mapImageData = imageDataState.imageData;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctxPreCheck = canvas.getContext('2d');
    if (!ctxPreCheck) return;

    const ctx = ctxPreCheck;

    const animationStart = Date.now();

    const targetTime = renderingState.time;

    const initialSolarState =
      currentRenderedSolarState.current || getSunAndEarthStateAtTime(renderingState.time);
    const targetSolarState = getSunAndEarthStateAtTime(targetTime);

    const springGenerator = spring({
      keyframes: [0, 1],
      visualDuration: ANIMATION_DURATION / 1000,
      bounce: 0,
    });

    let animationStopped = false;

    function animateMap() {
      const currentTime = Date.now();

      const delta = currentTime - animationStart;

      const { value, done } = springGenerator.next(delta);

      const animatedSolarState = linearlyInterpolateSunAndEarthState(
        initialSolarState,
        targetSolarState,
        value
      );

      drawMap({
        ctx,
        state: animatedSolarState,
        alphaSize: 20,
        useWorker: false,
        mapImageData,
      })
        .then(() => {
          currentRenderedSolarState.current = animatedSolarState;
          if (done || animationStopped) {
            dispatch({ type: 'doneAnimating', time: renderingState.time });
          } else {
            animationCallback = requestAnimationFrame(animateMap);
          }
        })
        .catch((e) => {
          console.error(e);
        });
    }

    let animationCallback = requestAnimationFrame(animateMap);

    return () => {
      animationStopped = true;
      cancelAnimationFrame(animationCallback);
    };
  }, [canvasRef, imageDataState, renderingState]);

  useEffect(() => {
    if (renderingState.state !== 'renderingLowRes') return;
    if (imageDataState.state === 'loading') return;
    const mapImageData = imageDataState.imageData;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const solarState = getSunAndEarthStateAtTime(renderingState.time);

    drawMap({
      ctx,
      state: solarState,
      alphaSize: 20,
      useWorker: false,
      mapImageData,
    })
      .then(() => {
        currentRenderedSolarState.current = solarState;
        dispatch({ type: 'doneRenderingLowRes', time: renderingState.time });
      })
      .catch((e) => {
        console.error(e);
      });
  }, [canvasRef, imageDataState, renderingState]);

  useEffect(() => {
    if (renderingState.state !== 'renderingHighRes') return;
    if (imageDataState.state === 'loading') return;
    const mapImageData = imageDataState.imageData;

    let abortController: AbortController | undefined;

    const timeout = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      abortController = new AbortController();

      const definedAbortController = abortController;

      const solarState = getSunAndEarthStateAtTime(renderingState.time);

      drawMap({
        ctx,
        state: solarState,
        alphaSize: 1,
        useWorker: true,
        abortSignal: abortController.signal,
        mapImageData,
      })
        .then(() => {
          if (!definedAbortController.signal.aborted) {
            currentRenderedSolarState.current = solarState;
            dispatch({ type: 'doneRenderingHighRes', time: renderingState.time });
          }
        })
        .catch((e) => {
          console.error(e);
        });
    }, 500);

    return () => {
      clearTimeout(timeout);
      abortController?.abort();
    };
  }, [canvasRef, imageDataState, renderingState]);

  return {
    hasRenderedOnce: state.hasRenderedOnce,
    isLoadingImages: state.imageDataState.state === 'loading',
  };
}
