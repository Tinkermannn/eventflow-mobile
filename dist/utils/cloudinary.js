"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = uploadToCloudinary;
exports.uploadMultipleToCloudinary = uploadMultipleToCloudinary;
exports.deleteFromCloudinary = deleteFromCloudinary;
/**
 * File: cloudinary.ts
 * Author: eventFlow Team
 * Deskripsi: Enhanced utility untuk upload media (foto, video, audio) ke Cloudinary
 * Dibuat: 2025-11-10
 * Terakhir Diubah: 2025-11-15
 * Versi: 2.0.0
 * Lisensi: MIT
 * Dependensi: Cloudinary
 */
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
/**
 * Deteksi tipe resource berdasarkan MIME type dan extension
 */
function getResourceType(filePath, mimetype) {
    // Priority 1: Check MIME type (paling reliable)
    if (mimetype) {
        if (mimetype.startsWith('image/'))
            return 'image';
        if (mimetype.startsWith('video/'))
            return 'video';
        if (mimetype.startsWith('audio/'))
            return 'video'; // Audio treated as video in Cloudinary
    }
    // Priority 2: Check extension
    const ext = path_1.default.extname(filePath).toLowerCase();
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    if (imageExts.includes(ext))
        return 'image';
    const videoExts = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv', '.m4v'];
    if (videoExts.includes(ext))
        return 'video';
    const audioExts = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
    if (audioExts.includes(ext))
        return 'video';
    return 'auto';
}
/**
 * Upload file ke Cloudinary dengan support penuh untuk image, video, dan audio
 * @param {string} filePath - Path file lokal
 * @param {string} folder - Nama folder di Cloudinary (default: 'eventflow-report')
 * @param {string} mimetype - MIME type dari file (optional tapi sangat disarankan)
 * @returns {Promise<string>} - URL hasil upload
 */
async function uploadToCloudinary(filePath, folder = 'eventflow-report', mimetype) {
    return new Promise((resolve, reject) => {
        // Validasi file exists
        if (!fs_1.default.existsSync(filePath)) {
            console.error('❌ File tidak ditemukan:', filePath);
            return reject(new Error(`File tidak ditemukan: ${filePath}`));
        }
        // Deteksi resource type
        const resourceType = getResourceType(filePath, mimetype);
        const fileSize = fs_1.default.statSync(filePath).size;
        const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
        const fileName = path_1.default.basename(filePath);
        console.log('📤 [Cloudinary] Starting upload...');
        console.log('   📁 File:', fileName);
        console.log('   📊 Size:', fileSizeMB, 'MB');
        console.log('   🎭 MIME:', mimetype || 'not provided');
        console.log('   🔖 Resource Type:', resourceType);
        const uploadOptions = {
            folder,
            resource_type: resourceType,
            timeout: 120000, // 2 minutes timeout
        };
        // Untuk video/audio, tambahkan chunked upload
        if (resourceType === 'video') {
            uploadOptions.chunk_size = 6000000; // 6MB chunks untuk file besar
        }
        console.log('⚙️  Upload config:', JSON.stringify(uploadOptions, null, 2));
        // Upload ke Cloudinary
        cloudinary_1.v2.uploader.upload(filePath, uploadOptions, (error, result) => {
            if (error) {
                console.error('❌ [Cloudinary] Upload failed!');
                console.error('   Error:', error.message);
                console.error('   HTTP Code:', error.http_code);
                return reject(error);
            }
            if (!result) {
                console.error('❌ [Cloudinary] No result returned');
                return reject(new Error('Upload failed: No result from Cloudinary'));
            }
            console.log('✅ [Cloudinary] Upload SUCCESS!');
            console.log('   🔗 URL:', result.secure_url);
            console.log('   📄 Format:', result.format);
            console.log('   🏷️  Type:', result.resource_type);
            console.log('   🆔 Public ID:', result.public_id);
            resolve(result.secure_url);
        });
    });
}
/**
 * Upload multiple files sekaligus
 */
async function uploadMultipleToCloudinary(filePaths, folder = 'eventflow-report', mimetypes) {
    const uploadPromises = filePaths.map((filePath, index) => uploadToCloudinary(filePath, folder, mimetypes?.[index]));
    return Promise.all(uploadPromises);
}
/**
 * Delete file dari Cloudinary
 */
async function deleteFromCloudinary(publicId, resourceType = 'image') {
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader.destroy(publicId, { resource_type: resourceType }, (error) => {
            if (error)
                return reject(error);
            resolve();
        });
    });
}
