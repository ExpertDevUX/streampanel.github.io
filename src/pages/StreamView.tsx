import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StreamPlayer } from '../components/StreamPlayer';
import { Stream } from '../types/stream';
import { Eye, Clock, Monitor, Radio, ArrowLeft, Share2, Code } from 'lucide-react';
import { formatDuration, formatBitrate, getEmbedCode } from '../utils/streamUtils';

export const StreamView: React.FC = () => {
  const { streamId } = useParams<{ streamId: string }>();
  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmbedCode, setShowEmbedCode] = useState(false);

  useEffect(() => {
    // Mock stream data - in real app, fetch from API
    const mockStream: Stream = {
      id: streamId || '1',
      name: 'Gaming Live Stream - Epic Battles',
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

  const handleCopyEmbed = () => {
    if (stream) {
      const embedCode = getEmbedCode(stream.id);
      navigator.clipboard.writeText(embedCode);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading stream...</div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Stream not found</h2>
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">{stream.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="uppercase font-semibold">LIVE</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye size={14} />
                    <span>{stream.viewers} viewers</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>
              <button
                onClick={() => setShowEmbedCode(!showEmbedCode)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Code size={16} />
                <span>Embed</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Player */}
          <div className="lg:col-span-3">
            <div className="aspect-video mb-6">
              <StreamPlayer
                hlsUrl={stream.hlsUrl}
                dashUrl={stream.dashUrl}
                autoplay={false}
                className="w-full h-full"
              />
            </div>

            {/* Embed Code */}
            {showEmbedCode && (
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Embed Code</h3>
                <div className="bg-gray-900 rounded-lg p-4">
                  <code className="text-green-400 text-sm break-all">
                    {getEmbedCode(stream.id)}
                  </code>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleCopyEmbed}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Copy Code
                  </button>
                </div>
              </div>
            )}

            {/* Stream Details */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Stream Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Eye size={16} />
                  <div>
                    <p className="text-sm text-gray-400">Viewers</p>
                    <p className="font-semibold">{stream.viewers}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Radio size={16} />
                  <div>
                    <p className="text-sm text-gray-400">Bitrate</p>
                    <p className="font-semibold">{formatBitrate(stream.bitrate)}bps</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Monitor size={16} />
                  <div>
                    <p className="text-sm text-gray-400">Resolution</p>
                    <p className="font-semibold">{stream.resolution}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <Clock size={16} />
                  <div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="font-semibold">{formatDuration(stream.duration)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stream URLs */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Stream URLs</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">RTMP URL</label>
                  <code className="block bg-gray-900 p-2 rounded text-blue-400 text-xs break-all">
                    {stream.rtmpUrl}/{stream.streamKey}
                  </code>
                </div>
                {stream.hlsUrl && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">HLS URL</label>
                    <code className="block bg-gray-900 p-2 rounded text-green-400 text-xs break-all">
                      {stream.hlsUrl}
                    </code>
                  </div>
                )}
                {stream.dashUrl && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">DASH URL</label>
                    <code className="block bg-gray-900 p-2 rounded text-purple-400 text-xs break-all">
                      {stream.dashUrl}
                    </code>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors">
                  Stop Stream
                </button>
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
                  Download Recording
                </button>
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
                  Stream Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};