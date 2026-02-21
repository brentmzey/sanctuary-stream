import { useState, useEffect } from 'react';
import { StreamRecord, pb, subscribeToStream, unsubscribeFromStream } from '../lib/pocketbase';
import { Option, none, some } from '@shared/option';

interface UseStreamProps {
  streamId: string;
}

export function useStream({ streamId }: UseStreamProps) {
  const [stream, setStream] = useState<Option<StreamRecord>>(none());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Option<string>>(none());

  useEffect(() => {
    let mounted = true;

    async function fetchStream() {
      try {
        const record = await pb.collection('streams').getOne<StreamRecord>(streamId);
        if (mounted) {
          setStream(some(record));
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          setError(some(message));
          setLoading(false);
        }
      }
    }

    fetchStream();

    subscribeToStream(streamId, (record) => {
      if (mounted) {
        setStream(some(record));
      }
    });

    return () => {
      mounted = false;
      unsubscribeFromStream(streamId);
    };
  }, [streamId]);

  return { stream, loading, error };
}
