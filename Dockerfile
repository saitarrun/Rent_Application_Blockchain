# Use a single-stage build for simplicity and correctness
FROM node:20-alpine

WORKDIR /app

# Install pnpm and other necessary build tools
RUN apk add --no-cache python3 py3-setuptools make g++ git curl
RUN npm install -g pnpm

# Copy all project files
# This is less cache-efficient but ensures all files are present
COPY . .

# Install all dependencies using pnpm
# This respects the pnpm-lock.yaml file
RUN pnpm install

# Build the contracts and the frontend application
# This uses the 'build' script from the root package.json
RUN pnpm run build

# Copy the entrypoint script and make it executable
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Expose the frontend port
EXPOSE 3000

# Set environment variables for runtime
ENV NEXT_PUBLIC_NETWORK=local
ENV NODE_ENV=development

# Run the entrypoint script
CMD ["./entrypoint.sh"]
