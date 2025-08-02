import React, { useState, useRef, useEffect } from 'react';

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

interface ChatRoomProps {
  room: Room;
  messages: Message[];
  onlineUsers: User[];
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  currentUser: User;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  room,
  messages,
  onlineUsers,
  onSendMessage,
  onTyping,
  currentUser,
  messagesEndRef
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    onSendMessage(messageInput);
    setMessageInput('');
    setIsTyping(false);
    onTyping(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessageInput(value);

    // Handle typing indicator
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      onTyping(true);
    } else if (isTyping && value.length === 0) {
      setIsTyping(false);
      onTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isOwnMessage = (message: Message) => {
    return message.userId === currentUser.id;
  };

  return (
    <div className="chat-main">
      <div className="chat-header">
        <h2>{room.name}</h2>
        <div className="online-users">
          <span style={{ fontSize: '14px', color: '#666', marginRight: '8px' }}>
            {onlineUsers.length} online
          </span>
          {onlineUsers.slice(0, 5).map(user => (
            <div key={user.id} className="user-avatar" title={user.name}>
              {user.photoUrl ? (
                <img 
                  src={user.photoUrl} 
                  alt={user.name} 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                getUserInitials(user.name)
              )}
            </div>
          ))}
          {onlineUsers.length > 5 && (
            <div className="user-avatar" style={{ fontSize: '10px' }}>
              +{onlineUsers.length - 5}
            </div>
          )}
        </div>
      </div>

      <div className="messages-container">
        {messages.map(message => (
          <div
            key={message.id}
            className="message"
            style={{
              justifyContent: isOwnMessage(message) ? 'flex-end' : 'flex-start'
            }}
          >
            {!isOwnMessage(message) && (
              <div className="message-avatar">
                {message.photoUrl ? (
                  <img 
                    src={message.photoUrl} 
                    alt={message.name} 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  getUserInitials(message.name)
                )}
              </div>
            )}
            
            <div 
              className="message-content"
              style={{
                backgroundColor: isOwnMessage(message) ? '#667eea' : 'white',
                color: isOwnMessage(message) ? 'white' : '#333',
                marginLeft: isOwnMessage(message) ? 'auto' : '0',
                marginRight: isOwnMessage(message) ? '0' : 'auto',
                maxWidth: '60%'
              }}
            >
              <div className="message-header">
                <span className="message-author" style={{ color: isOwnMessage(message) ? 'white' : '#333' }}>
                  {message.name}
                </span>
                <span className="message-time" style={{ color: isOwnMessage(message) ? 'rgba(255,255,255,0.7)' : '#666' }}>
                  {formatTime(message.createdAt)}
                </span>
              </div>
              <div className="message-text" style={{ color: isOwnMessage(message) ? 'white' : '#333' }}>
                {message.content}
              </div>
            </div>
          </div>
        ))}
        
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-container">
        <form onSubmit={handleSubmit} className="message-input-form">
          <textarea
            ref={textareaRef}
            className="message-input"
            placeholder="Type a message..."
            value={messageInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            rows={1}
            maxLength={1000}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!messageInput.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom; 