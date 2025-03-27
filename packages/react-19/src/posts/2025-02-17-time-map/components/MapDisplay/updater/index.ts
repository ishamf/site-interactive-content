import { RefObject, useEffect, useReducer, useRef } from 'react';
import { drawMap } from './drawMap';
import { getSunAndEarthStateAtTime, linearlyInterpolateSunAndEarthState } from '../../../math';
import { SunAndEarthState } from '../../../types';
import { loadImageData, loadSmallImageData, MapImageData } from '../../../assets';
import { waitForMs } from '../../../utils';

type RenderingState =
  | {
      renderingState: 'idle';
      time: number;
    }
  | {
      renderingState: 'animatingToTime';
      time: number;
    }
  | { renderingState: 'renderingLowRes'; time: number }
  | { renderingState: 'renderingHighRes'; time: number };

type ImageDataState =
  | {
      imageDataState: 'loading';
    }
  | {
      imageDataState: 'smallLoaded';
      imageData: MapImageData;
    }
  | {
      imageDataState: 'largeLoaded';
      imageData: MapImageData;
    };

type State = RenderingState &
  ImageDataState & {
    hasRenderedOnce: boolean;
  };

type Action =
  | { type: 'newTime'; time: number }
  | { type: 'animateToTime'; time: number }
  | { type: 'doneAnimating'; time: number }
  | { type: 'doneRenderingLowRes'; time: number }
  | { type: 'doneRenderingHighRes'; time: number }
  | { type: 'doneLoadingSmallImages'; imageData: MapImageData }
  | { type: 'doneLoadingLargeImages'; imageData: MapImageData };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'newTime':
      return { ...state, renderingState: 'renderingLowRes', time: action.time };
    case 'animateToTime':
      return { ...state, renderingState: 'animatingToTime', time: action.time };
    case 'doneAnimating':
      if (state.renderingState === 'animatingToTime' && state.time === action.time) {
        return {
          ...state,
          renderingState: 'renderingLowRes',
          time: state.time,
          hasRenderedOnce: true,
        };
      } else {
        return state;
      }
    case 'doneRenderingLowRes':
      if (state.renderingState === 'renderingLowRes' && state.time === action.time) {
        return {
          ...state,
          renderingState: 'renderingHighRes',
          time: state.time,
          hasRenderedOnce: true,
        };
      } else {
        return state;
      }
    case 'doneRenderingHighRes':
      if (state.renderingState === 'renderingHighRes' && state.time === action.time) {
        return { ...state, renderingState: 'idle', time: state.time, hasRenderedOnce: true };
      } else {
        return state;
      }
    case 'doneLoadingSmallImages': {
      return {
        ...state,
        imageDataState: 'smallLoaded',
        imageData: action.imageData,
        renderingState: 'renderingLowRes',
      };
    }
    case 'doneLoadingLargeImages': {
      return {
        ...state,
        imageDataState: 'largeLoaded',
        imageData: action.imageData,
        renderingState: 'renderingLowRes',
      };
    }
  }
}

const ANIMATION_DURATION = 100;

export function useMapUpdater(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  time: number,
  animated: boolean
) {
  const [state, dispatch] = useReducer<State, [Action]>(reducer, {
    renderingState: 'idle',
    imageDataState: 'loading',
    time: 0,
    hasRenderedOnce: false,
  });

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
    if (time === state.time) return;

    if (animated) {
      dispatch({ type: 'animateToTime', time });
    } else {
      dispatch({ type: 'newTime', time });
    }
  }, [time, animated, state.time]);

  const currentRenderedSolarState = useRef<SunAndEarthState>(null);

  useEffect(() => {
    if (state.renderingState !== 'animatingToTime') return;
    if (state.imageDataState === 'loading') return;
    const mapImageData = state.imageData;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctxPreCheck = canvas.getContext('2d');
    if (!ctxPreCheck) return;

    const ctx = ctxPreCheck;

    const animationStart = Date.now();

    const targetTime = state.time;

    const initialSolarState =
      currentRenderedSolarState.current || getSunAndEarthStateAtTime(state.time);
    const targetSolarState = getSunAndEarthStateAtTime(targetTime);

    function animateMap() {
      const currentTime = Date.now();

      const animationProgress = Math.min((currentTime - animationStart) / ANIMATION_DURATION, 1);

      const animatedSolarState = linearlyInterpolateSunAndEarthState(
        initialSolarState,
        targetSolarState,
        animationProgress
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
          if (Date.now() > animationStart + ANIMATION_DURATION) {
            dispatch({ type: 'doneAnimating', time: state.time });
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
      cancelAnimationFrame(animationCallback);
    };
  }, [canvasRef, state]);

  useEffect(() => {
    if (state.renderingState !== 'renderingLowRes') return;
    if (state.imageDataState === 'loading') return;
    const mapImageData = state.imageData;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const solarState = getSunAndEarthStateAtTime(state.time);

    drawMap({
      ctx,
      state: solarState,
      alphaSize: 20,
      useWorker: false,
      mapImageData,
    })
      .then(() => {
        currentRenderedSolarState.current = solarState;
        dispatch({ type: 'doneRenderingLowRes', time: state.time });
      })
      .catch((e) => {
        console.error(e);
      });
  }, [canvasRef, state]);

  useEffect(() => {
    if (state.renderingState !== 'renderingHighRes') return;
    if (state.imageDataState === 'loading') return;
    const mapImageData = state.imageData;

    let abortController: AbortController | undefined;

    const timeout = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      abortController = new AbortController();

      const definedAbortController = abortController;

      const solarState = getSunAndEarthStateAtTime(state.time);

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
            dispatch({ type: 'doneRenderingHighRes', time: state.time });
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
  }, [canvasRef, state]);

  return {
    hasRenderedOnce: state.hasRenderedOnce,
    isLoadingImages: state.imageDataState === 'loading',
  };
}
