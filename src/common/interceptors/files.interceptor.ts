import { normalizeFilename } from '@helpers/utils.helper';
import { BadRequestException } from '@nestjs/common';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { existsSync, mkdirSync, unlink } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';

export const allowedMimeTypes = ['image/jpeg', 'image/png','image/webp', 'application/pdf', 'text/csv'];
const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.pdf','.webp'];

// AWS S3 client setup (lazy initialized via Proxy to ensure env variables are loaded)
let realS3: S3Client | null = null;
const s3 = new Proxy({}, {
    get(target, prop) {
        if (!realS3) {
            realS3 = new S3Client({
                region: process.env.AWS_REGION || 'ap-south-1',
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
                },
                endpoint: process.env.AWS_S3_ENDPOINT || undefined,
            });
        }
        const value = Reflect.get(realS3, prop);
        return typeof value === 'function' ? value.bind(realS3) : value;
    }
}) as S3Client;

const s3FileFilter = (_req: Request, file: Express.Multer.File, callback: any) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return callback(new BadRequestException(`Unsupported file type: ${file.mimetype}.`), false);
    }

    const ext = extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
        return callback(new BadRequestException('Invalid file extension!'), false);
    }

    callback(null, true);
};

/**
 * @description Interceptor for handling single field file uploads with custom directories.
 * @description Use type example { Express.Multer.File[] }
 */
export const SingleFileInterceptor = (directory: string, fieldName: string) => FilesInterceptor(fieldName, 25, {
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    storage: diskStorage({
        destination(_req: Request, _file: Express.Multer.File, callback) {
            if (!existsSync('./public')) mkdirSync('./public');
            if (!existsSync('./public/uploads')) mkdirSync('./public/uploads');
            if (!existsSync(`./public/uploads/${directory}`)) mkdirSync(`./public/uploads/${directory}`);

            callback(null, `./public/uploads/${directory}`);
        },
        filename(_req, file, callback) {
            callback(null, normalizeFilename(file.originalname));
        }
    }),
    fileFilter(_req, file, callback) {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return callback(new BadRequestException(`Unsupported file type: ${file.mimetype}.`), false);
        }

        const ext = extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(ext)) {
            return callback(new Error('Invalid file extension!'), false);
        }

        callback(null, true);
    }
});

/**
 * @description Interceptor for handling multiple field file uploads with custom directories.
 * @description Use type example { fieldname: Express.Multer.Files[] }
 */
export const MultiFileInterceptor = (fileFields: { name: string, directory: string, maxCount?: number }[]) => FileFieldsInterceptor(
    fileFields,
    {
        storage: diskStorage({
            destination(_req: Request, file: Express.Multer.File, callback) {
                const currField = fileFields.find(field => file.fieldname === field.name);

                if (!existsSync('./public')) mkdirSync('./public');
                if (!existsSync('./public/uploads')) mkdirSync('./public/uploads');
                if (!existsSync(`./public/uploads/${currField.directory}`)) mkdirSync(`./public/uploads/${currField.directory}`);

                if (currField) { return callback(null, `./public/uploads/${currField.directory}`); }

                unlink(file.destination, (_err) => {
                    if (_err) callback(_err, null);
                    return callback(new BadRequestException(`Image fieldname not allowed: ${file.fieldname}. Please ensure the fieldname matches one of the specified fields.`), null);
                });
            },
            filename(_req, file, callback) {
                return callback(null, normalizeFilename(file.originalname));
            }
        }),
        fileFilter(_req, file, callback) {
            if (!allowedMimeTypes.includes(file.mimetype)) {
                return callback(new BadRequestException(`Unsupported file type: ${file.mimetype}.`), false);
            }

            const ext = extname(file.originalname).toLowerCase();
            if (!allowedExtensions.includes(ext)) {
                return callback(new Error('Invalid file extension!'), false);
            }

            return callback(null, true);
        }
    }
);

/**
 * @description Interceptor for handling single field file uploads to AWS S3.
 */
export const S3SingleFileInterceptor = (directory: string, fieldName: string) => FilesInterceptor(fieldName, 25, {
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME || 'display-doctor',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata(_req, file, callback) {
            callback(null, { fieldname: file.fieldname });
        },
        key(_req, file, callback) {
            const normalized = normalizeFilename(file.originalname);
            const keyPath = directory ? `${directory}/${normalized}` : normalized;
            callback(null, keyPath);
        }
    }),
    fileFilter: s3FileFilter
});

/**
 * @description Interceptor for handling multiple field file uploads to AWS S3.
 */
export const S3MultiFileInterceptor = (fileFields: { name: string, directory: string, maxCount?: number }[]) => FileFieldsInterceptor(
    fileFields,
    {
        storage: multerS3({
            s3: s3,
            bucket: process.env.AWS_BUCKET_NAME || 'display-doctor',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            metadata(_req, file, callback) {
                callback(null, { fieldname: file.fieldname });
            },
            key(_req, file, callback) {
                const currField = fileFields.find(field => file.fieldname === field.name);
                const directory = currField ? currField.directory : 'temp';
                const normalized = normalizeFilename(file.originalname);
                const keyPath = directory ? `${directory}/${normalized}` : normalized;
                callback(null, keyPath);
            }
        }),
        fileFilter: s3FileFilter
    }
);