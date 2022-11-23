var express = require('express');
var bcrypt = require('bcrypt');
const db = require('../database');
var router = express.Router();
const saltRounds = 10;
var logged_in;

// Get index page
router.get('/', function (req, res, next) {
    //var users = db.prepare("SELECT * FROM users").all();
    //res.render('index', { title: 'Wildcat Intramural Inc.', users: JSON.stringify(users) });
    res.render('index', { title: 'Wildcat Intramural Inc.' });
});

// Get teams page
router.get('/teams', function (req, res, next) {
    /*var code = req.query.tc;
    console.log(code);
    var team = db.prepare(`SELECT * FROM teams`).get(code);
    var players = db.prepare(`SELECT * FROM userToTeam`).get(teams.team_id);
    var members;

    for (let i = 0; i < players.length; i++) {
        members = db.prepare(`SELECT * FROM users`).get(players[i].user_id);
    }*/
    var team = db.prepare("SELECT * FROM teams").all();

    res.render('teams', { title: 'Teams', teams: team });
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
    //var users = db.prepare("SELECT * FROM users").all();
    console.log('Now on login page')
    //res.render('login', { title: 'Login', msg: '', users: (users) });
    res.render('login', { title: 'Login', msg: '' });
});

// Post from login page
router.post('/login', function (req, res, next) {
    var users = db.prepare("SELECT * FROM users").all();
    var email = req.body.email;
    var pass = req.body.password;
    let success = true;
    console.log(email, pass);

    var user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    console.log('user', user);

    if (!user) {
        res.render('login', { title: 'Login', msg: 'Incorrect Usename/Password. Please try again.', users: (users) });
    }

    console.log(user.password_hash);

    bcrypt.compare(pass, user.password_hash, (err, result) => {
        if (err) return serveError(req, res, 500, err);
        console.log('result', result);
        if (!result) {
            if (pass === user.password_hash) {
                logged_in = user;
                res.redirect('./home');
            }
            else {
                res.render('login', { title: 'Login', msg: 'Incorrect Username/Password. Please try again.', users: (users) });
            }   
        }
        else {
            logged_in = user;
            res.redirect('./home');
        }
    });
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

    var user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
    if (!user) {
        bcrypt.hash(pass, saltRounds, (err, hash) => {
            db.prepare(`INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)`).run(email, name, hash);
        });
        user = db.prepare(`SELECT * FROM users WHERE email ?`).get(email);
        logged_in = user;
        res.redirect('./home')
    }
    else {
        res.render('signup', { title: 'Signup', msg: 'Email already exists' });
    }
});

// Get home page
router.get('/home', function (req, res, next) {
    res.render('home', { title: 'Home', user: logged_in });
});

// Posts for home pages
router.post('/home', function (req, res, next) {
    var tc = req.body.tc;
    console.log(tc);
});

// Get stats page
router.get('/stats', function (req, res, next) {
    res.render('stats', { title: 'Stats' });
});

// Get rules page
router.get('/rules', function (req, res, next) {
    res.render('rules', { title: 'Rules' });
});

router.get('/create-team', function (req, res, next){
    res.render('create-team', { title: 'Create Team' });
});

router.get('/sports', function (req, res, next) {
    var sports = db.prepare("SELECT * FROM sports").all();
    res.render('sports', { title: 'Sports', sports: sports });
});

module.exports = router;