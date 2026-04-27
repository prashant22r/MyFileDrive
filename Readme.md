# 📁 MyFileDrive

MyFileDrive is a full-stack cloud file storage and management application. Users can securely upload, organize, download, preview, and manage files and folders through an intuitive web interface, backed by AWS S3 for scalable object storage and Google OAuth 2.0 for seamless authentication.

**Live Demo**
- **Frontend:** [https://my-file-drive.vercel.app](https://my-file-drive.vercel.app)
- **Backend API:** [https://myfiledrive.onrender.com](https://myfiledrive.onrender.com)

---

## 🚀 Features

- 🔐 **Google Authentication** via Passport.js (OAuth 2.0)
- 📤 **Upload files** (images, videos, documents) up to 100MB
- 📥 **Download files** via secure pre-signed URLs
- 👁️ **Preview files** inline (images, PDFs, videos)
- 📁 **Folder management** — create, rename, move, and delete folders
- 🗂️ **File organization** — move files between folders
- 🧠 **Duplicate detection** — SHA-256 content hash deduplication per user
- 🔒 **JWT-secured APIs** — protected routes with Bearer token authorization
- 📱 **Responsive UI** — built with modern React and CSS

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite, React Router DOM v7 |
| **Backend** | Node.js, Express.js 5 |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **File Storage** | AWS S3 (with pre-signed URLs) |
| **Authentication** | Passport.js (Google OAuth 2.0) + JWT |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## ⚙️ How It Works

1. User signs in using Google OAuth via Passport.js.
2. Backend generates a JWT token and redirects the user back to the frontend.
3. The frontend stores the JWT in `localStorage` and uses it for all API requests.
4. Users create folders and upload files through the Drive UI.
5. Uploaded files are streamed to **AWS S3** with unique per-user keys.
6. File metadata (name, S3 key, content hash, folder location) is stored in **MongoDB**.
7. Pre-signed URLs are generated for secure file preview and download.
8. Duplicate uploads are detected via SHA-256 hash and transparently handled.

---

## 📂 Project Structure

```
MyFileDrive/
│
├── Frontend/                 # Vite + React application
│   ├── src/
│   │   ├── components/       # Reusable UI components (Drive, Sidebar, etc.)
│   │   ├── pages/            # Route-level pages (DrivePage, Login, etc.)
│   │   ├── services/         # API client functions
│   │   ├── hooks/            # Custom React hooks (useDriveData)
│   │   ├── utils/            # Auth helpers (JWT decode, token store)
│   │   └── config/           # App constants (API_BASE_URL)
│   ├── public/
│   └── index.html
│
├── Backend/                  # Node.js + Express server
│   ├── config/               # DB, S3, Passport, Multer config
│   ├── controllers/          # Route controllers
│   ├── routes/               # API route definitions
│   ├── models/               # Mongoose schemas (User, File, Folder)
│   ├── middleware/           # Auth middleware (JWT protect)
│   └── server.js
│
└── Readme.md
```

---

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/prashant22r/myfiledrive.git
cd myfiledrive
```

### 2. Setup Backend

```bash
cd Backend
npm install
```

Create a `.env` file:

```env
# MongoDB
MONGO_URI=your_mongodb_connection_string

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Frontend URL (CORS + OAuth redirects)
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# JWT & Session
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# AWS S3
AWS_REGION=your_aws_region
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_s3_bucket_name

# Optional
NODE_ENV=development
```

> **Production Note:** On Render, set `GOOGLE_CALLBACK_URL` to your deployed backend URL (e.g., `https://myfiledrive.onrender.com/auth/google/callback`) and `CLIENT_URL` / `FRONTEND_URL` to your deployed frontend URL (`https://my-file-drive.vercel.app`). Also add the callback URL to the **Authorized redirect URIs** in your Google Cloud Console OAuth 2.0 credentials.

Run the backend:

```bash
npm start
# or for development
npm run dev
```

---

### 3. Setup Frontend

```bash
cd Frontend
npm install
```

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Run the frontend:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 📊 Database Design

### Collections

- **users** — Google profile data, email, name, avatar
- **files** — Metadata for each uploaded file:
  - `owner` (ref), `originalName`, `mimeType`, `size`
  - `s3Key`, `bucket`
  - `contentHash` (SHA-256 for deduplication)
  - `folderId` (nullable, for folder organization)
  - `isPublic`
- **folders** — Folder hierarchy:
  - `owner` (ref), `name`, `parentFolder` (self-referencing, nullable for root)

### Indexes

- `{ owner: 1, contentHash: 1 }` — Unique constraint per user (deduplication)
- `{ owner: 1, folderId: 1, createdAt: -1 }` — Fast folder-scoped file listing
- `{ owner: 1, parentFolder: 1, name: 1 }` — Unique folder names within the same parent

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/auth/google` | Initiate Google OAuth login |
| `GET` | `/auth/google/callback` | OAuth callback (returns JWT redirect) |
| `GET` | `/api/user` | Get current authenticated user |
| `GET` | `/api/logout` | Logout and redirect |
| `POST` | `/api/upload` | Upload a file (multipart/form-data) |
| `GET` | `/api/files` | List user's files (with pagination) |
| `DELETE` | `/api/files/:id` | Delete a file (from S3 + DB) |
| `PATCH` | `/api/files/:id` | Move a file to another folder |
| `GET` | `/api/files/:id/url` | Get pre-signed view/download URL |
| `POST` | `/api/folders` | Create a new folder |
| `GET` | `/api/folders` | List folders within a parent |
| `PATCH` | `/api/folders/:id` | Rename a folder |
| `PATCH` | `/api/folders/:id/move` | Move a folder to another parent |
| `DELETE` | `/api/folders/:id` | Delete an empty folder |

---

## ⚠️ Limitations

- File upload size is limited to **100MB** (configurable via Multer).
- Folders cannot be deleted if they contain files or subfolders (must empty first).
- No public file sharing links yet (files are private by default).
- No real-time collaboration or multi-user folder sharing.
- No file search or content-based indexing.

---

## 🔮 Future Enhancements

- 🔗 Public/private file sharing links
- 🔍 Full-text search across file names
- 🏷️ Tags and filters for files
- 🖼️ Thumbnail generation for images/videos
- 📂 Bulk upload and drag-and-drop support
- 🔔 Activity logs and recent uploads sidebar
- 🌓 Dark mode toggle

---

## 📌 Conclusion

MyFileDrive demonstrates a production-ready full-stack cloud storage application using the MERN ecosystem combined with AWS S3. It covers essential concepts such as OAuth authentication, JWT authorization, RESTful API design, object storage integration, and modern React frontend patterns with hooks and client-side routing.

---

## 👨‍💻 Author

- **Prashant Maini**

