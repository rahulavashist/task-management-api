# Quick Setup Guide

This guide will help you quickly set up and run the Task Management API.

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js (v14+) installed
- ✅ MongoDB installed and running
- ✅ Redis installed (optional but recommended)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and set at minimum:
```env
MONGODB_URI=mongodb://localhost:27017/task_management
JWT_SECRET=your-super-secret-jwt-key-change-this
```

### 3. Start MongoDB

**macOS (Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

### 4. Start Redis (Optional)

**macOS (Homebrew):**
```bash
brew services start redis
```

**Linux:**
```bash
sudo systemctl start redis
```

**Docker:**
```bash
docker run -d -p 6379:6379 --name redis redis
```

**Note:** The API will work without Redis, but caching features will be disabled.

### 5. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### 6. Verify Installation

1. Check health endpoint:
   ```bash
   curl http://localhost:3000/health
   ```

2. Access Swagger documentation:
   Open browser: `http://localhost:3000/api-docs`

## Quick Test

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

Save the token from the response and use it in subsequent requests:
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongosh` or `mongo`
- Check connection string in `.env`
- Verify MongoDB is listening on port 27017

### Redis Connection Error
- Redis is optional - the API will work without it
- If you want caching, ensure Redis is running
- Check Redis connection in `.env`

### Port Already in Use
- Change `PORT` in `.env` to a different port
- Or stop the process using port 3000

### Module Not Found
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then `npm install`

## Next Steps

1. Explore the API documentation at `/api-docs`
2. Read the full README.md for detailed API usage
3. Test all endpoints using Swagger UI or Postman

## Need Help?

- Check the main README.md for detailed documentation
- Review error messages in the console
- Ensure all environment variables are set correctly
