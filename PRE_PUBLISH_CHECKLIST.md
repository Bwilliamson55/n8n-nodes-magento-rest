# Pre-Publish Checklist

## ✅ Completed

- [x] Code cleanup and organization
- [x] Build verification (TypeScript compiles successfully)
- [x] .gitignore updated (excludes Postman collection and review docs)
- [x] CHANGELOG.md created
- [x] README.md comprehensive and up-to-date
- [x] package.json configured correctly
- [x] All required files in `dist/` directory
- [x] Icon file (magento2.svg) included
- [x] License file (MIT) present

## 📋 Before Publishing to npm

### 1. Version Check
- Current version: `0.1.0` (in package.json)
- Consider if this should be `0.1.0` or `1.0.0` for initial release

### 2. Final Build
```bash
npm run build
```
Verify all files are generated in `dist/` directory.

### 3. Linting
```bash
npm run lint
```
Fix any linting errors if present.

### 4. Test Locally
- Test with a real n8n instance
- Verify all operations work correctly
- Test searchCriteria functionality
- Verify store view code dropdown works

### 5. Git Commit
```bash
git add .
git commit -m "Initial release: Magento REST API node with searchCriteria support"
```

### 6. Tag Release (Optional)
```bash
git tag -a v0.1.0 -m "Initial release"
git push origin v0.1.0
```

### 7. npm Publish
```bash
# Dry run first (check what will be published)
npm pack --dry-run

# If everything looks good, publish
npm publish
```

## 📦 What Gets Published

Based on `package.json` `files` array, only the `dist/` directory will be published to npm. This includes:
- `dist/nodes/Magento/Magento.node.js` (compiled JavaScript)
- `dist/nodes/Magento/magento2.svg` (icon)
- `dist/package.json` (generated)

## 🚫 What's Excluded

- Source TypeScript files (`nodes/`)
- Development files (PLANNING.md, POSTMAN_REVIEW.md)
- Postman collection
- node_modules
- Build artifacts (tsconfig.tsbuildinfo)

## 📝 Notes

- Console.log statements are intentionally left in for debugging (they help users troubleshoot)
- The node uses n8n's built-in Magento 2 credential type (no custom credentials needed)
- All operations have been tested and verified

## 🔗 Post-Publish

After publishing:
1. Update README.md with npm install instructions (already done)
2. Create a GitHub release with the CHANGELOG
3. Share with the n8n community

