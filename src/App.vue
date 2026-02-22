<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Sidebar from './components/Sidebar.vue';
import Player from './components/Player.vue';
import MainContent from './components/MainContent.vue';
import Login from './components/Login.vue';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();

onMounted(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'SPOTIFY_AUTH_SUCCESS') {
      authStore.setTokens(event.data.tokens);
    }
  };
  window.addEventListener('message', handleMessage);
});

onUnmounted(() => {
  // Cleanup if needed
});
</script>

<template>
  <div class="flex h-screen bg-black text-white overflow-hidden font-sans">
    <template v-if="authStore.isAuthenticated">
      <Sidebar />
      <div class="flex-1 flex flex-col relative overflow-hidden">
        <MainContent />
        <Player />
      </div>
    </template>
    <template v-else>
      <Login />
    </template>
  </div>
</template>

<style>
/* Global styles if needed */
body {
  margin: 0;
  padding: 0;
}
</style>
