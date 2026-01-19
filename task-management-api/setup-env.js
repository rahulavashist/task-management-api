const fs = require('fs');
const path = require('path');

const envExample = `# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/task_management

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters-long
JWT_EXPIRE=7d

# Redis (Optional - API will work without Redis but caching will be disabled)
REDIS_HOST=localhost
REDIS_PORT=6379

# Email Configuration (Optional - for email notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3001

# API URL (for Swagger documentation)
API_URL=http://localhost:3000
`;

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

// Create .env.example
if (!fs.existsSync(envExamplePath)) {
    fs.writeFileSync(envExamplePath, envExample);
    console.log('✅ Created .env.example');
}

// Create .env if it doesn't exist
if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envExample);
    console.log('✅ Created .env file');
    console.log('⚠️  Please update .env with your actual configuration values!');
} else {
    console.log('ℹ️  .env file already exists');
}
