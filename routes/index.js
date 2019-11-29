const express = require('express');
var cors = require('cors');
const routes = express.Router();
require('passport');

/**
 * List of main routes
 */

routes.use(cors({ credentials: true, origin: true }))

routes.use('/mail', require('./mail.routes.js'))
// routes.use('/api', require('./notifications.routes.js'))

module.exports = routes;