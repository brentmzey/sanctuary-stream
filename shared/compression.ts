import { zlibSync, unzlibSync, strToU8, strFromU8 } from 'fflate';
import { type Option, isNone, some, none } from './option';

/**
 * Enterprise Compression Service
 * Uses fflate for universal (Browser + Node) high-performance zlib compression.
 * Perfect for large text payloads like sermons and announcements.
 */
export class CompressionService {
  /**
   * Compresses a string to a Zlib-Base64 string.
   */
  static async compressToBase64(input: Option<string>): Promise<Option<string>> {
    if (isNone(input) || input.value.trim() === '') return none();

    try {
      const buf = strToU8(input.value);
      const compressed = zlibSync(buf, { level: 9 });
      
      // Convert to Base64 (Browser/Node compatible)
      const base64 = typeof Buffer !== 'undefined' 
        ? Buffer.from(compressed).toString('base64') 
        : btoa(String.fromCharCode(...compressed));
        
      return some(base64);
    } catch (e) {
      console.error('Compression failed:', e);
      return none();
    }
  }

  /**
   * Decompresses a Zlib-Base64 string back to original text.
   */
  static async decompressFromBase64(compressed: Option<string>): Promise<Option<string>> {
    if (isNone(compressed) || !compressed.value || compressed.value.trim() === '') return none();

    try {
      // Decode Base64 (Browser/Node compatible)
      const bin = typeof Buffer !== 'undefined'
        ? Buffer.from(compressed.value, 'base64')
        : new Uint8Array(atob(compressed.value).split('').map(c => c.charCodeAt(0)));
        
      const decompressed = unzlibSync(bin);
      return some(strFromU8(decompressed));
    } catch (e) {
      console.warn('Decompression failed (fallback to raw):', e);
      return compressed;
    }
  }
}
