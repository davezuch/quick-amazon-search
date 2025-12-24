# Quick Amazon Search

A Chromium browser extension (Chrome, Brave, Edge, etc.) that provides quick Amazon search with autocomplete.

## Tech Stack

- **TypeScript** - Type-safe development
- **React** - UI framework
- **Vite** - Fast build tool
- **CRXJS** - Chrome extension plugin for Vite

## Development

This project uses Nix for reproducible development environments.

```bash
# Enter the development environment (with direnv)
direnv allow

# Start development server
npm run dev

# Build for production
npm run build
```

## Loading the Extension

1. Run `npm run dev` to build the extension
2. Open Brave/Chrome and navigate to `brave://extensions` or `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist` folder from this project

## Project Structure

- `src/` - Source code
- `manifest.json` - Extension manifest
- `dist/` - Built extension (generated)
