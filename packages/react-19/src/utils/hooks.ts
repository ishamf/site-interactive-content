import { useEffect, useRef } from 'react';

export function useElementSize({
  ref,
  onSizeChange,
}: {
  ref: React.RefObject<HTMLElement | null>;
  onSizeChange: (size: { width: number; height: number } | null) => void;
}) {
  const latestOnSizeChange = useRef(onSizeChange);

  useEffect(() => {
    latestOnSizeChange.current = onSizeChange;
  }, [onSizeChange]);

  useEffect(() => {
    function updateSize() {
      if (!ref.current) {
        return;
      }

      const { offsetWidth, offsetHeight } = ref.current;

      latestOnSizeChange.current({ width: offsetWidth, height: offsetHeight });
    }

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    return () => {
      resizeObserver.disconnect();
      latestOnSizeChange.current(null);
    };
  }, [ref]);
}
