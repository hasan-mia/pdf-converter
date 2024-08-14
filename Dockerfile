# Use a small base image
FROM node:18-slim

# Set the working directory
WORKDIR /app

# Copy the package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the application code
COPY ./src ./src

# Run the application
CMD ["npm", "start"]
