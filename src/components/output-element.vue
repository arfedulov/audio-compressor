<template>
  <div class="card bg-base-200">
    <div class="card-body">
      <div class="w-full h-full flex items-center">
        <button
          :disabled="!inputFile || isProcessing"
          class="btn btn-primary w-full"
          @click="onDownload"
        >
          <span v-if="isProcessing" class="loading loading-spinner"></span>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 -960 960 960"
            width="24"
            :style="{ fill: '#ffffff' }"
          >
            <path
              d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { set } from '@vueuse/core';
import { OfflineCompressorModule } from '@/services/OfflineCompressorModule';
import { CompressorParams } from '@/services/ProcessingGraphWithCompression';

interface Props {
  compressorParams: CompressorParams;
  inputFile?: File;
}
const props = defineProps<Props>();

const isProcessing = ref(false);

const onDownload = async () => {
  const file = props.inputFile;
  if (!file) {
    return;
  }

  const compressorModule = new OfflineCompressorModule(file, props.compressorParams);

  set(isProcessing, true);
  await compressorModule.downloadProcessedFile();
  set(isProcessing, false);
};
</script>
