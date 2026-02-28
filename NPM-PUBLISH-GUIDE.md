# 📦 Publishing Aruvi to NPM - Complete Guide

## Step 1: Prepare package.json

Your package.json needs proper metadata and configuration. Here's the complete setup:

```json
{
  "name": "@your-username/aruvi",
  "version": "1.0.0",
  "description": "🧠 Generic Multi-Provider AI Agent Framework - No SDK dependencies, Raw HTTP only",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./agents": {
      "import": "./dist/core/agent.js",
      "types": "./dist/core/agent.d.ts"
    },
    "./types": {
      "import": "./dist/core/types.js",
      "types": "./dist/core/types.d.ts"
    },
    "./llm": {
      "import": "./dist/core/llm.js",
      "types": "./dist/core/llm.d.ts"
    },
    "./providers": {
      "import": "./dist/providers/index.js",
      "types": "./dist/providers/index.d.ts"
    },
    "./providers/openai": {
      "import": "./dist/providers/openai.provider.js",
      "types": "./dist/providers/openai.provider.d.ts"
    },
    "./providers/claude": {
      "import": "./dist/providers/claude.provider.js",
      "types": "./dist/providers/claude.provider.d.ts"
    },
    "./providers/azure": {
      "import": "./dist/providers/azure.provider.js",
      "types": "./dist/providers/azure.provider.d.ts"
    },
    "./providers/ollama": {
      "import": "./dist/providers/ollama.provider.js",
      "types": "./dist/providers/ollama.provider.d.ts"
    },
    "./providers/openrouter": {
      "import": "./dist/providers/openrouter.provider.js",
      "types": "./dist/providers/openrouter.provider.d.ts"
    },
    "./providers/mimo": {
      "import": "./dist/providers/mimo.provider.js",
      "types": "./dist/providers/mimo.provider.d.ts"
    },
    "./runtime": {
      "import": "./dist/runtime/multi-agent-runtime.js",
      "types": "./dist/runtime/multi-agent-runtime.d.ts"
    }
  },
  "keywords": [
    "ai",
    "agent",
    "llm",
    "openai",
    "claude",
    "anthropic",
    "azure",
    "ollama",
    "openrouter",
    "streaming",
    "agent-framework",
    "tool-calling",
    "multi-agent"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/aruvi-agent-sdk.git"
  },
  "homepage": "https://github.com/your-username/aruvi-agent-sdk#readme",
  "bugs": {
    "url": "https://github.com/your-username/aruvi-agent-sdk/issues"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "dev": "bun run --hot src/index.ts",
    "build": "tsc",
    "lint": "eslint src --ext .ts",
    "type-check": "tsc --noEmit",
    "prepare": "npm run build",
    "prepublishOnly": "npm run build && npm run type-check",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ],
  "dependencies": {
    "hono": "^4.12.2"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5.3.0"
  }
}
```

---

## Step 2: TypeScript Configuration

Ensure your `tsconfig.json` is properly configured:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": true,
    "noEmit": false,
    "importHelpers": true,
    "importsNotUsedAsVars": "error",
    "downlevelIteration": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "examples"]
}
```

---

## Step 3: Create Essential Files

### .npmignore
```
src/
examples/
.env
.env.example
*.md
!README.md
tsconfig.json
.github/
.gitignore
node_modules/
```

### README.md (SEO Optimized)
Already created, ensure it describes features clearly.

### LICENSE
```
MIT License

Copyright (c) 2026 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### CHANGELOG.md
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-27

### Added
- Initial release of Aruvi Agent SDK
- Support for OpenAI, Claude, Azure, Ollama, OpenRouter, and Mimo providers
- Streaming support for all providers
- Agent framework with tool calling
- Multi-agent runtime with Hono adapter
- Complete TypeScript support
- Comprehensive examples and documentation

### Features
- Provider-agnostic architecture
- No external SDK dependencies
- Raw HTTP with fetch API
- Real-time streaming
- Tool calling system
- Multi-agent routing
```

---

## Step 4: Build Instructions

### Build the Package

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Type check
npm run type-check

# Verify dist folder is created with compiled files
ls dist/
```

---

## Step 5: Create NPM Account

```bash
# Create account at https://www.npmjs.com
# Verify email

# Login from terminal
npm login

# Enter your NPM credentials when prompted
```

---

## Step 6: Publish to NPM

### First Time Publishing

```bash
# Verify your package.json has unique name
npm view @your-username/aruvi

# Publish
npm publish --access public

# If you want it private (requires paid NPM plan):
# npm publish --access private
```

### Update Version & Publish Again

Follow [Semantic Versioning](https://semver.org/):

```bash
# Patch release (bug fixes): 1.0.0 → 1.0.1
npm version patch
npm publish

# Minor release (new features): 1.0.0 → 1.1.0
npm version minor
npm publish

# Major release (breaking changes): 1.0.0 → 2.0.0
npm version major
npm publish
```

---

## Step 7: Verify Publication

### Check on npm.js
```
https://www.npmjs.com/package/@your-username/aruvi
```

### Test Installation
```bash
# Create a test directory
mkdir test-aruvi
cd test-aruvi
npm init -y

# Install your package
npm install @your-username/aruvi

# Test it
cat > test.mjs << 'EOF'
import { OpenAIProvider } from '@your-username/aruvi';

console.log('✓ Successfully imported from npm!');
EOF

node test.mjs
```

---

## Step 8: User Installation

Your users can now install with:

```bash
npm install @your-username/aruvi
# or
bun add @your-username/aruvi
```

And use it:

```typescript
import { OpenAIProvider, Agent } from '@your-username/aruvi';
import type { Tool } from '@your-username/aruvi';

const provider = new OpenAIProvider(apiKey, model);
const agent = new Agent(provider, config);
```

---

## Complete Checklist

- [ ] Update `package.json` with proper metadata
- [ ] Ensure `tsconfig.json` exports declaration files (`declaration: true`)
- [ ] Create `.npmignore` file
- [ ] Create `LICENSE` file (MIT recommended)
- [ ] Create `CHANGELOG.md` file
- [ ] Run `npm run build` and verify `dist/` folder
- [ ] Run `npm run type-check` to verify TypeScript
- [ ] Test locally: `npm install .` in another directory
- [ ] Create npm account at https://www.npmjs.com
- [ ] Run `npm login` in terminal
- [ ] Run `npm publish --access public`
- [ ] Verify package on npmjs.com
- [ ] Test installation: `npm install @your-username/aruvi`

---

## Optional Enhancements

### GitHub Actions for Auto-Publish
Create `.github/workflows/publish.yml`:

```yaml
name: Publish to NPM

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - run: npm install
      - run: npm run build
      - run: npm run type-check
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

To use this:
1. Get your NPM token from https://www.npmjs.com/settings/tokens
2. Add it to GitHub secrets as `NPM_TOKEN`
3. Create git tag: `git tag v1.0.0`
4. Push: `git push origin v1.0.0`
5. Automatically publishes to npm!

### README Badges

```markdown
# 🧠 Aruvi Agent SDK

[![npm version](https://badge.fury.io/js/@your-username/aruvi.svg)](https://www.npmjs.com/package/@your-username/aruvi)
[![downloads](https://img.shields.io/npm/dm/@your-username/aruvi.svg)](https://www.npmjs.com/package/@your-username/aruvi)
[![license](https://img.shields.io/npm/l/@your-username/aruvi.svg)](LICENSE)
```

---

## Troubleshooting

### "Package name exists"
Choose a unique scoped name: `@your-username/aruvi`

### "Missing declaration files"
Ensure `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true
  }
}
```

### "Files not included in package"
Update `files` in `package.json`:
```json
{
  "files": [
    "dist",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ]
}
```

### Authentication issues
```bash
# Clear npm cache
npm cache clean --force

# Re-login
npm logout
npm login
```

---

## Next Steps

1. ✅ Update package.json
2. ✅ Build locally
3. ✅ Create npm account
4. ✅ Publish
5. 📢 Share on Twitter, GitHub, Product Hunt, etc.
6. 📚 Create getting started guide
7. 🐛 Set up issue tracking
8. 🔄 Plan future versions

---

## Resources

- NPM Publishing Guide: https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry
- Semantic Versioning: https://semver.org/
- Keep a Changelog: https://keepachangelog.com/
- License Info: https://choosealicense.com/

Happy publishing! 🚀
