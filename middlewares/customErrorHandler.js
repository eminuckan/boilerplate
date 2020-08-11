const CustomError = require('../helpers/CustomErrors');
//Bu server.js te daima çalışan merkezi middleware

const customErrorHandler = (err,req,res,next) => {

    let customError = err;
    switch (err.name) {
        case "SyntaxError":
            customError = new CustomError("Unexpected Syntax",400);
            break;
        case "ValidationError":
            customError = new CustomError(err.message,400);
            break;
        case "MongoError":
            customError = new CustomError("DB Error",400);
            break;
        case "CastError":
            customError = new CustomError("Invalid id",400);
            break;
    }

    res
    .status(customError.status || 500)
    .json({
        success:false,
        message: customError.message
    });
};

module.exports = customErrorHandler;
