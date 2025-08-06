require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔧 Testing Email Configuration...\n');

// Check if nodemailer is installed
try {
  console.log('✅ nodemailer module found');
} catch (error) {
  console.error('❌ nodemailer module not found. Run: npm install nodemailer');
  process.exit(1);
}

// Check environment variables
console.log('📋 Environment Variables:');
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE || 'NOT SET');
console.log('EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***SET***' : 'NOT SET');
console.log();

// Test email configuration function
const testEmailConfiguration = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  
  if (!emailUser || !emailPass) {
    console.log('⚠️  Email credentials not configured. Running in DEVELOPMENT MODE.');
    console.log('\n📝 TO SEND REAL EMAILS:');
    console.log('1. Create a .env file in the server directory');
    console.log('2. Add these variables:');
    console.log('   EMAIL_SERVICE=gmail');
    console.log('   EMAIL_USER=your-email@gmail.com');
    console.log('   EMAIL_PASS=your-app-password');
    console.log('\n🔒 For Gmail App Password setup:');
    console.log('   Visit: https://myaccount.google.com/apppasswords');
    console.log();
    return null;
  }

  console.log(`📧 Email service configured: ${emailService}`);
  
  // Configuration for different email services
  const serviceConfigs = {
    gmail: {
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass }
    },
    outlook: {
      service: 'outlook',
      auth: { user: emailUser, pass: emailPass }
    },
    yahoo: {
      service: 'yahoo',
      auth: { user: emailUser, pass: emailPass }
    },
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: emailUser, pass: emailPass }
    }
  };

  const config = serviceConfigs[emailService.toLowerCase()] || serviceConfigs.gmail;
  
  try {
    const transporter = nodemailer.createTransport(config);
    console.log('✅ Email transporter created successfully');
    return transporter;
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error.message);
    return null;
  }
};

// Test sending email function
const testSendEmail = async (transporter, testEmail) => {
  if (!transporter) {
    console.log('🧪 DEVELOPMENT MODE - Email would be logged to console');
    console.log('📧 Test Email Details:');
    console.log('  To:', testEmail);
    console.log('  Subject: ChatApp Email Test');
    console.log('  Content: This is a test email from ChatApp password reset system');
    return true;
  }
  
  console.log(`📤 Attempting to send test email to: ${testEmail}`);
  
  try {
    const result = await transporter.sendMail({
      from: `"ChatApp Test" <${process.env.EMAIL_USER}>`,
      to: testEmail,
      subject: 'ChatApp Email Test',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">ChatApp</h1>
            <p style="color: white; margin: 10px 0 0 0;">Email Configuration Test</p>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">✅ Email System Working!</h2>
            <p style="color: #666; line-height: 1.6;">
              Congratulations! Your email configuration is working properly.
              The password reset feature is now ready to use.
            </p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📬 Message ID:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication Error:');
      console.error('   - Check your email and password');
      console.error('   - For Gmail, use App Password (not regular password)');
      console.error('   - Ensure 2FA is enabled for Gmail');
    } else if (error.code === 'ECONNECTION') {
      console.error('🌐 Connection Error:');
      console.error('   - Check internet connection');
      console.error('   - Verify SMTP settings');
    }
    
    return false;
  }
};

// Main test function
const runTest = async () => {
  console.log('🚀 Starting Email Module Test...\n');
  
  // Test 1: Check configuration
  const transporter = testEmailConfiguration();
  
  // Test 2: Check if we can send emails
  const testEmail = process.env.EMAIL_USER || 'test@example.com';
  const emailSent = await testSendEmail(transporter, testEmail);
  
  // Results
  console.log('\n📊 TEST RESULTS:');
  console.log('================');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('🔶 Status: DEVELOPMENT MODE');
    console.log('📝 Action: Configure email credentials to send real emails');
  } else if (emailSent) {
    console.log('🟢 Status: EMAIL SYSTEM WORKING');
    console.log('✅ Password reset emails will be sent successfully');
  } else {
    console.log('🔴 Status: EMAIL CONFIGURATION ERROR');
    console.log('❌ Please fix the configuration before using password reset');
  }
  
  console.log('\n📚 For detailed setup instructions, see EMAIL_SETUP.md');
  console.log('🔧 Server logs will show email status when password reset is used');
};

// Run the test
runTest().catch(console.error);
