import { Capacitor } from '@capacitor/core';
import {
  Directory,
  Encoding,
  Filesystem,
} from '@capacitor/filesystem';
import type {
  PermissionStatus,
  ProgressStatus,
  WriteFileResult,
} from '@capacitor/filesystem';

export type PublicStorageTarget = 'documents' | 'downloads';

export type SavePublicFileOptions = {
  fileName: string;
  base64Data: string;
  target?: PublicStorageTarget;
  folder?: string;
};

class FileStorageService {
  async checkStoragePermissions(): Promise<PermissionStatus> {
    return Filesystem.checkPermissions();
  }

  async requestStoragePermissions(): Promise<PermissionStatus> {
    return Filesystem.requestPermissions();
  }

  async ensurePublicStoragePermission(): Promise<boolean> {
    const status = await this.checkStoragePermissions();
    if (status.publicStorage === 'granted') {
      return true;
    }

    if (status.publicStorage === 'denied') {
      return false;
    }

    const requested = await this.requestStoragePermissions();
    return requested.publicStorage === 'granted';
  }

  async readFileAsBase64(path: string, directory: Directory = Directory.Documents): Promise<string> {
    const result = await Filesystem.readFile({ path, directory });
    if (typeof result.data === 'string') {
      return this.stripDataUrlPrefix(result.data);
    }

    return this.blobToBase64(result.data);
  }

  async readFileAsBytes(path: string, directory: Directory = Directory.Documents): Promise<Uint8Array> {
    const base64 = await this.readFileAsBase64(path, directory);
    return this.base64ToBytes(base64);
  }

  async saveBase64ToPublicStorage(options: SavePublicFileOptions): Promise<WriteFileResult> {
    await this.ensurePublicStoragePermission();

    const { directory, path } = this.getPublicTarget(options);
    return Filesystem.writeFile({
      path,
      directory,
      data: this.stripDataUrlPrefix(options.base64Data),
      recursive: true,
    });
  }

  async saveTextToPublicStorage(options: {
    fileName: string;
    text: string;
    target?: PublicStorageTarget;
    folder?: string;
  }): Promise<WriteFileResult> {
    await this.ensurePublicStoragePermission();

    const { directory, path } = this.getPublicTarget(options);
    return Filesystem.writeFile({
      path,
      directory,
      data: options.text,
      encoding: Encoding.UTF8,
      recursive: true,
    });
  }

  async downloadToPublicStorage(options: {
    url: string;
    fileName: string;
    target?: PublicStorageTarget;
    folder?: string;
    onProgress?: (progress: ProgressStatus) => void;
  }): Promise<string> {
    await this.ensurePublicStoragePermission();

    const { directory, path } = this.getPublicTarget(options);
    let listenerHandle: { remove: () => Promise<void> } | undefined;

    if (options.onProgress) {
      listenerHandle = await Filesystem.addListener('progress', options.onProgress);
    }

    try {
      const result = await Filesystem.downloadFile({
        url: options.url,
        path,
        directory,
        recursive: true,
        progress: Boolean(options.onProgress),
      });

      return result.path ?? path;
    } finally {
      await listenerHandle?.remove();
    }
  }

  async getPublicUri(
    fileName: string,
    target: PublicStorageTarget = 'documents',
    folder = 'Clashgram',
  ): Promise<string> {
    const { directory, path } = this.getPublicTarget({ fileName, target, folder });
    const result = await Filesystem.getUri({ path, directory });
    return Capacitor.convertFileSrc(result.uri);
  }

  private getPublicTarget(options: {
    fileName: string;
    target?: PublicStorageTarget;
    folder?: string;
  }): { directory: Directory; path: string } {
    const safeFileName = this.sanitizePathSegment(options.fileName);
    const safeFolder = options.folder ? this.sanitizeFolder(options.folder) : 'Clashgram';
    const target = options.target ?? 'documents';

    if (target === 'downloads' && Capacitor.getPlatform() === 'android') {
      return {
        directory: Directory.ExternalStorage,
        path: `Download/${safeFolder}/${safeFileName}`,
      };
    }

    return {
      directory: Directory.Documents,
      path: `${safeFolder}/${safeFileName}`,
    };
  }

  private sanitizeFolder(folder: string): string {
    return folder
      .split(/[\\/]+/)
      .map((segment) => this.sanitizePathSegment(segment))
      .filter(Boolean)
      .join('/');
  }

  private sanitizePathSegment(segment: string): string {
    return segment.replace(/[<>:"|?*\u0000-\u001F]/g, '_').trim();
  }

  private stripDataUrlPrefix(value: string): string {
    const marker = ';base64,';
    const markerIndex = value.indexOf(marker);
    if (markerIndex === -1) {
      return value;
    }

    return value.slice(markerIndex + marker.length);
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error ?? new Error('Unable to read file blob'));
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== 'string') {
          reject(new Error('Unexpected file reader result'));
          return;
        }

        resolve(this.stripDataUrlPrefix(result));
      };
      reader.readAsDataURL(blob);
    });
  }

  private base64ToBytes(base64: string): Uint8Array {
    const binary = atob(this.stripDataUrlPrefix(base64));
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
  }
}

export default new FileStorageService();
