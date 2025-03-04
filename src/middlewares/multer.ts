import multer from "multer";
import { Request, RequestHandler } from "express"; 
// Configure storage
const storage = multer.diskStorage({
  destination: (
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, "./uploads/"); // Define the upload directory
  },
  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// const storage = multer.diskStorage({
//   destination: './uploads/',
//   filename: function (_req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//   }
// });

// CSV file filter
const csvFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (
    file.mimetype === "text/csv" ||
    file.originalname.toLowerCase().endsWith(".csv")
  ) {
    cb(null, true);
  } else {
    cb(null, false); // Reject file without throwing an error
  }
};

// Multer instance
export const upload = multer({
  storage,
  fileFilter: csvFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export const uploadCSVMiddleware: RequestHandler = upload.single("csv");
