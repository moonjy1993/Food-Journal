
var express = require('express');
var path = require('path');
var app = express();
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');


var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

mongoose.connect('mongodb://localhost/fooddb');

require('./config/passport')(passport);


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'static')));
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({ 
	secret: 'secret',
	resave: true,
    saveUninitialized: true 
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());




require('./app/routes.js')(app, passport);


module.exports = app;