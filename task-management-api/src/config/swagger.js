const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Task Management API',
            version: '1.0.0',
            description:
                'Comprehensive RESTful API for task management system with authentication and role-based access control',
            contact: {
                name: 'API Support',
            },
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:3000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'User ID',
                        },
                        username: {
                            type: 'string',
                            description: 'Username',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email',
                        },
                        role: {
                            type: 'string',
                            enum: ['admin', 'manager', 'user'],
                            description: 'User role',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Task: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Task ID',
                        },
                        title: {
                            type: 'string',
                            description: 'Task title',
                        },
                        description: {
                            type: 'string',
                            description: 'Task description',
                        },
                        dueDate: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Task due date',
                        },
                        priority: {
                            type: 'string',
                            enum: ['low', 'medium', 'high', 'urgent'],
                            description: 'Task priority',
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'in-progress', 'completed', 'cancelled'],
                            description: 'Task status',
                        },
                        createdBy: {
                            $ref: '#/components/schemas/User',
                        },
                        assignedTo: {
                            $ref: '#/components/schemas/User',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
