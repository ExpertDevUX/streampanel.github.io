import React, { useState } from 'react';
import { Plus, Radio, Users, Monitor, TrendingUp } from 'lucide-react';
import { StreamCard } from '../components/StreamCard';
import { StreamForm } from '../components/StreamForm';
import { RTMPConfiguration } from '../components/RTMPConfiguration';
import { FFmpegInstructions } from '../components/FFmpegInstructions';
import { useStreams } from '../hooks/useStreams';
import { Stream, StreamSettings } from '../types/stream';

export const Dashboard: React.FC = () => {
  const { streams, createStream, updateStream, deleteStream } = useStreams();
  const [showStreamForm, setShowStreamForm] = useState(false);
  const [editingStream, setEditingStream] = useState<Stream | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [activeHlsUrl, setActiveHlsUrl] = useState<string | undefined>();
  const [activeDashUrl, setActiveDashUrl] = useState<string | undefined>();

  const handleCreateStream = () => {
    setEditingStream(null);
    setShowStreamForm(true);
  };

  const handleEditStream = (stream: Stream) => {
    setEditingStream(stream);
    setShowStreamForm(true);
  };

  const handleSaveStream = (streamData: Partial<Stream>, settings: StreamSettings) => {
    if (editingStream) {
      updateStream(editingStream.id, streamData);
    } else {
      createStream(streamData, settings);
    }
    setShowStreamForm(false);
    setEditingStream(null);
    showNotification(editingStream ? 'Stream updated successfully!' : 'Stream created successfully!');
  };

  const handleDeleteStream = (streamId: string) => {
    if (window.confirm('Are you sure you want to delete this stream?')) {
      deleteStream(streamId);
      showNotification('Stream deleted successfully!');
    }
  };

  const handleCopyEmbed = (embedCode: string) => {
    navigator.clipboard.writeText(embedCode);
    showNotification('Embed code copied to clipboard!');
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleStreamStart = (hlsUrl?: string, dashUrl?: string) => {
    setActiveHlsUrl(hlsUrl);
    setActiveDashUrl(dashUrl);
    showNotification('RTMP stream conversion started successfully!');
  };

  const handleStreamStop = () => {
    setActiveHlsUrl(undefined);
    setActiveDashUrl(undefined);
    showNotification('Stream conversion stopped.');
  };
  const liveStreams = streams.filter(s => s.status === 'live');
  const totalViewers = streams.reduce((sum, s) => sum + s.viewers, 0);
  const totalBandwidth = streams.reduce((sum, s) => sum + (s.status === 'live' ? s.bitrate : 0), 0);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Stream Portal</h1>
              <p className="text-gray-400 mt-1">RTMP to HLS/DASH Streaming Platform</p>
            </div>
            <button
              onClick={handleCreateStream}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>New Stream</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* RTMP Configuration */}
        <div className="mb-8">
          <RTMPConfiguration
            onStreamStart={handleStreamStart}
            onStreamStop={handleStreamStop}
          />
        </div>

        {/* Live Stream Preview */}
        {(activeHlsUrl || activeDashUrl) && (
          <div className="mb-8">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Live Stream Preview</h2>
              <div className="aspect-video bg-black rounded-lg mb-4">
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <Radio size={32} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">LIVE STREAM ACTIVE</h3>
                    <p className="text-gray-300 text-sm mb-4">Stream is being converted to HLS/DASH formats</p>
                    <div className="space-y-2 text-xs">
                      {activeHlsUrl && (
                        <div className="bg-gray-900 p-2 rounded">
                          <span className="text-green-400">HLS: </span>
                          <code className="text-green-300">{activeHlsUrl}</code>
                        </div>
                      )}
                      {activeDashUrl && (
                        <div className="bg-gray-900 p-2 rounded">
                          <span className="text-purple-400">DASH: </span>
                          <code className="text-purple-300">{activeDashUrl}</code>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Streams</p>
                <p className="text-2xl font-bold text-white">{streams.length}</p>
              </div>
              <div className="bg-blue-600/20 p-3 rounded-lg">
                <Monitor className="text-blue-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Live Streams</p>
                <p className="text-2xl font-bold text-white">{liveStreams.length}</p>
              </div>
              <div className="bg-red-600/20 p-3 rounded-lg">
                <Radio className="text-red-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Viewers</p>
                <p className="text-2xl font-bold text-white">{totalViewers.toLocaleString()}</p>
              </div>
              <div className="bg-green-600/20 p-3 rounded-lg">
                <Users className="text-green-400" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Bandwidth</p>
                <p className="text-2xl font-bold text-white">
                  {(totalBandwidth / 1000).toFixed(1)}M
                </p>
              </div>
              <div className="bg-purple-600/20 p-3 rounded-lg">
                <TrendingUp className="text-purple-400" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* FFmpeg Instructions */}
        <div className="mb-8">
          <FFmpegInstructions />
        </div>

        {/* Streams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {streams.map(stream => (
            <StreamCard
              key={stream.id}
              stream={stream}
              onEdit={handleEditStream}
              onDelete={handleDeleteStream}
              onCopyEmbed={handleCopyEmbed}
            />
          ))}
        </div>

        {streams.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Radio size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No streams yet</h3>
            <p className="text-gray-400 mb-6">Create your first stream to get started</p>
            <button
              onClick={handleCreateStream}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Stream
            </button>
          </div>
        )}
      </div>

      {/* Stream Form Modal */}
      {showStreamForm && (
        <StreamForm
          stream={editingStream || undefined}
          onSave={handleSaveStream}
          onClose={() => {
            setShowStreamForm(false);
            setEditingStream(null);
          }}
        />
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          {notification}
        </div>
      )}
    </div>
  );
};