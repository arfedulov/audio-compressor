<template>
  <div class="card bg-base-200">
    <div class="card-body">
      <div class="h-full flex flex-col gap-2 justify-between">
        <button class="btn btn-primary" :disabled="isFileUploaded" @click="$emit('upload-source')">
          Choose input file
        </button>

        <div class="card bg-base-100">
          <div class="card-body">
            <div class="flex gap-1 justify-center">
              <button class="btn btn-circle" :disabled="!isFileUploaded" @click="$emit('play')">
                <img src="@/assets/icons/play.svg" width="24" height="24" alt="Play" />
              </button>
              <button class="btn btn-circle" :disabled="!isFileUploaded" @click="$emit('pause')">
                <img src="@/assets/icons/pause.svg" width="24" height="24" alt="Pause" />
              </button>
              <button class="btn btn-circle" :disabled="!isFileUploaded" @click="$emit('stop')">
                <img src="@/assets/icons/stop.svg" width="24" height="24" alt="Stop" />
              </button>
            </div>

            <div class="flex flex-col gap-1 mt-2">
              <progress class="progress progress-primary" :value="progress" max="100"></progress>
              <div>
                {{ formatTime(currentTime) }} /
                {{ formatTime(totalDuration) }}
              </div>
            </div>
          </div>
        </div>

        <button :disabled="!isFileUploaded" class="btn btn-error" @click="$emit('clear')">
          Clear
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatTime } from '@/lib/format';

defineEmits(['clear', 'play', 'pause', 'stop', 'upload-source']);

interface Props {
  isFileUploaded: boolean;
  progress: number;
  currentTime: number;
  totalDuration: number;
}
defineProps<Props>();
</script>

<style scoped>
button[disabled] {
  opacity: 0.5;
}
</style>
