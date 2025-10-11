#!/bin/bash

# Add the modified package.json file
git add package.json

# Commit with a descriptive message
git commit -m "Fix: Separate Prisma client generation from database operations for Vercel deployment"

# Push to the remote repository (assuming 'main' branch)
git push origin main

echo "Changes committed and pushed successfully!"
