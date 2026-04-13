const multer = require("multer");

let upload;

const initStorage = () => {
  upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      // Keep uploads bounded to avoid unbounded memory use.
      fileSize: 100 * 1024 * 1024,
    },
  });
};

const getUpload = () => {
  if (!upload) {
    throw new Error("Multer upload middleware is not initialized");
  }
  return upload;
};

module.exports = { initStorage, getUpload };