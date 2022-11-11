var express = require('express');
const db = require('../database');
const login = require('../public/javascripts/login');
var router = express.Router();

// Get index page
router.get('/', function (req, res, next) {
    var users = db.prepare("SELECT * FROM users").all();
    res.render('index', { title: 'Data goes here', users: JSON.stringify(users) });
});

// Get teams page
router.get('/teams', function (req, res, next) {
    res.render('teams', { title: 'Data goes here' });
});

// Get leagues page
router.get('/leagues', function (req, res, next) {
    res.render('leagues', { title: 'Data goes here' });
});

// Get about page
router.get('/about', function (req, res, next) {
    res.render('about', { title: 'Data goes here' });
});

// Get login page
router.get('/login', function (req, res, next) {
    var users = db.prepare("SELECT * FROM users").all();
    console.log('Now on login page')
    res.render('login', { title: 'Data goes here', users: (users) });
});

// Post from login page
router.post('/login', function (req, res, next) {
    var email = req.body.email;
    var pass = req.body.password;
    console.log(email, pass);
    res.redirect('./home')
});


// Get sign-up page
router.get('/signup', function (req, res, next) {
    res.render('signup', { title: 'Data goes here' });
});

// Post from sign-up page
router.post('/signup', function (req, res, next) {
    var fname = req.body.fname;
    var lname = req.body.lname;
    var email = req.body.email;
    var pass = req.body.password;
    console.log(fname, lname, email, pass);
    res.redirect('./home')
})

// Get home page
router.get('/home', function (req, res, next) {
    res.render('home', { title: 'Data goes here' });
});

// Get stats page
router.get('/stats', function (req, res, next) {
    res.render('stats', { title: 'Data goes here' });
});

// Get rules page
router.get('/rules', function (req, res, next) {
    res.render('rules', { title: 'Data goes here' });
});

module.exports = router;