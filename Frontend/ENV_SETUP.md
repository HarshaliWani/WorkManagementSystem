# Environment Variables Setup

## For Development
Create a `.env.local` file in the `Frontend/` directory:
```env
VITE_API_URL=http://localhost:8000/api
VITE_API_BASE_URL=http://localhost:8000
```

## For Production
Create a `.env.production` file in the `Frontend/` directory:
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_API_BASE_URL=https://api.yourdomain.com
```

**Important**: Replace `yourdomain.com` with your actual production domain.

## Notes
- Environment variables must be prefixed with `VITE_` to be accessible in Vite
- The `.env.production` file is used automatically during `npm run build`
- The `.env.local` file is used during development (`npm run dev`)
- Do not commit `.env.local` or `.env.production` to version control (they should be in `.gitignore`)

