const CustomError = require('../helpers/CustomErrors');
const jwt = require('jsonwebtoken');
const {isTokenDefined,getAccessTokenFromHeader} = require('../helpers/tokenHelpers');
const errorWrapper = require('express-async-handler');
const User = require('../models/User');

const getAccessToRoute = (req,res,next) =>{
    //secret
    const {JWT_SECRET} = process.env;

    if (!isTokenDefined(req)) {
        return next(new CustomError("You are not authorized to access this route",401));
    }


    const accessToken = getAccessTokenFromHeader(req);

    jwt.verify(accessToken,JWT_SECRET,(err,decoded) =>{
        if(err){
            return next(new CustomError("You are not authorized to access this route",401));
        }
        req.user = {
            id:decoded.id,
            name: decoded.name
        };
        next();
    });
};


const getAdminAccess = errorWrapper(async (req,res,next) =>{
    const {id} = req.user;

    const user = await User.findById(id);

    if (user.role !== "admin") {
        return next(new CustomError("Only admins can access this route",403));
    }

    next();
});

module.exports = {
    getAccessToRoute,
    getAdminAccess
};