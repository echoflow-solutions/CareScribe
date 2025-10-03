#!/bin/bash

echo "🔐 CareScribe HTTPS Setup for Local Development"
echo "=============================================="
echo ""

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo "❌ mkcert is not installed."
    echo ""
    echo "Please install mkcert first:"
    echo "  macOS:    brew install mkcert"
    echo "  Linux:    Check https://github.com/FiloSottile/mkcert#installation"
    echo "  Windows:  Use chocolatey or scoop"
    echo ""
    exit 1
fi

echo "✅ mkcert is installed"
echo ""

# Install local CA
echo "📋 Installing local Certificate Authority..."
mkcert -install

# Create certificates directory
echo "📁 Creating certificates directory..."
mkdir -p certificates
cd certificates

# Get local IP address
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}')

if [ -z "$LOCAL_IP" ]; then
    # Fallback method
    LOCAL_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
fi

echo "🌐 Your local IP address: $LOCAL_IP"
echo ""

# Generate certificates
echo "🔑 Generating certificates for localhost and local network..."
mkcert localhost 127.0.0.1 ::1 $LOCAL_IP

echo ""
echo "✅ HTTPS setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update your package.json to use the custom server:"
echo '   "dev": "node server.js"'
echo "   OR"
echo '   "dev:https": "node server.js"'
echo ""
echo "2. Restart your development server"
echo ""
echo "3. Access your app via:"
echo "   https://localhost:3443"
echo "   https://127.0.0.1:3443"
echo "   https://$LOCAL_IP:3443"
echo ""
echo "🎤 Microphone access will now work on all these URLs!"