# Task Management API

A comprehensive RESTful API for a task management system built with Node.js, Express, MongoDB, and featuring authentication, role-based access control, real-time updates, caching, and analytics.

## Features

### Core Features
- ✅ User Registration with email validation and strong password requirements
- ✅ User Login with JWT authentication
- ✅ User Logout with token invalidation
- ✅ User Profile management
- ✅ Role-Based Access Control (RBAC) - Admin, Manager, User
- ✅ Complete Task CRUD operations
- ✅ Task Assignment functionality
- ✅ Search and filtering capabilities
- ✅ Pagination support

### Advanced Features
- ✅ Real-time updates using WebSockets (Socket.io)
- ✅ Analytics endpoints for task statistics
- ✅ Redis caching for improved performance
- ✅ Rate limiting for API protection
- ✅ Comprehensive error handling
- ✅ OpenAPI/Swagger documentation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **Documentation**: Swagger/OpenAPI 3.0
- **Validation**: express-validator
- **Security**: Helmet, CORS, bcryptjs

## Project Structure

```
Assignment-PsiBorg/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   ├── redis.js             # Redis connection
│   │   └── swagger.js           # Swagger configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── taskController.js   # Task management logic
│   │   └── analyticsController.js # Analytics logic
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── rbac.js              # Role-based access control
│   │   ├── rateLimiter.js       # Rate limiting
│   │   ├── validation.js        # Request validation
│   │   └── errorHandler.js      # Error handling
│   ├── models/
│   │   ├── User.js              # User model
│   │   └── Task.js               # Task model
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication routes
│   │   ├── taskRoutes.js        # Task routes
│   │   ├── analyticsRoutes.js   # Analytics routes
│   │   └── index.js             # Route aggregator
│   ├── utils/
│   │   ├── jwt.js               # JWT utilities
│   │   ├── cache.js             # Redis cache utilities
│   │   ├── email.js             # Email service
│   │   └── genericCRUD.js       # Generic CRUD handler
│   └── server.js                # Main server file
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Redis (v6 or higher) - Optional but recommended
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Assignment-PsiBorg
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Edit the `.env` file and update the following:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/task_management
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   REDIS_HOST=localhost
   REDIS_PORT=6379
   FRONTEND_URL=http://localhost:3001
   ```

5. **Start MongoDB**
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community

   # On Linux
   sudo systemctl start mongod

   # Or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo
   ```

6. **Start Redis (Optional)**
   ```bash
   # On macOS with Homebrew
   brew services start redis

   # On Linux
   sudo systemctl start redis

   # Or use Docker
   docker run -d -p 6379:6379 --name redis redis
   ```

7. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Documentation

Once the server is running, you can access the interactive API documentation at:

**Swagger UI**: `http://localhost:3000/api-docs`

The documentation includes:
- All available endpoints
- Request/response schemas
- Authentication requirements
- Example requests and responses

## API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/logout` | Logout user | Private |
| GET | `/api/auth/profile` | Get user profile | Private |
| PUT | `/api/auth/profile` | Update user profile | Private |

### Tasks

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/tasks` | Get all tasks (with filters) | Private |
| GET | `/api/tasks/my-tasks` | Get user's tasks | Private |
| GET | `/api/tasks/assigned` | Get assigned tasks | Private |
| GET | `/api/tasks/:id` | Get a single task | Private |
| POST | `/api/tasks` | Create a new task | Private |
| PUT | `/api/tasks/:id` | Update a task | Private |
| DELETE | `/api/tasks/:id` | Delete a task | Private |
| POST | `/api/tasks/:id/assign` | Assign task to user | Manager, Admin |

### Analytics

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/analytics/stats` | Get task statistics | Private |
| GET | `/api/analytics/user/:userId` | Get user statistics | Private |
| GET | `/api/analytics/team` | Get team statistics | Manager, Admin |

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Role-Based Access Control

### Admin
- Full access to all endpoints
- Can manage all users and tasks
- Can assign tasks to any user

### Manager
- Can manage tasks assigned to their team
- Can view team member profiles
- Can assign tasks to team members
- Can view team analytics

### User
- Can manage their own tasks
- Can view their own profile
- Can view their own analytics

## Request Examples

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Create a Task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive documentation for the API",
    "dueDate": "2024-12-31T23:59:59Z",
    "priority": "high",
    "status": "pending"
  }'
```

### Get Tasks with Filters
```bash
curl -X GET "http://localhost:3000/api/tasks?status=pending&priority=high&page=1&limit=10" \
  -H "Authorization: Bearer <your-token>"
```

## WebSocket Events

The API supports real-time updates via WebSocket. Connect to the server and listen for events:

### Client Connection
```javascript
const socket = io('http://localhost:3000');

// Join user's room
socket.emit('join-room', userId);

// Listen for task events
socket.on('task:created', (task) => {
  console.log('New task created:', task);
});

socket.on('task:updated', (task) => {
  console.log('Task updated:', task);
});

socket.on('task:deleted', (data) => {
  console.log('Task deleted:', data.id);
});

socket.on('task:assigned', (task) => {
  console.log('Task assigned:', task);
});
```

## Caching

The API uses Redis for caching frequently accessed data:
- Task lists are cached for 5 minutes
- Individual tasks are cached for 5 minutes
- Analytics data is cached for 5 minutes

Cache is automatically invalidated when data is created, updated, or deleted.

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **Task creation**: 50 requests per hour per IP

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error message here"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Testing

To test the API, you can use:
- Postman
- cURL
- Swagger UI (interactive documentation)
- Any HTTP client

## Deployment

### Environment Variables for Production

Make sure to update these in production:
- `NODE_ENV=production`
- `JWT_SECRET` - Use a strong, random secret
- `MONGODB_URI` - Use a production MongoDB connection string
- `REDIS_HOST` and `REDIS_PORT` - Production Redis instance
- `FRONTEND_URL` - Your frontend URL

### Deployment Platforms

The API can be deployed to:
- Heroku
- AWS (EC2, Elastic Beanstalk)
- Google Cloud Platform
- Azure
- DigitalOcean
- Railway
- Render

## Assumptions and Design Decisions

1. **Password Requirements**: Minimum 8 characters with uppercase, lowercase, number, and special character
2. **JWT Expiration**: 7 days (configurable via environment variable)
3. **Default User Role**: New users are assigned 'user' role by default
4. **Task Status**: Tasks can be pending, in-progress, completed, or cancelled
5. **Task Priority**: Tasks can have low, medium, high, or urgent priority
6. **Cache TTL**: 5 minutes for most cached data
7. **Pagination**: Default 10 items per page, configurable via query parameters
8. **Email Service**: Optional - API works without email configuration

## Future Enhancements

- [ ] Email verification for new registrations
- [ ] Password reset functionality
- [ ] File attachments for tasks
- [ ] Task comments and activity logs
- [ ] Advanced search with full-text search
- [ ] Task templates
- [ ] Recurring tasks
- [ ] Task dependencies
- [ ] Export functionality (CSV, PDF)
- [ ] Mobile app support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC

## Support

For issues and questions, please open an issue in the repository.

---

**Note**: This is a comprehensive implementation of the task management API with all core requirements and advanced features. The code follows MVC architecture with generic CRUD handlers to reduce code duplication and improve maintainability.
