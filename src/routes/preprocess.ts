import initWasm from '../../pkg/wasm_preprocess/wasm_preprocess.js';
import type { WasmModulePreprocess } from '../types';
import { loadWasmModule, validateWasmModule } from '../wasm/loader';
import { WasmLoadError, WasmInitError } from '../wasm/types';

interface PreprocessStats {
  original_size: number;
  target_size: number;
  scale_factor: number;
}

let wasmModule: WasmModulePreprocess | null = null;

function callUnknownFunction(func: unknown, ...args: unknown[]): unknown {
  if (typeof func !== 'function') {
    throw new Error('Function is not callable');
  }
  const boundCall = Function.prototype.call.bind(func);
  return boundCall(undefined, ...args);
}

function validatePreprocessModule(exports: unknown): WasmModulePreprocess | null {
  if (!validateWasmModule(exports)) {
    return null;
  }
  
  if (
    typeof exports !== 'object' ||
    exports === null ||
    !('preprocess_image' in exports) ||
    !('preprocess_text' in exports) ||
    !('normalize_text' in exports) ||
    !('get_preprocess_stats' in exports) ||
    !('memory' in exports) ||
    !(exports.memory instanceof WebAssembly.Memory)
  ) {
    return null;
  }
  
  const memory = exports.memory;
  
  if (
    'preprocess_image' in exports &&
    'preprocess_text' in exports &&
    'normalize_text' in exports &&
    'get_preprocess_stats' in exports &&
    typeof exports.preprocess_image === 'function' &&
    typeof exports.preprocess_text === 'function' &&
    typeof exports.normalize_text === 'function' &&
    typeof exports.get_preprocess_stats === 'function'
  ) {
    const exportsRecord: Record<string, unknown> = exports;
    
    const module: WasmModulePreprocess = {
      memory,
      preprocess_image: (imageData: Uint8Array, sourceWidth: number, sourceHeight: number, targetWidth: number, targetHeight: number): Uint8Array => {
        const func = exportsRecord.preprocess_image;
        const callResult: unknown = callUnknownFunction(func, imageData, sourceWidth, sourceHeight, targetWidth, targetHeight);
        if (!(callResult instanceof Uint8Array)) {
          throw new Error('preprocess_image did not return Uint8Array');
        }
        return callResult;
      },
      preprocess_text: (text: string): Uint32Array => {
        const func = exportsRecord.preprocess_text;
        const callResult: unknown = callUnknownFunction(func, text);
        if (!(callResult instanceof Uint32Array)) {
          throw new Error('preprocess_text did not return Uint32Array');
        }
        return callResult;
      },
      normalize_text: (text: string): string => {
        const func = exportsRecord.normalize_text;
        const callResult: unknown = callUnknownFunction(func, text);
        if (typeof callResult !== 'string') {
          throw new Error('normalize_text did not return string');
        }
        return callResult;
      },
      get_preprocess_stats: (originalSize: number, targetSize: number): PreprocessStats => {
        const func = exportsRecord.get_preprocess_stats;
        const callResult: unknown = callUnknownFunction(func, originalSize, targetSize);
        if (
          typeof callResult !== 'object' ||
          callResult === null ||
          !('original_size' in callResult) ||
          !('target_size' in callResult) ||
          !('scale_factor' in callResult) ||
          typeof callResult.original_size !== 'number' ||
          typeof callResult.target_size !== 'number' ||
          typeof callResult.scale_factor !== 'number'
        ) {
          throw new Error('get_preprocess_stats did not return PreprocessStats');
        }
        const statsObj: { original_size: number; target_size: number; scale_factor: number } = {
          original_size: callResult.original_size,
          target_size: callResult.target_size,
          scale_factor: callResult.scale_factor,
        };
        return statsObj;
      },
    };
    return module;
  }
  
  return null;
}

export const init = async (): Promise<void> => {
  const errorDiv = document.getElementById('error');
  const loadingIndicator = document.getElementById('loadingIndicator');
  const processImageBtn = document.getElementById('processImageBtn');
  const processTextBtn = document.getElementById('processTextBtn');
  
  try {
    // Show loading state
    if (loadingIndicator) {
      loadingIndicator.textContent = 'Loading SmolVLM WASM module...';
    }
    
    // Disable buttons until WASM is ready
    if (processImageBtn instanceof HTMLButtonElement) {
      processImageBtn.disabled = true;
    }
    if (processTextBtn instanceof HTMLButtonElement) {
      processTextBtn.disabled = true;
    }
    
    // Use loadWasmModule for proper error handling
    wasmModule = await loadWasmModule<WasmModulePreprocess>(
      async () => await initWasm(),
      validatePreprocessModule
    );
    
    // Verify module is ready
    if (!wasmModule) {
      throw new WasmInitError('WASM module failed validation');
    }
    
    // Hide loading, show ready state
    if (loadingIndicator) {
      loadingIndicator.textContent = 'SmolVLM WASM module ready!';
      // Clear after 2 seconds using requestAnimationFrame
      const startTime = performance.now();
      const clearAfterDelay = (): void => {
        if (loadingIndicator) {
          const elapsed = performance.now() - startTime;
          if (elapsed >= 2000) {
            loadingIndicator.textContent = '';
          } else {
            requestAnimationFrame(clearAfterDelay);
          }
        }
      };
      requestAnimationFrame(clearAfterDelay);
    }
    
    // Enable buttons now that WASM is ready
    if (processImageBtn instanceof HTMLButtonElement) {
      processImageBtn.disabled = false;
    }
    if (processTextBtn instanceof HTMLButtonElement) {
      processTextBtn.disabled = false;
    }
    
    // Setup UI only after WASM is confirmed ready
    setupUI();
  } catch (error) {
    // Clear loading indicator
    if (loadingIndicator) {
      loadingIndicator.textContent = '';
    }
    
    // Disable buttons on error
    if (processImageBtn instanceof HTMLButtonElement) {
      processImageBtn.disabled = true;
    }
    if (processTextBtn instanceof HTMLButtonElement) {
      processTextBtn.disabled = true;
    }
    
    // Show detailed error
    if (errorDiv) {
      if (error instanceof WasmLoadError) {
        errorDiv.textContent = `Failed to load SmolVLM WASM: ${error.message}`;
      } else if (error instanceof WasmInitError) {
        errorDiv.textContent = `SmolVLM WASM initialization failed: ${error.message}`;
      } else if (error instanceof Error) {
        errorDiv.textContent = `Error: ${error.message}`;
      } else {
        errorDiv.textContent = 'Unknown error loading SmolVLM WASM module';
      }
    }
  }
};

function setupUI(): void {
  const imageInputEl = document.getElementById('imageInput');
  const textInputEl = document.getElementById('textInput');
  const processImageBtn = document.getElementById('processImageBtn');
  const processTextBtn = document.getElementById('processTextBtn');
  const imageOutputEl = document.getElementById('imageOutput');
  const textOutputEl = document.getElementById('textOutput');
  const statsOutputEl = document.getElementById('statsOutput');
  const imagePreviewEl = document.getElementById('imagePreview');
  const imagePreviewContainerEl = document.getElementById('imagePreviewContainer');

  if (
    !imageInputEl ||
    !textInputEl ||
    !processImageBtn ||
    !processTextBtn ||
    !imageOutputEl ||
    !textOutputEl ||
    !statsOutputEl ||
    !imagePreviewEl ||
    !imagePreviewContainerEl ||
    !(imageInputEl instanceof HTMLInputElement) ||
    !(textInputEl instanceof HTMLTextAreaElement) ||
    !(imageOutputEl instanceof HTMLCanvasElement) ||
    !(textOutputEl instanceof HTMLPreElement) ||
    !(statsOutputEl instanceof HTMLDivElement) ||
    !(imagePreviewEl instanceof HTMLImageElement) ||
    !(imagePreviewContainerEl instanceof HTMLDivElement)
  ) {
    throw new Error('Required UI elements not found');
  }

  const imageInput = imageInputEl;
  const textInput = textInputEl;
  const imageOutput = imageOutputEl;
  const textOutput = textOutputEl;
  const statsOutput = statsOutputEl;
  const imagePreview = imagePreviewEl;
  const imagePreviewContainer = imagePreviewContainerEl;

  // Initially hide preview container
  imagePreviewContainer.style.display = 'none';

  // Handle file input change to show preview
  imageInput.addEventListener('change', () => {
    if (imageInput.files && imageInput.files.length > 0) {
      const file = imageInput.files[0];
      const url = URL.createObjectURL(file);
      
      imagePreview.onload = () => {
        URL.revokeObjectURL(url);
        imagePreviewContainer.style.display = 'block';
      };
      
      imagePreview.onerror = () => {
        URL.revokeObjectURL(url);
        imagePreviewContainer.style.display = 'none';
        alert('Failed to load image preview');
      };
      
      imagePreview.src = url;
    } else {
      imagePreviewContainer.style.display = 'none';
      imagePreview.src = '';
    }
  });

  processImageBtn.addEventListener('click', () => {
    if (!imageInput.files || imageInput.files.length === 0) {
      alert('Please select an image file');
      return;
    }
    void processImage(imageInput.files[0], imageOutput, statsOutput);
  });

  processTextBtn.addEventListener('click', () => {
    const text = textInput.value;
    if (!text.trim()) {
      alert('Please enter some text');
      return;
    }
    processText(text, textOutput);
  });
}

function processImage(file: File, canvas: HTMLCanvasElement, statsDiv: HTMLDivElement): void {
  const module = wasmModule;
  if (!module) {
    throw new Error('WASM module not initialized');
  }

  const img = new Image();
  const url = URL.createObjectURL(file);
  
  img.onload = () => {
    URL.revokeObjectURL(url);
    
    // Create a temporary canvas to get image data
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) {
      throw new Error('Failed to get 2d context');
    }
    tempCtx.drawImage(img, 0, 0);
    const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
    
    // Target size for SmolVLM preprocessing (384×384 patches)
    // SmolVLM-500M-Instruct uses 384×384 image patches encoded as 81 visual tokens
    const targetWidth = 384;
    const targetHeight = 384;
    
    // Preprocess image
    const processedData = module.preprocess_image(
      new Uint8Array(imageData.data),
      img.width,
      img.height,
      targetWidth,
      targetHeight
    );
    
    // Display processed image
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    const processedImageData = new ImageData(
      new Uint8ClampedArray(processedData),
      targetWidth,
      targetHeight
    );
    ctx.putImageData(processedImageData, 0, 0);
    
    // Display stats
    const stats = module.get_preprocess_stats(img.width, targetWidth);
    statsDiv.innerHTML = `
      <h3>Preprocessing Stats</h3>
      <p>Original: ${stats.original_size}x${stats.original_size}</p>
      <p>Target: ${stats.target_size}x${stats.target_size}</p>
      <p>Scale Factor: ${stats.scale_factor.toFixed(2)}</p>
    `;
  };
  
  img.onerror = () => {
    URL.revokeObjectURL(url);
    alert('Failed to load image');
  };
  
  img.src = url;
}

function processText(text: string, output: HTMLPreElement): void {
  const module = wasmModule;
  if (!module) {
    throw new Error('WASM module not initialized');
  }
  
  // Normalize text
  const normalized = module.normalize_text(text);
  
  // Preprocess text (tokenize)
  const tokens = module.preprocess_text(normalized);
  
  // Display results
  output.textContent = `Original: ${text}\n\nNormalized: ${normalized}\n\nTokens (${tokens.length}): [${Array.from(tokens).slice(0, 20).join(', ')}${tokens.length > 20 ? '...' : ''}]`;
}

