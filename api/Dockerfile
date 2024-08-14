# Use Node.js base image
FROM node:18

# Set the working directory to /app
WORKDIR /usr/src/app

# Copy dependency files to /app
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy project files to /app
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Expose the port used by the application (if applicable)
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start:prod"]