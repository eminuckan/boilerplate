const multer = require('multer');
const path = require('path');
const CustomError = require('../helpers/CustomErrors');

// Storage, FİleFilter

const storage = multer.diskStorage({
    destination: function (req,file,cb) {
        const rootDir = path.dirname(require.main.filename);
        cb(null,path.join(rootDir,"/public/profile_image_uploads"));
    },
    filename:function (req,file,cb) {
        // file-mimetype-image/png
        
        const extension = file.mimetype.split("/")[1];
        req.savedImage = `user_image_${req.user.id}.${extension}`;
        cb(null,req.savedImage);
    }
});

const fileFilter = (req,file,cb) =>{
    let allowedMimeTypes = ["image/jpg","image/gif","image/jpeg","image/png"];

    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new CustomError("Unsupported file type",400),false);
    }

    return cb(null,true);

};

const profileImageUpload = multer({storage,fileFilter});

module.exports = profileImageUpload;