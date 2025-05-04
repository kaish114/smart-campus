.PHONY: build up down restart logs seed shell clean

# Default target - builds and starts the application
all: build up

# Build the Docker images
build:
	@echo "Building Docker images..."
	docker-compose build

# Start the application
up:
	@echo "Starting the application..."
	docker-compose up -d

# Stop the application
down:
	@echo "Stopping the application..."
	docker-compose down

# Restart the application
restart:
	@echo "Restarting the application..."
	docker-compose restart

# View logs
logs:
	@echo "Showing logs..."
	docker-compose logs -f

# Seed the database
seed:
	@echo "Seeding the database..."
	docker-compose exec backend npm run seed

# Shell into a container
shell:
	@echo "Opening shell in backend container..."
	docker-compose exec backend /bin/sh

# Clean up resources (including volumes)
clean:
	@echo "Cleaning up resources..."
	docker-compose down -v

# Create an empty .env file if it doesn't exist
.env:
	@echo "Creating .env file..."
	cp backend/.env.example backend/.env

# Help
help:
	@echo "Smart Campus Resource Management System"
	@echo ""
	@echo "Usage:"
	@echo "  make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  all       Build and start the application (default)"
	@echo "  build     Build the Docker images"
	@echo "  up        Start the application"
	@echo "  down      Stop the application"
	@echo "  restart   Restart the application"
	@echo "  logs      View logs"
	@echo "  seed      Seed the database"
	@echo "  shell     Open shell in backend container"
	@echo "  clean     Clean up resources (including volumes)"
	@echo "  help      Show this help message"