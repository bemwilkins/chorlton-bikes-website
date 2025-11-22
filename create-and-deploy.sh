#!/bin/bash

# Create GitHub repository and deploy Chorlton Bikes website
# This script will create the repo via GitHub API if you have a token

REPO_NAME="chorlton-bikes-website"
GITHUB_USER="bemwilkins"
REPO_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}"

echo "🚴 Setting up Chorlton Bikes website on GitHub..."
echo ""

# Check if repo already exists
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Repository already exists!"
else
    echo "📦 Repository doesn't exist yet. Creating it..."
    echo ""
    echo "To create the repository automatically, you need a GitHub Personal Access Token."
    echo ""
    echo "Option 1: Create manually (easiest)"
    echo "   1. Go to: https://github.com/new"
    echo "   2. Repository name: ${REPO_NAME}"
    echo "   3. Description: Chorlton Bikes - Community Benefit Society website"
    echo "   4. Visibility: Public"
    echo "   5. DO NOT check any initialization options"
    echo "   6. Click 'Create repository'"
    echo ""
    echo "Option 2: Create via API (requires token)"
    echo "   If you have a GitHub Personal Access Token, set it as:"
    echo "   export GITHUB_TOKEN=your_token_here"
    echo ""
    read -p "Press Enter once the repository is created (or if you want to use API with token)..."
    
    # Try to create via API if token is set
    if [ -n "$GITHUB_TOKEN" ]; then
        echo "Creating repository via API..."
        RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Authorization: token ${GITHUB_TOKEN}" \
            -H "Accept: application/vnd.github.v3+json" \
            "https://api.github.com/user/repos" \
            -d "{\"name\":\"${REPO_NAME}\",\"description\":\"Chorlton Bikes - Community Benefit Society website\",\"public\":true}")
        
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        
        if [ "$HTTP_CODE" = "201" ]; then
            echo "✅ Repository created successfully!"
        else
            echo "❌ Failed to create repository. Error:"
            echo "$RESPONSE" | head -n-1
            echo ""
            echo "Please create it manually at: https://github.com/new"
            exit 1
        fi
    fi
fi

# Wait a moment for GitHub to process
sleep 2

# Add remote (remove if exists first)
git remote remove origin 2>/dev/null
git remote add origin "${REPO_URL}.git"

echo ""
echo "📤 Pushing code to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Code pushed successfully!"
    echo ""
    echo "🌐 Final step: Enable GitHub Pages"
    echo "   1. Go to: ${REPO_URL}/settings/pages"
    echo "   2. Under 'Source', select:"
    echo "      - Branch: main"
    echo "      - Folder: / (root)"
    echo "   3. Click 'Save'"
    echo ""
    echo "⏳ Your site will be live at:"
    echo "   https://${GITHUB_USER}.github.io/${REPO_NAME}/"
    echo ""
    echo "   (It may take 1-2 minutes to deploy)"
else
    echo ""
    echo "❌ Failed to push. Please check:"
    echo "   1. Repository exists at: ${REPO_URL}"
    echo "   2. You have push access"
    echo "   3. Your git credentials are set up"
fi


