<script setup lang="ts">
import { ref } from 'vue'
import { ConnectionState, LiveKitRoom } from 'vue-livekit-components'

const serverUrl = ref('')
const roomToken = ref('')
</script>

<template>
  <div>
    <input v-model="serverUrl" type="text" placeholder="Server URL">
    <input v-model="roomToken" type="text" placeholder="Room Token">

    <LiveKitRoom data-lk-theme="default" :server-url="serverUrl" :token="roomToken">
      <ConnectionState v-slot="{ connectionStatus }">
        status: {{ connectionStatus }}
      </ConnectionState>
    </LiveKitRoom>
  </div>
</template>
