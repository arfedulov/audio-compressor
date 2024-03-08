export interface CanvasContainer {
  value: HTMLCanvasElement | null;
}

export class DynamicsRangeDisplay {
  private isAnimating: boolean = false;
  private lastDraw: number = -Infinity;
  private bars: number[] | null = null;

  constructor(
    private analyserNode: AnalyserNode,
    private canvasContainer: CanvasContainer,
    private color: string
  ) {
    this.draw = this.draw.bind(this);
  }

  play() {
    if (this.isAnimating) {
      return;
    }

    this.isAnimating = true;
    this.draw(performance.now());
  }

  pause() {
    this.isAnimating = false;
  }

  stop() {
    this.isAnimating = false;
    const canvas = this.canvasContainer.value;
    if (!canvas) {
      return;
    }

    const canvasContext = canvas.getContext('2d');
    if (!canvasContext) {
      return;
    }

    requestAnimationFrame(() => {
      canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    });
  }

  private draw(t: number) {
    if (this.isAnimating) {
      requestAnimationFrame(this.draw);
    }
    if (t - this.lastDraw < 10) {
      return;
    }
    this.lastDraw = t;

    const canvas = this.canvasContainer.value;
    if (!canvas) {
      return;
    }
    if (this.bars === null) {
      this.bars = Array(canvas.width).fill(-Infinity);
    }

    const value = this.getMasterLoudnessRatio();
    this.bars.push(value);
    this.bars.shift();
    this.drawBars();
  }

  getMasterLoudnessRatio() {
    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyserNode.getByteTimeDomainData(dataArray);

    const top = Math.max(...dataArray);
    const bottom = Math.min(...dataArray);

    return (top - bottom) / 256;
  }

  drawBars() {
    const canvas = this.canvasContainer.value;
    if (!canvas || !this.bars) {
      return;
    }

    const canvasContext = canvas.getContext('2d');
    if (!canvasContext) {
      return;
    }

    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.fillStyle = this.color;

    for (let i = 0; i < this.bars.length; i++) {
      const y = canvas.height - canvas.height * this.bars[i];
      const h = canvas.height - y;
      canvasContext.fillRect(i, y, 1, h);
    }
  }
}
