<template>
  <div class="flex flex-col lg:flex-row gap-2 max-w-[2000px] mx-auto">
    <source-element
      :is-file-uploaded="Boolean(currentInputFile)"
      :progress="progress"
      :current-time="currentTime"
      :total-duration="totalDuration"
      @play="play"
      @pause="pause"
      @stop="stop"
      @upload-source="open"
      @clear="onClear"
    />
    <compressor-element
      class="grow"
      v-model:is-compressor-on="isCompressorOn"
      v-model:input-gain="compressorModuleParams.inputGain"
      v-model:output-gain="compressorModuleParams.outputGain"
      v-model:threshold="compressorModuleParams.threshold"
      v-model:knee="compressorModuleParams.knee"
      v-model:ratio="compressorModuleParams.ratio"
      v-model:attack="compressorModuleParams.attack"
      v-model:release="compressorModuleParams.release"
    >
      <template #canvases>
        <canvas
          ref="inputCanvasRef"
          class="w-full h-full"
          :width="ANALYSER_CANVAS_WIDTH"
          :style="{ backgroundColor: SETTINGS.ANALYSER_DISPLAY.BACKGROUND_COLOR }"
        ></canvas>
        <canvas
          ref="outputCanvasRef"
          :width="ANALYSER_CANVAS_WIDTH"
          class="bg-transparent absolute top-0 left-0 w-full h-full"
        ></canvas>
      </template>
    </compressor-element>
    <output-element :compressor-params="compressorModuleParams" :input-file="currentInputFile" />
  </div>
</template>

<script setup lang="ts">
import SourceElement from '@/components/source-element.vue';
import CompressorElement from '@/components/compressor-element.vue';
import OutputElement from '@/components/output-element.vue';
import { useFileDialog } from '@vueuse/core';
import { shallowRef, computed, ref, reactive, watch } from 'vue';
import { refWithEffect } from '@/lib/util';
import { SETTINGS } from '@/settings';
import { RealtimeCompressorModule } from '@/services/RealtimeCompressorModule';

const ANALYSER_CANVAS_WIDTH = 512;
const inputCanvasRef = ref<HTMLCanvasElement | null>(null);
const outputCanvasRef = ref<HTMLCanvasElement | null>(null);

const audioElement = shallowRef<HTMLAudioElement | null>(null);
const audioSourceNode = shallowRef<MediaElementAudioSourceNode | null>(null);
const compressorModule = shallowRef<RealtimeCompressorModule | null>(null);

const isCompressorOn = refWithEffect<boolean>(true, (value) => {
  compressorModule.value?.setCompression(value);
});
const compressorModuleParams = reactive({
  inputGain: SETTINGS.INITIAL_INPUT_GAIN_VALUE,
  outputGain: SETTINGS.INITIAL_OUTPUT_GAIN_VALUE,
  threshold: SETTINGS.COMPRESSOR_INITIAL_VALUES.threshold,
  knee: SETTINGS.COMPRESSOR_INITIAL_VALUES.knee,
  ratio: SETTINGS.COMPRESSOR_INITIAL_VALUES.ratio,
  attack: SETTINGS.COMPRESSOR_INITIAL_VALUES.attack,
  release: SETTINGS.COMPRESSOR_INITIAL_VALUES.release
});
watch(compressorModuleParams, (params) => {
  compressorModule.value?.compressorGraph?.setInputGainValue(params.inputGain);
  compressorModule.value?.compressorGraph?.setOutputGainValue(params.outputGain);
  compressorModule.value?.compressorGraph?.setThreshold(params.threshold);
  compressorModule.value?.compressorGraph?.setKnee(params.knee);
  compressorModule.value?.compressorGraph?.setRatio(params.ratio);
  compressorModule.value?.compressorGraph?.setAttack(params.attack);
  compressorModule.value?.compressorGraph?.setRelease(params.release);
});

const currentTime = ref(0);
const totalDuration = ref(0);
const progress = computed(() => {
  if (!totalDuration.value) {
    return 0;
  }

  return Math.round((100 * currentTime.value) / totalDuration.value);
});

const { open, reset, onChange, files } = useFileDialog({
  accept: 'audio/*'
});
const currentInputFile = computed(() => files.value?.[0]);
onChange((files) => {
  const file = files?.[0];
  if (!file) {
    return;
  }

  const ctx = new AudioContext();
  audioElement.value = new Audio();
  audioElement.value.src = URL.createObjectURL(file);
  audioSourceNode.value = ctx.createMediaElementSource(audioElement.value);
  audioSourceNode.value.connect(ctx.destination);

  audioElement.value.ontimeupdate = () => {
    currentTime.value = audioElement.value?.currentTime || 0;
  };
  audioElement.value.ondurationchange = () => {
    totalDuration.value = audioElement.value?.duration || 0;
  };

  compressorModule.value = new RealtimeCompressorModule(
    ctx,
    audioSourceNode.value,
    inputCanvasRef,
    outputCanvasRef
  );
});

const play = () => audioElement.value?.play();
const pause = () => audioElement.value?.pause();
const stop = () => {
  if (!audioElement.value) {
    return;
  }

  audioElement.value.pause();
  audioElement.value.currentTime = 0;
};
const onClear = () => {
  reset();
  audioElement.value = null;
  audioSourceNode.value?.disconnect();
  audioSourceNode.value = null;
  totalDuration.value = 0;
  currentTime.value = 0;
};
</script>
