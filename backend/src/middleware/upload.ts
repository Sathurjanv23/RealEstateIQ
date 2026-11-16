import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

const CLOUDINARY_CONFIGURED =
  !!(process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET);

if (CLOUDINARY_CONFIGURED) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key:    process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
    secure: true,
  });
  logger.info('Upload: Cloudinary storage configured.');
} else {
  logger.warn('Upload: Cloudinary env vars not set — falling back to local disk storage.');
}

// ── Cloudinary storage (production) ──────────────────────────────────────────
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'realestate-iq/properties',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto:best', fetch_format: 'auto' }],
  } as any,
});

// ── Local disk storage (fallback for development) ────────────────────────────
const uploadDir = path.join(__dirname, '../../uploads');
if (!CLOUDINARY_CONFIGURED && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `property-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP image files are allowed.'));
  }
};

/**
 * upload middleware:
 *  - Uses Cloudinary in production (when CLOUDINARY_* env vars are set)
 *  - Falls back to local disk storage in development
 */
export const upload = multer({
  storage: CLOUDINARY_CONFIGURED ? cloudinaryStorage : diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

/** True when Cloudinary is the active storage provider */
export const isCloudinaryActive = CLOUDINARY_CONFIGURED;
