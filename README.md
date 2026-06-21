<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png" width="80" alt="React Logo" />
  <img src="https://nodejs.org/static/images/logo.svg" width="120" alt="Node.js Logo" />
  
  <h1>Premium E-Commerce Platform (MERN)</h1>
  <p>A full-stack, production-ready premium fashion e-commerce application built with the MERN stack. Designed with a magazine-style UI inspired by top fashion brands like Snitch and Zara.</p>

  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#environment-variables">Environment Variables</a> •
    <a href="#run-locally">Run Locally</a> •
    <a href="#deployment">Deployment</a>
  </p>
</div>

---

## ✨ Features

- **🛍️ Complete E-Commerce Flow:** Browse products, add to cart, checkout, and view order history.
- **🔐 Authentication & Authorization:** Email/Password login and Google OAuth integration using Passport.js.
- **💳 Secure Payments:** Integrated with Razorpay for seamless and secure checkout experiences.
- **🖼️ High-Performance Images:** Image hosting and optimization via ImageKit.
- **📱 Premium Responsive Design:** A beautiful, magazine-style UI built with Tailwind CSS that works flawlessly on desktop and mobile.
- **🔄 State Management:** Centralized client-state handling via Redux Toolkit.
- **🛠️ Admin/Seller Dashboard:** Easily create, manage, and delete products, including complex variant setups (sizes, colors, stock).
- **🚀 Unified Deployment:** Architected to serve the React frontend statically through the Express backend for a single-domain, CORS-free production environment.

## 💻 Tech Stack

**Frontend:**
- React 19 (Vite)
- Redux Toolkit (State Management)
- Tailwind CSS 4 (Styling)
- React Router DOM v7 (Routing)
- Axios (HTTP Client)
- React Razorpay (Payments)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (Database & ODM)
- Passport.js (Google OAuth)
- JSON Web Tokens (JWT) & bcrypt (Authentication)
- ImageKit Node.js (Media storage)
- Razorpay Node.js SDK

## 🔑 Environment Variables

To run this project, you will need to add the following environment variables to your `backend/.env` file:

```env
# Server
PORT=3000
NODE_ENV=development # Change to 'production' when deploying

# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# ImageKit (Image Hosting)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint/

# Razorpay (Payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

## 🚀 Run Locally

Clone the project

```bash
  git clone https://github.com/your-username/snitch-ecommerce.git
```

Go to the project directory

```bash
  cd snitch-ecommerce
```

**1. Start the Backend Server**
```bash
  cd backend
  npm install
  npm run dev
```

**2. Start the Frontend Client**
Open a new terminal and navigate to the frontend folder:
```bash
  cd frontend
  npm install
  npm run dev
```

The application will be running on `http://localhost:5173`.

## 📦 Deployment (Render)

This project is configured for a **Single-Domain Deployment** on Render. The Express backend will serve the built React frontend.

1. Push your code to GitHub.
2. Create a new **Web Service** on Render.
3. Connect your repository.
4. Set the **Root Directory** to: `backend`
5. Set the **Build Command** to: `npm install`
6. Set the **Start Command** to: `npm start`
7. Add all your Environment Variables in the Render dashboard. Make sure to add `NODE_ENV=production`.
8. Deploy!

*(Note: Before deploying, ensure you have built the frontend locally using `cd frontend && npm run build` and moved the contents of `frontend/dist` into `backend/public`, as this repo is currently configured to serve static files from that public directory).*

## 👨‍💻 Author

- [@YourGitHubHandle](https://www.github.com/YourGitHubHandle)
