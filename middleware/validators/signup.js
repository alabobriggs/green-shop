const {check, body} = require('express-validator')
const User = require('../../models/user')

module.exports = [
    check('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email')
        .custom((value, { req }) => {
            // if(value === 'test@test.com'){
            // throw new Error('This email address is forbidden')
            // }
            //  return true
            return User.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email already in use, please pick a new one')
                    }
                })
        }),
    body('password', 'Please enter a password with only numbers and text and at least 5 characters')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match')
            }
            return true
        })
        .trim()
]
