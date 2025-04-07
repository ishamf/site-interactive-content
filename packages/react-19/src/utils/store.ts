export function onlyIfChanged<T>(
  keyGetter: (state: T) => unknown[],
  listener: (state: T, prevState: T) => void
): (state: T, prevState: T) => void {
  return (state, prevState) => {
    const currentKeys = keyGetter(state);
    const previousKeys = keyGetter(prevState);
    const hasChanged = currentKeys.some((key, index) => {
      return key !== previousKeys[index];
    });

    if (hasChanged) {
      listener(state, prevState);
    }
  };
}
