import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock axios
jest.mock('axios');
const axios = require('axios');

describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    jest.clearAllMocks();
  });

  test('renders login form when user is not authenticated', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<App />);
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(<App />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders chat interface when user is authenticated', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User'
    };
    
    localStorageMock.getItem
      .mockReturnValueOnce('mock-token')
      .mockReturnValueOnce(JSON.stringify(mockUser));
    
    render(<App />);
    
    waitFor(() => {
      expect(screen.getByText('Chat Rooms')).toBeInTheDocument();
    });
  });

  test('handles login successfully', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const mockResponse = {
      data: {
        token: 'mock-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User'
        }
      }
    };
    
    axios.post.mockResolvedValue(mockResponse);
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByText('Sign In'));
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'mock-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.data.user));
    });
  });

  test('handles logout', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User'
    };
    
    localStorageMock.getItem
      .mockReturnValueOnce('mock-token')
      .mockReturnValueOnce(JSON.stringify(mockUser));
    
    render(<App />);
    
    waitFor(() => {
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });
  });
}); 