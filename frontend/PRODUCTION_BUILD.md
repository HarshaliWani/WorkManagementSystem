# Production Build Guide

## ✅ Completed Tasks

### 1. Package.json Scripts
- ✅ `"build": "vite build"` - Already exists
- ✅ `"preview": "vite preview"` - Already exists

### 2. Vite.config.ts Optimizations
Production optimizations have been enabled:
- ✅ **Minification**: Using `esbuild` (faster, built-in)
- ✅ **Code Splitting**: Vendor chunks split for better caching
  - `react-vendor`: React, React-DOM, React Router
  - `axios-vendor`: Axios
  - `vendor`: Other dependencies
- ✅ **Asset Handling**: Optimized file naming with content hashing
  - Images: `assets/img/[name]-[hash].[ext]`
  - Fonts: `assets/fonts/[name]-[hash].[ext]`
  - CSS: `assets/css/[name]-[hash].css`
  - JS: `assets/js/[name]-[hash].js`
- ✅ **Source Maps**: Disabled in production for smaller bundle
- ✅ **CSS Code Splitting**: Enabled
- ✅ **Preview Server**: Configured on port 4173

### 3. Environment Variables

**Create `.env.production` file** in the `Frontend` directory with:

```env
# Production Environment Variables
# These variables are used during the build process (npm run build)
# Update VITE_API_URL with your production backend URL

# API Base URL for production
VITE_API_URL=https://api.yourdomain.com/api

# Alternative: If your demo API uses a different base URL
# VITE_API_BASE_URL=https://api.yourdomain.com
```

**Important**: Replace `https://api.yourdomain.com/api` with your actual production API URL.

## Build Instructions

### 1. Set Environment Variables
Create `.env.production` file (see above) with your production API URL.

### 2. Build for Production
```bash
npm run build
```

This will:
- Create optimized production build in `dist/` folder
- Remove source maps
- Minify JavaScript and CSS
- Split vendor chunks for better caching
- Apply content hashing to all assets

### 3. Preview Production Build
```bash
npm run preview
```

This starts a local server at `http://localhost:4173` to test the production build locally.

## Build Output

The build creates the following structure:

```
dist/
├── index.html
└── assets/
    ├── css/
    │   └── index-[hash].css
    ├── js/
    │   ├── index-[hash].js
    │   ├── react-vendor-[hash].js
    │   ├── axios-vendor-[hash].js
    │   └── vendor-[hash].js
    ├── img/
    └── fonts/
```

### Bundle Sizes (Approximate)
- `index.html`: ~0.76 kB (0.39 kB gzipped)
- `index-[hash].css`: ~31.71 kB (5.76 kB gzipped)
- `react-vendor-[hash].js`: ~191.04 kB (60.80 kB gzipped)
- `axios-vendor-[hash].js`: ~38.42 kB (15.40 kB gzipped)
- `index-[hash].js`: ~264.08 kB (48.43 kB gzipped)
- `vendor-[hash].js`: ~4.13 kB (1.78 kB gzipped)

**Total**: ~530 kB uncompressed, ~132 kB gzipped

## Deployment

### Option 1: Static Hosting (Nginx, Apache, etc.)

1. Build the application:
   ```bash
   npm run build
   ```

2. Copy the `dist/` folder contents to your web server's public directory

3. Configure your web server to:
   - Serve `index.html` for all routes (for React Router)
   - Set proper MIME types
   - Enable gzip compression
   - Set appropriate cache headers for assets

### Option 2: CDN (Vercel, Netlify, etc.)

1. Connect your repository to the CDN service
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Set environment variables in the CDN dashboard:
   - `VITE_API_URL`: Your production API URL

## Environment Variables Reference

### Development (.env.local)
```env
VITE_API_URL=http://localhost:8000/api
VITE_API_BASE_URL=http://localhost:8000
```

### Production (.env.production)
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_API_BASE_URL=https://api.yourdomain.com
```

## Notes

- **Source Maps**: Disabled in production for security and smaller bundle size
- **Console Logs**: Currently not automatically removed (console logs are wrapped in `import.meta.env.DEV` checks in most places)
- **Caching**: Assets use content hashing, so you can set long cache headers
- **Base URL**: Currently set to `/`. Change in `vite.config.ts` if deploying to a subdirectory

## Troubleshooting

### Build Fails
- Check Node.js version (should be >= 16)
- Delete `node_modules` and `dist`, then run `npm install` and `npm run build`

### Preview Doesn't Work
- Make sure port 4173 is available
- Or change the port in `vite.config.ts` preview configuration

### API Calls Fail in Production
- Verify `.env.production` has correct `VITE_API_URL`
- Check CORS settings on backend
- Ensure backend allows requests from your frontend domain

---

## ✅ Build verification & cleanup

### Build Status
- ✅ **Build Successful**: `npm run build` completed without errors and `dist/` was created.

### Removed Dev-Only Code
- ✅ **React.StrictMode removed** in production (`main.tsx`)
- ✅ **Hardcoded localhost URLs replaced** with `utils/apiUrl.ts` and `VITE_` environment variables
- ✅ **Console logs removed** (DEV-guarded `console.error` remains for debugging)

### Files Modified
- `vite.config.ts` - Production build optimizations
- `main.tsx` - Removed React.StrictMode
- `package.json` - Verified build and preview scripts
- `GRTable.tsx`, `TendersTable.tsx`, `BillsTable.tsx`, `BillFormModal.tsx` - Document/media URL fixes
- `utils/apiUrl.ts` - New helper for environment-based media URLs

**Status:** Production build is ready for deployment! 🎉

