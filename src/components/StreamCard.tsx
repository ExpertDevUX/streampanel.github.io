import React from 'react';
import { Stream } from '../types/stream';
import { Eye, Radio, Clock, Monitor, Copy, ExternalLink } from 'lucide-react';
import { formatDuration, formatBitrate, getStatusColor, getEmbedCode } from '../utils/streamUtils';

interface StreamCardProps {
  stream: Stream;
  onEdit: (stream: Stream) => void;
  onDelete: (streamId: string) => void;
  onCopyEmbed: (embedCode: string) => void;
}

export const StreamCard: React.FC<StreamCardProps> = ({
  stream,
  onEdit,
  onDelete,
  onCopyEmbed
}) => {
  const handleCopyEmbed = () => {
    const embedCode = getEmbedCode(stream.id);
    onCopyEmbed(embedCode);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-all duration-300 border border-gray-700 hover:border-blue-500/50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(stream.status)} animate-pulse`} />
          <div>
            <h3 className="text-lg font-semibold text-white">{stream.name}</h3>
            <p className="text-gray-400 text-sm capitalize">{stream.status}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {stream.status === 'live' && (
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              LIVE
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2 text-gray-300">
          <Eye size={16} />
          <span className="text-sm">{stream.viewers} viewers</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-300">
          <Radio size={16} />
          <span className="text-sm">{formatBitrate(stream.bitrate)}bps</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-300">
          <Clock size={16} />
          <span className="text-sm">{formatDuration(stream.duration)}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-300">
          <Monitor size={16} />
          <span className="text-sm">{stream.resolution}</span>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-3 mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Stream URLs</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">RTMP:</span>
            <code className="text-xs text-blue-400 bg-gray-800 px-2 py-1 rounded">
              {stream.rtmpUrl}
            </code>
          </div>
          {stream.hlsUrl && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">HLS:</span>
              <code className="text-xs text-green-400 bg-gray-800 px-2 py-1 rounded">
                {stream.hlsUrl}
              </code>
            </div>
          )}
          {stream.dashUrl && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">DASH:</span>
              <code className="text-xs text-purple-400 bg-gray-800 px-2 py-1 rounded">
                {stream.dashUrl}
              </code>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onEdit(stream)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
        >
          Configure
        </button>
        <button
          onClick={handleCopyEmbed}
          className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
          title="Copy embed code"
        >
          <Copy size={16} />
        </button>
        <a
          href={stream.embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
          title="Open in new tab"
        >
          <ExternalLink size={16} />
        </a>
        <button
          onClick={() => onDelete(stream.id)}
          className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
};