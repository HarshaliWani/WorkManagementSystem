# WorkManagementSystem
Office work management that organizes and tracks the entire workflow from GR release to final bills of tenders.




Initial Django Setup
First, create a virtual environment and install the required packages in your project root directory :​

bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Django and other dependencies
pip install django djangorestframework psycopg2-binary django-cors-headers python-dotenv pillow
Create your Django project :​

bash
django-admin startproject management_system .
Project Structure
Your recommended structure should look like this :​

text
project_root/
├── frontend/                 # Your React app
├── management_system/        # Django project folder
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── apps/                     # All Django apps
│   ├── gr/                   # Government Resolution app
│   ├── works/                # Works management
│   ├── technical_sanction/
│   ├── tender/
│   └── bill/
├── media/                    # Uploaded files (Work Orders, Bills)
├── static/
├── venv/
├── .env                      # Environment variables
└── manage.py
Configure PostgreSQL Database
Create a .env file in your root directory for sensitive data :​

text
DB_NAME=management_system_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=your-secret-key-here
DEBUG=True
Update management_system/settings.py :​

python
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'corsheaders',
    
    # Your apps
    'apps.gr',
    'apps.works',
    'apps.technical_sanction',
    'apps.tender',
    'apps.bill',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be at top
    'django.middleware.common.CommonMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS Configuration for React
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Database Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT'),
    }
}

# Media files configuration (for Work Orders and Bills)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
Create Django Apps
Create the necessary apps for your workflow :​

bash
mkdir apps
cd apps
python ../manage.py startapp gr
python ../manage.py startapp works
python ../manage.py startapp technical_sanction
python ../manage.py startapp tender
python ../manage.py startapp bill
Configure Django REST Framework
Add this to your settings.py :​

python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.MultiPartParser',
        'rest_framework.parsers.FormParser',
    ],
}
Update .gitignore
Add Django-specific entries to your existing .gitignore :​

text
# Django
*.pyc
__pycache__/
db.sqlite3
*.sqlite3
/media/
/staticfiles/
.env

# Virtual environment
venv/
env/
Create PostgreSQL Database
Connect to server
Open PostgreSQL and create your database :​

sql
CREATE DATABASE management_system_db;
Initialize Django
Run these commands :​

bash
python manage.py check --database default
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
Your Django backend foundation is now ready! Next steps would be creating the models for GR, Works, Technical Sanction, Tender, and Bill with their relationships and constraints.




Intermediary steps
pip install django-cors-headers
npm install axios
