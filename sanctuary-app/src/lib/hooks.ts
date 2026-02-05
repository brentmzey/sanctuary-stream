import { useState, useEffect } from 'react';
import { StreamRecord, pb, subscribeToStream, unsubscribeFromStream } from '../lib/pocketbase';

interface UseStreamProps {
  streamId: string;
}

export function useStream({ streamId }: UseStreamProps) {
  const [stream, setStream] = useState<StreamRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchStream() {
      try {
        const record = await pb.collection('streams').getOne<StreamRecord>(streamId);
        if (mounted) {
          setStream(record);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          setError(message);
          setLoading(false);
        }
      }
    }

    fetchStream();

    subscribeToStream(streamId, (record) => {
      if (mounted) {
        setStream(record);
      }
    });

    return () => {
      mounted = false;
      unsubscribeFromStream(streamId);
    };
  }, [streamId]);

  return { stream, loading, error };
}
