import {
  CompressorParams,
  ProcessingGraphWithCompression
} from '@/services/ProcessingGraphWithCompression';

export class OfflineCompressorModule {
  constructor(
    private readonly file: File,
    private readonly compressorParams: CompressorParams
  ) {}

  async downloadProcessedFile() {
    if (!this.file) {
      return;
    }

    const audioContext = new AudioContext();
    const buffer = await fileToAudioBuffer(audioContext, this.file);
    const offlineAudioContext = new OfflineAudioContext({
      numberOfChannels: 2,
      length: buffer.length,
      sampleRate: buffer.sampleRate
    });
    const sourceNode = new AudioBufferSourceNode(offlineAudioContext, {
      buffer
    });

    const compressorPipe = new ProcessingGraphWithCompression(
      offlineAudioContext,
      this.compressorParams
    );

    compressorPipe.connectInputNode(sourceNode);
    compressorPipe.connectOutputNode(offlineAudioContext.destination);

    sourceNode.start();
    const processedBuffer = await offlineAudioContext.startRendering();

    const fileName = this.file.name.split('.')[0];
    downloadAudioBufferAsWAV(processedBuffer, `${fileName}.wav`, {
      numChannels: 2,
      sampleRate: processedBuffer.sampleRate
    });
  }
}

interface WAVOptions {
  numFrames: number;
  numChannels: number;
  sampleRate: number;
}

// Returns Uint8Array of WAV bytes
function getWavBytes(buffer: ArrayBuffer, options: Omit<WAVOptions, 'numFrames'>) {
  const numFrames = buffer.byteLength / Float32Array.BYTES_PER_ELEMENT;

  const headerBytes = getWavHeader(Object.assign({}, options, { numFrames }));
  const wavBytes = new Uint8Array(headerBytes.length + buffer.byteLength);

  // prepend header, then add pcmBytes
  wavBytes.set(headerBytes, 0);
  wavBytes.set(new Uint8Array(buffer), headerBytes.length);

  return wavBytes;
}

// adapted from https://gist.github.com/also/900023
// returns Uint8Array of WAV header bytes
function getWavHeader(options: WAVOptions) {
  const numFrames = options.numFrames;
  const numChannels = options.numChannels;
  const sampleRate = options.sampleRate;
  const bytesPerSample = Float32Array.BYTES_PER_ELEMENT;
  const format = 3;

  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * blockAlign;

  const buffer = new ArrayBuffer(44);
  const dv = new DataView(buffer);

  let p = 0;

  function writeString(s: string) {
    for (let i = 0; i < s.length; i++) {
      dv.setUint8(p + i, s.charCodeAt(i));
    }
    p += s.length;
  }

  function writeUint32(d: number) {
    dv.setUint32(p, d, true);
    p += 4;
  }

  function writeUint16(d: number) {
    dv.setUint16(p, d, true);
    p += 2;
  }

  writeString('RIFF'); // ChunkID
  writeUint32(dataSize + 36); // ChunkSize
  writeString('WAVE'); // Format
  writeString('fmt '); // Subchunk1ID
  writeUint32(16); // Subchunk1Size
  writeUint16(format); // AudioFormat https://i.stack.imgur.com/BuSmb.png
  writeUint16(numChannels); // NumChannels
  writeUint32(sampleRate); // SampleRate
  writeUint32(byteRate); // ByteRate
  writeUint16(blockAlign); // BlockAlign
  writeUint16(bytesPerSample * 8); // BitsPerSample
  writeString('data'); // Subchunk2ID
  writeUint32(dataSize); // Subchunk2Size

  return new Uint8Array(buffer);
}

function downloadAudioBufferAsWAV(
  audioBuffer: AudioBuffer,
  name: string,
  options: { numChannels: number; sampleRate: number }
) {
  const { numChannels, sampleRate } = options;
  // Float32Array samples
  const [left, right] = [audioBuffer.getChannelData(0), audioBuffer.getChannelData(1)];

  // interleaved
  const interleaved = new Float32Array(left.length + right.length);
  for (let src = 0, dst = 0; src < left.length; src++, dst += 2) {
    interleaved[dst] = left[src];
    interleaved[dst + 1] = right[src];
  }

  // get WAV file bytes and audio params of your audio source
  const wavBytes = getWavBytes(interleaved.buffer, {
    numChannels,
    sampleRate
  });
  const wav = new Blob([wavBytes], { type: 'audio/wav' });

  const url = URL.createObjectURL(wav);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function readFileIntoBuffer(blob: File) {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    fileReader.onerror = (e) => reject(e.target?.error);

    fileReader.readAsArrayBuffer(blob);
  });
}

function createAudioBuffer(audioContext: AudioContext, arrayBuffer: ArrayBuffer) {
  return new Promise<AudioBuffer>((resolve, reject) => {
    audioContext.decodeAudioData(
      arrayBuffer,
      (audioBuffer) => resolve(audioBuffer),
      () => reject(new Error('Error decoding audio file'))
    );
  });
}

async function fileToAudioBuffer(audioContext: AudioContext, file: File) {
  const ab = await readFileIntoBuffer(file);
  return createAudioBuffer(audioContext, ab);
}
