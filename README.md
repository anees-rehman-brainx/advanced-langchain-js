# Node.js Backend Template

A robust Node.js backend template with authentication, AI capabilities using LangChain, and vector database integration.

## Features

- 🔐 Authentication & Authorization
- 🤖 AI Integration with LangChain
- 📊 Vector Database (Pinecone) Integration
- 📝 OpenAI Integration
- 📨 Email Service Integration
- 📱 Firebase Integration
- 🔄 AWS S3 Integration
- 📚 Swagger Documentation
- 🔒 JWT Token Management

## Prerequisites

- Node.js 18.x
- MongoDB
- AWS Account (for S3)
- OpenAI API Key
- Pinecone Account
- Firebase Account

## Installation

1. Clone the repository

clone repo and use `npm install` or `yarn install`
to start the development server, use `npm run dev` or `yarn dev`
to start the production server, use `npm run start` or `yarn start`

go to url `http://localhost:<PORT>` to see if server is up and running
default port is 5000

2. Install dependencies

3. Create a `.env` file in the root directory and add your environment variables:

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on port 5000 by default. You can access the API at `http://localhost:5000`.

## API Documentation

Access the Swagger documentation at `/api/docs` endpoint after starting the server.

## Main Features

### Authentication
- User registration
- Login
- Password reset
- OTP verification
- Profile management

### AI Features
- Chat completion using LangChain
- Agent-based interactions
- Complex scenario analysis
- Parallel execution of AI tasks

### Vector Database Operations
- Document embedding
- Vector similarity search
- Namespace management

## Docker Support

The application includes Docker support. To run using Docker:

```bash
# Build the image
docker build -t nodejs-backend .

# Run the container
docker run -p 5000:5000 nodejs-backend
```

## CI/CD

The project includes GitHub Actions workflows for continuous integration and deployment. Check the `.github/workflows` directory for configuration details.

## Project Structure

- `/config` - Configuration files
- `/controllers` - Request handlers
- `/middlewares` - Custom middleware functions
- `/models` - Database models
- `/routes` - API routes
- `/services` - Business logic
- `/constants` - Application constants

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC