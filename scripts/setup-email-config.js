#!/usr/bin/env node

/**
 * Email Configuration Setup Script
 * This script helps set up email configuration for the Kanvaro application
 */

const readline = require('readline')
const fs = require('fs')
const path = require('path')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function setupEmailConfig() {
  console.log('📧 Kanvaro Email Configuration Setup')
  console.log('=====================================\n')

  console.log('This script will help you configure email settings for sending invitations and notifications.\n')

  const useEnvVars = await question('Do you want to configure email via environment variables? (y/n): ')
  
  if (useEnvVars.toLowerCase() === 'y') {
    console.log('\n📝 Add these environment variables to your .env file:\n')
    
    const smtpHost = await question('SMTP Host (e.g., smtp.gmail.com): ')
    const smtpPort = await question('SMTP Port (e.g., 587): ')
    const smtpUser = await question('SMTP Username: ')
    const smtpPass = await question('SMTP Password: ')
    const smtpFromEmail = await question('From Email: ')
    const smtpFromName = await question('From Name (e.g., Kanvaro Team): ')

    const envContent = `
# Email Configuration
SMTP_HOST=${smtpHost}
SMTP_PORT=${smtpPort}
SMTP_USER=${smtpUser}
SMTP_PASS=${smtpPass}
SMTP_FROM_EMAIL=${smtpFromEmail}
SMTP_FROM_NAME=${smtpFromName}
`

    console.log('\n📄 Add these lines to your .env file:')
    console.log(envContent)

    const writeToEnv = await question('Do you want to append these to your .env file? (y/n): ')
    
    if (writeToEnv.toLowerCase() === 'y') {
      try {
        const envPath = path.join(process.cwd(), '.env')
        fs.appendFileSync(envPath, envContent)
        console.log('✅ Environment variables added to .env file')
      } catch (error) {
        console.log('❌ Could not write to .env file:', error.message)
        console.log('Please manually add the variables to your .env file')
      }
    }
  } else {
    console.log('\n📋 Manual Configuration Steps:')
    console.log('1. Go to your Kanvaro admin panel')
    console.log('2. Navigate to Settings > Email Configuration')
    console.log('3. Configure your SMTP settings')
    console.log('4. Test the configuration')
  }

  console.log('\n🔧 Common SMTP Settings:')
  console.log('Gmail:')
  console.log('  Host: smtp.gmail.com')
  console.log('  Port: 587')
  console.log('  Security: STARTTLS')
  console.log('  Note: Use App Password, not regular password')
  
  console.log('\nOutlook/Hotmail:')
  console.log('  Host: smtp-mail.outlook.com')
  console.log('  Port: 587')
  console.log('  Security: STARTTLS')
  
  console.log('\nYahoo:')
  console.log('  Host: smtp.mail.yahoo.com')
  console.log('  Port: 587')
  console.log('  Security: STARTTLS')

  console.log('\n✅ Setup complete! Restart your application to apply the changes.')
  
  rl.close()
}

setupEmailConfig().catch(console.error)
