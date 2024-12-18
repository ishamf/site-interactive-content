import { autorun } from 'mobx';
import { readable } from 'svelte/store';

export function createStoreFromMobx<T>(getter: () => T, setter?: (x: T) => unknown) {
  const store = readable<T>(undefined, (set) => autorun(() => set(getter())));

  return {
    subscribe: store.subscribe,
    set: setter,
  };
}
