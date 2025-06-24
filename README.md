# Agora Convo AI Demo - Frontend

A modern React-based frontend application for showcasing AI agents using Agora's Conversational AI platform. This application provides a comprehensive dashboard for managing and interacting with AI agents through real-time voice conversations.

## 🚀 Features

### Core Functionality
- **Agent Dashboard**: Browse and manage available AI agents by type
- **Real-time Voice Conversations**: Start conversations with AI agents using Agora's RTC (Real-Time Communication)
- **Multi-language Support**: Support for multiple languages per agent
- **Live Transcription**: Real-time speech-to-text with conversation history
- **Agent Status Management**: Start, stop, and monitor agent conversations
- **Heartbeat Monitoring**: Keep track of conversation duration and agent status
- **Responsive Design**: Modern UI built with Tailwind CSS and Radix UI components

### Technical Features
- **Real-time Audio Streaming**: Powered by Agora RTC SDK
- **Message Handling**: RTM (Real-Time Messaging) for metadata and transcriptions
- **Authentication**: Secure login system
- **Error Handling**: Comprehensive error management with user-friendly notifications
- **Theme Support**: Dark/light mode toggle
- **TypeScript**: Full type safety throughout the application

## 🏗️ Architecture

### Project Structure
```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (Radix UI)
│   ├── Agent.tsx       # Main agent conversation interface
│   ├── Dashboard.tsx   # Agent dashboard and navigation
│   ├── Login.tsx       # Authentication component
│   └── ...
├── services/           # API and external service integrations
│   ├── agora.rtc.service.ts    # Agora RTC (audio) service
│   ├── agora.rtm.services.ts   # Agora RTM (messaging) service
│   ├── agora.message.service.ts # Message handling service
│   └── auth.service.ts         # Authentication service
├── types/              # TypeScript type definitions
├── config/             # Configuration files
├── utils/              # Utility functions
├── contexts/           # React contexts
└── assets/             # Static assets
```

### Technology Stack
- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI
- **Real-time Communication**: Agora RTC SDK & RTM SDK
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **State Management**: React Hooks
- **Notifications**: Sonner
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Agora account and credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd convo-ai-demo-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_AGORA_APP_ID=your_agora_app_id
   VITE_API_BASE_URL=https://convo.agoraaidemo.in:3009
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📱 Application Flow

### 1. Authentication
- Users start at the login page (`/login`)
- After successful authentication, users are redirected to the dashboard

### 2. Dashboard (`/dashboard`)
- **Agent Types**: Browse available agent categories
- **Agent Selection**: Choose specific agents within each type
- **Navigation**: Seamless navigation between agent types and individual agents

### 3. Agent Conversation (`/agent/:agentId`)
- **Agent Details**: View agent information, features, and supported languages
- **Language Selection**: Choose conversation language
- **Voice Controls**: Start/stop conversations, mute/unmute audio
- **Real-time Features**:
  - Live audio streaming
  - Real-time transcription
  - Conversation metadata
  - Heartbeat monitoring
  - Session timeout handling

## 🔧 Configuration

### API Configuration
The application uses a centralized API configuration in `src/config/api.config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://convo.agoraaidemo.in:3009',
  ENDPOINTS: {
    AUTH: { LOGIN: '/api/auth/login' },
    AGORA: { CHANNEL: '/api/agora/channel' },
    AGENT: {
      START: '/api/agent/start',
      STOP: '/api/agent/stop',
      HEARTBEAT: '/api/agent/heartbeat',
      // ... more endpoints
    }
  }
}
```

### Agora Integration
The application integrates with Agora's services through dedicated service classes:

- **AgoraRTCService**: Handles real-time audio communication
- **AgoraRTMService**: Manages real-time messaging for metadata
- **MessageEngine**: Processes and handles conversation messages

## 🎯 Key Components

### Dashboard Component
- Fetches and displays agent types
- Handles agent type selection
- Manages loading states and error handling
- Provides navigation to individual agents

### Agent Component
- Core conversation interface
- Manages audio session lifecycle
- Handles real-time transcription
- Implements heartbeat monitoring
- Provides conversation controls

### Services Layer
- **Authentication**: Handles user login and session management
- **Agent Management**: Fetches agent data and manages agent lifecycle
- **Real-time Communication**: Manages Agora RTC and RTM connections
- **Message Processing**: Handles conversation messages and metadata

## 🔌 API Integration

### Authentication Endpoints
- `POST /api/auth/login` - User authentication

### Agent Endpoints
- `GET /api/agent/agent-types` - Fetch available agent types
- `GET /api/agent/agents/:type` - Fetch agents by type
- `GET /api/agent/:agentId` - Get agent details
- `POST /api/agent/start/:agentId` - Start agent conversation
- `POST /api/agent/stop/:agentId` - Stop agent conversation
- `POST /api/agent/heartbeat/:agentId` - Send heartbeat to keep session alive

### Agora Endpoints
- `GET /api/agora/channel/:agentId` - Get Agora channel information

## 🎨 UI/UX Features

### Design System
- **Modern Interface**: Clean, intuitive design with Tailwind CSS
- **Responsive Layout**: Works seamlessly across desktop and mobile devices
- **Accessibility**: Built with Radix UI for excellent accessibility
- **Theme Support**: Dark/light mode toggle
- **Loading States**: Smooth loading animations and skeleton screens
- **Error Handling**: User-friendly error messages and recovery options

### Interactive Elements
- **Voice Controls**: Intuitive audio controls with visual feedback
- **Real-time Indicators**: Live status indicators for connection and conversation state
- **Transcription Display**: Real-time conversation history with speaker identification
- **Progress Tracking**: Visual indicators for conversation duration and remaining time

## 🔒 Security Features

- **Token-based Authentication**: Secure API communication
- **Agora Token Management**: Secure real-time communication tokens
- **Session Management**: Proper session handling and cleanup
- **Error Boundaries**: Graceful error handling without exposing sensitive information

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Vercel Deployment
The project includes `vercel.json` configuration for easy deployment on Vercel:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] User authentication flow
- [ ] Agent type browsing
- [ ] Agent selection and navigation
- [ ] Language selection
- [ ] Agent session start/stop
- [ ] Real-time transcription
- [ ] Mute/unmute functionality
- [ ] Heartbeat monitoring
- [ ] Session timeout handling
- [ ] Error scenarios
- [ ] Responsive design on different screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the [Agora Documentation](https://docs.agora.io/)
- Open an issue in this repository

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- Real-time voice conversations
- Agent dashboard
- Multi-language support
- Live transcription
- Responsive design

