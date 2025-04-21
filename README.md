# CJM Backend

Backend service for the Customer Jewelry Management (CJM) platform.

## Features

- User authentication and management
- Gold price tracking and statistics
- User scheme management
- Transaction handling
- Point redemption system
- Circulars/announcements with view tracking
- Admin dashboard and analytics
- File management
- Comprehensive logging system

## Tech Stack

- Node.js and Express
- TypeScript
- PostgreSQL with Sequelize ORM
- JWT for authentication
- Winston and Morgan for logging
- Swagger for API documentation
- Jest for testing

## Prerequisites

- Node.js 18.x or higher
- PostgreSQL 13.x or higher
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cjm-backend.git
   cd cjm-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Server
   PORT=3000
   NODE_ENV=development
   
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=cjm_dev
   DB_USER=postgres
   DB_PASSWORD=yourpassword
   
   # JWT
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   
   # Logging
   LOG_DIR=logs
   ```

4. Run database migrations:
   ```bash
   npm run migrate
   ```

## Running the Application

### Development Mode

Start the application in development mode with hot reloading:

```bash
npm run dev
```

### Production Mode

Build and run the application in production mode:

```bash
npm run build
npm run start:prod
```

### Using PM2 (Production)

Start the application using PM2 process manager:

```bash
npm run build
npm run start:pm2
```

PM2 commands:
- `npm run stop:pm2` - Stop the application
- `npm run restart:pm2` - Restart the application
- `npm run status:pm2` - Check application status
- `npm run logs:pm2` - View application logs
- `npm run delete:pm2` - Delete the application from PM2

## Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Logging System

The application uses a comprehensive logging system with Winston and Morgan:

- **Winston**: For application-level logging with different log levels (error, warn, info, debug)
- **Morgan**: For HTTP request logging
- **Log Rotation**: Daily log files with automatic rotation and compression
- **Environment-based configuration**: Different logging formats for development and production

Logs are stored in the `logs` directory (configurable via `LOG_DIR` env variable).

## API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3000/docs
```

## Endpoints

The API provides the following main endpoint groups:

- `/api/auth` - Authentication (login, register, etc.)
- `/api/user` - User management
- `/api/admin` - Admin authentication and operations
- `/api/gold-prices` - Gold price data and statistics
- `/api/user-schemes` - User scheme management
- `/api/transactions` - Transaction handling
- `/api/points` - Point redemption system
- `/api/circulars` - Announcements and circulars
- `/api/settings` - Application settings
- `/api/dashboard` - Admin dashboard data
- `/api/files` - File upload/download
- `/api/analytics` - Application analytics
- `/api/referrals` - Referral management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
