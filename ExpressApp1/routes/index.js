var express = require('express');
const db = require('../database');
var router = express.Router();

// Get home page
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
    res.render('login', { title: 'Data goes here' });
});

// Get sign-up page
router.get('/signup', function (req, res, next) {
    res.render('signup', { title: 'Data goes here' });
});

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