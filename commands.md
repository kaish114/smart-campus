Here's how to run the Smart Campus application:

  Option 1: Using Docker (Recommended)

  1. Make sure you have Docker and Docker Compose installed on your system.
  2. Open a terminal and navigate to the project directory:
  cd /Users/kaish114/Desktop/MyProjects/SmartCampus
  3. Start all services using Docker Compose:
  docker-compose up -d
  4. Seed the database with initial data:
  docker-compose exec backend npm run seed
  5. Access the application:
    - Frontend: http://localhost
    - Backend API: http://localhost:8000/api
    - MongoDB: mongodb://localhost:27017/smart-campus

  Option 2: Running Services Separately

  Backend Setup:

  1. Install MongoDB on your machine or use a cloud service.
  2. Navigate to the backend directory:
  cd /Users/kaish114/Desktop/MyProjects/SmartCampus/backend
  3. Install dependencies:
  npm install
  4. Start the backend server:
  npm run dev
  5. In a separate terminal, seed the database:
  npm run seed

  Frontend Setup:

  1. Open a new terminal and navigate to the frontend directory:
  cd /Users/kaish114/Desktop/MyProjects/SmartCampus/frontend
  2. Install dependencies:
  npm install
  3. Start the frontend development server:
  npm start
  4. Access the frontend at: http://localhost:3000

  Login Information

  After running the seed script, you can log in with these credentials:

  - Admin User:
    - Email: mailto:admin@smartcampus.com
    - Password: password123
  - Faculty User:
    - Email: mailto:faculty@smartcampus.com
    - Password: password123
  - Student Users:
    - Email: mailto:john@student.com
    - Password: password123
    - Email: mailto:jane@student.com
    - Password: password123

  Troubleshooting

  - If Docker containers fail to start, check Docker logs:
  docker-compose logs
  - For specific service logs:
  docker-compose logs backend
  docker-compose logs frontend
  docker-compose logs mongodb
  - To restart services:
  docker-compose restart backend
  - If you encounter permission issues with MongoDB data directory, you might need to run:
  sudo chown -R $USER:$USER ~/data/db

  Let me know if you need any clarification or encounter any issues while setting up the application!