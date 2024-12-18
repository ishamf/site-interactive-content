export function lastAvailableResult<T>(resultGetter: () => T | null | undefined) {
  let last = $state(resultGetter());
  let isValid = $state(!!resultGetter());

  $effect(() => {
    const result = resultGetter();
    if (result != null) {
      last = result;
      isValid = true;
    } else {
      isValid = false;
    }
  });

  return {
    get latest() {
      return last;
    },

    get isValid() {
      return isValid;
    },
  };
}
