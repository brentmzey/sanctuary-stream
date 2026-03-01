#!/bin/bash
# Create PocketBase admin automatically

PB_URL="http://127.0.0.1:8090"
ADMIN_EMAIL="admin@sanctuary.local"
ADMIN_PASS="sanctuary123456"

echo "🔐 Creating PocketBase admin..."

# Wait for PocketBase to be ready
for i in {1..30}; do
    if curl -s "$PB_URL/api/health" > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

# Check if admin exists
ADMIN_EXISTS=$(curl -s "$PB_URL/api/admins" 2>&1 | grep -o "requires valid admin authentication" || echo "")

if [ -z "$ADMIN_EXISTS" ]; then
    echo "⚠️  Admin might already exist"
else
    echo "Creating admin account..."
    curl -s -X POST "$PB_URL/api/admins" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$ADMIN_EMAIL\",
            \"password\": \"$ADMIN_PASS\",
            \"passwordConfirm\": \"$ADMIN_PASS\"
        }" > /dev/null 2>&1
fi

echo "✅ Admin ready: $ADMIN_EMAIL / $ADMIN_PASS"
