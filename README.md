[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/d7M8Pab7)
# **Term Project**

**Hello, Students!** 👋

Your **Term Project** is an essential part of the course. Please review the instructions carefully to ensure a smooth and successful experience.

- [**Project Instructions**](https://gvsu-cis658.github.io/project/term.html)

### **Getting Started:**

1. **Read** the full instructions carefully.
2. **Understand** all requirements before starting.
3. **Ask questions** if anything is unclear.

### **Tips for Success:**

- Follow guidelines closely.
- Plan your work and stay on schedule.
- Test your project regularly.

Best of luck! 🚀

## **View the project live**
https://atlas-campusfit.netlify.app/

## **Project Setup**
1. Clone the repo
2. Install dependencies:
```
cd campusfit && npm install
cd ../server && npm install
```
3. Set up your `.env` file:
```
// make sure you are in the /server folder
cp .env.example .env
```
4. Fill in the `.env` values:
 - The `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY` values are in the shared supabase project settings
 - Generate your own values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` using the command:
 ```
 openssl rand -hex 32
 ```
5. Start both servers:
```
# Terminal 1 for backend
cd server
npm run dev

# Terminal 2 for frontend
cd campus-fit
npm run dev
```
6. Open `http://localhost:5173`. API calls are already setup with a proxy
## **Backend Deployment to Production**
1. (For the first time only) Install Railway CLI:
```
npm install -g @railway/cli
```
2. Make sure your terminal is in the `/server` folder and run:
```
railway up
```