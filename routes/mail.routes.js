const express = require('express');
const mailController = require('../controllers/mail.controller');
const Multer = require('multer');
const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
    }
});
const routes = express.Router();

/**
 * Mail routes
 */
routes.post('/send', mailController.sendMail);
routes.post('/attachment', multer.single('file'), mailController.upload);

module.exports = routes;