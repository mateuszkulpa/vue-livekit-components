<script setup lang="ts">
import type { Room } from 'livekit-client'
import { inject } from 'vue'
import { useConnectionStatus } from '../composables/useConnectionStatus'
import { LIVEKIT_ROOM_SYMBOL } from '../utils/injectionKeys'

interface ConnectionStatusProps {
  /**
   * The room from which the connection status should be displayed.
   */
  room?: Room
}

const props = defineProps<ConnectionStatusProps>()

const roomInstance = props.room ?? inject(LIVEKIT_ROOM_SYMBOL)?.value
const connectionStatus = useConnectionStatus(roomInstance)
</script>

<template>
  <slot v-bind="{ connectionStatus }">
    <div>
      {{ connectionStatus }}
    </div>
  </slot>
</template>
