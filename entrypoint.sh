#!/bin/sh
# Exit immediately if a command exits with a non-zero status.
set -e

# Poll Ganache until it's ready to respond to RPC requests
echo "--- Waiting for Ganache to be ready..."
until curl --silent --fail -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' http://ganache:8545 > /dev/null 2>&1; do
    echo "Ganache not ready, sleeping..."
    sleep 1
done
echo "--- Ganache is ready!"

# Run the local deployment script to generate contract addresses
echo "--- Deploying contracts to local Ganache..."
echo "GANACHE_RPC=${GANACHE_RPC:-unset}"
pnpm run deploy:local

# Export a consolidated frontend config (addresses + ABIs)
echo "--- Exporting frontend contracts config..."
pnpm run export:frontend-config || true

# Start the frontend application
echo "--- Starting frontend application..."
exec pnpm --prefix frontend run dev
