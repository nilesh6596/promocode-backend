const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cors = require('cors');


const app = express();

// app.options('*', cors({
//     origin: '*',
//     preflightContinue: true,
//     methods: 'POST, GET, PUT, DELETE, OPTIONS',
//     optionsSuccessStatus: 204,
//     allowedHeaders: ['Origin, X-Requested-With, Content-Type, Accept, Authorization, token, orgName, user_code, File-Name'],
//     exposedHeaders: ['Authorization, File-Name']
// }))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, '/public/favicon.ico')));

require('./routes')(app);


module.exports = app;
