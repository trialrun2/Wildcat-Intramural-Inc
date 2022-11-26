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
    var teams = db.prepare("SELECT * FROM teams").all();

    res.render('teams', { title: 'Teams', teams: JSON.stringify(teams) });
    //res.render('teams', { title: 'Teams', teams: teams });
});

// Get leagues page
router.get('/leagues', function (req, res, next) {
    var sportId = req.query.si;
    var leagues = db.prepare("SELECT * FROM leagues WHERE sport_id = ?").all(sportId);
    var aleagues = db.prepare("SELECT * FROM leagues").all();
    res.render('leagues', { title: 'Leagues', leagues: leagues, aleagues: aleagues });
});

// Get about page
router.get('/about', function (req, res, next) {
    res.render('about', { title: 'About' });
});

//get createTeam page
router.get('/createTeam', function (req, res, next) {
    var sports = db.prepare("SELECT * FROM sports").all();
    var bballLeague = db.prepare("SELECT * FROM leagues WHERE sport_id = ?").get(1);
    console.log(bballLeague);
    var fballLeague = db.prepare("SELECT * FROM leagues WHERE sport_id = ?").get(2);
    console.log(fballLeague);
    res.render('createTeam', {
        title: 'CreateTeam', sports: sports,
        bballLeague: bballLeague,
        fballLeague: fballLeague
    });
});

//post from createTeam page
router.post('/createTeam', function (req, res, next) {
    
});

// Get login page
router.get('/login', function (req, res, next) {
    res.render('login', { title: 'Login', msg: '' });
});

// Post from login page
router.post('/login', function (req, res, next) {
    var users = db.prepare("SELECT * FROM users").all();
    var email = req.body.email;
    var pass = req.body.password;

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
    var sports = db.prepare("SELECT * FROM sports").all();
    res.render('home', {
        title: 'Home', user: logged_in,
        sports: sports
    });
});

// Posts for home pages
router.post('/home', function (req, res, next) {
    var tc = req.body.tc;
    console.log("tc" + tc);
    
});

// Get stats page
router.get('/stats', function (req, res, next) {

    res.render('stats', { title: 'Stats' });
});

// Get rules page
router.get('/rules', function (req, res, next) {
    res.render('rules', { title: 'Rules' });
});

router.get('/createTeam', function (req, res, next) { 
    var sports = db.prepare("SELECT * FROM sports").all();
    res.render('createTeam', { title: 'Create Team', sports: sports });
});


router.get('/sports', function (req, res, next) {
    var sports = db.prepare("SELECT * FROM sports").all();
    res.render('sports', { title: 'Sports', sports: sports, s: JSON.stringify(sports) });
});

module.exports = router;