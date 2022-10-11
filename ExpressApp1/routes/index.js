var express = require('express');
var router = express.Router();

// Get home page
router.get('/index', function (req, res, next) {
    res.render('index', { title: 'Data goes here' });
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

module.exports = router;