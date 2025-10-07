#!/usr/bin/env node

/**
 * Database Setup Script
 * This script helps configure the database connection for different environments
 */

const fs = require('fs');
const path = require('path');

// Database configuration for different environments
const dbConfigs = {
  development: {
    host: 'localhost',
    port: 27017,
    database: 'kanvaro_dev',
    username: 'admin',
    password: 'password',
    authSource: 'admin',
    ssl: false
  },
  production: {
    host: 'mongodb',
    port: 27017,
    database: 'kanvaro_dev_db',
    username: 'dulandias',
    password: '1n4M9Y6RmtQf',
    authSource: 'admin',
    ssl: false
  }
};

/**
 * Generate MongoDB URI from configuration
 */
function generateMongoUri(config) {
  return `mongodb://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}?authSource=${config.authSource}`;
}

/**
 * Create environment file
 */
function createEnvFile(environment, config) {
  const envContent = `# ${environment.toUpperCase()} Environment Configuration
NODE_ENV=${environment}

# Database Configuration
MONGODB_URI=${generateMongoUri(config)}
MONGODB_USERNAME=${config.username}
MONGODB_PASSWORD=${config.password}
MONGODB_DATABASE=${config.database}

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret-change-this-in-production
JWT_EXPIRES_IN=7d

# Application
PORT=3000
HOST=0.0.0.0
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Redis
REDIS_URL=redis://redis:6379

# File Storage
UPLOADS_DIR=./uploads
MAX_FILE_SIZE=26214400

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=noreply@kanvaro.com
SMTP_FROM_NAME=Kanvaro
`;

  const envFile = path.join(process.cwd(), `.env.${environment}`);
  fs.writeFileSync(envFile, envContent);
  console.log(`✅ Created ${envFile}`);
}

/**
 * Main function
 */
function main() {
  const environment = process.argv[2] || 'development';
  
  if (!dbConfigs[environment]) {
    console.error(`❌ Unknown environment: ${environment}`);
    console.log('Available environments:', Object.keys(dbConfigs).join(', '));
    process.exit(1);
  }

  const config = dbConfigs[environment];
  console.log(`🔧 Setting up database configuration for ${environment}...`);
  console.log(`📊 Database: ${config.database}`);
  console.log(`🔗 Host: ${config.host}:${config.port}`);
  console.log(`👤 Username: ${config.username}`);
  console.log(`🔐 MongoDB URI: ${generateMongoUri(config)}`);
  
  createEnvFile(environment, config);
  
  console.log(`\n✅ Database configuration completed for ${environment}!`);
  console.log(`\n📝 Next steps:`);
  console.log(`1. Review the generated .env.${environment} file`);
  console.log(`2. Update any placeholder values (JWT_SECRET, SMTP settings, etc.)`);
  console.log(`3. Start your application with: npm run dev (or docker-compose up)`);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { dbConfigs, generateMongoUri };
