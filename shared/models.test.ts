import { describe, it, expect } from 'vitest';
import { SermonBuilder, SermonRow, BrotliBase64String } from './models';

describe('SermonBuilder', () => {
  const mockRow: SermonRow = {
    id: 'sermon01',
    created: '2026-03-24T00:00:00Z',
    updated: '2026-03-24T00:00:00Z',
    collectionId: 'sermons',
    collectionName: 'sermons',
    title: 'The Great Commission',
    bodyBrotliBase64: 'compressed-data' as BrotliBase64String,
    sermon_date: '2026-03-22T10:00:00Z',
    published: true,
    speaker: 'Pastor John'
  };

  it('builds from a database row', () => {
    const builder = SermonBuilder.fromRow(mockRow);
    const row = builder.toRow();
    expect(row).toEqual(mockRow);
  });

  it('handles optional fields using monads', () => {
    const builder = new SermonBuilder()
      .withTitle('Test')
      .withSpeaker('Speaker A');
    
    const row = builder.toRow();
    expect(row.speaker).toBe('Speaker A');
    expect(row.youtube_url).toBeUndefined();
  });

  it('mapped partial updates correctly', () => {
    const builder = SermonBuilder.fromPartial({ title: 'New Title' });
    const row = builder.toRow();
    expect(row.title).toBe('New Title');
    expect(row.id).toBe(''); // Default
  });
});
