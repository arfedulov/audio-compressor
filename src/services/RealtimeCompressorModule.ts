import { ProcessingGraphWithCompression } from '@/services/ProcessingGraphWithCompression';
import { ProcessingGraphWithoutCompression } from '@/services/ProcessingGraphWithoutCompression';
import { DynamicsRangeDisplay, CanvasContainer } from '@/services/DynamicsRangeDisplay';
import { SETTINGS } from '@/settings';

export class RealtimeCompressorModule {
  private readonly uncompressedGraph: ProcessingGraphWithoutCompression;
  readonly compressorGraph: ProcessingGraphWithCompression;
  private inputDisplay: DynamicsRangeDisplay | null = null;
  private outputDisplay: DynamicsRangeDisplay | null = null;
  private isCompressorOn: boolean = true;

  constructor(
    private audioContext: AudioContext,
    private sourceNode: MediaElementAudioSourceNode,
    private inputCanvasContainer: CanvasContainer,
    private outputCanvasContainer: CanvasContainer
  ) {
    this.uncompressedGraph = new ProcessingGraphWithoutCompression(audioContext);
    this.compressorGraph = new ProcessingGraphWithCompression(audioContext);
    this.updatePipeConnection();

    this.initAnalyserDisplay();
  }

  setCompression(isCompressorOn: boolean) {
    if (!this.sourceNode) {
      throw Error('Trying to work with source node before initializing it');
    }

    this.isCompressorOn = isCompressorOn;
    this.updatePipeConnection();

    this.initAnalyserDisplay();
  }

  private getCurrentProcessingGraph() {
    if (this.isCompressorOn) {
      return this.compressorGraph;
    }

    return this.uncompressedGraph;
  }

  private initAnalyserDisplay() {
    const pipe = this.getCurrentProcessingGraph();

    this.inputDisplay?.stop();
    this.outputDisplay?.stop();

    this.inputDisplay = new DynamicsRangeDisplay(
      pipe.getInputAnalyser(),
      this.inputCanvasContainer,
      SETTINGS.ANALYSER_DISPLAY.INPUT_BAR_COLOR
    );
    if (pipe instanceof ProcessingGraphWithCompression) {
      this.outputDisplay = new DynamicsRangeDisplay(
        pipe.getOutputAnalyser(),
        this.outputCanvasContainer,
        SETTINGS.ANALYSER_DISPLAY.OUTPUT_COLOR
      );
    } else {
      this.outputDisplay = null;
    }

    this.inputDisplay?.play();
    this.outputDisplay?.play();
  }

  private updatePipeConnection() {
    const onPipe = this.isCompressorOn ? this.compressorGraph : this.uncompressedGraph;
    const offPipe = this.isCompressorOn ? this.uncompressedGraph : this.compressorGraph;
    offPipe.disconnectInputNode();
    offPipe.disconnectOutputNode();
    onPipe.connectInputNode(this.sourceNode);
    onPipe.connectOutputNode(this.audioContext.destination);
  }
}
