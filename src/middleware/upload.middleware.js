const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary.config');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'eventflow_avatars', // Nama folder di Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 250, height: 250, crop: 'limit' }], // Resize gambar
  },
});

const upload = multer({ storage: storage });

module.exports = upload;