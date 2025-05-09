import type { MaybeRef } from 'vue'

export type MaybeRefObject<T> = {
  [K in keyof T]: MaybeRef<T[K]>
}
