import React, { useState } from 'react';
import { Terminal, Copy, Download, ExternalLink, AlertTriangle } from 'lucide-react';

export const FFmpegInstructions: React.FC = () => {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = (text: string, commandType: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(commandType);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const installCommands = {
    ubuntu: 'sudo apt update && sudo apt install ffmpeg',
    centos: 'sudo yum install epel-release && sudo yum install ffmpeg',
    macos: 'brew install ffmpeg',
    windows: 'Download from https://ffmpeg.org/download.html'
  };

  const conversionCommand = `ffmpeg -i rtmp://103.82.23.191:1935/live/YOUR_STREAM_KEY \\
  -c:v libx264 -c:a aac \\
  -preset veryfast -tune zerolatency \\
  -f hls -hls_time 6 -hls_playlist_type live \\
  -hls_flags delete_segments \\
  -hls_segment_filename "/var/www/html/hls/segment_%03d.ts" \\
  /var/www/html/hls/playlist.m3u8 \\
  -f dash -seg_duration 4 -use_template 1 -use_timeline 1 \\
  /var/www/html/dash/manifest.mpd`;

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center space-x-2 mb-6">
        <Terminal className="text-blue-400" size={24} />
        <h2 className="text-xl font-semibold text-white">FFmpeg Server Setup</h2>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="text-yellow-400 mt-0.5" size={16} />
          <div>
            <h3 className="text-yellow-300 font-medium text-sm">Server Requirements</h3>
            <p className="text-yellow-200 text-sm mt-1">
              FFmpeg is not available in this browser environment. You'll need to set up a server with FFmpeg installed to perform actual RTMP-to-HLS/DASH conversion.
            </p>
          </div>
        </div>
      </div>

      {/* Installation Instructions */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-4">1. Install FFmpeg on Your Server</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(installCommands).map(([os, command]) => (
            <div key={os} className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-300 capitalize">{os}</h4>
                <button
                  onClick={() => copyToClipboard(command, os)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {copiedCommand === os ? (
                    <span className="text-green-400 text-xs">Copied!</span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
              <code className="text-blue-300 text-xs break-all">{command}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Command */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-4">2. RTMP to HLS/DASH Conversion Command</h3>
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-300">Complete FFmpeg Command</h4>
            <button
              onClick={() => copyToClipboard(conversionCommand, 'conversion')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors flex items-center space-x-1"
            >
              <Copy size={12} />
              <span>{copiedCommand === 'conversion' ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <pre className="text-green-300 text-xs overflow-x-auto whitespace-pre-wrap">
            {conversionCommand}
          </pre>
        </div>
        
        <div className="mt-4 text-sm text-gray-400">
          <p className="mb-2"><strong>Command Explanation:</strong></p>
          <ul className="space-y-1 text-xs">
            <li>• <code className="text-blue-300">-i rtmp://...</code> - Input RTMP stream</li>
            <li>• <code className="text-blue-300">-c:v libx264</code> - H.264 video codec</li>
            <li>• <code className="text-blue-300">-c:a aac</code> - AAC audio codec</li>
            <li>• <code className="text-blue-300">-preset veryfast</code> - Fast encoding for live streaming</li>
            <li>• <code className="text-blue-300">-f hls</code> - HLS output format</li>
            <li>• <code className="text-blue-300">-f dash</code> - DASH output format</li>
          </ul>
        </div>
      </div>

      {/* Server Setup */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-4">3. Web Server Configuration</h3>
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Nginx Configuration</h4>
            <pre className="text-purple-300 text-xs overflow-x-auto">
{`server {
    listen 80;
    server_name your-domain.com;
    
    location /hls {
        add_header Cache-Control no-cache;
        add_header Access-Control-Allow-Origin *;
        root /var/www/html;
    }
    
    location /dash {
        add_header Cache-Control no-cache;
        add_header Access-Control-Allow-Origin *;
        root /var/www/html;
    }
}`}
            </pre>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Apache Configuration</h4>
            <pre className="text-purple-300 text-xs overflow-x-auto">
{`<Directory "/var/www/html/hls">
    Header set Cache-Control "no-cache"
    Header set Access-Control-Allow-Origin "*"
</Directory>

<Directory "/var/www/html/dash">
    Header set Cache-Control "no-cache"
    Header set Access-Control-Allow-Origin "*"
</Directory>`}
            </pre>
          </div>
        </div>
      </div>

      {/* Useful Links */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">4. Additional Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="https://ffmpeg.org/documentation.html"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-900 rounded-lg p-4 hover:bg-gray-750 transition-colors flex items-center space-x-3"
          >
            <ExternalLink className="text-blue-400" size={20} />
            <div>
              <h4 className="text-white font-medium">FFmpeg Documentation</h4>
              <p className="text-gray-400 text-sm">Official FFmpeg documentation</p>
            </div>
          </a>
          
          <a
            href="https://github.com/video-dev/hls.js/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-900 rounded-lg p-4 hover:bg-gray-750 transition-colors flex items-center space-x-3"
          >
            <ExternalLink className="text-green-400" size={20} />
            <div>
              <h4 className="text-white font-medium">HLS.js Player</h4>
              <p className="text-gray-400 text-sm">JavaScript HLS player library</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};