import React, { useState } from 'react';
import { X, Copy, Eye, EyeOff } from 'lucide-react';
import { Stream, StreamSettings } from '../types/stream';
import { generateStreamKey } from '../utils/streamUtils';

interface StreamFormProps {
  stream?: Stream;
  onSave: (streamData: Partial<Stream>, settings: StreamSettings) => void;
  onClose: () => void;
}

export const StreamForm: React.FC<StreamFormProps> = ({
  stream,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: stream?.name || '',
    rtmpUrl: stream?.rtmpUrl || 'rtmp://localhost:1935/live',
    streamKey: stream?.streamKey || generateStreamKey()
  });

  const [settings, setSettings] = useState<StreamSettings>({
    enableHLS: true,
    enableDASH: true,
    bitrates: [1000, 2000, 4000],
    resolutions: ['480p', '720p', '1080p'],
    maxViewers: 1000,
    autoRecord: false
  });

  const [showStreamKey, setShowStreamKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, settings);
  };

  const copyStreamKey = () => {
    navigator.clipboard.writeText(formData.streamKey);
  };

  const regenerateStreamKey = () => {
    setFormData(prev => ({ ...prev, streamKey: generateStreamKey() }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {stream ? 'Edit Stream' : 'Create New Stream'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Settings */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Basic Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stream Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="My Live Stream"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  RTMP Server URL
                </label>
                <input
                  type="text"
                  value={formData.rtmpUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, rtmpUrl: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="rtmp://localhost:1935/live"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stream Key
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <input
                      type={showStreamKey ? 'text' : 'password'}
                      value={formData.streamKey}
                      onChange={(e) => setFormData(prev => ({ ...prev, streamKey: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pr-12 text-white focus:border-blue-500 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowStreamKey(!showStreamKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showStreamKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={copyStreamKey}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
                    title="Copy stream key"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={regenerateStreamKey}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Output Settings */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Output Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.enableHLS}
                    onChange={(e) => setSettings(prev => ({ ...prev, enableHLS: e.target.checked }))}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">Enable HLS Output</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.enableDASH}
                    onChange={(e) => setSettings(prev => ({ ...prev, enableDASH: e.target.checked }))}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">Enable DASH Output</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bitrates (kbps)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[500, 1000, 2000, 4000, 6000, 8000].map(bitrate => (
                    <label key={bitrate} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={settings.bitrates.includes(bitrate)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSettings(prev => ({
                              ...prev,
                              bitrates: [...prev.bitrates, bitrate].sort((a, b) => a - b)
                            }));
                          } else {
                            setSettings(prev => ({
                              ...prev,
                              bitrates: prev.bitrates.filter(b => b !== bitrate)
                            }));
                          }
                        }}
                        className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-300 text-sm">{bitrate}k</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Concurrent Viewers
                </label>
                <input
                  type="number"
                  value={settings.maxViewers}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxViewers: parseInt(e.target.value) }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                  min="1"
                  max="10000"
                />
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.autoRecord}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoRecord: e.target.checked }))}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-300">Auto-record streams</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-4 pt-4 border-t border-gray-700">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors font-medium"
            >
              {stream ? 'Update Stream' : 'Create Stream'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};