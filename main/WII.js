module.exports = router;

wii.use(express.urlencoded({ extended: false }));
wii.use(cookieParser());
wii.use(express.static(path.join(__dirname, 'public')));

wii.use('/', indexRouter);
wii.use('/users', usersRouter);

// catch 404 error and send to error handler
wii.use(function (req, res, next) {
    next(createError(404));
});

// error handler
wii.use(function (err, re1, res, next) {
    // set locals, only provide error in dev
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = wii;


/*using with HTML
'use strict';
var http = require('http');
var port = process.env.PORT || 1337;
var fs = require('fs');

http.createServer(function (req, res) {
    fs.readFile('views/Login.html', function (err, data) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();
    });

}).listen(port);

console.log('Server running at http:127.0.0.1:' + port + '/ ',);
*/