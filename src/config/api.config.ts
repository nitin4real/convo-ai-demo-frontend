export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL ?? (
    import.meta.env.DEV
      ? 'http://localhost:3009'
      : 'https://convo.agoraaidemo.in:3009'
  ),

  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login'
    },
    AGORA: {
      CHANNEL: '/api/agora/channel',
      RTM_TOKEN: '/api/agora/rtm-token'
    },
    AGENT: {
      START: '/api/agent/start',
      STOP: '/api/agent/stop',
      HEARTBEAT: '/api/agent/heartbeat',
      CHANNEL: '/api/agent/channel',
      AGENTS: '/api/agent/agents',
      AGENT_TYPES: '/api/agent/agent-types',
      AGENTS_BY_TYPE: '/api/agent/agents/:type',
      AGENT_DETAILS: '/api/agent/:agentId',
      START_SIP_CALL: '/api/agent/start-sip-call',
      GET_BUFFER: '/api/webhook/buffer-logs',
      CHANNEL_FOR_SIP: '/api/agent/channel-for-sip'
    },
    FEEDBACK: '/api/feedback'
  }
} as const;
