#!/bin/bash

# Deploy Chorlton Bikes Website to GitHub Pages
# Repository: bemwilkins/chorlton-bikes-website

echo "🚴 Deploying Chorlton Bikes website to GitHub..."

# Step 1: Create repository on GitHub (you'll need to do this manually first)
echo ""
echo "📝 STEP 1: Create the repository on GitHub"
echo "   Go to: https://github.com/new"
echo "   Repository name: chorlton-bikes-website"
echo "   Description: Chorlton Bikes - Community Benefit Society website"
echo "   Visibility: Public (required for free GitHub Pages)"
echo "   DO NOT initialize with README, .gitignore, or license"
echo "   Click 'Create repository'"
echo ""
read -p "Press Enter once you've created the repository on GitHub..."

# Step 2: Add remote and push
echo ""
echo "📤 STEP 2: Pushing code to GitHub..."
git remote add origin https://github.com/bemwilkins/chorlton-bikes-website.git
git push -u origin main

echo ""
echo "✅ Code pushed successfully!"
echo ""
echo "🌐 STEP 3: Enable GitHub Pages"
echo "   1. Go to: https://github.com/bemwilkins/chorlton-bikes-website/settings/pages"
echo "   2. Under 'Source', select:"
echo "      - Branch: main"
echo "      - Folder: / (root)"
echo "   3. Click 'Save'"
echo ""
echo "⏳ Your site will be live at:"
echo "   https://bemwilkins.github.io/chorlton-bikes-website/"
echo ""
echo "   (It may take a few minutes to deploy)"
echo ""


