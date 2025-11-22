#!/bin/bash
# VM-Optimized Development Setup for PTE Application
# This script optimizes the development environment for virtual machines

echo "🚀 Setting up PTE development environment for virtual machine..."

# Set memory limits for Node.js
export NODE_OPTIONS="--max-old-space-size=2048"

# Configure pnpm for VM optimization
echo "⚙️ Configuring pnpm for VM performance..."
pnpm config set store-dir .pnpm-store
pnpm config set prefer-offline true
pnpm config set child-concurrency 3
pnpm config set network-timeout 60000

# Clean any existing cache
echo "🧹 Cleaning existing cache..."
rm -rf .next .turbo .swc node_modules/.cache pnpm-store

# Install dependencies with VM optimizations
echo "📦 Installing dependencies with VM optimizations..."
pnpm install --prefer-offline --child-concurrency 3

# Create optimized build
echo "🔨 Building with VM optimizations..."
NODE_OPTIONS="--max-old-space-size=4096" pnpm build

echo "✅ VM-optimized setup complete!"
echo ""
echo "🎯 Available commands:"
echo "  pnpm vm:dev     - Start development server with VM optimizations"
echo "  pnpm dev:vm     - Alternative dev command with memory limits"
echo "  pnpm build:vm   - Build with increased memory for VM"
echo "  pnpm fresh:vm   - Clean restart optimized for VM"
echo ""
echo "🌐 Access your application at: http://localhost:3000"
echo "🗄️  Database Studio at: https://local.drizzle.studio"