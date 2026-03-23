# WorkManagementSystem

![Demo GIF](./docs/demo.gif)
Live: [WorkManagementSystem](http://13.51.206.221:3000)

## 🎯 Overview
End-to-end office workflow platform for tracking public works from GR release to tendering, execution, and final bill processing.

## 🚀 Features
- Full workflow tracking from GR to final bills (single system visibility)
- Role-based authentication and protected routes
- File/document handling for work orders, tenders, GR documents, and bills

## 🛠 Tech Stack
React, TypeScript, Vite, Tailwind CSS, Django, Django REST Framework, PostgreSQL, Docker

## 📈 Results
<div align='center'> 
<img width="600" height="400" alt="image" src="https://github.com/user-attachments/assets/a6b313b1-b9ca-463e-9dfc-88b420fc51c4" /> 
  
<img width="600" height="400" alt="image" src="https://github.com/user-attachments/assets/d24fe833-0643-41b9-9b9f-2a4a916239eb" />

<img width="600" height="400" alt="image" src="https://github.com/user-attachments/assets/2d683286-8154-46d0-8449-ab2eb541c418" />
</div>


## 📋 Setup

```bash
# Clone repository
git clone https://github.com/your-username/WorkManagementSystem.git
cd WorkManagementSystem

# Start with Docker
docker compose up --build

# Frontend (optional local run)
cd frontend
npm install
npm run dev

# Backend (optional local run)
cd ../backend
pip install -r requirements.txt
python management_system/manage.py runserver
```
