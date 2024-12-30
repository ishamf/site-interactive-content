export type ValidationState = {
  state: 'valid' | 'invalid' | 'pending' | 'empty';
  error: string;
};

export function delayedValidator<T>(
  valueGetter: () => T,
  validator: (value: T) => string | null,
  delay = (1000 / 3) * 2
): ValidationState {
  const state: ValidationState = $state({
    state: 'pending',
    error: '',
  });

  $effect(() => {
    const value = valueGetter();

    if (!value) {
      state.state = 'empty';
      state.error = '';
      return;
    }

    const error = validator(value);
    if (!error) {
      state.state = 'valid';
      state.error = '';
    } else {
      state.state = 'pending';
      state.error = '';

      const timeout = setTimeout(() => {
        state.state = 'invalid';
        state.error = error;
      }, delay);

      return () => {
        clearTimeout(timeout);
      };
    }
  });

  return state;
}
