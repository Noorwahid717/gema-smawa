#!/bin/bash

# 🔍 Script untuk verifikasi environment variables di Vercel
# Script ini akan memeriksa apakah semua environment variables yang diperlukan sudah di-set dengan benar

echo "========================================="
echo "🔍 VERCEL ENVIRONMENT VARIABLES CHECK"
echo "========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Required environment variables
REQUIRED_VARS=(
  "DATABASE_URL"
  "NEXTAUTH_URL"
  "NEXTAUTH_SECRET"
)

# Optional but recommended
OPTIONAL_VARS=(
  "NODE_ENV"
  "NEXT_PUBLIC_SITE_URL"
)

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not installed${NC}"
    echo ""
    echo "Install with:"
    echo "  npm install -g vercel"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Vercel CLI installed${NC}"
echo ""

# Check if logged in
echo "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Vercel${NC}"
    echo ""
    echo "Login with:"
    echo "  vercel login"
    echo ""
    exit 1
fi

VERCEL_USER=$(vercel whoami)
echo -e "${GREEN}✅ Logged in as: ${VERCEL_USER}${NC}"
echo ""

# Get environment variables from Vercel
echo "Fetching environment variables from Vercel..."
echo ""

# Function to check if a variable exists
check_var() {
    local var_name=$1
    local is_required=$2
    
    # Try to get the variable (this will prompt for project selection if needed)
    if vercel env ls | grep -q "^$var_name"; then
        echo -e "${GREEN}✅${NC} $var_name: ${GREEN}Set${NC}"
        
        # Get the environments where it's set
        local envs=$(vercel env ls | grep "^$var_name" | awk '{print $2}' | tr '\n' ', ' | sed 's/,$//')
        echo -e "   Environments: ${BLUE}${envs}${NC}"
        
        return 0
    else
        if [ "$is_required" = "true" ]; then
            echo -e "${RED}❌${NC} $var_name: ${RED}NOT SET${NC}"
            return 1
        else
            echo -e "${YELLOW}⚠️${NC}  $var_name: ${YELLOW}Not set (optional)${NC}"
            return 0
        fi
    fi
}

# Check required variables
echo "========================================="
echo "📋 REQUIRED ENVIRONMENT VARIABLES"
echo "========================================="
echo ""

MISSING_REQUIRED=0
for var in "${REQUIRED_VARS[@]}"; do
    if ! check_var "$var" "true"; then
        MISSING_REQUIRED=$((MISSING_REQUIRED + 1))
    fi
    echo ""
done

# Check optional variables
echo "========================================="
echo "📋 OPTIONAL ENVIRONMENT VARIABLES"
echo "========================================="
echo ""

for var in "${OPTIONAL_VARS[@]}"; do
    check_var "$var" "false"
    echo ""
done

# Summary
echo "========================================="
echo "📊 SUMMARY"
echo "========================================="
echo ""

if [ $MISSING_REQUIRED -gt 0 ]; then
    echo -e "${RED}❌ $MISSING_REQUIRED required variable(s) missing${NC}"
    echo ""
    echo "To add missing variables:"
    echo "  vercel env add <VARIABLE_NAME>"
    echo ""
    echo "Or add via Vercel Dashboard:"
    echo "  https://vercel.com/dashboard → Your Project → Settings → Environment Variables"
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ All required environment variables are set!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Verify variable values in Vercel Dashboard"
    echo "  2. Ensure NEXTAUTH_URL matches your production URL exactly"
    echo "  3. Ensure NEXTAUTH_SECRET is at least 32 characters"
    echo "  4. Deploy your changes"
    echo ""
fi

# Additional checks
echo "========================================="
echo "🔍 ADDITIONAL CHECKS"
echo "========================================="
echo ""

# Check NEXTAUTH_URL format (if we can access it)
echo "Verifying NEXTAUTH_URL format..."
NEXTAUTH_URL=$(vercel env pull --yes .env.production 2>/dev/null && grep "^NEXTAUTH_URL=" .env.production | cut -d'=' -f2 || echo "")

if [ -n "$NEXTAUTH_URL" ]; then
    if [[ $NEXTAUTH_URL == https://* ]]; then
        echo -e "${GREEN}✅${NC} NEXTAUTH_URL uses HTTPS"
    else
        echo -e "${RED}❌${NC} NEXTAUTH_URL should use HTTPS in production"
    fi
    
    if [[ $NEXTAUTH_URL != */ ]]; then
        echo -e "${GREEN}✅${NC} NEXTAUTH_URL has no trailing slash"
    else
        echo -e "${YELLOW}⚠️${NC}  NEXTAUTH_URL has trailing slash (remove it)"
    fi
    
    echo -e "   Value: ${BLUE}${NEXTAUTH_URL}${NC}"
else
    echo -e "${YELLOW}⚠️${NC}  Could not verify NEXTAUTH_URL format"
    echo "   Check manually in Vercel Dashboard"
fi

# Clean up
rm -f .env.production 2>/dev/null

echo ""
echo "========================================="
echo "✅ Environment check complete!"
echo "========================================="
