import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Supported MIME types and extensions
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Helper: check magic bytes for true file type
export function validateImageMagicBytes(buffer) {
  if (!buffer || buffer.length < 12) {
    return false;
  }

  // JPEG: FF D8 FF
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (isJpeg) return 'image/jpeg';

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;
  if (isPng) return 'image/png';

  // WEBP: RIFF .... WEBP
  const isWebp =
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;
  if (isWebp) return 'image/webp';

  return false;
}

// Memory storage so we can validate magic bytes before committing to disk
const memoryStorage = multer.memoryStorage();

export const uploadSingleImage = (fieldName = 'image') => {
  const upload = multer({
    storage: memoryStorage,
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: 1,
    },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const mime = file.mimetype.toLowerCase();

      if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(mime)) {
        return cb(
          new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP images are allowed.')
        );
      }
      cb(null, true);
    },
  }).single(fieldName);

  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            message: 'Image size exceeds maximum limit of 5MB.',
          });
        }
        return res.status(400).json({
          message: `Upload error: ${err.message}`,
        });
      } else if (err) {
        return res.status(400).json({
          message: err.message || 'Image upload failed.',
        });
      }

      if (!req.file) {
        return next();
      }

      // Validate magic bytes to verify genuine image content
      const detectedMime = validateImageMagicBytes(req.file.buffer);
      if (!detectedMime || !ALLOWED_MIME_TYPES.has(detectedMime)) {
        return res.status(400).json({
          message: 'Invalid image content. File signature does not match a valid image format.',
        });
      }

      // Normalize detected mime
      req.file.mimetype = detectedMime;

      next();
    });
  };
};

/**
 * Saves verified buffer to designated subfolder in uploads directory.
 * Returns the storageKey (relative filename).
 */
export async function saveImageToDisk(buffer, subfolder = 'physique', ext = '.jpg') {
  const uploadsBase = path.resolve(process.cwd(), 'uploads', subfolder);
  await fs.promises.mkdir(uploadsBase, { recursive: true });

  const safeExt = ext.startsWith('.') ? ext : `.${ext}`;
  const filename = `${crypto.randomUUID()}${safeExt}`;
  const filePath = path.join(uploadsBase, filename);

  await fs.promises.writeFile(filePath, buffer);
  return `${subfolder}/${filename}`;
}

/**
 * Reads an image from the uploads directory.
 */
export async function readImageFromDisk(storageKey) {
  // Prevent directory traversal
  const safeKey = path.normalize(storageKey).replace(/^(\.\.(\/|\\|$))+/, '');
  const filePath = path.resolve(process.cwd(), 'uploads', safeKey);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  return fs.promises.readFile(filePath);
}
