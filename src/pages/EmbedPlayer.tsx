import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { StreamPlayer } from '../components/StreamPlayer';
import { Stream } from '../types/stream';

export const EmbedPlayer: React.FC = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock stream data - in real app, fetch from API
    const mockStream: Stream = {
      id: streamId || '1',
      name: 'Live Stream',
      rtmpUrl: 'rtmp://localhost:1935/live',
      streamKey: 'abc123',
      status: 'live',
      hlsUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      dashUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.mpd',
      viewers: 342,
      bitrate: 2500,
      resolution: '1080p',
      createdAt: new Date(),
      duration: 3600
    };

    setStream(mockStream);
    setLoading(false);
  }, [streamId]);

  if (loading) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="text-white">Loading stream...</div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <div className="text-white">Stream not found</div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black">
      <StreamPlayer
        hlsUrl={stream.hlsUrl}
        dashUrl={stream.dashUrl}
        autoplay={true}
        className="w-full h-full"
      />
    </div>
  );
};