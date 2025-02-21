import { RefObject, useEffect, useState } from 'react';
import { drawMapAtTimeWithWorker } from './manager';

async function drawMapAtTime({
  ctx,
  time,
  alphaSize = 1,
}: {
  ctx: CanvasRenderingContext2D;
  time: number;
  alphaSize: number;
}) {
  await drawMapAtTimeWithWorker({
    ctx,
    time,
    alphaSize,
  });
}

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

  useEffect(() => {
    setPendingRequest({ time, needQuickUpdate });
  }, [needQuickUpdate, time]);

  useEffect(() => {
    if (isLowresProcessing || isHighresProcessing || pendingRequest === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsLowresProcessing(true);
    setPendingRequest(null);
    if (!pendingRequest.needQuickUpdate) {
      setPendingHighresTime(null);
    }

    drawMapAtTime({
      ctx,
      time: pendingRequest.time,
      alphaSize: pendingRequest.needQuickUpdate ? 20 : 1,
    }).then(() => {
      setIsLowresProcessing(false);
      if (pendingRequest.needQuickUpdate) {
        setPendingHighresTime(pendingRequest.time);
      }
    });
  }, [time, canvasRef, isLowresProcessing, pendingRequest, isHighresProcessing]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLowresProcessing || isHighresProcessing || pendingHighresTime === null) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      setIsHighresProcessing(true);
      setPendingHighresTime(null);

      drawMapAtTime({ ctx, time: pendingHighresTime, alphaSize: 1 }).then(() => {
        setIsHighresProcessing(false);
      });
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [canvasRef, isHighresProcessing, isLowresProcessing, pendingHighresTime]);
}
