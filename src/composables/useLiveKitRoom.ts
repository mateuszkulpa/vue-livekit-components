import type {
  AudioCaptureOptions,
  DisconnectReason,
  MediaDeviceFailure,
  Room,
  RoomConnectOptions,
  RoomOptions,
  ScreenShareCaptureOptions,
  VideoCaptureOptions,
} from 'livekit-client'
import type { ShallowRef } from 'vue'
import type { MaybeRefObject } from '../utils/types'
import { log } from '@livekit/components-core'
import { MediaDeviceFailure as MediaDeviceFailureClass, Room as RoomClass, RoomEvent } from 'livekit-client'
import { onBeforeUnmount, provide, ref, shallowRef, unref, watch, watchEffect } from 'vue'
import { LIVEKIT_ROOM_SYMBOL } from '../utils/injectionKeys'

export interface UseLiveKitRoomCallbacks {
  /**
   * Called when the room is connected
   */
  onConnected?: () => void
  /**
   * Called when the room is disconnected
   */
  onDisconnected?: (reason?: DisconnectReason) => void
  /**
   * Called when an error occurs
   */
  onError?: (error: Error) => void
  /**
   * Called when an encryption error occurs
   */
  onEncryptionError?: (error: Error) => void
  /**
   * Called when a media device failure occurs
   */
  onMediaDeviceFailure?: (failure?: MediaDeviceFailure) => void
}

export interface UseLiveKitRoomOptions {
  /**
   * URL to the LiveKit server.
   */
  serverUrl?: string
  /**
   * A user specific access token for a client to authenticate to the room.
   */
  token?: string
  /**
   * If set to true a connection to LiveKit room is initiated.
   */
  connect?: boolean
  /**
   * Options for when creating a new room.
   */
  options?: RoomOptions
  /**
   * Optional room instance.
   */
  room?: Room
  /**
   * Define options how to connect to the LiveKit server.
   */
  connectOptions?: RoomConnectOptions
  /**
   * Publish audio immediately after connecting.
   */
  audio?: AudioCaptureOptions | boolean
  /**
   * Publish video immediately after connecting.
   */
  video?: VideoCaptureOptions | boolean
  /**
   * Publish screen share immediately after connecting.
   */
  screen?: ScreenShareCaptureOptions | boolean
  /**
   * For simulation purposes only
   */
  simulateParticipants?: number
}

const defaultOptions: Partial<UseLiveKitRoomOptions> = {
  connect: true,
  audio: false,
  video: false,
}

export function useLiveKitRoom(
  options: MaybeRefObject<UseLiveKitRoomOptions> & MaybeRefObject<UseLiveKitRoomCallbacks> = {},
): { room: ShallowRef<Room> } {
  const roomOptions = unref(options.options)
  const passedRoom = unref(options.room)

  if (roomOptions && passedRoom) {
    console.warn(
      'When using a manually created room, the options object will be ignored. Set the desired options directly when creating the room instead.',
    )
  }

  const room = shallowRef<Room>(passedRoom ?? new RoomClass(roomOptions))
  const isConnecting = ref(false)
  const shouldConnect = ref(unref(options.connect) ?? defaultOptions.connect)

  const setupRoomListeners = () => {
    const onSignalConnected = (): void => {
      const localP = room.value.localParticipant
      const audioOption = unref(options.audio) ?? defaultOptions.audio
      const videoOption = unref(options.video) ?? defaultOptions.video
      const screenOption = unref(options.screen) ?? false

      log.debug('trying to publish local tracks')
      Promise.all([
        localP.setMicrophoneEnabled(!!audioOption, typeof audioOption !== 'boolean' ? audioOption : undefined),
        localP.setCameraEnabled(!!videoOption, typeof videoOption !== 'boolean' ? videoOption : undefined),
        localP.setScreenShareEnabled(!!screenOption, typeof screenOption !== 'boolean' ? screenOption : undefined),
      ]).catch((e) => {
        log.warn(e)
        const onError = unref(options.onError)
        onError?.(e as Error)
      })
    }

    const handleMediaDeviceError = (e: Error): void => {
      const mediaDeviceFailure = MediaDeviceFailureClass.getFailure(e)
      const onMediaDeviceFailure = unref(options.onMediaDeviceFailure)
      onMediaDeviceFailure?.(mediaDeviceFailure)
    }

    const handleEncryptionError = (e: Error): void => {
      const onEncryptionError = unref(options.onEncryptionError)
      onEncryptionError?.(e)
    }

    const handleDisconnected = (reason?: DisconnectReason): void => {
      const onDisconnected = unref(options.onDisconnected)
      onDisconnected?.(reason)
    }

    const handleConnected = (): void => {
      const onConnected = unref(options.onConnected)
      onConnected?.()
    }

    room.value
      .on(RoomEvent.SignalConnected, onSignalConnected)
      .on(RoomEvent.Connected, handleConnected)
      .on(RoomEvent.Disconnected, handleDisconnected)
      .on(RoomEvent.MediaDevicesError, handleMediaDeviceError)
      .on(RoomEvent.EncryptionError, handleEncryptionError)

    return () => {
      room.value
        .off(RoomEvent.SignalConnected, onSignalConnected)
        .off(RoomEvent.Connected, handleConnected)
        .off(RoomEvent.Disconnected, handleDisconnected)
        .off(RoomEvent.MediaDevicesError, handleMediaDeviceError)
        .off(RoomEvent.EncryptionError, handleEncryptionError)
    }
  }

  const cleanupRoomListeners = setupRoomListeners()

  watchEffect(() => {
    const simulateParticipants = unref(options.simulateParticipants)
    if (simulateParticipants) {
      room.value.simulateParticipants({
        participants: { count: simulateParticipants },
        publish: {
          audio: true,
          useRealTracks: true,
        },
      })
    }
  })

  const connectToRoom = async (): Promise<void> => {
    if (isConnecting.value || room.value.state !== 'disconnected') {
      return
    }

    const serverUrl = unref(options.serverUrl)
    const token = unref(options.token)
    const connectOptions = unref(options.connectOptions)
    const onError = unref(options.onError)

    if (!serverUrl) {
      log.warn('no livekit url provided')
      onError?.(new Error('no livekit url provided'))
      return
    }

    if (!token) {
      log.warn('no token provided')
      onError?.(new Error('no token provided'))
      return
    }

    log.debug('connecting')
    isConnecting.value = true

    try {
      await room.value.connect(serverUrl, token, connectOptions)
      isConnecting.value = false
    }
    catch (e) {
      log.warn(e)
      isConnecting.value = false
      if (shouldConnect.value) {
        onError?.(e as Error)
      }
    }
  }

  const disconnectFromRoom = async (): Promise<void> => {
    if (room.value.state !== 'disconnected') {
      await room.value.disconnect()
    }
  }

  watch(
    () => [shouldConnect.value, unref(options.serverUrl), unref(options.token)],
    async ([shouldConnectVal]) => {
      if (shouldConnectVal) {
        await connectToRoom()
      }
      else {
        await disconnectFromRoom()
      }
    },
    { immediate: true },
  )

  watch(
    () => unref(options.connect),
    (newConnectVal) => {
      shouldConnect.value = newConnectVal ?? defaultOptions.connect
    },
  )

  onBeforeUnmount(() => {
    shouldConnect.value = false
    disconnectFromRoom()
    cleanupRoomListeners()
  })

  provide(LIVEKIT_ROOM_SYMBOL, room)

  return {
    room,
  }
}
