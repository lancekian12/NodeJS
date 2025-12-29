const path = require('path')
const express = require('express')
const rootDir = require('../utils/path')


const router = express.Router()

router.get("/", (req, res, next) => {
    res.sendFile(path.join(rootDir, 'views', 'shop.html'))
//   res.send(path.join());
});

module.exports = router