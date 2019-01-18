const { check, body } = require('express-validator')
const User = require('../../models/user')

module.exports = [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .custom((value, { req }) => {

            return User.findOne({ email: value })
                .then(userDoc => {
                    if (!userDoc) {
                        return Promise.reject('No user with that email found')
                    }
                })
        })
        .trim()
]