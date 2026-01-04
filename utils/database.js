const mysql = require('mysql2')

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'node-mvc',
    password: '@52425978Qwqw'
})

module.exports = pool.promise();