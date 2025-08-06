import React, { useState } from 'react';
import { Server, Key, Play, Square, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { StreamingService, ConversionSettings } from '../services/streamingService';

interface RTMPConfigurationProps {
  onStreamStart: (hlsUrl?: string, dashUrl?: string) => void;
  onStreamStop: () => void;
}

export const RTMPConfiguration: React.FC<RTMPConfigurationProps> = ({
  onStreamStart,
  onStreamStop
}) => {
  const [rtmpUrl, setRtmpUrl] = useState('rtmp://103.82.23.191:1935/live');
  const [streamKey, setStreamKey] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStatus, setStreamStatus] = useState<'idle' | 'connecting' | 'live' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [conversionSettings, setConversionSettings] = useState<ConversionSettings>({
    enableHLS: true,
    enableDASH: true,
    hlsSegmentDuration: 6,
    dashSegmentDuration: 4,
    bitrates: [1000, 2500, 5000],
    resolutions: [
      { width: 854, height: 480, name: '480p' },
      { width: 1280, height: 720, name: '720p' },
      { width: 1920, height: 1080, name: '1080p' }
    ],
    audioCodec: 'aac',
    videoCodec: 'h264'
  });

  const streamingService = StreamingService.getInstance();

  const handleStartStream = async () => {
    if (!streamKey.trim()) {
      setErrorMessage('Please enter a stream key');
      return;
    }

    setStreamStatus('connecting');
    setErrorMessage('');
    setIsStreaming(true);

    try {
      const streamId = `stream_${Date.now()}`;
      const { hlsUrl, dashUrl } = await streamingService.startConversion(
        streamId,
        rtmpUrl,
        streamKey,
        conversionSettings
      );

      setStreamStatus('live');
      onStreamStart(hlsUrl, dashUrl);
    } catch (error) {
      setStreamStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to start stream conversion');
      setIsStreaming(false);
    }
  };

  const handleStopStream = () => {
    setStreamStatus('idle');
    setIsStreaming(false);
    setErrorMessage('');
    onStreamStop();
  };

  const getStatusIcon = () => {
    switch (streamStatus) {
      case 'connecting':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />;
      case 'live':
        return <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full" />;
    }
  };

  const getStatusText = () => {
    switch (streamStatus) {
      case 'connecting':
        return 'Connecting to RTMP...';
      case 'live':
        return 'Live - Converting to HLS/DASH';
      case 'error':
        return 'Connection Error';
      default:
        return 'Ready to Stream';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">RTMP Stream Configuration</h2>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm text-gray-300">{getStatusText()}</span>
        </div>
      </div>

      {/* RTMP Settings */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Server className="inline w-4 h-4 mr-2" />
            RTMP Server URL
          </label>
          <input
            type="text"
            value={rtmpUrl}
            onChange={(e) => setRtmpUrl(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
            placeholder="rtmp://your-server:1935/live"
            disabled={isStreaming}
          />
          <p className="text-xs text-gray-400 mt-1">
            Use this URL in OBS: Settings → Stream → Server
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Key className="inline w-4 h-4 mr-2" />
            Stream Key
          </label>
          <input
            type="text"
            value={streamKey}
            onChange={(e) => setStreamKey(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
            placeholder="Enter your stream key"
            disabled={isStreaming}
          />
          <p className="text-xs text-gray-400 mt-1">
            Use this key in OBS: Settings → Stream → Stream Key
          </p>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="mb-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Settings size={16} />
          <span>Advanced Conversion Settings</span>
        </button>

        {showAdvanced && (
          <div className="mt-4 p-4 bg-gray-900 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={conversionSettings.enableHLS}
                  onChange={(e) => setConversionSettings(prev => ({ ...prev, enableHLS: e.target.checked }))}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  disabled={isStreaming}
                />
                <span className="text-gray-300">Enable HLS Output</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={conversionSettings.enableDASH}
                  onChange={(e) => setConversionSettings(prev => ({ ...prev, enableDASH: e.target.checked }))}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  disabled={isStreaming}
                />
                <span className="text-gray-300">Enable DASH Output</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">HLS Segment Duration (s)</label>
                <input
                  type="number"
                  value={conversionSettings.hlsSegmentDuration}
                  onChange={(e) => setConversionSettings(prev => ({ ...prev, hlsSegmentDuration: parseInt(e.target.value) }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                  min="2"
                  max="10"
                  disabled={isStreaming}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">DASH Segment Duration (s)</label>
                <input
                  type="number"
                  value={conversionSettings.dashSegmentDuration}
                  onChange={(e) => setConversionSettings(prev => ({ ...prev, dashSegmentDuration: parseInt(e.target.value) }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                  min="2"
                  max="10"
                  disabled={isStreaming}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Output Bitrates (kbps)</label>
              <div className="flex space-x-2">
                {[500, 1000, 2500, 5000, 8000].map(bitrate => (
                  <label key={bitrate} className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={conversionSettings.bitrates.includes(bitrate)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setConversionSettings(prev => ({
                            ...prev,
                            bitrates: [...prev.bitrates, bitrate].sort((a, b) => a - b)
                          }));
                        } else {
                          setConversionSettings(prev => ({
                            ...prev,
                            bitrates: prev.bitrates.filter(b => b !== bitrate)
                          }));
                        }
                      }}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                      disabled={isStreaming}
                    />
                    <span className="text-gray-300 text-sm">{bitrate}k</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-300 text-sm">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* OBS Instructions */}
      <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-300 mb-2">OBS Studio Configuration:</h3>
        <ol className="text-xs text-blue-200 space-y-1">
          <li>1. Open OBS Studio → Settings → Stream</li>
          <li>2. Service: Custom</li>
          <li>3. Server: <code className="bg-blue-800 px-1 rounded">{rtmpUrl}</code></li>
          <li>4. Stream Key: <code className="bg-blue-800 px-1 rounded">{streamKey || 'Enter key above'}</code></li>
          <li>5. Click "Start Streaming" in OBS, then click "Start Conversion" below</li>
        </ol>
      </div>

      {/* Control Buttons */}
      <div className="flex space-x-4">
        {!isStreaming ? (
          <button
            onClick={handleStartStream}
            disabled={!streamKey.trim()}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <Play size={20} />
            <span>Start Conversion</span>
          </button>
        ) : (
          <button
            onClick={handleStopStream}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <Square size={20} />
            <span>Stop Conversion</span>
          </button>
        )}
      </div>

      {/* FFmpeg Command Display */}
      {streamStatus === 'live' && (
        <div className="mt-4 p-3 bg-gray-900 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Generated FFmpeg Command:</h4>
          <code className="text-xs text-green-400 break-all">
            {streamingService.generateFFmpegCommand(
              `${rtmpUrl}/${streamKey}`,
              `/tmp/streams/current`,
              conversionSettings
            )}
          </code>
          <p className="text-xs text-gray-400 mt-2">
            This command would be executed on a server with FFmpeg installed to perform the actual conversion.
          </p>
        </div>
      )}
    </div>
  );
};