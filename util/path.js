const path = require('path')

module.exports = path.dirname(process.mainModule.filename)

// this gets the absolut path of the entry file