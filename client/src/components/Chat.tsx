import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import Sidebar from './Sidebar';
import ChatRoom from './ChatRoom';

interface User {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
}

interface Room {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
}

interface Message {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  name: string;
  photoUrl?: string;
  createdAt: string;
}

interface ChatProps {
  user: User;
  onLogout: () => void;
}

const Chat: React.FC<ChatProps> = ({ user, onLogout }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Load rooms
    loadRooms();

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Socket event listeners
    socket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('user_joined', ({ user: joinedUser }) => {
      setOnlineUsers(prev => [...prev, joinedUser]);
    });

    socket.on('user_left', ({ userId }) => {
      setOnlineUsers(prev => prev.filter(u => u.id !== userId));
    });

    socket.on('room_users', (users: User[]) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('new_message');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('room_users');
    };
  }, [socket]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(response.data);
      setLoading(false);
    } catch (error: any) {
      setError('Failed to load rooms');
      setLoading(false);
    }
  };

  const createRoom = async (name: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/rooms', { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(prev => [response.data, ...prev]);
      return response.data;
    } catch (error: any) {
      setError('Failed to create room');
      throw error;
    }
  };

  const joinRoom = async (room: Room) => {
    if (!socket) return;

    // Leave current room if any
    if (currentRoom) {
      socket.emit('leave_room', { roomId: currentRoom.id });
    }

    // Join new room
    socket.emit('join_room', { roomId: room.id, user });
    setCurrentRoom(room);

    // Load room messages
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/rooms/${room.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error: any) {
      setError('Failed to load messages');
    }
  };

  const sendMessage = (content: string) => {
    if (!socket || !currentRoom || !content.trim()) return;

    socket.emit('send_message', {
      roomId: currentRoom.id,
      content: content.trim(),
      user
    });
  };

  const handleTyping = (isTyping: boolean) => {
    if (!socket || !currentRoom) return;
    socket.emit('typing', { roomId: currentRoom.id, user, isTyping });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="auth-card">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="chat-container">
        <Sidebar
          rooms={rooms}
          currentRoom={currentRoom}
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
          onLogout={onLogout}
          user={user}
        />
        
        {currentRoom ? (
          <ChatRoom
            room={currentRoom}
            messages={messages}
            onlineUsers={onlineUsers}
            onSendMessage={sendMessage}
            onTyping={handleTyping}
            currentUser={user}
            messagesEndRef={messagesEndRef}
          />
        ) : (
          <div className="chat-main">
            <div className="messages-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <h2 style={{ color: '#666' }}>Select a room to start chatting</h2>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="error-message" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000 }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default Chat; 