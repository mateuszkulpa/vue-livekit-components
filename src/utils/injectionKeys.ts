import type { Room } from 'livekit-client'
import type { InjectionKey, ShallowRef } from 'vue'

export const LIVEKIT_ROOM_SYMBOL: InjectionKey<ShallowRef<Room>> = Symbol('LiveKitRoom')
