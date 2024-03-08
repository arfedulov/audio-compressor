export interface IProcessingGraph {
  getInputAnalyser(): AnalyserNode;

  connectInputNode(node: AudioNode): void;
  connectOutputNode(node: AudioNode): void;
  disconnectInputNode(): void;
  disconnectOutputNode(): void;
}

export class ProcessingGraphWithoutCompression implements IProcessingGraph {
  private inputNode: AudioNode | null = null;
  private readonly inputAnalyser: AnalyserNode;

  constructor(audioContext: AudioContext) {
    this.inputAnalyser = audioContext.createAnalyser();
    this.inputAnalyser.fftSize = 2048;
  }

  getInputAnalyser() {
    return this.inputAnalyser;
  }

  connectInputNode(node: AudioNode) {
    this.disconnectInputNode();
    node.disconnect();

    this.inputNode = node;
    this.inputNode.connect(this.inputAnalyser);
  }

  connectOutputNode(node: AudioNode) {
    this.disconnectOutputNode();

    this.inputAnalyser.connect(node);
  }

  disconnectInputNode() {
    this.inputNode?.disconnect();
  }

  disconnectOutputNode() {
    this.inputAnalyser.disconnect();
  }
}
