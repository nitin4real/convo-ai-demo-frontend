export const API_CONFIG = {
  BASE_URL: 'https://convo.agoraaidemo.in:3009',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login'
    },
    AGORA: {
      CHANNEL: '/api/agora/channel'
    },
    AGENT: {
      START: '/api/agent/start'
    }
  }
} as const; 