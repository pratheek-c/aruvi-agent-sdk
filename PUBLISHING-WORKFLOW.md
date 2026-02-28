# 📋 Complete NPM Publishing Workflow

## Visual Overview

```
┌─────────────────────────────────────────────────────────┐
│  1. Prepare Your Code                                   │
│  - Update package.json                                  │
│  - Create LICENSE, CHANGELOG.md, .npmignore             │
│  - Configure tsconfig.json for declarations             │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│  2. Build & Test Locally                                │
│  - npm run build                                        │
│  - npm run type-check                                   │
│  - Test import in another directory                     │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│  3. Setup NPM                                           │
│  - Create account on npmjs.com                          │
│  - Verify email                                         │
│  - npm login in terminal                                │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│  4. Publish                                             │
│  - npm publish --access public                          │
│  - Verify on npmjs.com                                  │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│  5. Share & Promote                                     │
│  - Add badge to README                                  │
│  - Share on Twitter, Dev.to, etc.                       │
│  - Users can now: npm install aruvi-agent-sdk           │
└─────────────────────────────────────────────────────────┘
```

---

## Detailed Checklist with Commands

### Phase 1: Preparation ✨

**1.1 - Update package.json**
```bash
# Verify your package.json has:
cat package.json | grep -E 'name|version|main|types|exports'
```

**1.2 - Create essential files**
```bash
# These should already exist:
ls LICENSE CHANGELOG.md .npmignore README.md
```

**1.3 - Verify TypeScript configuration**
```bash
# Check tsconfig.json has declaration enabled
grep -A 2 '"declaration"' tsconfig.json
```

### Phase 2: Build & Validate 🏗️

**2.1 - Install dependencies**
```bash
npm install
```

**2.2 - Build the project**
```bash
npm run build
```

**Expected output:**
```
✓ Compiled successfully
✓ dist/ folder created with .js and .d.ts files
```

**2.3 - Type check**
```bash
npm run type-check
```

**2.4 - Verify build output**
```bash
# Should see compiled files
ls -la dist/
ls dist/*.d.ts

# Expected structure:
# dist/
# ├── index.js
# ├── index.d.ts
# ├── core/
# │   ├── agent.js
# │   ├── agent.d.ts
# │   ├── types.js
# │   ├── types.d.ts
# │   └── ...
# ├── providers/
# └── runtime/
```

**2.5 - Local installation test (Optional)**
```bash
# Create test directory
mkdir -p /tmp/test-aruvi
cd /tmp/test-aruvi
npm init -y

# Install from local directory
npm install /path/to/aruvi-agent-sdk

# Test import
cat > test.mjs << 'EOF'
import { OpenAIProvider } from './node_modules/aruvi-agent-sdk/dist/index.js';
console.log('✓ Import works!');
EOF

node test.mjs
```

### Phase 3: NPM Account Setup 🔐

**3.1 - Create NPM account**
- Visit https://www.npmjs.com/signup
- Enter username, email, password
- Verify email

**3.2 - Create access token (Optional but recommended)**
- Go to https://www.npmjs.com/settings/tokens
- Create "Automation" token
- Copy the token

**3.3 - Login to npm**
```bash
npm login

# When prompted:
# Username: your-npm-username
# Password: your-npm-password
# Email: your-registered-email
# OTP (if 2FA enabled): 6-digit code from authenticator
```

**Verify login:**
```bash
npm whoami
# Should output your username
```

### Phase 4: Publishing 📦

**4.1 - Final checks before publishing**
```bash
# Check that package.json is valid
npm publish --dry-run

# This will show what will be published without actually publishing
```

**4.2 - Publish**
```bash
# Public package (everyone can install)
npm publish --access public

# Or private (requires paid npm)
npm publish --access private
```

**Expected output:**
```
npm notice 
npm notice 📦  aruvi-agent-sdk@1.0.0
npm notice === Tarball Contents === 
npm notice 123.4kB dist/index.js
npm notice 234.5kB dist/index.d.ts
npm notice ...
npm notice 
npm notice === Packed Files === 
npm notice [file count here]
npm notice === Tarball Details ===
npm notice ...
npm notice + aruvi-agent-sdk@1.0.0
```

**4.3 - Verify publication**
```bash
# Check npm registry
npm view aruvi-agent-sdk

# Or visit
curl https://registry.npmjs.org/aruvi-agent-sdk

# Or open browser
# https://www.npmjs.com/package/aruvi-agent-sdk
```

### Phase 5: Testing Installation 🧪

**5.1 - New directory test**
```bash
mkdir test-npm-install
cd test-npm-install
npm init -y

# Install your published package
npm install aruvi-agent-sdk
```

**5.2 - Verify it works**
```bash
cat > test.mjs << 'EOF'
import { 
  OpenAIProvider, 
  ClaudeProvider, 
  Agent 
} from 'aruvi-agent-sdk';

console.log('✓ Successfully imported from npm!');
console.log('- OpenAIProvider:', typeof OpenAIProvider);
console.log('- ClaudeProvider:', typeof ClaudeProvider);
console.log('- Agent:', typeof Agent);
EOF

node test.mjs
```

**Expected output:**
```
✓ Successfully imported from npm!
- OpenAIProvider: function
- ClaudeProvider: function
- Agent: function
```

### Phase 6: Update & Maintain 🔄

**6.1 - Update version**
```bash
# For patch release (bug fixes)
npm version patch
# Changes 1.0.0 → 1.0.1

# For minor release (new features)  
npm version minor
# Changes 1.0.0 → 1.1.0

# For major release (breaking changes)
npm version major
# Changes 1.0.0 → 2.0.0
```

**6.2 - Publish update**
```bash
npm publish --access public
```

**6.3 - Create git tags**
```bash
git tag v1.0.1
git push origin v1.0.1
```

---

## Automation Options

### Option A: Local Publishing (Simple)
```bash
# Just run these 3 commands
npm run build
npm login
npm publish --access public
```

### Option B: GitHub Actions (Advanced)
Create `.github/workflows/publish.yml`:

```yaml
name: Publish to NPM on Release

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Then:
1. Get token from https://www.npmjs.com/settings/tokens
2. Add to GitHub → Settings → Secrets as `NPM_TOKEN`
3. Create GitHub release, auto-publishes!

---

## Troubleshooting Matrix

| Symptom | Cause | Solution |
|---------|-------|----------|
| `npm ERR! 404 Not Found` | Package doesn't exist (first publish) | This is normal! Proceed with publish |
| `npm ERR! 403 Forbidden` | Not authenticated or permission denied | Run `npm login` or check token |
| `npm ERR! Package name already exists` | Name taken on npm | Use scoped name: `@your-username/pkg` |
| `Module not found` importing from npm | Missing type definitions | Ensure `tsconfig.json` has `declaration: true` |
| `publish --dry-run` shows empty files | .npmignore too restrictive | Update .npmignore or files in package.json |
| Old version still showing | NPM cache | Run `npm cache clean --force` |

---

## After Publishing

### Celebrate 🎉
- Your package is live!
- Users can install it
- Share on social media

### Promote 📢

Add to README:
```markdown
[![npm version](https://badge.fury.io/js/aruvi-agent-sdk.svg)](https://www.npmjs.com/package/aruvi-agent-sdk)
[![npm downloads](https://img.shields.io/npm/dm/aruvi-agent-sdk.svg)](https://www.npmjs.com/package/aruvi-agent-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
```

### Track 📊
- Monitor downloads: https://www.npmjs.com/package/aruvi-agent-sdk
- Handle issues promptly
- Keep CHANGELOG.md updated

---

## Quick Reference Commands

```bash
# Build
npm run build

# Type check
npm run type-check

# Login
npm login

# Publish
npm publish --access public

# Check what will be published
npm publish --dry-run

# View published package
npm view aruvi-agent-sdk

# Install published package
npm install aruvi-agent-sdk

# Update version
npm version patch | minor | major

# Create git tag
git tag v1.0.1
git push origin v1.0.1
```

---

## Success Checklist ✅

- [ ] `npm run build` succeeds
- [ ] `npm run type-check` succeeds
- [ ] `npm login` successful
- [ ] Package name is unique
- [ ] LICENSE file exists
- [ ] CHANGELOG.md exists
- [ ] README has proper instructions
- [ ] `npm publish --dry-run` looks good
- [ ] `npm publish` succeeds
- [ ] Package visible on npmjs.com
- [ ] Can install with `npm install aruvi-agent-sdk`
- [ ] Examples work after installation

---

**Now you're ready to share your amazing framework with the world! 🚀**
