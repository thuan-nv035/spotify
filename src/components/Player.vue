<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { 
  Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, 
  Volume2, Maximize2, ListMusic, Laptop2, Heart
} from 'lucide-react';
import { spotifyService } from '../services/spotify';

const playback = ref<any>(null);
const isPlaying = ref(false);
const progress = ref(0);
const volume = ref(50);
let pollInterval: any = null;

const fetchPlayback = async () => {
  try {
    const response = await spotifyService.getPlaybackState();
    if (response.data) {
      playback.value = response.data;
      isPlaying.value = response.data.is_playing;
      progress.value = (response.data.progress_ms / response.data.item.duration_ms) * 100;
    }
  } catch (error) {
    // Silent fail if no active device
  }
};

const togglePlay = async () => {
  try {
    if (isPlaying.value) {
      await spotifyService.pause();
    } else {
      await spotifyService.play();
    }
    isPlaying.value = !isPlaying.value;
  } catch (error) {
    console.error('Playback control error:', error);
  }
};

const handleVolumeChange = async (e: any) => {
  const newVolume = parseInt(e.target.value);
  volume.value = newVolume;
  try {
    await spotifyService.setVolume(newVolume);
  } catch (error) {}
};

onMounted(() => {
  fetchPlayback();
  pollInterval = setInterval(fetchPlayback, 3000);
});

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval);
});
</script>

<template>
  <div class="h-24 bg-[#181818] border-t border-white/10 px-4 flex items-center justify-between z-50">
    <!-- Track Info -->
    <div class="flex items-center w-1/3">
      <template v-if="playback?.item">
        <img :src="playback.item.album.images[0]?.url" class="h-14 w-14 rounded shadow-lg" />
        <div class="ml-4 overflow-hidden">
          <div class="text-sm font-bold truncate hover:underline cursor-pointer">{{ playback.item.name }}</div>
          <div class="text-xs text-gray-400 truncate hover:underline cursor-pointer hover:text-white">
            {{ playback.item.artists.map((a: any) => a.name).join(', ') }}
          </div>
        </div>
        <button class="ml-4 text-gray-400 hover:text-white transition-colors">
          <Heart class="h-5 w-5" />
        </button>
      </template>
      <template v-else>
        <div class="text-gray-500 text-sm">No active playback</div>
      </template>
    </div>

    <!-- Controls -->
    <div class="flex flex-col items-center max-w-[40%] w-full">
      <div class="flex items-center space-x-6 mb-2">
        <button class="text-gray-400 hover:text-white transition-colors"><Shuffle class="h-4 w-4" /></button>
        <button @click="spotifyService.previous()" class="text-gray-400 hover:text-white transition-colors"><SkipBack class="h-5 w-5 fill-current" /></button>
        <button 
          @click="togglePlay"
          class="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform active:scale-95"
        >
          <Pause v-if="isPlaying" class="h-5 w-5 fill-current" />
          <Play v-else class="h-5 w-5 fill-current ml-0.5" />
        </button>
        <button @click="spotifyService.next()" class="text-gray-400 hover:text-white transition-colors"><SkipForward class="h-5 w-5 fill-current" /></button>
        <button class="text-gray-400 hover:text-white transition-colors"><Repeat class="h-4 w-4" /></button>
      </div>
      
      <div class="flex items-center w-full space-x-2">
        <span class="text-[10px] text-gray-400 min-w-[30px] text-right">0:00</span>
        <div class="flex-1 h-1 bg-gray-600 rounded-full group cursor-pointer relative">
          <div :style="{ width: progress + '%' }" class="h-full bg-white group-hover:bg-[#1DB954] rounded-full relative">
            <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-lg"></div>
          </div>
        </div>
        <span class="text-[10px] text-gray-400 min-w-[30px]">3:45</span>
      </div>
    </div>

    <!-- Extra Controls -->
    <div class="flex items-center justify-end w-1/3 space-x-3">
      <button class="text-gray-400 hover:text-white transition-colors"><ListMusic class="h-5 w-5" /></button>
      <button class="text-gray-400 hover:text-white transition-colors"><Laptop2 class="h-5 w-5" /></button>
      <div class="flex items-center space-x-2 w-32">
        <Volume2 class="h-5 w-5 text-gray-400" />
        <input 
          type="range" 
          min="0" max="100" 
          :value="volume"
          @input="handleVolumeChange"
          class="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-white hover:accent-[#1DB954]" 
        />
      </div>
      <button class="text-gray-400 hover:text-white transition-colors"><Maximize2 class="h-4 w-4" /></button>
    </div>
  </div>
</template>

<style scoped>
input[type='range']::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
</style>
