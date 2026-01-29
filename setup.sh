#!/bin/bash

# MealMate Setup Script for macOS/Linux

echo ""
echo "========================================"
echo "  MealMate - Setup & Installation"
echo "========================================"
echo ""

echo "[1/3] Setting up Backend Server..."
cd server
echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install server dependencies"
    exit 1
fi
echo "✓ Server dependencies installed"
cd ..

echo ""
echo "[2/3] Setting up Frontend Client..."
cd client
echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install client dependencies"
    exit 1
fi
echo "✓ Client dependencies installed"
cd ..

echo ""
echo "[3/3] Creating .env file..."
if [ ! -f "server/.env" ]; then
    cp server/.env.example server/.env
    echo "✓ .env file created (UPDATE WITH YOUR SECRET KEY!)"
else
    echo "✓ .env file already exists"
fi

echo ""
echo "========================================"
echo "  Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo ""
echo "Terminal 1 - Start Backend:"
echo "  cd server"
echo "  npm run dev"
echo ""
echo "Terminal 2 - Start Frontend:"
echo "  cd client"
echo "  npm run dev"
echo ""
echo "Then visit: http://localhost:3000"
echo ""
echo "========================================"
