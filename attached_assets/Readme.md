# Full-Stack Blog Platform (Node.js + Angular + MongoDB)

---

## 🧠 Copilot Prompt Template: Full-Stack Blog Platform (Node.js + Angular + MongoDB)

> ✨ Use this as a ready-to-go project prompt for ChatGPT or GitHub Copilot.

---

### 🧾 Project Title

**Medium-like Blog Platform**

---

### ✅ Objective

Build a full-stack blog web application where users can sign up, create blogs, edit their profiles, and browse posts with tag filters. The app will have a responsive Angular frontend, Node.js + Express backend, and MongoDB database.

---

### 🧩 Tech Stack

- **Frontend:** Angular 17
- **Backend:** Node.js (Express.js)
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT-based Auth
- **Deployment:** Dockerized with Docker Compose (optional)
- **Optional:** Use Tailwind CSS for Angular styling

---

### 🖥️ Frontend Specification (Angular)

**Pages/Views:**

- **Home Feed** – List of all published blogs with pagination and tags filter
- **Login** / **Signup** – Auth forms
- **Create Blog** – Blog editor form with title, body, and tags
- **Edit Blog** – Edit existing blog post (if user is the owner)
- **User Profile** – User bio, avatar, and list of their posts
- **View Blog** – View full blog with author info and tags

**Components:**

- Header with navigation (Login/Logout/Profile)
- Blog Card (for list view)
- Blog Editor Form
- Tag Selector
- Profile Editor Form
- Pagination component
- Auth Guard for protected routes

**State Management (Optional):**

- Use Angular Services for shared state (AuthService, BlogService)
- LocalStorage for JWT tokens

**API Integration:**

Use Angular’s `HttpClientModule` to connect with the backend using JWT-authenticated APIs.

---

### 🛠️ Backend Specification (Node.js + Express)

**API Endpoints**

`Auth`

- `POST /api/auth/signup` – Register new user
- `POST /api/auth/login` – Login and return JWT
- `GET /api/auth/me` – Get logged-in user info

`Users`

- `GET /api/users/:id` – Get user profile
- `PUT /api/users/:id` – Update profile (bio, avatar, name)

`Blogs`

- `GET /api/blogs` – List all published blogs (with pagination & optional tag filter)
- `GET /api/blogs/:id` – View single blog
- `POST /api/blogs` – Create blog (auth required)
- `PUT /api/blogs/:id` – Edit blog (only if user is owner)
- `DELETE /api/blogs/:id` – Delete blog
- `GET /api/tags` – List all tags used

**Middlewares:**

- Auth middleware (JWT verify)
- Error handler middleware
- Input validation using `express-validator` or `joi`

**Controllers:**

Split into folders (`authController.js`, `userController.js`, `blogController.js`)

---

### 🗃️ Database Schema (MongoDB with Mongoose)

**User**

```ts
{
  username: String,
  email: String,
  passwordHash: String,
  bio: String,
  avatarUrl: String,
  createdAt: Date
}
```
