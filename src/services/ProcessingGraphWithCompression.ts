import { IProcessingGraph } from '@/services/ProcessingGraphWithoutCompression';
import { SETTINGS } from '@/settings';

export type CompressorParams = typeof SETTINGS.COMPRESSOR_INITIAL_VALUES & {
  inputGain: number;
  outputGain: number;
};

export class ProcessingGraphWithCompression implements IProcessingGraph {
  private inputNode: AudioNode | null = null;
  private readonly inputGain: GainNode;
  private readonly compressor: DynamicsCompressorNode;
  private readonly outputGain: GainNode;
  private readonly inputAnalyser: AnalyserNode;
  private readonly outputAnalyser: AnalyserNode;

  constructor(audioContext: AudioContext | OfflineAudioContext, options?: CompressorParams) {
    this.inputGain = audioContext.createGain();
    this.inputGain.gain.setValueAtTime(options?.inputGain || SETTINGS.INITIAL_INPUT_GAIN_VALUE, 0);
    this.inputAnalyser = audioContext.createAnalyser();
    this.inputAnalyser.fftSize = 2048;

    this.compressor = audioContext.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(
      (options || SETTINGS.COMPRESSOR_INITIAL_VALUES).threshold,
      0
    );
    this.compressor.knee.setValueAtTime((options || SETTINGS.COMPRESSOR_INITIAL_VALUES).knee, 0);
    this.compressor.ratio.setValueAtTime((options || SETTINGS.COMPRESSOR_INITIAL_VALUES).ratio, 0);
    this.compressor.attack.setValueAtTime(
      (options || SETTINGS.COMPRESSOR_INITIAL_VALUES).attack,
      0
    );
    this.compressor.release.setValueAtTime(
      (options || SETTINGS.COMPRESSOR_INITIAL_VALUES).release,
      0
    );

    this.outputGain = audioContext.createGain();
    this.outputGain.gain.setValueAtTime(
      options?.outputGain || SETTINGS.INITIAL_OUTPUT_GAIN_VALUE,
      0
    );
    this.outputAnalyser = audioContext.createAnalyser();
    this.outputAnalyser.fftSize = 2048;

    this.inputGain
      .connect(this.inputAnalyser)
      .connect(this.compressor)
      .connect(this.outputGain)
      .connect(this.outputAnalyser);
  }

  getInputAnalyser() {
    return this.inputAnalyser;
  }

  getOutputAnalyser() {
    return this.outputAnalyser;
  }

  disconnectInputNode() {
    this.inputNode?.disconnect();
  }

  disconnectOutputNode() {
    this.outputAnalyser.disconnect();
  }

  connectInputNode(node: AudioNode) {
    this.disconnectInputNode();
    node.disconnect();

    this.inputNode = node;
    this.inputNode.connect(this.inputGain);
  }

  connectOutputNode(node: AudioNode) {
    this.disconnectOutputNode();

    this.outputAnalyser.connect(node);
  }

  setInputGainValue(value: number) {
    this.inputGain.gain.setValueAtTime(value, 0);
  }

  setOutputGainValue(value: number) {
    this.outputGain.gain.setValueAtTime(value, 0);
  }

  setThreshold(value: number) {
    this.compressor.threshold.setValueAtTime(value, 0);
  }

  setKnee(value: number) {
    this.compressor.knee.setValueAtTime(value, 0);
  }

  setRatio(value: number) {
    this.compressor.ratio.setValueAtTime(value, 0);
  }

  setAttack(value: number) {
    this.compressor.attack.setValueAtTime(value, 0);
  }

  setRelease(value: number) {
    this.compressor.release.setValueAtTime(value, 0);
  }
}
