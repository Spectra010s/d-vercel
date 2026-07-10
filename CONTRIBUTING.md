# Contributing to d-vercel

Thank you for contributing to `d-vercel`! Here is how to get started:

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Make your changes in the `src/` directory.

3. Package/compile the action:

   ```bash
   npm run package
   ```

   _Note: Rollup will compile TypeScript and bundle everything into `dist/index.js`._

4. Format before committing:
   ```bash
   npm run format
   ```

## Pull Requests

Ensure that the compiled `dist/index.js` is updated and committed alongside your source files so the GitHub Action runner can execute your latest changes.
