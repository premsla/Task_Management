# Social Login Setup Guide

This guide will help you set up social login functionality for Google, GitHub, and Facebook in your Task Management application.

## 🚀 Features Added

- **Google OAuth 2.0** - Login with Google account
- **GitHub OAuth** - Login with GitHub account  
- **Facebook Login** - Login with Facebook account
- **Automatic user creation** - Creates user accounts automatically on first social login
- **Account linking** - Links social accounts to existing email addresses
- **Enhanced UI** - Beautiful social login buttons on login/signup pages

## 📋 Prerequisites

Before setting up social login, you need to create OAuth applications with each provider:

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:8800/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
7. Copy Client ID and Client Secret

### 2. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in application details:
   - Application name: Your app name
   - Homepage URL: `http://localhost:5174` (development)
   - Authorization callback URL: `http://localhost:8800/api/auth/github/callback`
4. Copy Client ID and Client Secret

### 3. Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Facebook Login" product
4. In Facebook Login settings, add valid OAuth redirect URIs:
   - `http://localhost:8800/api/auth/facebook/callback` (development)
   - `https://yourdomain.com/api/auth/facebook/callback` (production)
5. Copy App ID and App Secret

## ⚙️ Environment Configuration

1. Copy the example environment file:
```bash
cp server/.env.example server/.env
```

2. Update your `.env` file with the OAuth credentials:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/taskmanager

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Session
SESSION_SECRET=your-session-secret-key

# Client URL
CLIENT_URL=http://localhost:5174

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Server Port
PORT=8800
```

## 🔧 Installation

The required dependencies have already been installed:

**Server dependencies:**
- `passport` - Authentication middleware
- `passport-google-oauth20` - Google OAuth strategy
- `passport-github2` - GitHub OAuth strategy
- `passport-facebook` - Facebook OAuth strategy
- `express-session` - Session management

**Client dependencies:**
- Social login UI components (custom implementation)

## 🚀 Usage

### For Users

1. **Login Page**: Users can now see social login buttons below the regular login form
2. **Signup Page**: Users can create accounts using social providers
3. **One-click login**: Click any social provider button to authenticate
4. **Account linking**: If a user already exists with the same email, the social account will be linked

### For Developers

The social login system automatically:
- Creates new users on first social login
- Links social accounts to existing users with matching emails
- Stores social profile information (avatar, provider details)
- Generates JWT tokens for authenticated sessions
- Handles authentication errors gracefully

## 🔐 Security Features

- **Secure sessions** - Uses express-session with secure configuration
- **JWT tokens** - Stateless authentication after social login
- **CORS protection** - Configured for your frontend domain
- **Error handling** - Graceful error handling for failed authentications
- **Account verification** - Automatic email verification through social providers

## 🎨 UI Components

### SocialLogin Component
- Responsive design that works on all screen sizes
- Beautiful provider-specific styling (Google red, GitHub dark, Facebook blue)
- Loading states and error handling
- Accessible with proper ARIA labels

### Enhanced Login/Signup Pages
- Seamless integration with existing forms
- Clear visual separation between traditional and social login
- Consistent styling with the rest of the application

## 🔄 How It Works

1. **User clicks social login button** → Redirects to provider's OAuth page
2. **User authorizes the application** → Provider redirects back with authorization code
3. **Server exchanges code for user info** → Gets user profile from provider
4. **User account handling**:
   - If user exists: Links social account and logs in
   - If new user: Creates account with social profile info
5. **JWT token generation** → Creates session token for the user
6. **Frontend redirect** → User is redirected to dashboard with authentication

## 🐛 Troubleshooting

### Common Issues

1. **"Redirect URI mismatch"**
   - Ensure callback URLs in OAuth apps match your server configuration
   - Check for trailing slashes and protocol (http vs https)

2. **"Invalid client ID"**
   - Verify environment variables are correctly set
   - Ensure no extra spaces in the credentials

3. **"Session not found"**
   - Check SESSION_SECRET is set in environment variables
   - Verify express-session configuration

4. **CORS errors**
   - Update CLIENT_URL in environment variables
   - Check CORS configuration in server/index.js

### Debug Mode

Enable debug logging by adding to your `.env`:
```env
DEBUG=passport:*
```

## 🚀 Production Deployment

1. Update OAuth app settings with production URLs
2. Set secure session configuration:
   ```javascript
   cookie: {
     secure: true, // Enable for HTTPS
     maxAge: 24 * 60 * 60 * 1000
   }
   ```
3. Update CORS settings for production domain
4. Use environment-specific OAuth credentials

## 📱 Mobile Considerations

The social login implementation works on mobile devices, but consider:
- Testing on various mobile browsers
- Ensuring OAuth providers support mobile web flows
- Adding mobile app deep linking if needed

## 🔮 Future Enhancements

Potential improvements you could add:
- **Twitter/X OAuth** - Add Twitter login support
- **LinkedIn OAuth** - Professional network login
- **Apple Sign In** - For iOS users
- **Two-factor authentication** - Additional security layer
- **Social profile sync** - Sync profile updates from social providers

---

Your Task Management application now supports modern social login functionality! Users can quickly sign up and log in using their preferred social accounts, improving user experience and reducing friction in the authentication process.
