var express = require('express');
const db = require('../database');
var router = express.Router();

// Get index page
router.get('/', function (req, res, next) {
    var users = db.prepare("SELECT * FROM users").all();
    res.render('index', { title: 'Wildcat Intramural Inc.', users: JSON.stringify(users) });
});

// Get teams page
router.get('/teams', function (req, res, next) {
    res.render('teams', { title: 'Teams' });
});

// Get leagues page
router.get('/leagues', function (req, res, next) {
    res.render('leagues', { title: 'Leagues' });
});

// Get about page
router.get('/about', function (req, res, next) {
    res.render('about', { title: 'About' });
});

// Get login page
router.get('/login', function (req, res, next) {
    var users = db.prepare("SELECT * FROM users").all();
    console.log('Now on login page')
    res.render('login', { title: 'Login', msg: '', users: (users) });
});

// Post from login page
router.post('/login', function (req, res, next) {
    var users = db.prepare("SELECT * FROM users").all();
    var email = req.body.email;
    var pass = req.body.password;
    console.log(email, pass);

    var user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    console.log('user', user);

    if (!user) {
        res.render('login', { title: 'Login', msg: 'Incorrect Usename/Password. Please try again.', users: (users) });
    }
    if (pass === user.password_hash) {
        res.redirect('./home');
    }
    else {
        res.render('login', { title: 'Login', msg: 'Incorrect Username/Password. Please try again.', users: (users) });
    }

    
});


// Get sign-up page
router.get('/signup', function (req, res, next) {
    res.render('signup', { title: 'Sign Up' });
});

// Post from sign-up page
router.post('/signup', function (req, res, next) {
    var fname = req.body.fname;
    var lname = req.body.lname;
    var name = fname + " " + lname;
    var email = req.body.email;
    var pass = req.body.password;
    console.log(fname, lname, email, pass);

    var user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
        db.prepare("INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)").run(email, name, pass);
    } else {
        res.render('signup', { title: 'Signup', msg: 'Email already exists' });
    }

    res.redirect('./home')
})

// Get home page
router.get('/home', function (req, res, next) {
    res.render('home', { title: 'Home' });
});

// Get stats page
router.get('/stats', function (req, res, next) {
    res.render('stats', { title: 'Stats' });
});

// Get rules page
router.get('/rules', function (req, res, next) {
    res.render('rules', { title: 'Rules' });
});

module.exports = router;