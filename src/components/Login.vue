<script setup lang="ts">
import { ref } from 'vue';

const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  try {
    const response = await fetch('/api/auth/url');
    const { url } = await response.json();
    window.open(url, 'spotify_auth', 'width=600,height=800');
  } catch (error) {
    console.error('Login error:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col items-center justify-center w-full h-full bg-black">
    <div class="mb-8">
      <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_White.png" alt="Spotify" class="h-20" />
    </div>
    <button 
      @click="handleLogin"
      :disabled="loading"
      class="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-3 px-12 rounded-full transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
    >
      {{ loading ? 'Connecting...' : 'LOG IN WITH SPOTIFY' }}
    </button>
  </div>
</template>
