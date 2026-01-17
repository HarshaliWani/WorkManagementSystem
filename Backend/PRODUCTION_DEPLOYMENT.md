# Production Deployment Guide

## Environment Variables Required

Create a `.env` file in `Backend/management_system/` with the following variables:

```env
# Required - Django Secret Key (generate a strong random key)
SECRET_KEY=your-very-long-random-secret-key-here-minimum-50-characters

# Required - Set to False in production
DEBUG=False

# Required - Comma-separated list of allowed hosts
ALLOWED_HOSTS=yourdomain.com,.yourdomain.com,localhost

# Database Configuration
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432

# Optional - SSL Redirect (defaults to True when DEBUG=False)
SECURE_SSL_REDIRECT=True

# Email Configuration (optional)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
ADMIN_APPROVAL_EMAIL=admin@yourdomain.com
BACKEND_DOMAIN=https://api.yourdomain.com
```

## Security Settings Applied

When `DEBUG=False`, the following security settings are automatically enabled:

- ✅ `SECURE_SSL_REDIRECT = True` - Redirects HTTP to HTTPS
- ✅ `SESSION_COOKIE_SECURE = True` - Session cookies only over HTTPS
- ✅ `CSRF_COOKIE_SECURE = True` - CSRF cookies only over HTTPS
- ✅ `SECURE_BROWSER_XSS_FILTER = True` - XSS protection
- ✅ `SECURE_CONTENT_TYPE_NOSNIFF = True` - Prevents MIME sniffing
- ✅ `X_FRAME_OPTIONS = 'DENY'` - Prevents clickjacking
- ✅ `SECURE_HSTS_SECONDS = 31536000` - HSTS for 1 year
- ✅ `SECURE_HSTS_INCLUDE_SUBDOMAINS = True` - HSTS for subdomains
- ✅ `SECURE_HSTS_PRELOAD = True` - HSTS preload

## Static and Media Files

- **STATIC_ROOT**: `Backend/management_system/staticfiles/`
- **MEDIA_ROOT**: `Backend/management_system/media/`

### Collecting Static Files

Before deployment, run:
```bash
python manage.py collectstatic --noinput
```

### Serving Static/Media Files in Production

**Important**: Django should NOT serve static/media files in production. Use:
- **Nginx** or **Apache** for static files
- **Cloud storage** (S3, Azure Blob) for media files
- **CDN** for better performance

## Database Migrations

All migrations are up to date. To verify:
```bash
python manage.py showmigrations
```

To apply any new migrations:
```bash
python manage.py migrate
```

## Security Check

Run the production security check:
```bash
python manage.py check --deploy
```

This will verify all production security settings are correctly configured.

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables (create `.env` file)

3. Run migrations:
```bash
python manage.py migrate
```

4. Collect static files:
```bash
python manage.py collectstatic --noinput
```

5. Create superuser (if needed):
```bash
python manage.py createsuperuser
```

## Testing

After deployment, verify:
- ✅ API endpoints respond correctly
- ✅ Authentication works
- ✅ Static files are served (if using Django in production)
- ✅ Media files are accessible
- ✅ HTTPS redirects work
- ✅ Security headers are present

## Notes

- The application will **fail to start** if `SECRET_KEY` is not set
- `ALLOWED_HOSTS` must include your production domain
- In production, use a reverse proxy (Nginx/Apache) in front of Django
- Use a process manager like `systemd`, `supervisor`, or `gunicorn` with `systemd`

