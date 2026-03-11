# FutureBlog Frontend

A modern, animated blog platform frontend built with React, Vite, Tailwind CSS, and Framer Motion.

## Features

- 🎨 Modern UI with gradient backgrounds and glassmorphism effects
- ✨ Smooth animations using Framer Motion
- 🔐 User authentication (login/register)
- 📝 Create, edit, and delete blog posts
- ❤️ Like posts
- 💬 Comment on posts
- 👨‍💼 Admin dashboard for content management
- 📱 Responsive design

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Axios** - HTTP client
- **Lucide React** - Icon library

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on http://localhost:8080

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the App

Start the development server:
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Building for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── axios.js          # Axios instance with interceptors
│   ├── components/
│   │   ├── Navbar.jsx         # Navigation component
│   │   ├── PostCard.jsx       # Post card component
│   │   └── CommentSection.jsx # Comments component
│   ├── context/
│   │   └── AuthContext.jsx    # Authentication context
│   ├── pages/
│   │   ├── Home.jsx           # Home page with posts
│   │   ├── Login.jsx          # Login page
│   │   ├── Register.jsx       # Registration page
│   │   ├── CreatePost.jsx     # Create post page
│   │   ├── EditPost.jsx       # Edit post page
│   │   ├── PostDetail.jsx     # Post detail page
│   │   └── AdminDashboard.jsx # Admin dashboard
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## API Endpoints

The frontend connects to the following backend endpoints:

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/posts` - Get all posts
- `POST /api/posts/create` - Create new post
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post
- `POST /api/posts/{id}/like` - Like post
- `GET /api/posts/{id}/comments` - Get post comments
- `POST /api/posts/{id}/comment` - Add comment
- `DELETE /api/admin/post/{id}` - Admin delete post

## Environment Variables

The API base URL is configured in `src/api/axios.js` (default: http://localhost:8080/api)

## Authentication

The app uses JWT tokens for authentication. Tokens are stored in localStorage and automatically included in API requests via Axios interceptors.

## Admin Access

To access the admin dashboard, you need to login with an account that has the `ADMIN` role.
