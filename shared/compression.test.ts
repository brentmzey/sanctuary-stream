import { describe, it, expect } from 'vitest';
import { CompressionService } from './compression';
import { some, none, isSome } from './option';

describe('CompressionService', () => {
  const largeText = 'Sanctuary Stream '.repeat(1000); // ~17KB string

  it('compresses and decompresses text correctly (Round Trip)', async () => {
    const compressedOpt = await CompressionService.compressToBase64(some(largeText));
    expect(isSome(compressedOpt)).toBe(true);
    
    if (isSome(compressedOpt)) {
      // Binary compression should be significantly smaller than raw text
      // (Brotli-Base64 is still a string, but the content is squished)
      expect(compressedOpt.value.length).toBeLessThan(largeText.length);
      
      const decompressedOpt = await CompressionService.decompressFromBase64(compressedOpt);
      expect(isSome(decompressedOpt)).toBe(true);
      if (isSome(decompressedOpt)) {
        expect(decompressedOpt.value).toBe(largeText);
      }
    }
  });

  it('returns none for none input', async () => {
    const compressed = await CompressionService.compressToBase64(none());
    expect(isSome(compressed)).toBe(false);
    
    const decompressed = await CompressionService.decompressFromBase64(none());
    expect(isSome(decompressed)).toBe(false);
  });

  it('handles small text correctly', async () => {
    const text = 'short';
    const compressed = await CompressionService.compressToBase64(some(text));
    const decompressed = await CompressionService.decompressFromBase64(compressed);
    expect(isSome(decompressed) && decompressed.value).toBe(text);
  });

  it('is defensive against uncompressed text in decompressor', async () => {
    const raw = 'this is not compressed';
    const result = await CompressionService.decompressFromBase64(some(raw));
    // Should fallback to returning the input as-is if decompression fails
    expect(isSome(result) && result.value).toBe(raw);
  });
});
