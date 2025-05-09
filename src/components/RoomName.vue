<script setup lang="ts">
import type { Room } from 'livekit-client'
import { inject } from 'vue'
import { useRoomInfo } from '../composables/useRoomInfo'
import { LIVEKIT_ROOM_SYMBOL } from '../utils/injectionKeys'

interface RoomNameProps {
  /**
   * The room from which the name should be displayed.
   */
  room?: Room
}

const props = defineProps<RoomNameProps>()

const roomInstance = props.room ?? inject(LIVEKIT_ROOM_SYMBOL)?.value
const roomInfo = useRoomInfo({ room: roomInstance })
</script>

<template>
  <span>
    <slot name="before" />
    <slot v-bind="{ name: roomInfo.name }">
      {{ roomInfo.name }}
    </slot>
    <slot name="after" />
  </span>
</template>
