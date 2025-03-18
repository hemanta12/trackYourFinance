
# Use Node.js version 18 as the base image
FROM node:22.1.0

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app will run on.
# Since your .env file sets PORT=49684, we expose that port.
EXPOSE 49684

# Start the app
CMD ["node", "index.js"]

