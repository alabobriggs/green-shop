module.exports = (req,res,next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login')
    }
    next()
}

// this works because route files move from left to right