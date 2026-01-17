# Use Python 3.11 as base (pre-installed Python environment)
FROM python:3.11

# Set working directory inside container
WORKDIR /app

# Copy requirements file first (for efficient caching)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend code into container
COPY management_system /app

# Expose port 8000 (Django default)
EXPOSE 8000

# Command to run when container starts
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
