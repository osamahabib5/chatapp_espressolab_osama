import React, { useState } from 'react';

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

interface SidebarProps {
  rooms: Room[];
  currentRoom: Room | null;
  onCreateRoom: (name: string) => Promise<Room>;
  onJoinRoom: (room: Room) => void;
  onDeleteRoom?: (roomId: string) => Promise<void>;
  onLogout: () => void;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({
  rooms,
  currentRoom,
  onCreateRoom,
  onJoinRoom,
  onDeleteRoom,
  onLogout,
  user
}) => {
  const [newRoomName, setNewRoomName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    setCreating(true);
    try {
      const newRoom = await onCreateRoom(newRoomName.trim());
      setNewRoomName('');
      onJoinRoom(newRoom);
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRoom = async (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent room selection when clicking delete
    if (!onDeleteRoom) return;
    
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      setDeleting(roomId);
      try {
        await onDeleteRoom(roomId);
      } catch (error) {
        console.error('Failed to delete room:', error);
        alert('Failed to delete room. Please try again.');
      } finally {
        setDeleting(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div className="user-avatar">
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
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: '#333' }}>{user.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
        </div>
        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>

      <h2>Chat Rooms</h2>
      
      <div className="room-list">
        {rooms.map(room => (
          <div
            key={room.id}
            className={`room-item ${currentRoom?.id === room.id ? 'active' : ''}`}
            onClick={() => onJoinRoom(room)}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{room.name}</div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>
                Created {formatDate(room.createdAt)}
              </div>
            </div>
            {onDeleteRoom && (
              <button
                className="delete-room-btn"
                onClick={(e) => handleDeleteRoom(room.id, e)}
                disabled={deleting === room.id}
                title="Delete room"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff4757',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  opacity: deleting === room.id ? 0.5 : 0.7,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = deleting === room.id ? '0.5' : '0.7'}
              >
                {deleting === room.id ? '⏳' : '🗑️'}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="create-room">
        <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Create New Room</h3>
        <form onSubmit={handleCreateRoom}>
          <input
            type="text"
            placeholder="Room name"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            disabled={creating}
          />
          <button type="submit" disabled={creating || !newRoomName.trim()}>
            {creating ? 'Creating...' : 'Create Room'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Sidebar; 