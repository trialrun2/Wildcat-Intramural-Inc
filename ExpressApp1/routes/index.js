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
    var code = req.query.tc;
    console.log(code);
    var team = db.prepare(`SELECT * FROM teams`).get(code);
    var players = db.prepare(`SELECT * FROM userToTeam`).get(teams.team_id);
    var members;

    for (let i = 0; i < players.length; i++) {
        members.push(db.prepare(`SELECT * FROM users`).get(players[i].user_id));
    }
    var teams = db.prepare("SELECT * FROM teams").all();

    res.render('teams', { title: 'Teams', teams: JSON.stringify(teams), user: logged_in });
    //res.render('teams', { title: 'Teams', teams: teams });
});

// Get leagues page
router.get('/leagues', function (req, res, next) {
    var sportId = req.query.si;
    var leagues = db.prepare("SELECT * FROM leagues WHERE sport_id = ?").all(sportId);
    var aleagues = db.prepare("SELECT * FROM leagues").all();
    res.render('leagues', { title: 'Leagues', leagues: leagues, aleagues: aleagues, user: logged_in });
});

// Get about page
router.get('/about', function (req, res, next) {
    res.render('about', { title: 'About', user: logged_in });
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

    if (!user) {
        res.render('login', { title: 'Login', msg: 'Incorrect Usename/Password. Please try again.', users: (users) });
    }

    bcrypt.compare(pass, user.password_hash, (err, result) => {
        if (err) return serveError(req, res, 500, err);
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
    var teams = [];
    var leagues = [];
    var userID = logged_in.id;

    var u2t = db.prepare("SELECT * FROM userToTeam WHERE user_id = ?").all(userID);
    for (let i = 0; i < u2t.length; i++) {
        teams.push(db.prepare("SELECT * FROM teams WHERE team_id = ?").get(u2t[i].team_id));
    }

    for (let i = 0; i < teams.length; i++) {
        leagues.push(db.prepare("SELECT * FROM leagues WHERE league_id = ?").get(teams[i].league_id));
    }

    res.render('home', { title: 'Home', user: logged_in, teams: teams, u2t: u2t, leagues: leagues, sports: sports });
});

// Posts for home pages
router.post('/home', function (req, res, next) {
    
    

    
    
});

// Get stats page
router.get('/stats', function (req, res, next) {
    res.render('stats', { title: 'Stats', user: logged_in });
});

// Get rules page
router.get('/rules', function (req, res, next) {
    res.render('rules', { title: 'Rules', user: logged_in });
});

// Get sports page
router.get('/sports', function (req, res, next) {
    var sports = db.prepare("SELECT * FROM sports").all();
    res.render('sports', { title: 'Sports', sports: sports, user: logged_in, s: JSON.stringify(sports) });
});

// get createTeam page
router.get('/createTeam', function (req, res, next) {
    var sports = db.prepare("SELECT * FROM sports").all();
    var leagues = db.prepare("SELECT * FROM leagues").all();
    res.render('createTeam', { title: 'CreateTeam', sports: sports, leagues: leagues, user: logged_in });
});

router.post('/createTeam', function (req, res, next) {
    var tn = req.body.tn;
    var leagueID = req.body.lid;

    while (1) {
        var code = Math.floor(Math.random() * 90000) + 10000;
        var team = db.prepare(`SELECT * FROM teams WHERE code = ?`).get(code);
        console.log(code);
        console.log(team);
        if (!team) {
            db.prepare(`INSERT INTO teams (teamName, league_id, code) VALUES (?, ?, ?)`).run(tn, leagueID, code);
            break;
        }
    }

    var team = db.prepare(`SELECT * FROM teams WHERE code = ?`).get(code);
    db.prepare(`INSERT INTO userToTeam (user_id, team_id, captain) VALUES (?, ?, ?)`).run(logged_in.id, team.team_id, 1);

    res.redirect('/home');
});

router.post('/joinTeam', function (req, res, next) {
    var tc = req.body.tc;
    var team = db.prepare(`SELECT * FROM teams WHERE code = ?`).get(tc);
    db.prepare(`INSERT INTO userToTeam (user_id, team_id, captain) VALUES (?, ?, ?)`).run(logged_in.id, team.team_id, 0);
    res.redirect('/home');
});

// Get addLeague page
router.get('/addLeague', function (req, res, next) {
    var userID = logged_in.id;
    var sports = db.prepare("SELECT * FROM sports").all();
    var leagues = db.prepare("SELECT * FROM leagues").all();

    if (userID <= 2) {
        res.render('addLeague', { title: 'Add League', user: logged_in, sports: sports, leagues: leagues });
    }
    else {
        res.redirect('/home');
    }
});

router.post('/addLeague', function (req, res, next) {
    var sport = req.body.sname;
    var div = req.body.div;
    var day = req.body.day;
    var time = req.body.time;
    db.prepare("INSERT INTO leagues (sport_id, leagueName, gameDay, gameTime) VALUES (?, ?, ?, ?)").run(sport, div, day, time);
    res.redirect('/addLeague');
});

router.post('/removeLeague', function (req, res, next) {
    var lid = req.body.lid;
    db.prepare(`DELETE FROM leagues WHERE league_id = ?`).run(lid);
    res.redirect('/addLeague');
});

// Get addSports page
router.get('/addSport', function (req, res, next) {
    var userID = logged_in.id;
    var sports = db.prepare("SELECT * FROM sports").all();

    if (userID < 3) {
        res.render('addSport', { title: 'Add Sport', user: logged_in, sports: sports });
    }
    else {
        res.redirect('/home');
    }
});

router.post('/addSport', function (req, res, next) {
    var sportName = req.body.sport;
    var rules = req.body.rules;
    console.log(sportName + ' ' + rules);
    db.prepare("INSERT INTO sports (sportName, sportRules) VALUES (?, ?)").run(sportName, rules);
})

module.exports = router;