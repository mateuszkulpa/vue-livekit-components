import type { ConnectionState, Room } from 'livekit-client'
import type { Ref } from 'vue'
import { connectionStateObserver } from '@livekit/components-core'
import { onUnmounted, ref } from 'vue'
import { useEnsureRoom } from './useEnsureRoom'

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
  const roomInstance = useEnsureRoom(room)

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
