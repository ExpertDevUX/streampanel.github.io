import { useState, useEffect } from 'react';
import { Stream, StreamSettings } from '../types/stream';

export const useStreams = () => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockStreams: Stream[] = [
      {
        id: '1',
        name: 'Gaming Live Stream',
        rtmpUrl: 'rtmp://localhost:1935/live',
        streamKey: 'abc123def456',
        status: 'live',
        hlsUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
        dashUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.mpd',
        embedUrl: `/embed/1`,
        viewers: 342,
        bitrate: 2500,
        resolution: '1080p',
        createdAt: new Date(Date.now() - 86400000),
        lastActive: new Date(),
        duration: 3600
      },
      {
        id: '2',
        name: 'Conference Presentation',
        rtmpUrl: 'rtmp://localhost:1935/live',
        streamKey: 'xyz789uvw123',
        status: 'offline',
        hlsUrl: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
        embedUrl: `/embed/2`,
        viewers: 0,
        bitrate: 1500,
        resolution: '720p',
        createdAt: new Date(Date.now() - 172800000),
        duration: 0
      }
    ];
    setStreams(mockStreams);
  }, []);

  const createStream = (streamData: Partial<Stream>, settings: StreamSettings) => {
    const newStream: Stream = {
      id: Math.random().toString(36).substr(2, 9),
      name: streamData.name || 'Untitled Stream',
      rtmpUrl: streamData.rtmpUrl || 'rtmp://localhost:1935/live',
      streamKey: streamData.streamKey || Math.random().toString(36).substr(2, 15),
      status: 'offline',
      embedUrl: `/embed/${Math.random().toString(36).substr(2, 9)}`,
      viewers: 0,
      bitrate: 0,
      resolution: '720p',
      createdAt: new Date(),
      duration: 0
    };

    if (settings.enableHLS) {
      newStream.hlsUrl = `https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8`;
    }

    if (settings.enableDASH) {
      newStream.dashUrl = `https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.mpd`;
    }

    setStreams(prev => [newStream, ...prev]);
    return newStream;
  };

  const updateStream = (streamId: string, updates: Partial<Stream>) => {
    setStreams(prev => prev.map(stream => 
      stream.id === streamId ? { ...stream, ...updates } : stream
    ));
  };

  const deleteStream = (streamId: string) => {
    setStreams(prev => prev.filter(stream => stream.id !== streamId));
  };

  const startStream = (streamId: string) => {
    updateStream(streamId, { 
      status: 'starting',
      lastActive: new Date() 
    });
    
    // Simulate stream starting
    setTimeout(() => {
      updateStream(streamId, { 
        status: 'live',
        viewers: Math.floor(Math.random() * 500) + 50,
        bitrate: 2000 + Math.floor(Math.random() * 2000)
      });
    }, 2000);
  };

  const stopStream = (streamId: string) => {
    updateStream(streamId, { 
      status: 'offline',
      viewers: 0,
      bitrate: 0
    });
  };

  return {
    streams,
    loading,
    createStream,
    updateStream,
    deleteStream,
    startStream,
    stopStream
  };
};