// Types specific to the /ping endpoint

export interface PingResponse {
  message: string;
  timestamp: string;
  uptime: number;
} 