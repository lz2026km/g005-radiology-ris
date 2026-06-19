/**
 * G005 放射RIS系统 v3.0.6.6 - 移动端相机采集服务
 * 20 升级点:多种模式 / 分辨率控制 / 闪光灯 / 定位 / 条码 / 文档自适应 / 定时器
 */

import type { CameraCaptureOptions, CameraCaptureResult, CameraMode } from '../../types/mobile';

const DEFAULT_OPTIONS: CameraCaptureOptions = {
  mode: 'photo',
  quality: 0.85,
  facingMode: 'environment',
  flash: false,
  withLocation: false,
  withTimestamp: true,
  format: 'jpeg',
  purpose: 'documentation',
};

class CameraService {
  private stream: MediaStream | null = null;
  private activeTrack: MediaStreamTrack | null = null;

  get isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
  }

  async checkPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    if (!this.isSupported) return 'denied';
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return result.state as 'granted' | 'denied' | 'prompt';
    } catch {
      return 'prompt';
    }
  }

  async getCameras(): Promise<MediaDeviceInfo[]> {
    if (!this.isSupported) return [];
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(d => d.kind === 'videoinput');
  }

  async startPreview(videoElement: HTMLVideoElement, options: Partial<CameraCaptureOptions> = {}): Promise<MediaStream> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: opts.facingMode,
        width: opts.maxWidth ? { ideal: opts.maxWidth } : { ideal: 1920 },
        height: opts.maxHeight ? { ideal: opts.maxHeight } : { ideal: 1080 },
      },
      audio: false,
    };

    this.stopPreview();
    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.activeTrack = this.stream.getVideoTracks()[0] ?? null;

    if (this.activeTrack && 'applyConstraints' in this.activeTrack) {
      try {
        await this.activeTrack.applyConstraints({
          advanced: [{ torch: opts.flash } as unknown as MediaTrackConstraintSet],
        });
      } catch { /* flash not supported */ }
    }

    videoElement.srcObject = this.stream;
    await videoElement.play();
    return this.stream;
  }

  stopPreview(): void {
    if (this.stream) {
      for (const track of this.stream.getTracks()) track.stop();
      this.stream = null;
      this.activeTrack = null;
    }
  }

  async captureFrame(videoElement: HTMLVideoElement, options: Partial<CameraCaptureOptions> = {}): Promise<CameraCaptureResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    const canvas = document.createElement('canvas');
    const w = opts.maxWidth ?? videoElement.videoWidth;
    const h = opts.maxHeight ?? videoElement.videoHeight;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    if (opts.mode === 'document') {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);
      const scale = Math.min(w / videoElement.videoWidth, h / videoElement.videoHeight);
      const dw = videoElement.videoWidth * scale;
      const dh = videoElement.videoHeight * scale;
      ctx.drawImage(videoElement, (w - dw) / 2, (h - dh) / 2, dw, dh);
    } else {
      ctx.drawImage(videoElement, 0, 0, w, h);
    }

    const mimeType = opts.format === 'png' ? 'image/png' : opts.format === 'webp' ? 'image/webp' : 'image/jpeg';
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(b => {
        if (b) resolve(b);
        else reject(new Error('Canvas toBlob failed'));
      }, mimeType, opts.quality);
    });

    const result: CameraCaptureResult = {
      blob,
      dataUrl: canvas.toDataURL(mimeType, opts.quality),
      width: w,
      height: h,
      sizeBytes: blob.size,
      mimeType,
      capturedAt: new Date().toISOString(),
      deviceInfo: {
        model: this.activeTrack?.label ?? 'unknown',
        facing: opts.facingMode === 'user' ? 'front' : 'rear',
      },
    };

    if (opts.withLocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        result.location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
      } catch { /* location unavailable */ }
    }

    if (opts.mode === 'barcode') {
      result.metadata = { barcodeDetected: await this.detectBarcode(canvas) };
    }

    canvas.remove();
    return result;
  }

  async captureBarcode(videoElement: HTMLVideoElement): Promise<string | null> {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext('2d')!.drawImage(videoElement, 0, 0);
    const codes = await this.detectBarcode(canvas);
    canvas.remove();
    return codes.length > 0 ? codes[0]! : null;
  }

  async startTimedCapture(videoElement: HTMLVideoElement, count: number, intervalMs: number, options?: Partial<CameraCaptureOptions>): Promise<CameraCaptureResult[]> {
    const results: CameraCaptureResult[] = [];
    for (let i = 0; i < count; i++) {
      const result = await this.captureFrame(videoElement, options);
      results.push(result);
      if (i < count - 1) {
        await new Promise(r => setTimeout(r, intervalMs));
      }
    }
    return results;
  }

  toggleFlash(): boolean {
    if (!this.activeTrack || !('applyConstraints' in this.activeTrack)) return false;
    try {
      const settings = this.activeTrack.getSettings();
      this.activeTrack.applyConstraints({
        advanced: [{ torch: !(settings as any).torch } as unknown as MediaTrackConstraintSet],
      });
      return true;
    } catch { return false; }
  }

  async getZoomRange(): Promise<{ min: number; max: number; step: number } | null> {
    if (!this.activeTrack) return null;
    const cap = this.activeTrack.getCapabilities();
    if (!cap.zoom) return null;
    return { min: cap.zoom.min ?? 1, max: cap.zoom.max ?? 1, step: cap.zoom.step ?? 0.1 };
  }

  async setZoom(level: number): Promise<boolean> {
    if (!this.activeTrack || !('applyConstraints' in this.activeTrack)) return false;
    try {
      await this.activeTrack.applyConstraints({
        advanced: [{ zoom: level } as unknown as MediaTrackConstraintSet],
      });
      return true;
    } catch { return false; }
  }

  private async detectBarcode(canvas: HTMLCanvasElement): Promise<string[]> {
    if (!('BarcodeDetector' in window)) return [];
    try {
      const detector = new (window as any).BarcodeDetector({ formats: ['qr_code', 'ean_13', 'code_128', 'code_39'] });
      const codes = await detector.detect(canvas);
      return codes.map((c: any) => c.rawValue as string);
    } catch { return []; }
  }
}

export const camera = new CameraService();
