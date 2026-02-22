<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ChevronLeft, ChevronRight, Play, Heart, MoreHorizontal } from 'lucide-vue-next';
import { spotifyService } from '../services/spotify';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const topTracks = ref<any[]>([]);
const newReleases = ref<any[]>([]);
const recentlyPlayed = ref<any[]>([]);
const scrollOpacity = ref(0);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
});

const handleScroll = (e: any) => {
  const scrollTop = e.target.scrollTop;
  scrollOpacity.value = Math.min(scrollTop / 300, 1);
};

const playTrack = async (uri: string) => {
  try {
    await spotifyService.play(uri);
  } catch (error) {
    console.error('Failed to play track:', error);
  }
};

onMounted(async () => {
  try {
    const [top, releases, recent] = await Promise.all([
      spotifyService.getTopTracks(),
      spotifyService.getNewReleases(),
      spotifyService.getRecentlyPlayed()
    ]);
    topTracks.value = top.data.items.slice(0, 6);
    newReleases.value = releases.data.albums.items.slice(0, 6);
    recentlyPlayed.value = recent.data.items.slice(0, 6);
  } catch (error) {
    console.error('Failed to load main content:', error);
  }
});
</script>

<template>
  <div 
    class="flex-1 bg-gradient-to-b from-[#1e1e1e] to-[#121212] overflow-y-auto relative custom-scrollbar"
    @scroll="handleScroll"
  >
    <!-- Header -->
    <header 
      class="sticky top-0 h-16 flex items-center justify-between px-8 z-40 transition-colors duration-300"
      :style="{ backgroundColor: `rgba(7, 7, 7, ${scrollOpacity})` }"
    >
      <div class="flex items-center space-x-4">
        <button class="bg-black/70 p-1 rounded-full text-gray-400 cursor-not-allowed">
          <ChevronLeft class="h-6 w-6" />
        </button>
        <button class="bg-black/70 p-1 rounded-full text-gray-400 cursor-not-allowed">
          <ChevronRight class="h-6 w-6" />
        </button>
      </div>
      
      <div class="flex items-center space-x-4">
        <button class="bg-black/70 hover:bg-black/90 text-white font-bold py-1.5 px-4 rounded-full text-sm border border-white/20 transition-all">
          Upgrade
        </button>
        <div class="flex items-center bg-black/70 hover:bg-[#282828] rounded-full p-1 pr-3 cursor-pointer transition-colors group">
          <img :src="authStore.user?.images?.[0]?.url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'" class="h-7 w-7 rounded-full mr-2" />
          <span class="text-sm font-bold">{{ authStore.user?.display_name }}</span>
        </div>
      </div>
    </header>

    <main class="px-8 pt-6 pb-24">
      <h1 class="text-3xl font-bold mb-6">{{ greeting }}</h1>

      <!-- Top Tracks Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <div 
          v-for="track in topTracks" 
          :key="track.id"
          class="flex items-center bg-white/5 hover:bg-white/10 rounded overflow-hidden transition-colors group cursor-pointer"
          @click="playTrack(track.uri)"
        >
          <img :src="track.album.images[0].url" class="h-20 w-20 shadow-2xl" />
          <div class="flex-1 px-4 flex items-center justify-between">
            <span class="font-bold truncate">{{ track.name }}</span>
            <button class="bg-[#1DB954] p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 hover:scale-105 active:scale-95">
              <Play class="h-5 w-5 fill-black text-black" />
            </button>
          </div>
        </div>
      </div>

      <!-- New Releases Section -->
      <section class="mb-10">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold hover:underline cursor-pointer">New Releases</h2>
          <a href="#" class="text-xs font-bold text-gray-400 hover:underline uppercase tracking-widest">Show all</a>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <div 
            v-for="album in newReleases" 
            :key="album.id"
            class="bg-[#181818] hover:bg-[#282828] p-4 rounded-lg transition-colors group cursor-pointer"
          >
            <div class="relative mb-4">
              <img :src="album.images[0].url" class="aspect-square object-cover rounded shadow-2xl w-full" />
              <button class="absolute bottom-2 right-2 bg-[#1DB954] p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 hover:scale-105 active:scale-95">
                <Play class="h-5 w-5 fill-black text-black" />
              </button>
            </div>
            <h3 class="font-bold text-sm truncate mb-1">{{ album.name }}</h3>
            <p class="text-xs text-gray-400 line-clamp-2">{{ album.artists.map((a: any) => a.name).join(', ') }}</p>
          </div>
        </div>
      </section>

      <!-- Recently Played Section -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold hover:underline cursor-pointer">Recently Played</h2>
          <a href="#" class="text-xs font-bold text-gray-400 hover:underline uppercase tracking-widest">Show all</a>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <div 
            v-for="item in recentlyPlayed" 
            :key="item.track.id"
            class="bg-[#181818] hover:bg-[#282828] p-4 rounded-lg transition-colors group cursor-pointer"
            @click="playTrack(item.track.uri)"
          >
            <div class="relative mb-4">
              <img :src="item.track.album.images[0].url" class="aspect-square object-cover rounded shadow-2xl w-full" />
              <button class="absolute bottom-2 right-2 bg-[#1DB954] p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 hover:scale-105 active:scale-95">
                <Play class="h-5 w-5 fill-black text-black" />
              </button>
            </div>
            <h3 class="font-bold text-sm truncate mb-1">{{ item.track.name }}</h3>
            <p class="text-xs text-gray-400 line-clamp-2">{{ item.track.artists.map((a: any) => a.name).join(', ') }}</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 12px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
