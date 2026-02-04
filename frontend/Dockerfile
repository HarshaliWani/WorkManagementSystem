# Use Node.js 20 as base
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all frontend code
COPY . .

# Build React for production
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start React app
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
