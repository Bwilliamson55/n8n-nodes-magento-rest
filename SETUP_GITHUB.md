# GitHub Repository Setup Instructions

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `n8n-nodes-magento-rest`
3. Description: `An enhanced n8n community node for Magento REST API with searchCriteria support and additional features`
4. Visibility: **Public** (for community nodes) or **Private** (your choice)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 2: Add Remote and Push

After creating the repository, run these commands:

```bash
cd /home/bwilliamson/dev/n8n/n8n-nodes-magento-rest

# Add the remote (replace with your actual GitHub username if different)
git remote add origin https://github.com/Bwilliamson55/n8n-nodes-magento-rest.git

# Verify remote was added
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Verify

1. Check that the repository is visible at: https://github.com/Bwilliamson55/n8n-nodes-magento-rest
2. Verify all files are present
3. Check that README.md displays correctly

## Alternative: Using SSH

If you prefer SSH:

```bash
git remote add origin git@github.com:Bwilliamson55/n8n-nodes-magento-rest.git
git branch -M main
git push -u origin main
```

