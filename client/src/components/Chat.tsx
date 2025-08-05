import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import ChatRoom from './ChatRoom';
import Sidebar from './Sidebar';

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
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    fetchRooms();
    
    // Initialize Socket.IO connection
    socketRef.current = io('http://localhost:5000');
    
    // Listen for new messages
    socketRef.current.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });
    
    // Listen for user joined
    socketRef.current.on('user_joined', ({ user: joinedUser }: { user: User }) => {
      setOnlineUsers(prev => [...prev, joinedUser]);
    });
    
    // Listen for user left
    socketRef.current.on('user_left', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => prev.filter(u => u.id !== userId));
    });
    
    // Listen for room users
    socketRef.current.on('room_users', (users: User[]) => {
      setOnlineUsers(users);
    });
    
    // Listen for typing indicators
    socketRef.current.on('user_typing', ({ user: typingUser, isTyping }: { user: User, isTyping: boolean }) => {
      if (isTyping) {
        setTypingUsers(prev => {
          if (!prev.includes(typingUser.name)) {
            return [...prev, typingUser.name];
          }
          return prev;
        });
      } else {
        setTypingUsers(prev => prev.filter(name => name !== typingUser.name));
      }
    });
    
    // Listen for new room creation
    socketRef.current.on('room_created', (newRoom: Room) => {
      setRooms(prev => [newRoom, ...prev]);
    });
    
    // Listen for room deletion
    socketRef.current.on('room_deleted', ({ roomId }: { roomId: string }) => {
      setRooms(prev => prev.filter(room => room.id !== roomId));
      // If the current room is deleted, immediately clear everything
      setCurrentRoom(prevRoom => {
        if (prevRoom && prevRoom.id === roomId) {
          // Clear all related state immediately
          setMessages([]);
          setOnlineUsers([]);
          setTypingUsers([]);
          console.log('The room you were in has been deleted');
          return null;
        }
        return prevRoom;
      });
    });
    
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (currentRoom) {
      fetchMessages(currentRoom.id);
      
      // Join the room via Socket.IO
      if (socketRef.current) {
        socketRef.current.emit('join_room', { roomId: currentRoom.id, user });
      }
    }
    
    // Leave previous room when switching
    return () => {
      if (currentRoom && socketRef.current) {
        socketRef.current.emit('leave_room', { roomId: currentRoom.id });
      }
    };
  }, [currentRoom, user]);

  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rooms', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/rooms/${roomId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleCreateRoom = async (name: string): Promise<Room> => {
    const response = await fetch('http://localhost:5000/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ name })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create room');
    }
    
    const newRoom = await response.json();
    // Don't manually update the rooms list here - it will be updated via socket event
    return newRoom;
  };

  const handleDeleteRoom = async (roomId: string): Promise<void> => {
    // If we're deleting the current room, clear it immediately
    if (currentRoom && currentRoom.id === roomId) {
      setCurrentRoom(null);
      setMessages([]);
      setOnlineUsers([]);
      setTypingUsers([]);
    }
    
    const response = await fetch(`http://localhost:5000/api/rooms/${roomId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete room');
    }
    
    // Don't manually update the rooms list here - it will be updated via socket event
  };

  const handleJoinRoom = (room: Room) => {
    // Clear previous room state
    setMessages([]);
    setOnlineUsers([]);
    setTypingUsers([]);
    setCurrentRoom(room);
  };

  const handleSendMessage = (content: string) => {
    if (!currentRoom || !socketRef.current) return;

    // Send message via Socket.IO for real-time delivery
    socketRef.current.emit('send_message', {
      roomId: currentRoom.id,
      content,
      user
    });
  };

  const handleTyping = (isTyping: boolean) => {
    if (!currentRoom || !socketRef.current) return;
    
    socketRef.current.emit('typing', {
      roomId: currentRoom.id,
      user,
      isTyping
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="chat-container">
      <Sidebar 
        user={user} 
        onLogout={onLogout}
        rooms={rooms}
        currentRoom={currentRoom}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onDeleteRoom={handleDeleteRoom}
      />
      {currentRoom ? (
        <ChatRoom 
          room={currentRoom}
          messages={messages}
          onlineUsers={onlineUsers}
          typingUsers={typingUsers}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          currentUser={user}
          messagesEndRef={messagesEndRef}
        />
      ) : (
        <div className="no-room-selected">
          <h2>Welcome to ChatApp!</h2>
          <p>Select a room from the sidebar to start chatting.</p>
        </div>
      )}
    </div>
  );
};

export default Chat; 