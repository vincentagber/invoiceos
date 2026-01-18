#!/bin/bash

# Configuration
BACKEND_HOST="127.0.0.1"
BACKEND_PORT="8000"
BACKEND_URL="http://$BACKEND_HOST:$BACKEND_PORT"
FRONTEND_PORT="3000"
FRONTEND_URL="http://localhost:$FRONTEND_PORT"

echo "=== SuperlinkInvoice Verification Script ==="

# 1. Start Backend
echo "--> Starting Backend (PHP)..."
# Check if port 8000 is already in use
if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "    Port $BACKEND_PORT is already in use. Assuming Backend is running."
else
    cd backend
    php -S $BACKEND_HOST:$BACKEND_PORT > /dev/null 2>&1 &
    BACKEND_PID=$!
    echo "    Backend started with PID $BACKEND_PID"
    cd ..
    # Give it a moment to initialize
    sleep 2
fi

# 2. Check Backend Health
echo "--> Verifying Backend connectivity..."
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" $BACKEND_URL)
if [ "$HTTP_STATUS" == "200" ]; then
    echo "    [SUCCESS] Backend is up and returning 200 OK."
else
    echo "    [FAILURE] Backend returned status $HTTP_STATUS. Expected 200."
    # If we started it, kill it
    if [ ! -z "$BACKEND_PID" ]; then kill $BACKEND_PID; fi
    exit 1
fi

# 3. Build and Verify Frontend
echo "--> Building Frontend..."
cd frontend
# We use 'next build' which is standard
if npm run build; then
    echo "    [SUCCESS] Frontend build completed."
else
    echo "    [FAILURE] Frontend build failed."
    if [ ! -z "$BACKEND_PID" ]; then kill $BACKEND_PID; fi
    exit 1
fi

# 4. Start Frontend
echo "--> Starting Frontend..."
# Check if port 3000 is already in use
if lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "    Port $FRONTEND_PORT is already in use. Assuming Frontend is running."
else
    # Start nextjs in production mode
    nohup npm run start > /dev/null 2>&1 &
    FRONTEND_PID=$!
    echo "    Frontend started with PID $FRONTEND_PID"
    sleep 5
fi

# 5. Check Frontend Health
echo "--> Verifying Frontend connectivity..."
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" $FRONTEND_URL)
if [ "$HTTP_STATUS" == "200" ]; then
    echo "    [SUCCESS] Frontend is up and returning 200 OK."
else
    echo "    [FAILURE] Frontend returned status $HTTP_STATUS. Expected 200."
    if [ ! -z "$FRONTEND_PID" ]; then kill $FRONTEND_PID; fi
    if [ ! -z "$BACKEND_PID" ]; then kill $BACKEND_PID; fi
    exit 1
fi

echo "=== Verification Completed Successfully ==="
echo "App is running at: $FRONTEND_URL"
echo "API is running at: $BACKEND_URL"

# Optional: Cleanup if this was just a transient check
# echo "Cleaning up..."
# if [ ! -z "$FRONTEND_PID" ]; then kill $FRONTEND_PID; fi
# if [ ! -z "$BACKEND_PID" ]; then kill $BACKEND_PID; fi
