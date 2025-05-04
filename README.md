# 🏫 Smart Campus Resource Management System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-yellow)
![Node](https://img.shields.io/badge/node-14+-green)
![React](https://img.shields.io/badge/react-17+-61DAFB)
![MongoDB](https://img.shields.io/badge/mongodb-4.4+-47A248)

<p align="center">
  <img src="https://user-images.githubusercontent.com/74038190/238355349-7d484dc9-68a9-4ee6-a767-aea59035c12d.gif" width="500">
</p>

</div>

A comprehensive web application for managing and booking various campus resources such as study rooms, lab equipment, sports facilities, and more. The system provides real-time availability updates, interactive campus maps, QR code-based check-ins, and analytics for resource utilization.

<details open>
<summary>📋 Table of Contents</summary>

- [🌟 Features](#-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [🏗️ Architecture](#️-architecture)
- [🚀 Installation and Setup](#-installation-and-setup)
- [🔑 Default Users](#-default-users)
- [📚 API Documentation](#-api-documentation)
- [🔄 WebSocket Events](#-websocket-events)
- [👨‍💻 Development Guide](#-development-guide)
- [📁 Project Structure](#-project-structure)
- [🧩 Extending the Application](#-extending-the-application)
- [❓ Troubleshooting](#-troubleshooting)
- [📄 License](#-license)
- [👏 Acknowledgments](#-acknowledgments)

</details>

## 🌟 Features

<details open>
<summary><b>User Features</b></summary>

- **👤 User Authentication**: Secure login/registration with role-based access control (student, faculty, admin)
- **🗺️ Interactive Campus Map**: Visual representation of resource locations across campus
- **🔍 Resource Discovery**: Filter and search for resources by type, availability, location, and amenities
- **⏱️ Real-time Availability**: Up-to-date information on resource availability status
- **📅 Booking System**: Easy reservation process with calendar integration
- **📱 QR Code Check-in/out**: Streamlined process for resource utilization tracking
- **🔔 Notifications**: Email alerts and in-app notifications for bookings and reminders
- **👨‍🎓 User Profiles**: Manage personal information and view booking history
- **⭐ Feedback System**: Rate and review resources after use

</details>

<details open>
<summary><b>Administrative Features</b></summary>

- **📊 Resource Management**: Add, edit, and manage campus resources
- **👥 User Management**: Administer user accounts and permissions
- **📈 Analytics Dashboard**: Track resource usage and booking patterns
- **🔄 Reservation Management**: View, modify, or cancel bookings
- **⚙️ Restriction Settings**: Set usage policies for different resources

</details>

<div align="center">
  <p>
    <img src="https://user-images.githubusercontent.com/74038190/216649426-43e655af-357b-4105-951e-b33ce2268283.gif" width="500">
  </p>
</div>

## 🛠️ Technology Stack

<table align="center">
  <tr>
    <td align="center"><b>Frontend</b></td>
    <td align="center"><b>Backend</b></td>
    <td align="center"><b>DevOps</b></td>
  </tr>
  <tr>
    <td>
      <ul>
        <li>React.js</li>
        <li>Material-UI</li>
        <li>React Router</li>
        <li>Leaflet.js</li>
        <li>Socket.io-client</li>
        <li>QRCode.react</li>
        <li>Formik & Yup</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>Node.js & Express</li>
        <li>MongoDB</li>
        <li>Mongoose</li>
        <li>JWT</li>
        <li>Socket.io</li>
        <li>Nodemailer</li>
        <li>QRCode</li>
      </ul>
    </td>
    <td>
      <ul>
        <li>Docker & Docker Compose</li>
        <li>Nginx</li>
        <li>Environment Variables</li>
      </ul>
    </td>
  </tr>
</table>

## 🏗️ Architecture

<div align="center">
  <img src="https://mermaid.ink/img/pako:eNptkM1qwzAQhF9F7CmF9gGMCw1NaE5t6aWXhbWSFaQfI8mFEPLuXdmhDbQnMcx8O7PSARvTIuRQmk9ttY0U2V-GNVF0xo0tGQpLSt0L8X63VdRrNXW_Y7dVj4qQCMXtQGm5VZtbZ0Rqoi2eI71rnYxIV8V1jDqYQzzhpT8HHyUdvxiafIMhFEMb8hBCXrhKsXmEQvY-GbAKD_Aa6NwPAVc0obtyoIRcW3_KQ2Gm-4m_0PsLlEaNwYfyF3ZQQlmiJSJTBp-bWxvSSqvbSr2Cg_LaSvgB84Bcbw" alt="Architecture Diagram" width="600">
</div>

The application follows a three-tier architecture:

1. **Presentation Layer** (Frontend): React.js application with Material-UI components
2. **Application Layer** (Backend): Node.js/Express RESTful API with WebSocket support
3. **Data Layer** (Database): MongoDB for persistent storage

The components communicate as follows:
- Frontend ↔ Backend: HTTP REST API calls and WebSocket connections
- Backend ↔ Database: Mongoose ODM

## 🚀 Installation and Setup

### Prerequisites
- Docker and Docker Compose installed on your machine
- Git for cloning the repository

### Getting Started

<details>
<summary>Click to expand installation steps</summary>

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smart-campus.git
   cd smart-campus
   ```

2. Configure environment variables:
   ```bash
   cp backend/.env.example backend/.env
   ```
   Edit the `.env` file and set the required environment variables.

3. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

4. Initialize the database with seed data:
   ```bash
   docker-compose exec backend npm run seed
   ```

5. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:8000/api
   - MongoDB: mongodb://localhost:27017/smart-campus

</details>

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/212749447-bfb7e725-6987-49d9-ae85-2015e3e7cc41.gif" width="500">
</div>

## 🔑 Default Users

After seeding the database, you can log in with the following credentials:

<table align="center">
  <tr>
    <th>Role</th>
    <th>Email</th>
    <th>Password</th>
  </tr>
  <tr>
    <td>Admin</td>
    <td>admin@smartcampus.com</td>
    <td>password123</td>
  </tr>
  <tr>
    <td>Faculty</td>
    <td>faculty@smartcampus.com</td>
    <td>password123</td>
  </tr>
  <tr>
    <td>Student</td>
    <td>john@student.com</td>
    <td>password123</td>
  </tr>
  <tr>
    <td>Student</td>
    <td>jane@student.com</td>
    <td>password123</td>
  </tr>
</table>

## 📚 API Documentation

<details>
<summary>Click to expand API documentation</summary>

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/logout` - Logout user
- `POST /api/auth/forgotpassword` - Request password reset
- `PUT /api/auth/resetpassword/:resettoken` - Reset password
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password

### Resource Endpoints
- `GET /api/resources` - Get all resources
- `GET /api/resources/:id` - Get a single resource
- `POST /api/resources` - Create a new resource (admin only)
- `PUT /api/resources/:id` - Update a resource (admin only)
- `DELETE /api/resources/:id` - Delete a resource (admin only)
- `GET /api/resources/:id/availability` - Get resource availability

### Booking Endpoints
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get a single booking
- `POST /api/bookings` - Create a new booking
- `PUT /api/bookings/:id` - Update a booking
- `DELETE /api/bookings/:id` - Cancel a booking
- `PUT /api/bookings/:id/checkin` - Check in for a booking
- `PUT /api/bookings/:id/checkout` - Check out from a booking
- `PUT /api/bookings/:id/feedback` - Submit feedback for a booking

### User Endpoints
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get a single user (admin only)
- `PUT /api/users/:id` - Update a user (admin only)
- `DELETE /api/users/:id` - Delete a user (admin only)

</details>

## 🔄 WebSocket Events

The application uses Socket.IO for real-time updates. The following events are supported:

- `booking-created` - Emitted when a new booking is created
- `booking-updated` - Emitted when a booking is updated
- `booking-cancelled` - Emitted when a booking is cancelled
- `booking-check-in` - Emitted when a user checks in for a booking
- `booking-check-out` - Emitted when a user checks out from a booking

## 👨‍💻 Development Guide

<details>
<summary>Click to expand development guide</summary>

### Backend Development

1. Make changes to the backend code
2. Restart the backend container:
   ```bash
   docker-compose restart backend
   ```

### Frontend Development

1. Make changes to the frontend code
2. Rebuild the frontend container:
   ```bash
   docker-compose build frontend
   docker-compose up -d frontend
   ```

### Database Operations

- Access MongoDB shell:
  ```bash
  docker-compose exec mongodb mongo
  ```

- View MongoDB logs:
  ```bash
  docker-compose logs mongodb
  ```

- Backup database:
  ```bash
  docker-compose exec mongodb sh -c 'mongodump --out /data/backup/$(date +"%Y-%m-%d")'
  ```

- Restore database:
  ```bash
  docker-compose exec mongodb sh -c 'mongorestore /data/backup/YYYY-MM-DD'
  ```

</details>

## 📁 Project Structure

<details>
<summary>Click to expand project structure</summary>

```
smart-campus/
├── backend/                # Backend Node.js application
│   ├── controllers/        # API route controllers
│   ├── models/             # Mongoose database models
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration files
│   ├── services/           # Business logic
│   └── server.js           # Main server file
├── frontend/               # Frontend React application
│   ├── public/             # Static files
│   ├── src/                # React source files
│   │   ├── assets/         # Images, fonts, etc.
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Main page components
│   │   ├── services/       # API service functions
│   │   └── utils/          # Utility functions
├── database/               # Database scripts
│   ├── seeds/              # Seed data
│   └── backup/             # Backup scripts
├── docker/                 # Docker configuration
│   ├── backend/            # Backend Docker files
│   ├── frontend/           # Frontend Docker files
│   └── database/           # Database Docker files
└── docker-compose.yml      # Docker Compose configuration
```

</details>

## 🧩 Extending the Application

<details>
<summary>Click to expand extension guide</summary>

### Adding New Resource Types

1. Add the new resource type to the `type` enum in the `Resource` model
2. Update the frontend components to support the new resource type
3. Add appropriate icons and UI elements for the new type

### Implementing New Features

1. Backend: Add necessary models, controllers, and routes
2. Frontend: Create components and services to interact with the new API endpoints
3. Update documentation to reflect the new features

</details>

## ❓ Troubleshooting

<details>
<summary>Click to expand troubleshooting guide</summary>

### Common Issues

<table>
  <tr>
    <th>Problem</th>
    <th>Solution</th>
  </tr>
  <tr>
    <td>Backend container fails to start</td>
    <td>Check the MongoDB connection settings in the <code>.env</code> file</td>
  </tr>
  <tr>
    <td>Frontend cannot connect to backend API</td>
    <td>Ensure the <code>REACT_APP_API_URL</code> is correctly set in the frontend environment</td>
  </tr>
  <tr>
    <td>WebSocket connections are not working</td>
    <td>Check browser console for CORS errors and verify nginx proxy settings</td>
  </tr>
</table>

### Getting Help

If you encounter any issues or have questions, please:
1. Check the troubleshooting section above
2. Review the open and closed issues on GitHub
3. Open a new issue with a detailed description and steps to reproduce

</details>

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgments

- All contributors who participated in this project
- University IT department for requirements and testing support
- Open-source projects that made this system possible

<div align="center">
  <img src="https://user-images.githubusercontent.com/74038190/226190894-18e959ba-d458-4a94-ac44-790190f2a947.gif" width="500">
  <p>Made with ❤️ by The Engineer Guy</p>
</div>