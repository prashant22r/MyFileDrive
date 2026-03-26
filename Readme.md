# 📁 MyFileDrive

MyFileDrive is a web-based file storage and management system built using the MERN stack (MongoDB, Express.js, React.js, Node.js). It allows users to upload, store, access, download, and manage files such as documents, images, and videos from anywhere.

## 🚀 Features

* 🔐 Google Authentication using Passport.js
* 📤 Upload files (images, videos, documents)
* 📥 Download files
* 📄 View uploaded files
* 🗑️ Delete files
* 🧠 Efficient file storage using MongoDB GridFS

## 🏗️ Tech Stack

* **Frontend:** React.js
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas (GridFS)
* **Authentication:** Passport.js (Google OAuth 2.0)

## ⚙️ How It Works

1. User logs in using Google OAuth
2. Frontend sends requests to backend APIs
3. Backend processes requests and interacts with MongoDB
4. Files are stored using GridFS (split into chunks)
5. Files can be retrieved, streamed, or deleted

## 📂 Project Structure

```
myfiledrive/
│
├── frontend/        # React application
├── backend/         # Node.js + Express server
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── middleware/
│
└── README.md

## 🛠️ Installation & Setup

### 1. Clone the repository

```
git clone https://github.com/prashant22r/myfiledrive.git
cd myfiledrive
```

### 2. Setup Backend

```
cd backend
npm install
```

Create a `.env` file and add:

```
MONGO_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_secret_key
```

Run backend:

```
npm start
```

---

### 3. Setup Frontend

```
cd frontend
npm install
npm start

## 📊 Database Design

* Uses **MongoDB GridFS** to store large files
* Files are divided into chunks and stored efficiently
* Separate collections for file metadata and chunks

---

## ⚠️ Limitations

* Not optimized for large-scale production use
* No CDN or cloud storage integration
* Limited scalability

---

## 🔮 Future Enhancements

* Integration with AWS S3 or Cloudinary
* File sharing via links
* Folder structure support
* File preview (images/videos)
* Drag-and-drop uploads

---

## 📌 Conclusion

This project demonstrates the implementation of a file storage system using the MERN stack and MongoDB GridFS. It helps in understanding full-stack development, file handling, and system design concepts.

---

## 👨‍💻 Author

* Prashant Maini
