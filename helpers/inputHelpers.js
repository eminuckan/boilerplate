const bcrypt = require('bcryptjs');


const validateUserInput = (email,password) =>{
    return email && password;
};

const comparePasswords = (password,hashedPass) =>{
   return bcrypt.compareSync(password,hashedPass);
}

module.exports = {
    validateUserInput,
    comparePasswords
};