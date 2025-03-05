import { RefObject, useEffect, useReducer } from 'react';
import { drawMapAtTime } from './manager';

type State =
  | {
      state: 'idle';
      time: number;
    }
  | { state: 'renderingLowRes'; time: number }
  | { state: 'renderingHighRes'; time: number };

type Action =
  | { type: 'newTime'; time: number }
  | { type: 'doneRenderingLowRes'; time: number }
  | { type: 'doneRenderingHighRes'; time: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'newTime':
      return { state: 'renderingLowRes', time: action.time };
    case 'doneRenderingLowRes':
      if (state.state === 'renderingLowRes' && state.time === action.time) {
        return { state: 'renderingHighRes', time: state.time };
      } else {
        return state;
      }
    case 'doneRenderingHighRes':
      if (state.state === 'renderingHighRes' && state.time === action.time) {
        return { state: 'idle', time: state.time };
      } else {
        return state;
      }
  }
}

export function useMapUpdater(canvasRef: RefObject<HTMLCanvasElement | null>, time: number) {
  const [state, dispatch] = useReducer<State, [Action]>(reducer, { state: 'idle', time });

  useEffect(() => {
    dispatch({ type: 'newTime', time });
  }, [time]);

  useEffect(() => {
    if (state.state !== 'renderingLowRes') return;

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
    if (state.state !== 'renderingHighRes') return;

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
}
