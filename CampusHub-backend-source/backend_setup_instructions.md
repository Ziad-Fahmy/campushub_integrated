# CampusHub Backend Setup Instructions

This document provides instructions for setting up and running the CampusHub backend server that supports the updated frontend with role-based registration.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Extract the backend code to your desired location
2. Navigate to the project directory in your terminal
3. Install dependencies:

```bash
npm install
```

## Configuration

1. Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

- Replace `your_mongodb_connection_string` with your MongoDB connection string
- Replace `your_jwt_secret_key` with a secure random string for JWT token signing

## Running the Server

### Development Mode

```bash
npm run dev
```

This will start the server with nodemon for automatic reloading during development.

### Production Mode

```bash
npm start
```

## API Endpoints

The backend provides the following API endpoints:

### Authentication
- POST /api/auth/register - Register new user (with role-based fields)
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout
- GET /api/auth/profile - Get user profile
- PUT /api/auth/profile - Update user profile

### Classrooms
- GET /api/classrooms - Get all classrooms
- GET /api/classrooms/:id - Get classroom details
- POST /api/classrooms - Add new classroom (admin only)
- PUT /api/classrooms/:id - Update classroom (admin only)
- DELETE /api/classrooms/:id - Delete classroom (admin only)

### Facilities
- GET /api/facilities - Get all facilities
- GET /api/facilities/:id - Get facility details
- POST /api/facilities - Add new facility (admin only)
- PUT /api/facilities/:id - Update facility (admin only)
- DELETE /api/facilities/:id - Delete facility (admin only)

### Events
- GET /api/events - Get all events
- GET /api/events/:id - Get event details
- POST /api/events - Create new event
- PUT /api/events/:id - Update event
- DELETE /api/events/:id - Delete event
- POST /api/events/:id/register - Register for event

### Bookings
- GET /api/bookings - Get user bookings
- GET /api/bookings/:id - Get booking details
- POST /api/bookings - Create new booking
- PUT /api/bookings/:id - Update booking
- DELETE /api/bookings/:id - Cancel booking
- GET /api/bookings/resource/:resourceId - Get bookings for a resource

### Restaurants
- GET /api/restaurants - Get all restaurants
- GET /api/restaurants/:id - Get restaurant details
- GET /api/restaurants/:id/menu - Get restaurant menu
- POST /api/restaurants/:id/order - Place food order

### Complaints
- GET /api/complaints - Get user complaints
- GET /api/complaints/:id - Get complaint details
- POST /api/complaints - Submit new complaint
- PUT /api/complaints/:id - Update complaint
- GET /api/complaints/admin - Get all complaints (admin only)
- PUT /api/complaints/:id/respond - Respond to complaint (admin only)

## Role-Based Access

The backend supports two user roles:
- **Student**: Regular users who can book facilities, register for events, etc.
- **Admin**: Administrative users who can manage resources, approve bookings, etc.

## Frontend Integration

This backend is designed to work seamlessly with the updated CampusHub frontend, particularly supporting the new role-based registration system. The authentication endpoints handle the different fields required for student and admin registrations.

## Testing

You can test the API endpoints using tools like Postman or curl. For authentication endpoints that require a token, include the token in the request header as `x-auth-token`.

## Troubleshooting

- If you encounter CORS issues, ensure your frontend origin is properly configured
- For database connection issues, verify your MongoDB connection string
- Check server logs for detailed error messages

## Support

For any issues or questions, please contact the development team.
