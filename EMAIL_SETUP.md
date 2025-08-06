# Email Setup Guide for Password Reset

This guide will help you configure email sending for the password reset functionality in the ChatApp.

## 🚀 Quick Setup (Gmail - Recommended)

### Step 1: Set up Gmail App Password

1. **Enable 2-Factor Authentication** on your Gmail account (required for App Passwords)
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification if not already enabled

2. **Generate App Password**
   - Visit [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" as the app
   - Choose your device
   - Copy the 16-character password generated

### Step 2: Configure Environment Variables

1. **Copy the environment file**:
   ```bash
   cd server
   cp env.example .env
   ```

2. **Edit server/.env file**:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

3. **Restart your server**:
   ```bash
   npm run dev
   ```

✅ **That's it!** Your password reset emails will now be sent via Gmail.

## 📧 Alternative Email Services

### Outlook/Hotmail
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### Yahoo Mail
```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password  # Generate at Yahoo Account Security
```

### SendGrid
1. Sign up for [SendGrid](https://sendgrid.com/)
2. Create an API key
3. Configure:
   ```env
   EMAIL_SERVICE=sendgrid
   EMAIL_USER=apikey
   EMAIL_PASS=your-sendgrid-api-key
   ```

### Custom SMTP
```env
EMAIL_SERVICE=smtp
EMAIL_USER=your-email@yourprovider.com
EMAIL_PASS=your-password
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_SECURE=false
```

## 🔧 Testing Email Configuration

1. **Start the server** with your email configuration
2. **Check server logs** - you should see:
   ```
   📧 Email service configured: gmail
   ```

3. **Test password reset**:
   - Go to http://localhost:3000/forgot-password
   - Enter a valid email address
   - Check server logs for email sending status

4. **Development Mode**: If no email credentials are configured, emails will be logged to the console with setup instructions.

## 🐛 Troubleshooting

### Gmail Issues

**Error: "Invalid login"**
- ✅ Make sure you're using an App Password, not your regular password
- ✅ Ensure 2-Factor Authentication is enabled
- ✅ Double-check the App Password (no spaces, 16 characters)

**Error: "Less secure app access"**
- ✅ Use App Passwords instead of enabling less secure apps
- ✅ This method is deprecated and not recommended

### General Issues

**Error: "EAUTH - Authentication failed"**
- ✅ Check your email and password credentials
- ✅ Verify the email service configuration
- ✅ For Gmail, ensure App Passwords are used

**Error: "ECONNECTION - Connection failed"**
- ✅ Check your internet connection
- ✅ Verify SMTP host and port settings
- ✅ Check if your firewall allows SMTP traffic

**Error: "ETIMEOUT - Connection timeout"**
- ✅ Try a different SMTP port (587, 465, or 25)
- ✅ Check if your ISP blocks SMTP traffic
- ✅ Try using SMTP_SECURE=true for port 465

## 📋 Security Best Practices

1. **Never commit credentials** to version control
2. **Use App Passwords** instead of regular passwords when possible
3. **Rotate credentials** regularly
4. **Use environment variables** for all sensitive data
5. **Consider using dedicated email services** like SendGrid for production

## 🌟 Features

### Current Implementation
- ✅ Multiple email service support (Gmail, Outlook, Yahoo, SendGrid, Custom SMTP)
- ✅ Beautiful HTML email templates with ChatApp branding
- ✅ Secure token-based password reset (1-hour expiration)
- ✅ Development mode with console logging
- ✅ Comprehensive error handling and logging
- ✅ Email enumeration protection

### Email Template Features
- 📧 Professional HTML design matching ChatApp branding
- 🔒 Clear password reset instructions
- ⏰ Expiration time notification (1 hour)
- 🔗 Clickable reset button and fallback link
- 📱 Mobile-responsive design

## 🚀 Production Deployment

For production environments:

1. **Use a dedicated email service** (SendGrid, AWS SES, etc.)
2. **Set up proper DNS records** (SPF, DKIM, DMARC)
3. **Monitor email delivery** and bounce rates
4. **Implement rate limiting** to prevent abuse
5. **Use HTTPS** for all reset links

## 📞 Support

If you encounter issues:

1. Check the server logs for specific error messages
2. Verify your credentials and service configuration
3. Test with a simple email first
4. Consult the service-specific documentation
5. Consider using a different email service if problems persist

---

**Happy emailing! 📧**
