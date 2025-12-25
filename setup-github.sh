#!/bin/bash

# Setup script for GitHub repository
# Run this after creating the repository on GitHub

REPO_URL="https://github.com/Bwilliamson55/n8n-nodes-magento-rest.git"

echo "Setting up GitHub repository for n8n-nodes-magento-rest..."
echo ""

# Initialize git if not already done
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
fi

# Add all files
echo "Adding files to git..."
git add .

# Check if we have a commit
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
    echo "Creating initial commit..."
    git commit -m "Initial commit: Project setup for n8n-nodes-magento-rest

- Set up project structure based on Meilisearch node
- Create package.json with n8n-nodes-magento-rest name
- Add TypeScript, ESLint, and Prettier configuration
- Create PLANNING.md with development roadmap
- Create README.md with documentation
- Set up .gitignore and license"
fi

# Check if remote already exists
if git remote | grep -q "^origin$"; then
    echo "Remote 'origin' already exists. Updating URL..."
    git remote set-url origin "$REPO_URL"
else
    echo "Adding remote repository..."
    git remote add origin "$REPO_URL"
fi

# Set default branch to main
git branch -M main

echo ""
echo "✅ Repository setup complete!"
echo ""
echo "Next steps:"
echo "1. Create the repository on GitHub: https://github.com/new"
echo "   - Name: n8n-nodes-magento-rest"
echo "   - Description: An enhanced n8n community node for Magento REST API with searchCriteria support"
echo "   - DO NOT initialize with README, .gitignore, or license"
echo ""
echo "2. Push to GitHub:"
echo "   git push -u origin main"
echo ""

