export interface Stream {
  id: string;
  name: string;
  rtmpUrl: string;
  streamKey: string;
  status: 'offline' | 'live' | 'starting' | 'error';
  hlsUrl?: string;
  dashUrl?: string;
  embedUrl?: string;
  viewers: number;
  bitrate: number;
  resolution: string;
  createdAt: Date;
  lastActive?: Date;
  duration: number; // in seconds
}

export interface StreamSettings {
  enableHLS: boolean;
  enableDASH: boolean;
  bitrates: number[];
  resolutions: string[];
  maxViewers: number;
  autoRecord: boolean;
}