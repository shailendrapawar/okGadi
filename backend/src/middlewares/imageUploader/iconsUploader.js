import multer from "multer"
import { v4 as uuid } from "uuid"
// import path from "path"


// defining storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/icons-uploads/")
    },
    filename: (req, file, cb) => {
        const randomName = `${uuid()}__${file.originalname}`;
        cb(null, randomName);
    }
})


// filtering file type
const allowedMimes = ['image/png', 'image/svg', 'image/jpeg'];

function fileFilter(req, file, cb) {
    if (!allowedMimes.includes(file.mimetype)) {
        return cb(new Error('Unsupported file type. Please upload PNG, SVG or JPG image.'), false);
    }
    cb(null, true);
}

//function for uploading icon
const uploadIcon = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
}).single("iconImg")

export default uploadIcon;