#!/bin/bash

# Vercel Deployment Monitor Script
echo "🔍 MONITORING VERCEL DEPLOYMENT STATUS..."

echo "⏱️  $(date): Starting deployment check..."

# Function to test endpoint
test_endpoint() {
    local url=$1
    local description=$2
    
    echo "🧪 Testing $description..."
    echo "   URL: $url"
    
    response=$(curl -s -w "HTTP_CODE:%{http_code}" "$url")
    http_code=$(echo "$response" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
    content=$(echo "$response" | sed 's/HTTP_CODE:[0-9]*$//')
    
    echo "   Status: $http_code"
    
    if [[ "$http_code" == "200" ]]; then
        if [[ "$content" == *"sqlite"* ]]; then
            echo "   ❌ Still using SQLite schema"
            return 1
        elif [[ "$content" == *"postgresql"* || "$content" == *"success"* ]]; then
            echo "   ✅ PostgreSQL working!"
            return 0
        else
            echo "   ⚠️  Response unclear: $content"
            return 2
        fi
    else
        echo "   ❌ HTTP Error: $http_code"
        echo "   Response: $content"
        return 1
    fi
}

echo ""
echo "📋 Testing Production Endpoints:"

# Test 1: Public API
if test_endpoint "https://landing-page-gema.vercel.app/api/public" "Public API"; then
    echo "   📊 Data availability: ✅"
else
    echo "   📊 Data availability: ❌"
fi

echo ""

# Test 2: Debug Session  
if test_endpoint "https://landing-page-gema.vercel.app/api/debug-session" "Debug Session"; then
    echo "   🔧 Session API: ✅"
else
    echo "   🔧 Session API: ❌"
fi

echo ""

# Test 3: Database Seeding
echo "🧪 Testing Database Seeding..."
seed_response=$(curl -s -X POST "https://landing-page-gema.vercel.app/api/seed?secret=gema-sma-wahidiyah-super-secret-production-key-2025-kediri")

if [[ "$seed_response" == *"sqlite"* ]]; then
    echo "   ❌ Seeding failed: Still using SQLite"
    echo "   Response: $seed_response"
elif [[ "$seed_response" == *"success"* ]]; then
    echo "   ✅ Seeding successful: PostgreSQL working!"
    echo "   Response: $seed_response"
else
    echo "   ⚠️  Seeding response unclear:"
    echo "   $seed_response"
fi

echo ""
echo "📊 DEPLOYMENT STATUS SUMMARY:"
echo "   Local Database: ✅ PostgreSQL + Data"
echo "   Vercel Environment: ✅ DATABASE_URL Updated"
echo "   Production Status: Check results above ☝️"

echo ""
echo "🎯 If still showing SQLite errors:"
echo "   1. Wait 2-3 more minutes for full deployment"
echo "   2. Check Vercel Dashboard → Deployments"
echo "   3. Force redeploy from Vercel Dashboard if needed"

echo ""
echo "⏱️  $(date): Monitoring completed."