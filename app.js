process.env.NODE_ENV = process.env.NODE_ENV || 'development'

/**
 * Module dependencies.
 */
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
// const mongoose = require('mongoose');
const chalk = require('chalk');
const passport = require('passport');
const session = require('express-session');
const expressValidator = require('express-validator');
// const MongoStore = require('connect-mongo')(session);
const cors = require('cors');
var http = require('http');
var os = require('os');
var hostname = os.hostname();


/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env' });

/**
 * Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();
var server = http.createServer(app);
/**
 * Connect to MongoDB.
 */
// mongoose.set('useFindAndModify', false);
// mongoose.set('useCreateIndex', true);
// mongoose.set('useNewUrlParser', true);
// mongoose.connect(process.env.MONGODB_URI);
// mongoose.connection.on('error', (err) => {
//   console.error(err);
//   console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
//   process.exit();
// });


/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3005);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cors({
  credentials: true,
  origin: '*',
}));
app.use(function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Origin', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Origin','Content-type');
  next();
})


// app.use(session({
//   resave: true,
//   saveUninitialized: true,
//   secret: process.env.SESSION_SECRET,
//   cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
//   store: new MongoStore({
//     url: process.env.MONGODB_URI,
//     autoReconnect: true,
//   })
// }));
app.use(passport.initialize());
app.use(passport.session());


/**
 * Routes
 */
const routes = require('./routes');
const authRoutes = require('./routes/index.auth');

app.use('/auth', authRoutes);
app.use('/', routes);

let socketIO = require('socket.io');
let io = socketIO(server);

io.on('connection', (socket) => {
  console.log('user connected');
});


/**
 * Start Express server.
 */
server.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});





