# Stream Portable - RTMP to HLS/DASH Streaming Platform

A complete streaming solution that converts RTMP streams to HLS and DASH formats with embeddable players for any website.

## Features

- **RTMP Ingestion**: Accept streams from OBS Studio and other RTMP sources
- **Real-time Conversion**: Automatic conversion to HLS and DASH formats using FFmpeg
- **Multi-bitrate Streaming**: Support for adaptive bitrate streaming
- **Embeddable Players**: HTML5 video players that work on any website
- **Stream Management**: Web dashboard for monitoring and managing streams
- **Auto-scaling**: Handles multiple concurrent streams
- **SSL Support**: Optional HTTPS with Let's Encrypt certificates

## Quick Installation on VPS

### Automated Installation

Run the auto-installation script on your VPS (Ubuntu/Debian/CentOS):

```bash
# Download and run the installer
curl -fsSL https://raw.githubusercontent.com/your-repo/stream-portable/main/autoinstall.sh -o autoinstall.sh
chmod +x autoinstall.sh
sudo ./autoinstall.sh
```

The installer will:
- Install and configure Nginx
- Install FFmpeg for stream conversion
- Set up Node.js streaming server
- Configure firewall rules
- Create SSL certificates (optional)
- Set up systemd services

### Manual Installation

If you prefer manual installation:

1. **Install Dependencies**:
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install -y nginx ffmpeg nodejs npm

# CentOS/RHEL
sudo yum install -y nginx ffmpeg nodejs npm
```

2. **Clone and Setup**:
```bash
git clone https://github.com/your-repo/stream-portable.git
cd stream-portable
npm install
```

3. **Configure Nginx** (see autoinstall.sh for complete config)

4. **Start Services**:
```bash
sudo systemctl start nginx
npm start
```

## OBS Studio Configuration

1. Open OBS Studio → Settings → Stream
2. **Service**: Custom
3. **Server**: `rtmp://YOUR_SERVER_IP:1935/live`
4. **Stream Key**: Any unique identifier (e.g., `mystream123`)
5. Click "Start Streaming"

## Stream URLs

Once streaming starts, your content will be available at:

- **HLS**: `http://your-domain.com/streams/hls/{stream_key}/playlist.m3u8`
- **DASH**: `http://your-domain.com/streams/dash/{stream_key}/manifest.mpd`

## Embedding Streams

### HTML5 Video Player
```html
<video controls width="800" height="450">
  <source src="http://your-domain.com/streams/hls/mystream123/playlist.m3u8" type="application/vnd.apple.mpegurl">
  Your browser does not support the video tag.
</video>
```

### HLS.js Player
```html
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<video id="video" controls width="800" height="450"></video>
<script>
  const video = document.getElementById('video');
  const hls = new Hls();
  hls.loadSource('http://your-domain.com/streams/hls/mystream123/playlist.m3u8');
  hls.attachMedia(video);
</script>
```

### DASH.js Player
```html
<script src="https://cdn.dashjs.org/latest/dash.all.min.js"></script>
<video id="video" controls width="800" height="450"></video>
<script>
  const video = document.getElementById('video');
  const player = dashjs.MediaPlayer().create();
  player.initialize(video, 'http://your-domain.com/streams/dash/mystream123/manifest.mpd', true);
</script>
```

## Management Commands

After installation, use these commands to manage your streaming server:

```bash
# Start all services
streaming-start

# Stop all services
streaming-stop

# Check service status
streaming-status

# View real-time logs
streaming-logs
```

## API Endpoints

- `GET /api/streams` - List active streams
- `GET /api/health` - Server health check
- `POST /api/streams/{streamKey}/stop` - Stop a specific stream

## Configuration

### Stream Settings
- **HLS Segment Duration**: 6 seconds (configurable)
- **DASH Segment Duration**: 4 seconds (configurable)
- **Video Codec**: H.264
- **Audio Codec**: AAC
- **Bitrate**: Adaptive (multiple bitrates supported)

### Server Requirements
- **CPU**: 2+ cores recommended
- **RAM**: 4GB+ recommended
- **Storage**: SSD recommended for better performance
- **Bandwidth**: Sufficient upload bandwidth for your streams

## Troubleshooting

### Common Issues

1. **Stream not starting**:
   - Check if RTMP port (1935) is open
   - Verify OBS configuration
   - Check server logs: `streaming-logs`

2. **Playback issues**:
   - Ensure CORS headers are configured
   - Check if HLS/DASH files are being generated
   - Verify web server is serving files correctly

3. **Performance issues**:
   - Monitor CPU usage during streaming
   - Consider adjusting FFmpeg presets
   - Scale server resources if needed

### Log Locations
- **Nginx**: `/var/log/nginx/`
- **Streaming Server**: `journalctl -u streaming-server`
- **FFmpeg**: Console output in streaming server logs

## Security Considerations

- Use HTTPS in production (SSL certificates included in installer)
- Implement stream key authentication
- Configure firewall rules appropriately
- Regular security updates

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the troubleshooting section
- Review server logs
- Open an issue on GitHub

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request