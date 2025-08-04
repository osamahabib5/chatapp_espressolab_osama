import React, { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (currentRoom) {
      fetchMessages(currentRoom.id);
    }
  }, [currentRoom]);

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
    setRooms(prev => [...prev, newRoom]);
    return newRoom;
  };

  const handleJoinRoom = (room: Room) => {
    setCurrentRoom(room);
  };

  const handleSendMessage = async (content: string) => {
    if (!currentRoom) return;

    try {
      const response = await fetch(`http://localhost:5000/api/rooms/${currentRoom.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        const newMessage = await response.json();
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    // Implement typing indicator logic here
    console.log('User typing:', isTyping);
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
      />
      {currentRoom ? (
        <ChatRoom 
          room={currentRoom}
          messages={messages}
          onlineUsers={onlineUsers}
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