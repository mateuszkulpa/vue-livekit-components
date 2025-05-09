import type { Room } from 'livekit-client'
import { inject } from 'vue'
import { LIVEKIT_ROOM_SYMBOL } from '../utils/injectionKeys'

/**
 * Ensures that a room is provided, either via injection or explicitly as a parameter.
 * If no room is provided, an error is thrown.
 * @public
 */
export function useEnsureRoom(room?: Room): Room {
  const injectedRoom = inject(LIVEKIT_ROOM_SYMBOL)
  const r = room ?? injectedRoom?.value

  if (!r) {
    throw new Error(
      'No room provided, make sure you are inside a LiveKitRoom component or pass the room explicitly',
    )
  }

  return r
}
