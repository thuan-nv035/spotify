<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Home, Search, Library, PlusSquare, Heart, Download } from 'lucide-react';
import { spotifyService } from '../services/spotify';

const playlists = ref<any[]>([]);

onMounted(async () => {
  try {
    const response = await spotifyService.getPlaylists();
    playlists.value = response.data.items;
  } catch (error) {
    console.error('Failed to load playlists:', error);
  }
});
</script>

<template>
  <div class="w-64 bg-black flex flex-col h-full border-r border-white/10">
    <div class="p-6">
      <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_White.png" alt="Spotify" class="h-10 mb-8" />
      
      <nav class="space-y-4">
        <a href="#" class="flex items-center text-gray-400 hover:text-white transition-colors group">
          <Home class="mr-4 group-hover:scale-110 transition-transform" />
          <span class="font-bold">Home</span>
        </a>
        <a href="#" class="flex items-center text-gray-400 hover:text-white transition-colors group">
          <Search class="mr-4 group-hover:scale-110 transition-transform" />
          <span class="font-bold">Search</span>
        </a>
        <a href="#" class="flex items-center text-gray-400 hover:text-white transition-colors group">
          <Library class="mr-4 group-hover:scale-110 transition-transform" />
          <span class="font-bold">Your Library</span>
        </a>
      </nav>

      <div class="mt-10 space-y-4">
        <button class="flex items-center text-gray-400 hover:text-white transition-colors group w-full text-left">
          <div class="bg-gray-400 group-hover:bg-white p-1 rounded-sm mr-4 transition-colors">
            <PlusSquare class="text-black h-5 w-5" />
          </div>
          <span class="font-bold">Create Playlist</span>
        </button>
        <button class="flex items-center text-gray-400 hover:text-white transition-colors group w-full text-left">
          <div class="bg-gradient-to-br from-indigo-700 to-blue-300 p-1 rounded-sm mr-4">
            <Heart class="text-white h-5 w-5 fill-white" />
          </div>
          <span class="font-bold">Liked Songs</span>
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-6 pb-4 custom-scrollbar">
      <div class="border-t border-white/10 pt-4">
        <ul class="space-y-3">
          <li v-for="playlist in playlists" :key="playlist.id">
            <a href="#" class="text-gray-400 hover:text-white text-sm truncate block transition-colors">
              {{ playlist.name }}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="p-6">
      <a href="#" class="flex items-center text-gray-400 hover:text-white transition-colors group">
        <Download class="mr-4 h-5 w-5" />
        <span class="text-sm font-bold">Install App</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
