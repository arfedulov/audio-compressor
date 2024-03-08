import { ref } from 'vue';
import { watchDebounced } from '@vueuse/core';

interface RefWithEffectOptions {
  debounce?: number;
}
export const refWithEffect = <T>(
  initialValue: T,
  effectFn: (v: T) => void,
  options?: RefWithEffectOptions
) => {
  const r = ref(initialValue);
  watchDebounced(r, (v) => effectFn(v as T), {
    debounce: options?.debounce || 0
  });

  return r;
};
