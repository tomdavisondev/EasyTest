const https = require('https');
const fs = require('fs');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const logger = require('./logger');
require('dotenv').config();

const PORT = process.env.PORT || 8000;
const hostname = 'localhost';

const httpsOptions = {
	cert: fs.readFileSync(process.env.cert),
	key: fs.readFileSync(process.env.key)
};

const app = express();

const httpsServer = https.createServer(httpsOptions, app);

app.use(bodyParser.json());

// Passport config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').MongoURI;

// Connect to Mongo
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
	.then(() => logger.server('info', 'MongoDB Connected'))
	.catch(err => logger.server('error', 'Could not connect to mongodb server: \n' + err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use('/icons', express.static(__dirname + '/node_modules/bootstrap-icons/icons'));

//Bodyparser
app.use(express.urlencoded({ extended: false }));

// Express Session
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}));

app.use(methodOverride('_method'));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
logger.server('info', 'Passport started');

// Connect flash
app.use(flash());

// Global Vars
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/projects', require('./routes/projects'));
app.use('/requirements', require('./routes/requirements'));

httpsServer.listen(PORT, hostname);