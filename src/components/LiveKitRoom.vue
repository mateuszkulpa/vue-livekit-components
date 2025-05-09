<script setup lang="ts">
import type { DisconnectReason, MediaDeviceFailure } from 'livekit-client'
import type { UseLiveKitRoomOptions } from '../composables/useLiveKitRoom'
import { setupLiveKitRoom } from '@livekit/components-core'
import { toRefs } from 'vue'
import { useLiveKitRoom } from '../composables/useLiveKitRoom'

const props = withDefaults(defineProps<UseLiveKitRoomOptions>(), {
  connect: true,
  audio: false,
  video: false,
})

const emit = defineEmits<{
  /**
   * Emitted when the room connection is established
   */
  (e: 'connected'): void
  /**
   * Emitted when the room is disconnected
   */
  (e: 'disconnected', reason?: DisconnectReason): void
  /**
   * Emitted when an error occurs
   */
  (e: 'error', error: Error): void
  /**
   * Emitted when encryption error occurs
   */
  (e: 'encryptionError', error: Error): void
  /**
   * Emitted when media device failure occurs
   */
  (e: 'mediaDeviceFailure', failure?: MediaDeviceFailure): void
}>()

useLiveKitRoom(
  {
    ...toRefs(props),
    onConnected: () => emit('connected'),
    onDisconnected: reason => emit('disconnected', reason),
    onError: error => emit('error', error),
    onEncryptionError: error => emit('encryptionError', error),
    onMediaDeviceFailure: failure => emit('mediaDeviceFailure', failure),
  },
)

const componentAttrs = setupLiveKitRoom()
</script>

<template>
  <div v-bind="componentAttrs">
    <slot />
  </div>
</template>
