const db = require('./database');
const views = require('./views');

/** @function login
 * Serves the login page 
 * @param {http.IncomingMessage} req - the request object 
 * @param {http.ServerResponse} res - the response object
 */

function login(req, res) {
    var email = db.prepare("SELECT * FROM users ORDER BY email").all();
    var pug = views['login'](email);
    res.setHeader('Content-Type', "text/pug");
    res.setHeader('Content-Length', pug.length);
    res.end(pug);
}

module.exports = login;