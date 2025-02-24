import { RefObject, useEffect, useState } from 'react';
import { drawMapAtTime } from './manager';

export function useMapUpdater(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  time: number,
  needQuickUpdate: boolean
) {
  const [pendingRequest, setPendingRequest] = useState<{
    time: number;
    needQuickUpdate: boolean;
  } | null>(null);
  const [isLowresProcessing, setIsLowresProcessing] = useState(false);
  const [pendingHighresTime, setPendingHighresTime] = useState<number | null>(null);
  const [isHighresProcessing, setIsHighresProcessing] = useState(false);
  const [highresAbortController, setHighresAbortController] = useState<AbortController | null>(
    null
  );

  useEffect(() => {
    setPendingRequest({ time, needQuickUpdate });
  }, [needQuickUpdate, time]);

  useEffect(() => {
    if (isLowresProcessing || pendingRequest === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (highresAbortController) {
      highresAbortController.abort();
    }
    setIsLowresProcessing(true);
    setPendingRequest(null);
    if (!pendingRequest.needQuickUpdate) {
      setPendingHighresTime(null);
    }

    drawMapAtTime({
      ctx,
      time: pendingRequest.time,
      alphaSize: pendingRequest.needQuickUpdate ? 20 : 1,
      useWorker: !pendingRequest.needQuickUpdate,
    }).then(() => {
      setIsLowresProcessing(false);
      if (pendingRequest.needQuickUpdate) {
        setPendingHighresTime(pendingRequest.time);
      }
    });
  }, [
    time,
    canvasRef,
    isLowresProcessing,
    pendingRequest,
    isHighresProcessing,
    highresAbortController,
  ]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLowresProcessing || isHighresProcessing || pendingHighresTime === null) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const abortController = new AbortController();

      setIsHighresProcessing(true);
      setPendingHighresTime(null);
      setHighresAbortController(abortController);

      drawMapAtTime({
        ctx,
        time: pendingHighresTime,
        alphaSize: 1,
        useWorker: true,
        abortSignal: abortController.signal,
      }).then(() => {
        setIsHighresProcessing(false);
        setHighresAbortController(null);
      });
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [canvasRef, isHighresProcessing, isLowresProcessing, pendingHighresTime]);
}
