# Setup Guide for ChatApp

## Prerequisites Installation

### 1. Install Node.js

**Windows:**
1. Download Node.js from [https://nodejs.org/](https://nodejs.org/)
2. Choose the LTS version (recommended)
3. Run the installer and follow the setup wizard
4. Verify installation by opening Command Prompt and running:
   ```bash
   node --version
   npm --version
   ```

**macOS:**
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org/
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Verify Installation
After installing Node.js, verify it's working:
```bash
node --version  # Should show v16.x or higher
npm --version   # Should show 8.x or higher
```

## Application Setup

### 1. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

### 2. Start the Application

**Option 1: Start both servers together**
```bash
npm run dev
```

**Option 2: Start servers separately**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm start
```

### 3. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Testing

### Run All Tests
```bash
npm test
```

### Run Backend Tests Only
```bash
cd server
npm test
```

### Run Frontend Tests Only
```bash
cd client
npm test
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Kill the process using the port:
     ```bash
     # Windows
     netstat -ano | findstr :3000
     taskkill /PID <PID> /F
     
     # macOS/Linux
     lsof -ti:3000 | xargs kill -9
     ```

2. **Node modules not found**
   - Delete node_modules and reinstall:
     ```bash
     rm -rf node_modules
     npm install
     ```

3. **Database errors**
   - The SQLite database will be created automatically on first run
   - If you get permission errors, check file permissions

4. **Socket.IO connection issues**
   - Ensure both frontend and backend are running
   - Check that ports 3000 and 5000 are available
   - Verify CORS settings in server/index.js

### Environment Variables
Create a `.env` file in the server directory if needed:
```
PORT=5000
JWT_SECRET=your-secret-key-here
```

## Development

### Project Structure
```
chatapp_espressolab_osama/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.tsx         # Main app component
│   │   └── index.tsx       # Entry point
│   └── package.json
├── server/                 # Node.js backend
│   ├── index.js           # Main server file
│   ├── __tests__/         # Server tests
│   └── package.json
├── package.json           # Root package.json
└── README.md              # Main documentation
```

### Key Files
- `server/index.js` - Main server with Express and Socket.IO
- `client/src/App.tsx` - Main React application
- `client/src/components/Chat.tsx` - Chat interface
- `client/src/components/Login.tsx` - Authentication

### Making Changes
1. Frontend changes will auto-reload at http://localhost:3000
2. Backend changes require server restart (Ctrl+C then `npm run dev`)
3. Database changes require server restart

## Production Deployment

### Build for Production
```bash
# Build React app
cd client
npm run build

# Start production server
cd ../server
npm start
```

### Environment Setup
- Set `NODE_ENV=production`
- Use a production database (PostgreSQL/MySQL)
- Set up proper JWT_SECRET
- Configure CORS for your domain
- Set up SSL/HTTPS

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure ports are not in use
4. Check Node.js version compatibility 