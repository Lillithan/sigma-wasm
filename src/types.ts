// Type definitions for WASM module

export interface WasmModule {
  memory: WebAssembly.Memory;
  init(): void;
  wasm_init(debug: number, renderIntervalMs: number, windowWidth: number, windowHeight: number): void;
  tick(elapsedTime: number): void;
  key_down(keyCode: number): void;
  key_up(keyCode: number): void;
  mouse_move(x: number, y: number): void;
}

export interface Layer {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  setSize(width: number, height: number, quality: number): void;
  clearScreen(): void;
  drawRect(px: number, py: number, sx: number, sy: number, ch: number, cs: number, cl: number, ca: number): void;
  drawCircle(px: number, py: number, r: number, ch: number, cs: number, cl: number, ca: number): void;
  drawText(text: string, fontSize: number, px: number, py: number): void;
}

export interface WasmAstar {
  wasmModule: WasmModule | null;
  wasmModulePath: string;
  debug: boolean;
  renderIntervalMs: number;
  layers: Map<number, Layer>;
  layerWrapperEl: HTMLElement;
}

