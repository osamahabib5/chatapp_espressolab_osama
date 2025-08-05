require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const session = require('express-session');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your-google-client-id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret';
const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || 'your-microsoft-client-id';
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET || 'your-microsoft-client-secret';

// Debug: Log OAuth configuration
console.log('OAuth Configuration:');
console.log('Google Client ID:', GOOGLE_CLIENT_ID);
console.log('Google Client Secret:', GOOGLE_CLIENT_SECRET ? '***SET***' : '***NOT SET***');

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));
app.use(session({
  secret: JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));
app.use(passport.initialize());
app.use(passport.session());

// Database setup
const db = new sqlite3.Database('./chat.db');

// Initialize database tables
db.serialize(() => {
  // Create users table with OAuth support
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT,
    photoUrl TEXT,
    password TEXT,
    googleId TEXT,
    microsoftId TEXT,
    authProvider TEXT DEFAULT 'local',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  // Add OAuth columns to existing users table if they don't exist
  db.run(`ALTER TABLE users ADD COLUMN googleId TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('Error adding googleId column:', err.message);
    }
  });
  db.run(`ALTER TABLE users ADD COLUMN microsoftId TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('Error adding microsoftId column:', err.message);
    }
  });
  db.run(`ALTER TABLE users ADD COLUMN authProvider TEXT DEFAULT 'local'`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.log('Error adding authProvider column:', err.message);
    }
  });

  db.run(`CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT,
    createdBy TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    roomId TEXT,
    userId TEXT,
    content TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (roomId) REFERENCES rooms (id),
    FOREIGN KEY (userId) REFERENCES users (id)
  )`);
});

// In-memory storage for active users and rooms
const activeUsers = new Map();
const chatRooms = new Map();
const roomMessages = new Map();

// Passport configuration
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
    done(err, user);
  });
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    db.get('SELECT * FROM users WHERE googleId = ? OR email = ?', 
      [profile.id, profile.emails[0].value], (err, user) => {
        if (err) return done(err);
        
        if (user) {
          // Update existing user with Google ID if not already set
          if (!user.googleId) {
            db.run('UPDATE users SET googleId = ?, authProvider = ? WHERE id = ?', 
              [profile.id, 'google', user.id]);
          }
          return done(null, user);
        }
        
        // Create new user
        const userId = uuidv4();
        const newUser = {
          id: userId,
          email: profile.emails[0].value,
          name: profile.displayName,
          photoUrl: profile.photos[0]?.value,
          googleId: profile.id,
          authProvider: 'google'
        };
        
        db.run(
          'INSERT INTO users (id, email, name, photoUrl, googleId, authProvider) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, newUser.email, newUser.name, newUser.photoUrl, newUser.googleId, newUser.authProvider],
          function(err) {
            if (err) return done(err);
            newUser.id = userId;
            return done(null, newUser);
          }
        );
      });
  } catch (error) {
    return done(error);
  }
}));

// Microsoft OAuth Strategy
passport.use(new MicrosoftStrategy({
  clientID: MICROSOFT_CLIENT_ID,
  clientSecret: MICROSOFT_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/api/auth/microsoft/callback",
  scope: ['user.read']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    db.get('SELECT * FROM users WHERE microsoftId = ? OR email = ?', 
      [profile.id, profile.emails[0].value], (err, user) => {
        if (err) return done(err);
        
        if (user) {
          // Update existing user with Microsoft ID if not already set
          if (!user.microsoftId) {
            db.run('UPDATE users SET microsoftId = ?, authProvider = ? WHERE id = ?', 
              [profile.id, 'microsoft', user.id]);
          }
          return done(null, user);
        }
        
        // Create new user
        const userId = uuidv4();
        const newUser = {
          id: userId,
          email: profile.emails[0].value,
          name: profile.displayName,
          photoUrl: profile.photos[0]?.value,
          microsoftId: profile.id,
          authProvider: 'microsoft'
        };
        
        db.run(
          'INSERT INTO users (id, email, name, photoUrl, microsoftId, authProvider) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, newUser.email, newUser.name, newUser.photoUrl, newUser.microsoftId, newUser.authProvider],
          function(err) {
            if (err) return done(err);
            newUser.id = userId;
            return done(null, newUser);
          }
        );
      });
  } catch (error) {
    return done(error);
  }
}));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// API Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, name, photoUrl, password } = req.body;
    
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    db.run(
      'INSERT INTO users (id, email, name, photoUrl, password) VALUES (?, ?, ?, ?, ?)',
      [userId, email, name, photoUrl, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        const token = jwt.sign({ userId, email, name }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: userId, email, name, photoUrl } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, photoUrl: user.photoUrl } });
  });
});

app.get('/api/rooms', authenticateToken, (req, res) => {
  db.all('SELECT * FROM rooms ORDER BY createdAt DESC', (err, rooms) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rooms);
  });
});

app.post('/api/rooms', authenticateToken, (req, res) => {
  const { name } = req.body;
  const roomId = uuidv4();

  if (!name) {
    return res.status(400).json({ error: 'Room name is required' });
  }

  db.run(
    'INSERT INTO rooms (id, name, createdBy) VALUES (?, ?, ?)',
    [roomId, name, req.user.userId],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      
      const newRoom = { id: roomId, name, createdBy: req.user.userId, createdAt: new Date().toISOString() };
      chatRooms.set(roomId, newRoom);
      roomMessages.set(roomId, []);
      
      res.json(newRoom);
    }
  );
});

app.get('/api/rooms/:roomId/messages', authenticateToken, (req, res) => {
  const { roomId } = req.params;
  
  db.all(`
    SELECT m.*, u.name, u.photoUrl 
    FROM messages m 
    JOIN users u ON m.userId = u.id 
    WHERE m.roomId = ? 
    ORDER BY m.createdAt ASC
  `, [roomId], (err, messages) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(messages);
  });
});

// Test endpoint to check OAuth configuration
app.get('/api/auth/test', (req, res) => {
  res.json({
    googleClientId: GOOGLE_CLIENT_ID,
    googleClientSecretSet: !!GOOGLE_CLIENT_SECRET,
    microsoftClientId: MICROSOFT_CLIENT_ID,
    microsoftClientSecretSet: !!MICROSOFT_CLIENT_SECRET
  });
});

// OAuth Routes
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/api/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login' }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user.id, email: req.user.email, name: req.user.name }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    res.redirect(`http://localhost:3000/oauth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      photoUrl: req.user.photoUrl
    }))}`);
  }
);

app.get('/api/auth/microsoft', passport.authenticate('microsoft', { scope: ['user.read'] }));

app.get('/api/auth/microsoft/callback', 
  passport.authenticate('microsoft', { failureRedirect: 'http://localhost:3000/login' }),
  (req, res) => {
    const token = jwt.sign(
      { userId: req.user.id, email: req.user.email, name: req.user.name }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    res.redirect(`http://localhost:3000/oauth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      photoUrl: req.user.photoUrl
    }))}`);
  }
);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', ({ roomId, user }) => {
    socket.join(roomId);
    activeUsers.set(socket.id, { ...user, roomId });
    
    // Notify others in the room
    socket.to(roomId).emit('user_joined', { user, roomId });
    
    // Send current online users to the joining user
    const roomUsers = Array.from(activeUsers.values()).filter(u => u.roomId === roomId);
    socket.emit('room_users', roomUsers);
  });

  socket.on('leave_room', ({ roomId }) => {
    socket.leave(roomId);
    activeUsers.delete(socket.id);
    socket.to(roomId).emit('user_left', { userId: socket.id, roomId });
  });

  socket.on('send_message', ({ roomId, content, user }) => {
    const messageId = uuidv4();
    const message = {
      id: messageId,
      roomId,
      userId: user.id,
      content,
      name: user.name,
      photoUrl: user.photoUrl,
      createdAt: new Date().toISOString()
    };

    // Save to database
    db.run(
      'INSERT INTO messages (id, roomId, userId, content) VALUES (?, ?, ?, ?)',
      [messageId, roomId, user.id, content]
    );

    // Broadcast to room
    io.to(roomId).emit('new_message', message);
  });

  socket.on('typing', ({ roomId, user, isTyping }) => {
    socket.to(roomId).emit('user_typing', { user, isTyping });
  });

  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      socket.to(user.roomId).emit('user_left', { userId: socket.id, roomId: user.roomId });
      activeUsers.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; 