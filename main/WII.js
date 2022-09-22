/*//Imports
const express = require('express');
const wii = express();
var port = process.env.PORT || 1337;

//Static Files
wii.use(express.static('public'));
wii.use('/css', express.static(__dirname + 'public/css'));
wii.use('/js', express.static(__dirname + 'public/js'));
wii.use('/img', express.static(__dirname + 'public/img'));

//Set Views
wii.set('views', './views');
wii.set('view engine', 'ejs');

//Index Page
wii.get('', (req, res) => {
    res.render('index');
});

//About Page
wii.get('/about', (req, res) => {
    res.render('about', { text: 'About Page' });
});

wii.listen(port, () => console.info('Listening on port ${port}'));
*/

//using with HTML
'use strict';
var http = require('http');
var port = process.env.PORT || 1337;
var fs = require('fs');

http.createServer(function (req, res) {
    fs.readFile('views/index.html', function (err, data) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();
    });

}).listen(port);

console.log('Server running at http:127.0.0.1:' + port + '/ ',);