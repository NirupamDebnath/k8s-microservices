# Use the official Node.js image as a base
FROM node:22-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy the application source code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["node", "index.js"]