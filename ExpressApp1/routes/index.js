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

//get createTeam page
router.get('/createTeam', function (req, res, next) {
    var sports = db.prepare("SELECT * FROM sports").all();
    var leagues = db.prepare("SELECT * FROM leagues").all();
    res.render('createTeam', {title: 'CreateTeam', sports: sports, leagues: leagues, user: logged_in });
});

//post from createTeam page
router.post('/createTeam', function (req, res, next) {
    var teams = [];
    var leagues = [];
    var tn = req.body.tn;
    var leagueID = req.body.lid;
    var userID = logged_in.id;
    var u2t = db.prepare("SELECT * FROM userToTeam WHERE user_id = ?").all(userID);

    console.log(leagueID);
    console.log(tn);

    for (let i = 0; i < u2t.length; i++) {
        teams.push(db.prepare("SELECT * FROM teams WHERE team_id = ?").get(u2t[i].team_id));
    }

    for (let i = 0; i < teams.length; i++) {
        leagues.push(db.prepare("SELECT * FROM leagues WHERE league_id = ?").get(teams[i].league_id));
    }
    res.render('home', { title: 'Home', user: logged_in, teams: teams, u2t: u2t, leagues: leagues });
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
    //console.log('user', user);

    if (!user) {
        res.render('login', { title: 'Login', msg: 'Incorrect Usename/Password. Please try again.', users: (users) });
    }

    //console.log(user.password_hash);

    bcrypt.compare(pass, user.password_hash, (err, result) => {
        if (err) return serveError(req, res, 500, err);
        //console.log('result', result);
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
    //console.log('userID' + userID);
    var u2t = db.prepare("SELECT * FROM userToTeam WHERE user_id = ?").all(userID);
    //console.log('u:'+u2t.user_id + ' t:' +u2t.team_id + ' c:'+u2t.captain);
    for (let i = 0; i < u2t.length; i++) {
        teams.push(db.prepare("SELECT * FROM teams WHERE team_id = ?").get(u2t[i].team_id));
    }

    for (let i = 0; i < teams.length; i++) {
        //console.log(teams[i]);
        leagues.push(db.prepare("SELECT * FROM leagues WHERE league_id = ?").get(teams[i].league_id));

        //console.log(leagues[i].leagueName);
    }
    
    //console.log(teams);
    res.render('home', { title: 'Home', user: logged_in, teams: teams, u2t: u2t, leagues: leagues});
});

// Posts for home pages
router.post('/home', function (req, res, next) {
    var tc = req.body.tc;
    //console.log("tc" + tc);

    
    
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
    res.render('sports', { title: 'Sports', sports: sports, user: logged_in });
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
        var u2t = db.prepare("SELECT * FROM userToTeam WHERE user_id = ?").all(userID);
        for (let i = 0; i < u2t.length; i++) {
            teams.push(db.prepare("SELECT * FROM teams WHERE team_id = ?").get(u2t[i].team_id));
        }

        for (let i = 0; i < teams.length; i++) {
            leagues.push(db.prepare("SELECT * FROM leagues WHERE league_id = ?").get(teams[i].league_id));
        }
        res.render('home', { title: 'Home', user: logged_in, teams: teams, u2t: u2t, leagues: leagues });
    }
});

router.post('/addLeague', function (req, res, next) {
    var sport = req.body.sname;
    var div = req.body.div;
    var day = req.body.day;
    var time = req.body.time;
    console.log(sport + div + day + time);
    db.prepare("INSERT INTO leagues (sport_id, leagueName, gameDay, gameTime) VALUES (?, ?, ?, ?)").run(sport, div, day, time);
    var sports = db.prepare("SELECT * FROM sports").all();
    var leagues = db.prepare("SELECT * FROM leagues").all();
    res.render('addLeague', { title: 'Add League', user: logged_in, sports: sports, leagues: leagues });
});

router.post('/removeLeague', function (req, res, next) {
    var lid = req.body.lid;
    db.prepare(`DELETE FROM leagues WHERE league_id = ?`).run(lid);
    var sports = db.prepare("SELECT * FROM sports").all();
    var leagues = db.prepare("SELECT * FROM leagues").all();
    res.render('addLeague', { title: 'Add League', user: logged_in, sports: sports, leagues: leagues });
});

// Get addSports page
router.get('/addSport', function (req, res, next) {
    var teams = [];
    var leagues = [];
    var userID = logged_in.id;
    var sports = db.prepare("SELECT * FROM sports").all();

    if (userID < 3) {
        res.render('addSport', { title: 'Add Sport', user: logged_in, sports: sports });
    }
    else {
        var u2t = db.prepare("SELECT * FROM userToTeam WHERE user_id = ?").all(userID);
        for (let i = 0; i < u2t.length; i++) {
            teams.push(db.prepare("SELECT * FROM teams WHERE team_id = ?").get(u2t[i].team_id));
        }

        for (let i = 0; i < teams.length; i++) {
            leagues.push(db.prepare("SELECT * FROM leagues WHERE league_id = ?").get(teams[i].league_id));
        }
        res.render('home', { title: 'Home', user: logged_in, teams: teams, u2t: u2t, leagues: leagues });
    }
});

router.post('/addSport', function (req, res, next) {
    var sportName = req.body.sport;
    var r = req.body.rules;
    db.prepare(`INSERT INTO sports (sportName, sportRules) VALUES (?, ?)`).run(sportName, r)
    var sports = db.prepare("SELECT * FROM sports").all();
    res.render('addSport', { title: 'Add Sport', user: logged_in, sports: sports });
});

router.post('/removeSport', function (req, res, next) {
    var sID = req.body.sid;
    db.prepare(`DELETE FROM sports WHERE sport_id = ?`).run(sID);
    var sports = db.prepare("SELECT * FROM sports").all();
    res.render('addSport', { title: 'Add Sport', user: logged_in, sports: sports });
});

module.exports = router;