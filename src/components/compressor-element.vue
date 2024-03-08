<template>
  <div class="flex gap-2 flex-col lg:flex-row">
    <div class="card bg-base-200 basis-1/2">
      <div class="card-body">
        <label class="label cursor-pointer">
          <span class="label-text">Compression</span>
          <input
            type="checkbox"
            v-model="isCompressorOn"
            class="toggle toggle-primary col-span-2 ml-auto"
          />
        </label>

        <div class="divider"></div>

        <label class="label flex gap-2">
          <span class="label-text settings-first-col">Input&nbsp;gain</span>
          <input
            type="range"
            min="1"
            max="5"
            step="0.1"
            :disabled="!isCompressorOn"
            v-model.number="inputGain"
            class="range"
            :class="{ 'range-primary': isCompressorOn }"
          />
          <span class="settings-third-col">{{ inputGain }}</span>
        </label>

        <label class="label flex gap-2">
          <span class="label-text settings-first-col">Output&nbsp;gain</span>
          <input
            type="range"
            min="1"
            max="5"
            step="0.1"
            :disabled="!isCompressorOn"
            v-model.number="outputGain"
            class="range"
            :class="{ 'range-primary': isCompressorOn }"
          />
          <span class="settings-third-col">{{ outputGain }}</span>
        </label>

        <div class="divider"></div>

        <label class="label flex gap-2">
          <span class="label-text settings-first-col">Threshold</span>
          <input
            type="range"
            min="-100"
            max="0"
            :disabled="!isCompressorOn"
            v-model.number="threshold"
            class="range"
            :class="{ 'range-primary': isCompressorOn }"
          />
          <span class="settings-third-col">{{ threshold }}</span>
        </label>

        <label class="label flex gap-2">
          <span class="label-text settings-first-col">Knee</span>
          <input
            type="range"
            min="0"
            max="40"
            :disabled="!isCompressorOn"
            v-model.number="knee"
            class="range"
            :class="{ 'range-primary': isCompressorOn }"
          />
          <span class="settings-third-col">{{ knee }}</span>
        </label>

        <label class="label flex gap-2">
          <span class="label-text settings-first-col">Ratio</span>
          <input
            type="range"
            min="1"
            max="20"
            :disabled="!isCompressorOn"
            v-model.number="ratio"
            class="range"
            :class="{ 'range-primary': isCompressorOn }"
          />
          <span class="settings-third-col">{{ ratio }}</span>
        </label>

        <label class="label flex gap-2">
          <span class="label-text settings-first-col">Attack</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            :disabled="!isCompressorOn"
            v-model.number="attack"
            class="range"
            :class="{ 'range-primary': isCompressorOn }"
          />
          <span class="settings-third-col">{{ attack }}</span>
        </label>

        <label class="label flex gap-2">
          <span class="label-text settings-first-col">Release</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            :disabled="!isCompressorOn"
            v-model.number="release"
            class="range"
            :class="{ 'range-primary': isCompressorOn }"
          />
          <span class="settings-third-col">{{ release }}</span>
        </label>
      </div>
    </div>

    <div class="card bg-base-200 basis-1/2">
      <div class="card-body">
        <div class="relative h-full">
          <slot name="canvases"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVModels } from '@vueuse/core';

interface Props {
  isCompressorOn: boolean;
  inputGain: number;
  outputGain: number;
  threshold: number;
  knee: number;
  ratio: number;
  attack: number;
  release: number;
}
const props = defineProps<Props>();
const emit = defineEmits([
  'update:isCompressorOn',
  'update:inputGain',
  'update:outputGain',
  'update:threshold',
  'update:knee',
  'update:ratio',
  'update:attack',
  'update:release'
]);

const { isCompressorOn, inputGain, outputGain, threshold, knee, ratio, attack, release } =
  useVModels(props, emit);
</script>

<style scoped>
.settings-first-col {
  @apply w-[80px] flex-shrink-0;
}
.settings-third-col {
  @apply w-[80px] text-right;
}
.label:has(input[disabled]) {
  opacity: 0.5;
  cursor: not-allowed;
}
input[disabled] {
  cursor: not-allowed;
}
</style>
