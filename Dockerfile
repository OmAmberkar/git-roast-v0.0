# Stage 1 : Frontend Build
FROM node:18-alpine AS frontend-builder

WORKDIR /app/client

# Install dependencies
COPY client/package*.json ./
RUN npm install

# Building app
COPY client/ ./
RUN npm run build

# Stage 2 : Backend Setup
FROM python:3.11-slim AS backend-builder

WORKDIR /app

# Install dependencies
COPY server/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY server/ ./server


# Stage 3 : Final Setup
# Copy the built frontend artifacts from Stage 1 into the backend container
COPY --from=frontend-builder /app/client/dist ./client/dist

#set environment variables
ENV PORT=8080

# Run server
CMD ["python", "server/main.py"]