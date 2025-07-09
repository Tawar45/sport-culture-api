const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Function to ensure upload directory exists
const ensureUploadDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Get the route from the request URL
    const route = req.baseUrl.split('/').pop(); // This will get 'games' or 'ground' from '/api/games' or '/api/ground'
    const uploadDir = `public/uploads/${route}`;
    
    // Ensure the upload directory exists
    ensureUploadDir(uploadDir);
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Get the route for the prefix
    const prefix = req.baseUrl.split('/').pop();
    
    // Generate unique filename with route prefix and date          
    const uniqueName = `${prefix}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const imageFilter = (req, file, cb) => {
  // Accept only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;