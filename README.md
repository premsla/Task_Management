#  IDEA BOX

##  Overview

This is a full-stack **Todo Task Management Web Application** built as part of the **Katomaran Full Stack Hackathon**. The app allows users to log in using social platforms (Google, GitHub, Facebook) and perform full CRUD operations on their personal to-do tasks. It highlights skills in frontend design, backend development, API structuring, database modeling, authentication, and cloud deployment.

---



##  Tech Stack

### Backend

- **Node.js** with **Express.js**
- **MongoDB** using **Mongoose**
- **JWT (JSON Web Tokens)** for authentication
- **Passport.js** for OAuth (Google, GitHub, Facebook)
- **bcryptjs** for password hashing
- **Express-session** for session handling

### Frontend

- **React 18** (bootstrapped with Vite)
- **React Router DOM** for routing
- **Tailwind CSS** for responsive design
- **React Hook Form** for form handling
- **Axios** for API communication

### Deployment

- **Frontend:** Vercel / Firebase
- **Backend:** Render / AWS Lambda / Railway
- **Database:** MongoDB Atlas

---

##  Features

###  Authentication

- Social login via Google, GitHub, Facebook
- JWT-based authentication
- Secure sessions using HTTP-only cookies (optional fallback)

###  Task Management

- Create new tasks with title, description, due date
- Edit existing tasks
- Mark tasks as completed
- Delete tasks
- Tasks are private per user

###  UI/UX

- Mobile-first responsive design
- Clean dashboard UI to manage tasks
- Error messages and validation feedback

---

##  Setup Instructions

###  Backend Setup

1. Navigate to the server directory:

```bash
cd server
```

2. Create a `.env` file:

```env
PORT=8800
MONGODB_URI=your_mongodb_connection_url
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
CLIENT_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

```

3. Install dependencies and start the server:

```bash
npm install
npm start
```

If successful, you will see `Server is running...` and `Database Connected`.

---

###  Frontend Setup

1. Navigate to the client directory:

```bash
cd client
```

2. Create a `.env` file:

```env
VITE_APP_BASE_URL=http://localhost:8800
```

3. Install dependencies and run the app:

```bash
npm install
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) to view the frontend.

---

##  API Endpoints

| Method | Endpoint             | Description                   |
| ------ | -------------------- | ----------------------------- |
| GET    | `/api/tasks`         | Fetch all tasks (user scoped) |
| POST   | `/api/tasks`         | Create a new task             |
| PUT    | `/api/tasks/:id`     | Update a task                 |
| DELETE | `/api/tasks/:id`     | Delete a task                 |
| GET    | `/api/auth/google`   | Google login                  |

---

##  Folder Structure

```
project-root/
│
├── client/              # React frontend
│   ├── src/
│   └── .env
│
├── server/              # Node.js backend
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   └── .env
│
└── README.md
```
