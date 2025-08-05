# OAuth Authentication Setup Guide

This guide will help you set up Google and Microsoft OAuth authentication for the ChatApp.

## Prerequisites

- Node.js and npm installed
- Google Cloud Console account
- Microsoft Azure account (for Microsoft OAuth)

## Google OAuth Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)
5. Copy the Client ID and Client Secret

### 3. Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Microsoft OAuth Setup

### 1. Register an Application in Azure

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Fill in the details:
   - Name: "ChatApp"
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: Web > `http://localhost:5000/api/auth/microsoft/callback`

### 2. Get Client Credentials

1. Go to "Certificates & secrets"
2. Create a new client secret
3. Copy the Application (client) ID and the secret value

### 3. Configure Environment Variables

Add to your `.env` file:

```env
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

## Frontend Configuration

### Update Google Client ID

In `client/src/App.tsx`, replace `your-google-client-id` with your actual Google Client ID:

```tsx
<GoogleOAuthProvider clientId="your-actual-google-client-id">
```

## Testing the Setup

1. Start the server: `npm run dev`
2. Start the client: `cd client && npm start`
3. Try signing in with Google or Microsoft

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**: Make sure the redirect URI in your OAuth provider matches exactly what's in your code
2. **"Client ID not found" error**: Verify your Client ID is correct and the application is properly configured
3. **CORS errors**: Ensure your server CORS configuration includes your frontend URL

### Development vs Production

For production deployment:

1. Update redirect URIs in your OAuth providers to use your production domain
2. Set `secure: true` in the session configuration (requires HTTPS)
3. Use environment variables for all sensitive configuration

## Security Notes

- Never commit your `.env` file to version control
- Use strong, unique secrets for JWT_SECRET
- Regularly rotate your OAuth client secrets
- Use HTTPS in production
- Consider implementing CSRF protection for additional security 