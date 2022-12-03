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


// Get login page
router.get('/login', function (req, res, next) {
    res.render('login', { title: 'Login', msg: '' });
});

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
            console.log(logged_in);
            res.redirect('./home');
        }
    });
});

// Get sign-up page
router.get('/signup', function (req, res, next) {
    res.render('signup', { title: 'Sign Up' });
});

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
        res.redirect('/login');
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

router.post('/home', function (req, res, next) {
    
    

    
    
});


// Get teams page
router.get('/teams', function (req, res, next) {
    var players = [];
    var tid = req.query.tid;
    var team = db.prepare(`SELECT * FROM teams WHERE team_id = ?`).get(tid);
    var u2t = db.prepare(`SELECT * FROM userToTeam WHERE team_id = ?`).all(team.team_id);
    var league = db.prepare(`SELECT * FROM leagues WHERE league_id = ?`).get(team.league_id);
    var sport = db.prepare(`SELECT * FROM sports WHERE sport_id = ?`).get(league.sport_id);

    for (let i = 0; i < u2t.length; i++) {
        players.push(db.prepare(`SELECT * FROM users WHERE id = ?`).get(u2t[i].user_id));
    }

    res.render('teams', { title: 'Teams', team: team, user: logged_in, players: players, league: league, sport: sport });
});

// Get leagues page
router.get('/leagues', function (req, res, next) {
    var lid = req.query.lid;
    var league = db.prepare(`SELECT * FROM leagues WHERE league_id = ?`).get(lid);
    var teams = db.prepare(`SELECT * FROM teams WHERE league_id = ?`).all(lid);
    var sport = db.prepare(`SELECT * FROM sports WHERE sport_id = ?`).get(league.sport_id);
    res.render('leagues', { title: 'Leagues', league: league, teams: teams, user: logged_in, sport: sport });
});

// Get rules page
router.get('/rules', function (req, res, next) {
    var sid = req.query.sid;
    var sport = db.prepare(`SELECT * FROM sports WHERE sport_id = ?`).get(sid);
    res.render('rules', { title: 'Rules', user: logged_in, sport: sport });
});

// Get sports page
router.get('/sports', function (req, res, next) {
    var sports = db.prepare("SELECT * FROM sports").all();
    res.render('sports', { title: 'Sports', sports: sports, user: logged_in, s: JSON.stringify(sports) });
});

// Get stats page
router.get('/stats', function (req, res, next) {
    res.render('stats', { title: 'Stats', user: logged_in });
});

// Get about page
router.get('/about', function (req, res, next) {
    res.render('about', { title: 'About', user: logged_in });
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
    res.redirect('/addSport');
});

router.post('/removeSport', function (req, res, next) {
    var sid = req.body.sid;
    db.prepare(`DELETE FROM sports WHERE sport_id = ?`).run(sid);
    res.redirect('/addSport');
});


// Gets the remove Team page
router.get('/removeTeam', function (req, res, next) {
    var teams = db.prepare("SELECT * FROM teams").all();
    res.render('removeTeam', { title: 'Update User', user: logged_in, teams: teams });
});

router.post('/removeTeam', function (req, res, next) {
    var tid = req.body.tid;
    
    db.prepare(`DELETE FROM teams WHERE team_id = ?`).run(tid);
    var u2t = db.prepare(`SELECT * FROM userToTeam WHERE team_id = ?`).all(tid);
    for (let i = 0; i < u2t.length; i++) {
        db.prepare(`DELETE FROM userToTeam WHERE team_id = ?`).run(u2t[i].team_id);
    }
    res.redirect('/removeTeam');
});


// Gets the update User page
router.get('/updateUser', function (req, res, next) {
    var allusers = db.prepare("SELECT * FROM users").all();
    res.render('updateUser', { title: 'Update User', user: logged_in, allUsers: allusers });
});

router.post('/updateUser', function (req, res, next) {
    var uID = req.body.auid;
    console.log(uID);
    // this needs to update the user to be an admin - need to give the user an admin column with 1 or 0
    //db.prepare(`DELETE FROM sports WHERE sport_id = ?`).run(sID);
    res.redirect('/updateUser');
});

router.post('/removeUser', function (req, res, next) {
    var uID = req.body.uid;

    // hopefully would remove user from users and delete all instances from the many to many table
    
    db.prepare(`DELETE FROM users WHERE id = ?`).run(uID);
    var u2t = db.prepare(`SELECT * FROM userToTeam WHERE user_id = ?`).all(uID);
    for (let i = 0; i < u2t.length; i++) {
        db.prepare(`DELETE FROM userToTeam WHERE user_id = ?`).run(u2t[i].user_id);
    }
    res.redirect('/updateUser');
});


// Get u2t table to display, mostly for testing to see if users/ teams are deleted correctly
router.get('/u2t', function (req, res, next) {
    var u2t = db.prepare(`SELECT * FROM userToTeam`).all();
    res.render('u2t', {title: 'U2T', user: logged_in, u2t: u2t})
})


module.exports = router;