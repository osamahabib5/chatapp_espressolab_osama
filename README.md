# ChatApp - Real-Time Chat Application

A modern real-time chat application built with ReactJS, Node.js, and Socket.IO that allows users to join different chat rooms and interact in real-time.

## 🚀 Features

### ✅ Core Features
- **Real-Time Communication**: Bidirectional messaging using Socket.IO
- **Authentication**: Email/password authentication with JWT tokens
- **OAuth Integration**: Sign in with Google or Microsoft accounts
- **Multiple Chat Rooms**: Create and join different chat rooms dynamically
- **Online Users**: See who's currently online in each room
- **Message History**: Persistent message storage in SQLite database
- **User Profiles**: Support for user photos and display names
- **Typing Indicators**: Real-time typing status notifications

### ⭐ Bonus Features
- **Database Integration**: SQLite database for persistent storage
- **Jest Testing**: Comprehensive test coverage for both frontend and backend
- **Responsive Design**: Mobile-friendly interface
- **Modern UI**: Beautiful gradient design with smooth animations
- **Auto-scroll**: Messages automatically scroll to bottom
- **Message Timestamps**: Real-time message timestamps

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Socket.IO Client** for real-time communication
- **Axios** for HTTP requests
- **CSS3** with modern styling and animations
- **React Router** for navigation
- **Google OAuth React** for Google sign-in integration

### Backend
- **Node.js** with Express
- **Socket.IO** for WebSocket connections
- **SQLite3** for database storage
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Passport.js** for OAuth authentication
- **Google OAuth 2.0** and **Microsoft OAuth** integration

### Testing
- **Jest** for unit testing
- **React Testing Library** for component testing
- **Supertest** for API testing

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chatapp_espressolab_osama
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables**
   
   **Server Environment Variables:**
   ```bash
   cd server
   cp env.example .env
   ```
   
   **Client Environment Variables:**
   ```bash
   cd client
   cp env.example .env
   ```
   
   Edit both `.env` files with your actual OAuth credentials. Follow the instructions in `OAUTH_SETUP.md` to set up Google and Microsoft OAuth authentication.

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

### Manual Setup

If you prefer to set up frontend and backend separately:

#### Backend Setup
```bash
cd server
npm install
npm run dev
```

#### Frontend Setup
```bash
cd client
npm install
npm start
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Backend Tests Only
```bash
npm run test:server
```

### Frontend Tests Only
```bash
npm run test:client
```

## 🏗 Architecture

### Backend Architecture

```
server/
├── index.js              # Main server file with Express & Socket.IO
├── package.json          # Backend dependencies
└── __tests__/           # Server tests
    └── server.test.js    # API endpoint tests
```

**Key Components:**
- **Express Server**: RESTful API endpoints for authentication and room management
- **Socket.IO**: Real-time bidirectional communication
- **SQLite Database**: Persistent storage for users, rooms, and messages
- **JWT Authentication**: Secure token-based authentication
- **bcrypt Password Hashing**: Secure password storage

### Frontend Architecture

```
client/
├── src/
│   ├── components/       # React components
│   │   ├── Login.tsx     # Authentication component
│   │   ├── Chat.tsx      # Main chat interface
│   │   ├── Sidebar.tsx   # Room management sidebar
│   │   └── ChatRoom.tsx  # Individual chat room
│   ├── App.tsx          # Main application component
│   ├── index.tsx        # React entry point
│   └── index.css        # Global styles
├── public/              # Static assets
└── package.json         # Frontend dependencies
```

**Key Components:**
- **App.tsx**: Main application with authentication state management
- **Login.tsx**: Registration and login forms
- **Chat.tsx**: Main chat interface with Socket.IO integration
- **Sidebar.tsx**: Room management and user display
- **ChatRoom.tsx**: Individual chat room with message display

### Data Flow

1. **Authentication Flow**:
   - User registers/logs in → JWT token generated → Token stored in localStorage
   - All subsequent requests include JWT token in Authorization header

2. **Real-Time Communication**:
   - Socket.IO connection established on app load
   - Users join/leave rooms via socket events
   - Messages broadcast to all users in the same room
   - Typing indicators sent to room participants

3. **Room Management**:
   - Rooms created via REST API
   - Room list fetched on app load
   - Users can join multiple rooms (one at a time)
   - Message history loaded when joining a room

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/microsoft` - Initiate Microsoft OAuth
- `GET /api/auth/microsoft/callback` - Microsoft OAuth callback

### Rooms
- `GET /api/rooms` - Get all rooms (requires auth)
- `POST /api/rooms` - Create new room (requires auth)
- `GET /api/rooms/:roomId/messages` - Get room messages (requires auth)

### Socket.IO Events
- `join_room` - Join a chat room
- `leave_room` - Leave current room
- `send_message` - Send a message to room
- `typing` - Send typing indicator
- `new_message` - Receive new message
- `user_joined` - User joined room
- `user_left` - User left room
- `room_users` - Get online users in room

## 🎨 UI/UX Features

- **Modern Design**: Gradient backgrounds and smooth animations
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **User Avatars**: Support for profile photos with fallback initials
- **Message Bubbles**: Different styling for own vs others' messages
- **Real-time Updates**: Instant message delivery and user status
- **Auto-scroll**: Messages automatically scroll to bottom
- **Loading States**: Smooth loading indicators throughout the app

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Proper CORS setup for security
- **SQL Injection Prevention**: Parameterized queries

## 🚀 Deployment

### Production Build
```bash
# Build the React app
cd client
npm run build

# Start production server
cd ../server
npm start
```

### Environment Variables

#### Server Environment Variables

Copy the example environment file and configure your server credentials:

```bash
cd server
cp env.example .env
```

Edit the server `.env` file with your actual values:

```env
# Server Configuration
PORT=5000
JWT_SECRET=your-secret-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microsoft OAuth Configuration
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

#### Client Environment Variables

Copy the example environment file and configure your client credentials:

```bash
cd client
cp env.example .env
```

Edit the client `.env` file with your actual values:

```env
# React App Environment Variables
# Note: All environment variables must start with REACT_APP_

# Google OAuth Client ID for React
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

**Important**: Never commit your `.env` files to version control. The `.gitignore` file is configured to exclude them.

## 📈 Scalability Considerations

### Current Implementation
- **In-memory Storage**: Active users and room state stored in memory
- **SQLite Database**: Lightweight database suitable for small to medium scale
- **Single Server**: All connections handled by one Node.js instance

### Future Improvements
1. **Redis Integration**: For session management and real-time state
2. **PostgreSQL/MySQL**: For production database needs
3. **Load Balancing**: Multiple server instances with load balancer
4. **Message Queuing**: Redis/RabbitMQ for message processing
5. **Microservices**: Separate services for auth, messaging, and room management
6. **Docker Containerization**: For easy deployment and scaling
7. **CDN Integration**: For static assets and media files
8. **WebRTC**: For voice/video chat capabilities

## 🐛 Known Issues & Limitations

- **Single Room Limitation**: Users can only be in one room at a time
- **No Message Editing**: Messages cannot be edited or deleted
- **No File Sharing**: Only text messages supported
- **No Push Notifications**: No offline notification system
- **Memory Usage**: Active users stored in memory (cleared on server restart)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for the Espresso Lab Coding Challenge**
