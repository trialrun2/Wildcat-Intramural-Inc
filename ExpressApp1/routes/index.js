var express = require('express');
var bcrypt = require('bcrypt');
const db = require('../database');
var router = express.Router();
const saltRounds = 10;
var logged_in;
var message_code = 0;

// Get index page
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Wildcat Intramural Inc.' });
});

// Get login page
router.get('/login', function (req, res, next) {
    res.render('login', { title: 'Login', msg: '' });
});

// Post Login page
router.post('/login', function (req, res, next) {
    var email = req.body.email;
    var pass = req.body.password;
    var user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

    if (!user) {
        res.render('login', { title: 'Login', msg: 'Incorrect Usename/Password. Please try again.', users: (user) });
    }

    bcrypt.compare(pass, user.password_hash, (err, result) => {
        if (err) return serveError(req, res, 500, err);
        if (!result) {
            if (pass == user.password_hash) {
                logged_in = user;
                res.redirect('./home');
            }
            else {
                res.render('login', { title: 'Login', msg: 'Incorrect Username/Password. Please try again.', users: (user) });
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

// post sign up page
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
        setTimeout(function () {
            logged_in = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);
            res.redirect('/home');
        }, 250);
        
    }
    else {
        res.render('signup', { title: 'Signup', msg: 'Email already exists' });
    }
});

// Get home page
router.get('/home', function (req, res, next) {
    var sports = db.prepare("SELECT * FROM sports").all();
    var teams = [];
    var games = [];
    var leagues = [];
    var userID = logged_in.id;
    var team1;
    var team2;
    var msg = "";
    var joinmsg = "";
    var allgames = db.prepare("SELECT * FROM games").all();

    var u2t = db.prepare("SELECT * FROM userToTeam WHERE user_id = ?").all(userID);
    if (u2t.length == 0) {
        joinmsg = "Create or Join a team!";
    }

    for (let i = 0; i < u2t.length; i++) {
        teams.push(db.prepare("SELECT * FROM teams WHERE team_id = ?").get(u2t[i].team_id));
    }

    for (let i = 0; i < teams.length; i++) {
        if (teams[i].league_id != 0) {
            leagues.push(db.prepare("SELECT * FROM leagues WHERE league_id = ?").get(teams[i].league_id));
            for (let j = 0; j < allgames.length; j++) {
                if (allgames[j].team1_id == teams[i].team_id) {
                    games.push(allgames[j]);
                    console.log("pushing1");
                } else if (allgames[j].team2_id == teams[i].team_id) {
                    games.push(allgames[j]);
                    console.log("pushing2");
                }
            }
        }
    }
    if (message_code == 1) {
        msg = "Invalid Team Code";
    }
    else if (message_code == 2) {
        msg = "Cannot be on multiple teams in the same league";
    }
    else if (message_code == 3) {
        msg = "This League is already full";
    }
    else {
        msg = "";
    }
    message_code = 0;

    res.render('home', {
        title: 'Home', user: logged_in,
        teams: teams, u2t: u2t, leagues: leagues,
        sports: sports, msg: msg, joinmsg: joinmsg, games: games
    });
});

// Get teams page
router.get('/teams', function (req, res, next) {
    var players = [];
    var sport;
    var tid = req.query.tid;
    var team = db.prepare(`SELECT * FROM teams WHERE team_id = ?`).get(tid);
    var u2t = db.prepare(`SELECT * FROM userToTeam WHERE team_id = ?`).all(tid);
    var captain = db.prepare(`SELECT * FROM userToTeam WHERE team_id = ? AND user_id = ?`).get(tid, logged_in.id);
    if (!captain) {
        captain = {'captain' : '0'};
    }
    var league = db.prepare(`SELECT * FROM leagues WHERE league_id = ?`).get(team.league_id);
    if (league) {
        sport = db.prepare(`SELECT * FROM sports WHERE sport_id = ?`).get(league.sport_id);
    }
    else {
        league = 0;
    }

    for (let i = 0; i < u2t.length; i++) {
        players.push(db.prepare(`SELECT * FROM users WHERE id = ?`).get(u2t[i].user_id));
    }

    res.render('teams', { title: 'Teams', team: team, user: logged_in, players: players, league: league, sport: sport, captain: captain });
});

// Post Change Name
router.post('/changeName', function (req, res, next) {
    var teamName = req.body.tn;
    var teamId = req.body.tid;
    db.prepare(`UPDATE teams SET teamName = ? WHERE team_id = ?`).run(teamName, teamId);
    res.redirect('/teams/?tid=' + teamId);
});

// Get leagues page
router.get('/leagues', function (req, res, next) {
    var lid = req.query.lid;
    var league = db.prepare(`SELECT * FROM leagues WHERE league_id = ?`).get(lid);
    var teams = db.prepare(`SELECT * FROM teams WHERE league_id = ? ORDER BY teamName`).all(league.league_id);
    var sport = db.prepare(`SELECT * FROM sports WHERE sport_id = ?`).get(league.sport_id);
    res.render('leagues', { title: 'Leagues', league: league, teams: teams, user: logged_in, sport: sport });
});


router.post('/generateGames', function (req, res, next) {
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var count = 0;
    var lid = req.body.lid;
    var league = db.prepare(`SELECT * FROM leagues WHERE league_id = ?`).get(lid);

    //console.log(date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate());

    var teams = db.prepare(`SELECT * FROM teams WHERE league_id = ?`).all(lid);
    var length = Math.floor(teams.length / 2);

    for (let i = 0; i < length; i++) {
        for (let j = length; j < teams.length; j++) {

            var date = new Date();
            var day = weekdays[date.getDay()];
            do {
                date.setDate(date.getDate() + 1);
                day = weekdays[date.getDay()];
                count++;
            } while ((day != league.gameDay) || (day == league.gameDay && count < 6));

            var look = 1;
            var datecounter = 0;
            while (1) {
                currentDate = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

                var games = db.prepare(`SELECT * FROM games WHERE date = ?`).all(currentDate);

                console.log('DateCount: ' + datecounter + ', How many games today: ' + games.length);

                if (games.length == 0) {
                    db.prepare(`INSERT INTO games (team1_id, team2_id, location, date, time, league_id) VALUES (?, ?, ?, ?, ?, ?)`).run(teams[i].team_id, teams[j].team_id, 'K-State Rec', currentDate, league.gameTime, lid);
                    break;
                }

                for (let k = 0; k < games.length; k++) {
                    if (games[k].team1_id == teams[i].team_id || games[k].team2_id == teams[i].team_id || games[k].team1_id == teams[j].team_id || games[k].team2_id == teams[j].team_id) {
                        console.log('need another week');
                    }
                    else {
                        db.prepare(`INSERT INTO games (team1_id, team2_id, location, date, time, league_id) VALUES (?, ?, ?, ?, ?, ?)`).run(teams[i].team_id, teams[j].team_id, 'K-State Rec', currentDate, league.gameTime, lid);
                        look = 0;
                        break;
                    }
                    look = 1;
                }

                if (look == 1) {
                    date.setDate(date.getDate() + 7);
                    console.log(date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate());
                    datecounter += 1;
                }
                else {
                    break;
                }
            }
        }
    }
        
    res.redirect('/leagues/?lid=' + lid);
});

// Get rules page 
router.get('/rules', function (req, res, next) {
    var sid = req.query.sid;
    var sport = db.prepare(`SELECT * FROM sports WHERE sport_id = ?`).get(sid);
    res.render('rules', { title: 'Rules', user: logged_in, sport: sport });
});

// Get sports page
router.get('/sports', function (req, res, next) {
    var sports = db.prepare("SELECT * FROM sports ORDER BY sportName").all();
    res.render('sports', { title: 'Sports', sports: sports, user: logged_in, s: JSON.stringify(sports) });
});

// Get stats page
router.get('/stats', function (req, res, next) {
    var sports = db.prepare("SELECT * FROM sports").all();
    var leagues = db.prepare("SELECT * FROM leagues").all();
    res.render('stats', { title: 'Stats', user: logged_in, sports: sports, leagues: leagues });
});

// Get about page
router.get('/about', function (req, res, next) {
    res.render('about', { title: 'About', user: logged_in });
});

// get createTeam page
router.get('/createTeam', function (req, res, next) {
    var sports = db.prepare("SELECT * FROM sports ORDER BY sportName").all();
    var leagues = db.prepare("SELECT * FROM leagues ORDER BY leagueName, " +
        "CASE" +
        " WHEN gameDay = 'Sunday' THEN 1" +
        " WHEN gameDay = 'Monday' THEN 2" +
        " WHEN gameDay = 'Tuesday' THEN 3" +
        " WHEN gameDay = 'Wednesday' THEN 4" +
        " WHEN gameDay = 'Thursday' THEN 5" +
        " WHEN gameDay = 'Friday' THEN 6" +
        " WHEN gameDay = 'Saturday' THEN 7" +
        " END, gameTime").all();
    res.render('createTeam', { title: 'CreateTeam', sports: sports, leagues: leagues, user: logged_in });
});

// createTeam post
router.post('/createTeam', function (req, res, next) {
    var tn = req.body.tn;
    var leagueID = req.body.lid;
    var league = db.prepare(`SELECT * FROM leagues WHERE league_id = ?`).get(leagueID);
    var u2t = db.prepare(`SELECT * FROM userToTeam WHERE user_id = ?`).all(logged_in.id);

    if (league.length == 8) {
        message_code = 3;
        res.redirect('/home');
        return;
    }

    for (let i = 0; i < u2t.length; i++) {
        var teams = db.prepare(`SELECT * FROM teams WHERE team_id =?`).get(u2t[i].team_id);
        console.log(teams.league_id);
        if (leagueID == teams.league_id) {
            message_code = 2;
            res.redirect('/home');
            return;
        }
    }

    while (1) {
        var code = Math.floor(Math.random() * 90000) + 10000;
        var team = db.prepare(`SELECT * FROM teams WHERE code = ?`).get(code);
        if (!team) {
            db.prepare(`INSERT INTO teams (teamName, league_id, code) VALUES (?, ?, ?)`).run(tn, leagueID, code);
            break;
        }
    }

    var team = db.prepare(`SELECT * FROM teams WHERE code = ?`).get(code);
    db.prepare(`INSERT INTO userToTeam (user_id, team_id, captain) VALUES (?, ?, ?)`).run(logged_in.id, team.team_id, 1);
    res.redirect('/home');
});

// Post for joinTeam
router.post('/joinTeam', function (req, res, next) {
    var tc = req.body.tc;
    var team = db.prepare(`SELECT * FROM teams WHERE code = ?`).get(tc);
    var u2t = db.prepare(`SELECT * FROM userToTeam where user_id = ?`).all(logged_in.id);

    if (!team) {
        message_code = 1;
        res.redirect('/home');
        return;
    }

    for (let i = 0; i < u2t.length; i++) {
        var teams = db.prepare(`SELECT * FROM teams WHERE team_id =?`).get(u2t[i].team_id);
        if (team.league_id == teams.league_id) {
            message_code = 2;
            res.redirect('/home');
            return;
        }
    }

    db.prepare(`INSERT INTO userToTeam (user_id, team_id, captain) VALUES (?, ?, ?)`).run(logged_in.id, team.team_id, 0);
    res.redirect('/home');
});

// Get addLeague page
router.get('/addLeague', function (req, res, next) {
    var sports = db.prepare("SELECT * FROM sports ORDER BY sportName").all();
    var leagues = db.prepare("SELECT * FROM leagues ORDER BY leagueName, " +
        "CASE" +
        " WHEN gameDay = 'Sunday' THEN 1" +
        " WHEN gameDay = 'Monday' THEN 2" +
        " WHEN gameDay = 'Tuesday' THEN 3" +
        " WHEN gameDay = 'Wednesday' THEN 4" +
        " WHEN gameDay = 'Thursday' THEN 5" +
        " WHEN gameDay = 'Friday' THEN 6" +
        " WHEN gameDay = 'Saturday' THEN 7" +
        " END, gameTime").all();

    if (logged_in.admin == 1) {
        res.render('addLeague', { title: 'Add League', user: logged_in, sports: sports, leagues: leagues });
    }
    else {
        res.redirect('/home');
    }
});

// Post for addLeague page
router.post('/addLeague', function (req, res, next) {
    var sport = req.body.sname;
    var div = req.body.div;
    var day = req.body.day;
    var time = req.body.time;
    db.prepare("INSERT INTO leagues (sport_id, leagueName, gameDay, gameTime) VALUES (?, ?, ?, ?)").run(sport, div, day, time);
    res.redirect('/addLeague');
});

// Post for removeLeague
router.post('/removeLeague', function (req, res, next) {
    var lid = req.body.lid;
    var teams = db.prepare(`SELECT * FROM teams WHERE league_id = ?`).all(lid);

    db.prepare(`DELETE FROM leagues WHERE league_id = ?`).run(lid);

    for (let i = 0; i < teams.length; i++) {
        db.prepare(`UPDATE teams SET league_id = ? WHERE team_id = ?`).run(0, teams[i].team_id);
    }
    
    res.redirect('/addLeague');
});

// Get addSports page
router.get('/addSport', function (req, res, next) {
    var sports = db.prepare("SELECT * FROM sports ORDER BY sportName").all();
    if (logged_in.admin == 1) {
        res.render('addSport', { title: 'Add Sport', user: logged_in, sports: sports });
    }
    else {
        res.redirect('/home');
    }
});

// Post for addSport
router.post('/addSport', function (req, res, next) {
    var sportName = req.body.sport;
    var rules = req.body.rules;
    console.log(sportName + ' ' + rules);
    db.prepare("INSERT INTO sports (sportName, sportRules) VALUES (?, ?)").run(sportName, rules);
    res.redirect('/addSport');
});

// Post for removeSport
router.post('/removeSport', function (req, res, next) {
    var sid = req.body.sid;
    var teams;
    
    var leagues = db.prepare(`SELECT * FROM leagues WHERE sport_id = ?`).all(sid);
    for (let i = 0; i < leagues.length; i++) {
        teams = db.prepare(`SELECT * FROM teams WHERE league_id = ?`).all(leagues[i].league_id);
        for (let j = 0; j < teams.length; j++) {
            db.prepare(`UPDATE teams SET league_id = ? WHERE team_id = ?`).run(0, teams[j].team_id);
        }
        db.prepare(`DELETE FROM leagues WHERE sport_id = ?`).run(sid);
    }
    db.prepare(`DELETE FROM sports WHERE sport_id = ?`).run(sid);

    res.redirect('/addSport');
});

// Gets the remove Team page
router.get('/removeTeam', function (req, res, next) {
    var teams = db.prepare("SELECT * FROM teams ORDER BY teamName").all();
    res.render('removeTeam', { title: 'Update User', user: logged_in, teams: teams });
});

// Post for removeTeam
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
    var allusers = db.prepare("SELECT * FROM users ORDER BY name").all();
    if (logged_in.admin == 1) {
        res.render('updateUser', { title: 'Update User', user: logged_in, allUsers: allusers });
    }
    else {
        res.redirect('/home');
    }
});

// Post for updateUser -- makes a normal user an admin
router.post('/updateUser', function (req, res, next) {
    var uID = req.body.auid;
    db.prepare(`UPDATE users SET admin = ? WHERE id = ?`).run("1", uID);
    res.redirect('/updateUser');
});

// Post for update admin -- makes an admin a normal user
router.post('/updateAdmin', function (req, res, next) {
    var ruID = req.body.ruid;
    db.prepare(`UPDATE users SET admin = ? WHERE id = ?`).run("0", ruID);
    res.redirect('/updateUser');
});

// Post for remove user
router.post('/removeUser', function (req, res, next) {
    var uID = req.body.uid;    
    db.prepare(`DELETE FROM users WHERE id = ?`).run(uID);
    var u2t = db.prepare(`SELECT * FROM userToTeam WHERE user_id = ?`).all(uID);
    for (let i = 0; i < u2t.length; i++) {
        db.prepare(`DELETE FROM userToTeam WHERE user_id = ?`).run(u2t[i].user_id);
    }
    res.redirect('/updateUser');
});

// Post for gameInformation
router.get('/gameInformation', function (req, res, next) {
    var games = db.prepare("SELECT * FROM games").all();
    var leagues = db.prepare("SELECT * FROM leagues").all();
    var sports = db.prepare("SELECT * FROM sports").all();
    var teams = db.prepare("SELECT * FROM teams").all();
    if (logged_in.admin == 1) {
        res.render('gameInformation', {
            title: 'Game Information', user: logged_in,
            games: games, leagues: leagues, sports: sports, teams: teams
        });
    }
    else {
        res.redirect('/home');
    }
});


router.post('/gameInformation', function (req, res, next) {

});

// Get u2t table to display, mostly for testing to see if users/ teams are deleted correctly
router.get('/u2t', function (req, res, next) {
    var u2t = db.prepare(`SELECT * FROM userToTeam`).all();
    if (logged_in.admin == 1) {
        res.render('u2t', { title: 'U2T', user: logged_in, u2t: u2t })
    }
    else {
        res.redirect('/home');
    }   
})


module.exports = router;