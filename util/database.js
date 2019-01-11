const mysql = require('mysql2')

// pull will let us connect to a database at anytime we want
const pool = mysql.createPool({
    host : 'localhost',
    user: 'root',
    database: 'node-complete',
    password: 'letmein@1'
}) 

module.exports = pool.promise()