import type { Room } from 'livekit-client'
import type { Ref } from 'vue'
import { roomInfoObserver } from '@livekit/components-core'
import { onUnmounted, ref } from 'vue'
import { useEnsureRoom } from './useEnsureRoom'

/**
 * The `useRoomInfo` composable returns the name and metadata of the given `Room`.
 * @remarks
 * Needs to be called inside a `LiveKitRoom` component or by passing a `Room` instance.
 *
 * @example
 * ```vue
 * const { name, metadata } = useRoomInfo();
 * ```
 * @public
 */
export interface UseRoomInfoOptions {
  room?: Room
}

/** @public */
export function useRoomInfo(options: UseRoomInfoOptions = {}): Ref<{ name: string, metadata: string | undefined }> {
  const roomInstance = useEnsureRoom(options.room)

  const roomInfo = ref({
    name: roomInstance.name,
    metadata: roomInstance.metadata,
  })

  const observer = roomInfoObserver(roomInstance)
  const subscription = observer.subscribe((info) => {
    roomInfo.value = info
  })

  onUnmounted(() => {
    subscription.unsubscribe()
  })

  return roomInfo
}
