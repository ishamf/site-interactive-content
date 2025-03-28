import { useEffect, useState } from 'react';

export function useElementSize({ ref }: { ref: React.RefObject<HTMLElement | null> }) {
  const [latestSize, setLatestSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    function updateSize() {
      if (!ref.current) {
        return;
      }

      const { offsetWidth, offsetHeight } = ref.current;

      setLatestSize({ width: offsetWidth, height: offsetHeight });
    }

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    return () => {
      resizeObserver.disconnect();
      setLatestSize(null);
    };
  }, [ref]);

  return latestSize;
}
