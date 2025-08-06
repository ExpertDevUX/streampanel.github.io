#!/bin/bash

# Stream Portable - VPS Auto Installation Script
# This script installs and configures a complete RTMP-to-HLS/DASH streaming server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=""
EMAIL=""
INSTALL_SSL=false
RTMP_PORT=1935
HTTP_PORT=80
HTTPS_PORT=443
STREAM_DIR="/var/www/html/streams"
LOG_DIR="/var/log/streaming"

print_header() {
    echo -e "${BLUE}"
    echo "=================================================="
    echo "    Stream Portable - VPS Auto Installer"
    echo "    RTMP to HLS/DASH Streaming Server Setup"
    echo "=================================================="
    echo -e "${NC}"
}

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        print_error "Cannot detect operating system"
        exit 1
    fi
    
    print_info "Detected OS: $OS $VER"
}

get_user_input() {
    echo -e "${YELLOW}Configuration Setup:${NC}"
    
    read -p "Enter your domain name (optional, press Enter to skip): " DOMAIN
    
    if [[ ! -z "$DOMAIN" ]]; then
        read -p "Enter your email for SSL certificate: " EMAIL
        read -p "Install SSL certificate with Let's Encrypt? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            INSTALL_SSL=true
        fi
    fi
    
    read -p "RTMP port (default 1935): " input_port
    RTMP_PORT=${input_port:-1935}
    
    echo -e "${GREEN}Configuration:${NC}"
    echo "Domain: ${DOMAIN:-'Not set (will use IP)'}"
    echo "SSL: ${INSTALL_SSL}"
    echo "RTMP Port: ${RTMP_PORT}"
    echo
}

update_system() {
    print_step "Updating system packages..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt update && apt upgrade -y
        apt install -y curl wget git build-essential software-properties-common
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        yum update -y
        yum groupinstall -y "Development Tools"
        yum install -y curl wget git epel-release
    else
        print_error "Unsupported operating system: $OS"
        exit 1
    fi
}

install_nginx() {
    print_step "Installing and configuring Nginx..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt install -y nginx
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        yum install -y nginx
    fi
    
    # Enable and start nginx
    systemctl enable nginx
    systemctl start nginx
    
    # Configure firewall
    if command -v ufw &> /dev/null; then
        ufw allow 'Nginx Full'
        ufw allow $RTMP_PORT
    elif command -v firewall-cmd &> /dev/null; then
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --permanent --add-port=$RTMP_PORT/tcp
        firewall-cmd --reload
    fi
}

install_ffmpeg() {
    print_step "Installing FFmpeg..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt install -y ffmpeg
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        # Install RPM Fusion for FFmpeg on CentOS/RHEL
        yum install -y https://download1.rpmfusion.org/free/el/rpmfusion-free-release-$(rpm -E %rhel).noarch.rpm
        yum install -y ffmpeg ffmpeg-devel
    fi
    
    # Verify installation
    if ! command -v ffmpeg &> /dev/null; then
        print_error "FFmpeg installation failed"
        exit 1
    fi
    
    print_info "FFmpeg version: $(ffmpeg -version | head -n1)"
}

install_nodejs() {
    print_step "Installing Node.js and npm..."
    
    # Install Node.js 18.x
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        apt install -y nodejs
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        yum install -y nodejs npm
    fi
    
    # Install PM2 for process management
    npm install -g pm2
    
    print_info "Node.js version: $(node --version)"
    print_info "npm version: $(npm --version)"
}

setup_directories() {
    print_step "Setting up directories..."
    
    # Create streaming directories
    mkdir -p $STREAM_DIR/{hls,dash,recordings}
    mkdir -p $LOG_DIR
    mkdir -p /opt/streaming-server
    
    # Set permissions
    chown -R www-data:www-data $STREAM_DIR
    chmod -R 755 $STREAM_DIR
    
    print_info "Created directories:"
    print_info "  - Streams: $STREAM_DIR"
    print_info "  - Logs: $LOG_DIR"
    print_info "  - Server: /opt/streaming-server"
}

create_nginx_config() {
    print_step "Creating Nginx configuration..."
    
    cat > /etc/nginx/sites-available/streaming << EOF
server {
    listen 80;
    server_name ${DOMAIN:-_};
    
    # Redirect HTTP to HTTPS if SSL is enabled
    $(if [[ "$INSTALL_SSL" == true ]]; then echo "return 301 https://\$server_name\$request_uri;"; fi)
    
    # Root directory for streams
    root /var/www/html;
    index index.html;
    
    # CORS headers for streaming
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
    add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
    add_header Access-Control-Expose-Headers 'Content-Length,Content-Range';
    
    # HLS streams
    location /streams/hls {
        alias $STREAM_DIR/hls;
        
        # HLS specific headers
        add_header Cache-Control no-cache;
        add_header Access-Control-Allow-Origin *;
        
        # MIME types for HLS
        location ~* \\.m3u8\$ {
            add_header Content-Type application/vnd.apple.mpegurl;
        }
        
        location ~* \\.ts\$ {
            add_header Content-Type video/mp2t;
        }
    }
    
    # DASH streams
    location /streams/dash {
        alias $STREAM_DIR/dash;
        
        # DASH specific headers
        add_header Cache-Control no-cache;
        add_header Access-Control-Allow-Origin *;
        
        # MIME types for DASH
        location ~* \\.mpd\$ {
            add_header Content-Type application/dash+xml;
        }
        
        location ~* \\.m4s\$ {
            add_header Content-Type video/iso.segment;
        }
    }
    
    # API endpoints
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Static files
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}

$(if [[ "$INSTALL_SSL" == true ]]; then
cat << 'SSLEOF'
server {
    listen 443 ssl http2;
    server_name DOMAIN_PLACEHOLDER;
    
    ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Same location blocks as HTTP server
    root /var/www/html;
    index index.html;
    
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
    add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
    add_header Access-Control-Expose-Headers 'Content-Length,Content-Range';
    
    location /streams/hls {
        alias /var/www/html/streams/hls;
        add_header Cache-Control no-cache;
        add_header Access-Control-Allow-Origin *;
        
        location ~* \.m3u8$ {
            add_header Content-Type application/vnd.apple.mpegurl;
        }
        
        location ~* \.ts$ {
            add_header Content-Type video/mp2t;
        }
    }
    
    location /streams/dash {
        alias /var/www/html/streams/dash;
        add_header Cache-Control no-cache;
        add_header Access-Control-Allow-Origin *;
        
        location ~* \.mpd$ {
            add_header Content-Type application/dash+xml;
        }
        
        location ~* \.m4s$ {
            add_header Content-Type video/iso.segment;
        }
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
SSLEOF
fi)
EOF

    # Replace domain placeholder if SSL is enabled
    if [[ "$INSTALL_SSL" == true ]]; then
        sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/streaming
    fi
    
    # Enable the site
    ln -sf /etc/nginx/sites-available/streaming /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test nginx configuration
    nginx -t
    systemctl reload nginx
}

create_streaming_server() {
    print_step "Creating streaming server application..."
    
    cd /opt/streaming-server
    
    # Create package.json
    cat > package.json << EOF
{
  "name": "streaming-server",
  "version": "1.0.0",
  "description": "RTMP to HLS/DASH conversion server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "ws": "^8.13.0",
    "node-rtmp-server": "^2.0.5",
    "fluent-ffmpeg": "^2.1.2",
    "chokidar": "^3.5.3"
  }
}
EOF

    # Install dependencies
    npm install
    
    # Create main server file
    cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const NodeRtmpServer = require('node-rtmp-server');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const app = express();
const PORT = 3001;
const RTMP_PORT = 1935;
const STREAM_DIR = '/var/www/html/streams';

app.use(cors());
app.use(express.json());

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ port: 8080 });

// Active streams tracking
const activeStreams = new Map();
const conversionProcesses = new Map();

// RTMP Server configuration
const rtmpServer = new NodeRtmpServer({
  rtmp: {
    port: RTMP_PORT,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  }
});

// RTMP Events
rtmpServer.on('preConnect', (id, args) => {
  console.log('[RTMP] Pre-connect:', id, args);
});

rtmpServer.on('postConnect', (id, args) => {
  console.log('[RTMP] Post-connect:', id, args);
});

rtmpServer.on('prePublish', (id, StreamPath, args) => {
  console.log('[RTMP] Pre-publish:', id, StreamPath, args);
  
  const streamKey = StreamPath.split('/').pop();
  console.log(`[RTMP] Stream started: ${streamKey}`);
  
  // Start conversion process
  startConversion(streamKey, id);
});

rtmpServer.on('postPublish', (id, StreamPath, args) => {
  console.log('[RTMP] Post-publish:', id, StreamPath, args);
});

rtmpServer.on('donePublish', (id, StreamPath, args) => {
  console.log('[RTMP] Done publish:', id, StreamPath, args);
  
  const streamKey = StreamPath.split('/').pop();
  console.log(`[RTMP] Stream ended: ${streamKey}`);
  
  // Stop conversion process
  stopConversion(streamKey);
});

function startConversion(streamKey, rtmpId) {
  const inputUrl = `rtmp://localhost:${RTMP_PORT}/live/${streamKey}`;
  const hlsDir = path.join(STREAM_DIR, 'hls', streamKey);
  const dashDir = path.join(STREAM_DIR, 'dash', streamKey);
  
  // Create directories
  fs.mkdirSync(hlsDir, { recursive: true });
  fs.mkdirSync(dashDir, { recursive: true });
  
  // HLS Conversion
  const hlsProcess = ffmpeg(inputUrl)
    .videoCodec('libx264')
    .audioCodec('aac')
    .addOption('-preset', 'veryfast')
    .addOption('-tune', 'zerolatency')
    .addOption('-f', 'hls')
    .addOption('-hls_time', '6')
    .addOption('-hls_list_size', '10')
    .addOption('-hls_flags', 'delete_segments')
    .output(path.join(hlsDir, 'playlist.m3u8'))
    .on('start', (commandLine) => {
      console.log(`[HLS] Started conversion for ${streamKey}`);
      console.log(`[HLS] Command: ${commandLine}`);
    })
    .on('error', (err) => {
      console.error(`[HLS] Error for ${streamKey}:`, err.message);
    })
    .on('end', () => {
      console.log(`[HLS] Conversion ended for ${streamKey}`);
    });
  
  // DASH Conversion
  const dashProcess = ffmpeg(inputUrl)
    .videoCodec('libx264')
    .audioCodec('aac')
    .addOption('-preset', 'veryfast')
    .addOption('-tune', 'zerolatency')
    .addOption('-f', 'dash')
    .addOption('-seg_duration', '4')
    .addOption('-use_template', '1')
    .addOption('-use_timeline', '1')
    .output(path.join(dashDir, 'manifest.mpd'))
    .on('start', (commandLine) => {
      console.log(`[DASH] Started conversion for ${streamKey}`);
      console.log(`[DASH] Command: ${commandLine}`);
    })
    .on('error', (err) => {
      console.error(`[DASH] Error for ${streamKey}:`, err.message);
    })
    .on('end', () => {
      console.log(`[DASH] Conversion ended for ${streamKey}`);
    });
  
  // Start processes
  hlsProcess.run();
  dashProcess.run();
  
  // Store processes
  conversionProcesses.set(streamKey, { hls: hlsProcess, dash: dashProcess });
  
  // Update active streams
  activeStreams.set(streamKey, {
    id: rtmpId,
    streamKey,
    status: 'live',
    startTime: new Date(),
    hlsUrl: `/streams/hls/${streamKey}/playlist.m3u8`,
    dashUrl: `/streams/dash/${streamKey}/manifest.mpd`
  });
  
  // Broadcast update
  broadcastUpdate();
}

function stopConversion(streamKey) {
  const processes = conversionProcesses.get(streamKey);
  
  if (processes) {
    processes.hls.kill('SIGTERM');
    processes.dash.kill('SIGTERM');
    conversionProcesses.delete(streamKey);
  }
  
  activeStreams.delete(streamKey);
  broadcastUpdate();
}

function broadcastUpdate() {
  const streams = Array.from(activeStreams.values());
  const message = JSON.stringify({ type: 'streams_update', streams });
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// API Routes
app.get('/api/streams', (req, res) => {
  const streams = Array.from(activeStreams.values());
  res.json(streams);
});

app.post('/api/streams/:streamKey/stop', (req, res) => {
  const { streamKey } = req.params;
  stopConversion(streamKey);
  res.json({ success: true });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    activeStreams: activeStreams.size
  });
});

// Start servers
rtmpServer.run();
app.listen(PORT, () => {
  console.log(`[API] Server running on port ${PORT}`);
  console.log(`[RTMP] Server running on port ${RTMP_PORT}`);
  console.log(`[WebSocket] Server running on port 8080`);
});

console.log('Streaming server started successfully!');
console.log(`RTMP URL: rtmp://YOUR_SERVER_IP:${RTMP_PORT}/live`);
console.log(`Stream with OBS using stream key as the path`);
EOF

    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'streaming-server',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

    # Set permissions
    chown -R root:root /opt/streaming-server
    chmod +x server.js
}

install_ssl() {
    if [[ "$INSTALL_SSL" == true ]] && [[ ! -z "$DOMAIN" ]] && [[ ! -z "$EMAIL" ]]; then
        print_step "Installing SSL certificate with Let's Encrypt..."
        
        # Install certbot
        if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
            apt install -y certbot python3-certbot-nginx
        elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
            yum install -y certbot python3-certbot-nginx
        fi
        
        # Get certificate
        certbot --nginx -d $DOMAIN --email $EMAIL --agree-tos --non-interactive
        
        # Setup auto-renewal
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        
        print_info "SSL certificate installed for $DOMAIN"
    fi
}

create_systemd_service() {
    print_step "Creating systemd service..."
    
    cat > /etc/systemd/system/streaming-server.service << EOF
[Unit]
Description=Streaming Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/streaming-server
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable streaming-server
    systemctl start streaming-server
}

create_management_scripts() {
    print_step "Creating management scripts..."
    
    # Create start script
    cat > /usr/local/bin/streaming-start << 'EOF'
#!/bin/bash
echo "Starting streaming services..."
systemctl start nginx
systemctl start streaming-server
echo "Streaming services started!"
EOF

    # Create stop script
    cat > /usr/local/bin/streaming-stop << 'EOF'
#!/bin/bash
echo "Stopping streaming services..."
systemctl stop streaming-server
systemctl stop nginx
echo "Streaming services stopped!"
EOF

    # Create status script
    cat > /usr/local/bin/streaming-status << 'EOF'
#!/bin/bash
echo "=== Streaming Server Status ==="
echo "Nginx: $(systemctl is-active nginx)"
echo "Streaming Server: $(systemctl is-active streaming-server)"
echo "Active Streams: $(curl -s http://localhost:3001/api/streams | jq length 2>/dev/null || echo "API not responding")"
echo
echo "=== Port Status ==="
netstat -tlnp | grep -E ':(80|443|1935|3001|8080)\s'
EOF

    # Create logs script
    cat > /usr/local/bin/streaming-logs << 'EOF'
#!/bin/bash
echo "=== Streaming Server Logs ==="
journalctl -u streaming-server -f
EOF

    # Make scripts executable
    chmod +x /usr/local/bin/streaming-*
}

display_completion_info() {
    print_step "Installation completed successfully!"
    
    echo -e "${GREEN}"
    echo "=================================================="
    echo "    Stream Portable Server - Installation Complete"
    echo "=================================================="
    echo -e "${NC}"
    
    echo -e "${BLUE}Server Information:${NC}"
    echo "RTMP URL: rtmp://$(curl -s ifconfig.me):$RTMP_PORT/live"
    if [[ ! -z "$DOMAIN" ]]; then
        echo "Web Interface: http${INSTALL_SSL:+s}://$DOMAIN"
        echo "HLS Streams: http${INSTALL_SSL:+s}://$DOMAIN/streams/hls/{stream_key}/playlist.m3u8"
        echo "DASH Streams: http${INSTALL_SSL:+s}://$DOMAIN/streams/dash/{stream_key}/manifest.mpd"
    else
        echo "Web Interface: http://$(curl -s ifconfig.me)"
        echo "HLS Streams: http://$(curl -s ifconfig.me)/streams/hls/{stream_key}/playlist.m3u8"
        echo "DASH Streams: http://$(curl -s ifconfig.me)/streams/dash/{stream_key}/manifest.mpd"
    fi
    
    echo -e "\n${BLUE}OBS Configuration:${NC}"
    echo "Server: rtmp://$(curl -s ifconfig.me):$RTMP_PORT/live"
    echo "Stream Key: (use any unique key, e.g., 'mystream123')"
    
    echo -e "\n${BLUE}Management Commands:${NC}"
    echo "Start services: streaming-start"
    echo "Stop services: streaming-stop"
    echo "Check status: streaming-status"
    echo "View logs: streaming-logs"
    
    echo -e "\n${BLUE}Service Status:${NC}"
    systemctl status nginx --no-pager -l
    systemctl status streaming-server --no-pager -l
    
    echo -e "\n${YELLOW}Next Steps:${NC}"
    echo "1. Configure OBS with the RTMP URL above"
    echo "2. Start streaming in OBS"
    echo "3. Your stream will be automatically converted to HLS/DASH"
    echo "4. Access streams via the URLs provided above"
    
    if [[ "$INSTALL_SSL" == false ]] && [[ ! -z "$DOMAIN" ]]; then
        echo -e "\n${YELLOW}Note:${NC} SSL was not configured. Run 'certbot --nginx -d $DOMAIN' to enable HTTPS"
    fi
}

# Main installation process
main() {
    print_header
    
    check_root
    detect_os
    get_user_input
    
    update_system
    install_nginx
    install_ffmpeg
    install_nodejs
    setup_directories
    create_nginx_config
    create_streaming_server
    install_ssl
    create_systemd_service
    create_management_scripts
    
    display_completion_info
}

# Run main function
main "$@"