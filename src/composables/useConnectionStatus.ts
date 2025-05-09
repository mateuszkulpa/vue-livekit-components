import type { ConnectionState, Room } from 'livekit-client'
import type { Ref } from 'vue'
import { connectionStateObserver } from '@livekit/components-core'
import { inject, onUnmounted, ref } from 'vue'
import { LIVEKIT_ROOM_SYMBOL } from '../utils/injectionKeys'

/**
 * The `useConnectionStatus` composable allows you to simply implement your own connection status tracking.
 *
 * @example
 * ```tsx
 * const connectionStatus = useConnectionStatus(room);
 * ```
 * @public
 */
export function useConnectionStatus(room?: Room): Ref<ConnectionState> {
  const roomInstance = room ?? inject(LIVEKIT_ROOM_SYMBOL)?.value

  if (!roomInstance) {
    throw new Error('No LiveKit Room found. Make sure you are using this hook within a LiveKitRoom component or provide a room instance.')
  }

  const connectionStatus = ref(roomInstance.state)

  const observer = connectionStateObserver(roomInstance)
  const subscription = observer.subscribe((state) => {
    connectionStatus.value = state
  })

  onUnmounted(() => {
    subscription.unsubscribe()
  })

  return connectionStatus
}
