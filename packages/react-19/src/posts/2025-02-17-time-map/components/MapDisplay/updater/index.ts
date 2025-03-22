import { RefObject, useEffect, useReducer } from 'react';
import { drawMapAtTime } from './drawMap';

type RenderingState =
  | {
      renderingState: 'idle';
      time: number;
    }
  | { renderingState: 'renderingLowRes'; time: number }
  | { renderingState: 'renderingHighRes'; time: number };

type State = RenderingState & {
  hasRenderedOnce: boolean;
};

type Action =
  | { type: 'newTime'; time: number }
  | { type: 'doneRenderingLowRes'; time: number }
  | { type: 'doneRenderingHighRes'; time: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'newTime':
      return { ...state, renderingState: 'renderingLowRes', time: action.time };
    case 'doneRenderingLowRes':
      if (state.renderingState === 'renderingLowRes' && state.time === action.time) {
        return { renderingState: 'renderingHighRes', time: state.time, hasRenderedOnce: true };
      } else {
        return state;
      }
    case 'doneRenderingHighRes':
      if (state.renderingState === 'renderingHighRes' && state.time === action.time) {
        return { renderingState: 'idle', time: state.time, hasRenderedOnce: true };
      } else {
        return state;
      }
  }
}

export function useMapUpdater(canvasRef: RefObject<HTMLCanvasElement | null>, time: number) {
  const [state, dispatch] = useReducer<State, [Action]>(reducer, {
    renderingState: 'idle',
    time,
    hasRenderedOnce: false,
  });

  useEffect(() => {
    dispatch({ type: 'newTime', time });
  }, [time]);

  useEffect(() => {
    if (state.renderingState !== 'renderingLowRes') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawMapAtTime({
      ctx,
      time: state.time,
      alphaSize: 20,
      useWorker: false,
    })
      .then(() => {
        dispatch({ type: 'doneRenderingLowRes', time: state.time });
      })
      .catch((e) => {
        console.error(e);
      });
  }, [canvasRef, state]);

  useEffect(() => {
    if (state.renderingState !== 'renderingHighRes') return;

    let abortController: AbortController | undefined;

    const timeout = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      abortController = new AbortController();

      drawMapAtTime({
        ctx,
        time: state.time,
        alphaSize: 1,
        useWorker: true,
        abortSignal: abortController.signal,
      })
        .then(() => {
          dispatch({ type: 'doneRenderingHighRes', time: state.time });
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

  return { hasRenderedOnce: state.hasRenderedOnce };
}
