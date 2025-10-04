import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { provider, smtp, azure } = await request.json()

    if (provider === 'smtp') {
      // Trim all input values to remove any whitespace
      const trimmedSmtp = {
        host: smtp.host?.trim(),
        port: smtp.port,
        secure: smtp.secure,
        username: smtp.username?.trim(),
        password: smtp.password?.trim(),
        fromEmail: smtp.fromEmail?.trim(),
        fromName: smtp.fromName?.trim()
      }

      console.log('Testing SMTP connection with:', {
        host: trimmedSmtp.host,
        port: trimmedSmtp.port,
        secure: trimmedSmtp.secure,
        username: trimmedSmtp.username,
        fromEmail: trimmedSmtp.fromEmail,
        fromName: trimmedSmtp.fromName
      })

      // Test SMTP connection
      const transporter = nodemailer.createTransport({
        host: trimmedSmtp.host,
        port: trimmedSmtp.port,
        secure: trimmedSmtp.secure, // true for 465, false for other ports
        auth: {
          user: trimmedSmtp.username,
          pass: trimmedSmtp.password,
        },
        // Add additional options for better compatibility
        tls: {
          rejectUnauthorized: false,
          ciphers: 'SSLv3'
        },
        connectionTimeout: 60000, // 60 seconds
        greetingTimeout: 30000,   // 30 seconds
        socketTimeout: 60000,     // 60 seconds
        // Additional options for IONOS and other providers
        requireTLS: true,
        ignoreTLS: false,
        debug: true,
        logger: true
      })

      console.log('Verifying SMTP connection...')
      // Verify SMTP connection
      await transporter.verify()
      console.log('SMTP connection verified successfully')

      // Send test email
      const testEmail = {
        from: `"${trimmedSmtp.fromName}" <${trimmedSmtp.fromEmail}>`,
        to: trimmedSmtp.fromEmail, // Send to self for testing
        subject: 'Kanvaro Setup - Email Test',
        text: 'This is a test email from your Kanvaro setup. If you receive this, your email configuration is working correctly.',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Kanvaro Setup - Email Test</h2>
            <p>This is a test email from your Kanvaro setup.</p>
            <p>If you receive this email, your email configuration is working correctly!</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              This email was sent during the Kanvaro setup process to verify your email configuration.
            </p>
          </div>
        `,
      }

      await transporter.sendMail(testEmail)

      return NextResponse.json({ 
        success: true,
        message: 'Test email sent successfully! Check your inbox.'
      })

    } else if (provider === 'azure') {
      // For Azure App/Exchange integration, we would use Microsoft Graph API
      // This is a placeholder implementation - in production, you'd use the Microsoft Graph SDK
      
      // Validate required fields
      if (!azure.clientId || !azure.clientSecret || !azure.tenantId) {
        return NextResponse.json(
          { error: 'Azure configuration is incomplete' },
          { status: 400 }
        )
      }

      // In a real implementation, you would:
      // 1. Get an access token using client credentials flow
      // 2. Use Microsoft Graph API to send email
      // 3. Handle authentication and permissions

      // For now, we'll simulate a successful test
      return NextResponse.json({ 
        success: true,
        message: 'Azure configuration validated successfully! (Note: Full implementation requires Microsoft Graph SDK)'
      })

    } else {
      return NextResponse.json(
        { error: 'Invalid email provider' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Email test failed:', error)
    
    let errorMessage = 'Email test failed'
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        errorMessage = 'Invalid email credentials. Please check your username and password.'
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Cannot connect to email server. Please check your SMTP host and port.'
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('EBADNAME')) {
        errorMessage = 'Email server not found. Please check your SMTP host address and ensure it\'s accessible.'
      } else if (error.message.includes('authentication')) {
        errorMessage = 'Authentication failed. Please check your email credentials.'
      } else if (error.message.includes('ETIMEDOUT')) {
        errorMessage = 'Connection timeout. Please check your SMTP settings and network connection.'
      } else if (error.message.includes('EHLO')) {
        errorMessage = 'SMTP server rejected the connection. Please check your server settings.'
      } else {
        errorMessage = `Email test failed: ${error.message}`
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    )
  }
}