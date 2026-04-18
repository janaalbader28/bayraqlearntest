#!/bin/bash

# Bayraq Cyber Academy - Linux Deployment Automator
# Version: 1.0.0
# Target OS: Ubuntu 22.04+ / Debian 11+

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}------------------------------------------------------------${NC}"
echo -e "${CYAN}   BAYRAQ CYBER ACADEMY // LINUX DEPLOYMENT INITIALIZING    ${NC}"
echo -e "${CYAN}------------------------------------------------------------${NC}"

# 1. Check Prerequisites
echo -e "\n[1/6] Checking system prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: node is not installed.${NC}"
    echo "Please install Node.js v18+ (e.g., via nvm or nodesource)"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js found: $NODE_VERSION${NC}"

# 2. Install Dependencies
echo -e "\n[2/6] Installing tactical dependencies..."
npm install

# 3. Environment Configuration
echo -e "\n[3/6] Configuring operational environment..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env from .env.example${NC}"
        echo -e "${RED}ACTION REQUIRED: Please edit .env with your production database credentials.${NC}"
    else
        echo -e "DATABASE_URL=\"mysql://root:password@localhost:3306/bayraq_cyber_academy\"" > .env
        echo -e "JWT_SECRET=\"$(openssl rand -base64 32)\"" >> .env
        echo -e "${GREEN}✓ Generated fresh .env file.${NC}"
    fi
else
    echo -e "${GREEN}✓ Existing .env detected.${NC}"
fi

# 4. Database Synchronization (Prisma)
echo -e "\n[4/6] Synchronizing ORM with Mainframe..."
npx prisma generate
# Optional: npx prisma db push (if you want to sync schema to empty DB)

# 5. Production Build
echo -e "\n[5/6] Optimizing binary assets (Building Next.js)..."
npm run build

# 6. Finalization
echo -e "\n[6/6] Tactical Deployment Complete."
echo -e "${CYAN}------------------------------------------------------------${NC}"
echo -e "${GREEN}SUCCESS: Bayraq Cyber Academy is ready for operation.${NC}"
echo -e "\nTo start the platform in production mode:"
echo -e "${CYAN}npm run start${NC}"
echo -e "\nTo run in background (requires pm2):"
echo -e "${CYAN}pm2 start npm --name \"bayraq-academy\" -- start${NC}"
echo -e "${CYAN}------------------------------------------------------------${NC}"
