import { describe, it, expect, beforeAll } from 'vitest';
import { pb, getSermons, getCurrentContext } from '../sanctuary-app/src/lib/pocketbase';
import { SermonBuilder, BrotliBase64String } from '../shared/models';
import { CompressionService } from '../shared/compression';
import { some, isSome } from '../shared/option';
import { isSuccess, match } from '../shared/result';

/**
 * PRODUCTION ROUND-TRIP VERIFICATION
 * 
 * Verifies that we can:
 * 1. Authenticate (required for writes)
 * 2. Compress a massive text payload
 * 3. Store it in the live PocketHost instance
 * 4. Retrieve it and verify transparent decompression
 * 5. Cleanup
 */
describe('Production Round-Trip Verification', () => {
  const PB_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL_PRODUCTION || process.env.PB_ADMIN_EMAIL;
  const PB_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD_PRODUCTION || process.env.PB_ADMIN_PASSWORD;

  beforeAll(async () => {
    if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
      console.warn('⚠️ Missing admin credentials. Skipping production write tests.');
      return;
    }
    await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
  });

  it('should verify public read access for sermons', async () => {
    const result = await getSermons(1);
    expect(isSuccess(result)).toBe(true);
  });

  it('should complete a full compressed round-trip', async () => {
    if (!pb.authStore.isValid) return;

    const testTitle = `Round-Trip Test ${Date.now()}`;
    const massiveBody = 'Sanctuary Stream Enterprise Architecture Verification. '.repeat(500); // ~25KB
    
    // 1. Compress
    const compressedOpt = await CompressionService.compressToBase64(some(massiveBody));
    expect(isSome(compressedOpt)).toBe(true);
    const compressed = compressedOpt.value as BrotliBase64String;

    // 2. Create record
    const record = await pb.collection('sermons').create({
      title: testTitle,
      bodyBrotliBase64: compressed,
      sermon_date: new Date().toISOString(),
      published: false
    });

    expect(record.id).toBeDefined();

    try {
      // 3. Retrieve via service layer (should decompress automatically)
      const listResult = await getSermons(10);
      await match(listResult, 
        async (sermons) => {
          const found = sermons.find(s => s.id === record.id);
          expect(found).toBeDefined();
          expect(found?.title).toBe(testTitle);
          expect(found?.body).toBe(massiveBody); // Transparently decompressed!
        },
        (err) => { throw err; }
      );
    } finally {
      // 4. Cleanup
      await pb.collection('sermons').delete(record.id);
    }
  });

  it('should verify context elevation', () => {
    const ctx = getCurrentContext();
    // If authenticated as admin in beforeAll, role should be admin
    if (pb.authStore.isValid && pb.authStore.model?.email === PB_ADMIN_EMAIL) {
        expect(ctx.role).toBe('admin');
    }
  });
});
