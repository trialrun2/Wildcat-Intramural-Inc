const db = require('./database');
const views = require('./views');

/** @function login
 * Serves the login page 
 * @param {http.IncomingMessage} req - the request object 
 * @param {http.ServerResponse} res - the response object
 */

/*function login(req, res) {
    var email = db.prepare("SELECT * FROM users ORDER BY email").all();
    var pug = views['login'](email);
    res.setHeader('Content-Type', "text/pug");
    res.setHeader('Content-Length', pug.length);
    res.end(pug);
}*/

//module.exports = login;

/** @function createSession
* A helper method invoked when session creation is
* successful.  The request should have an object
* as its body parameter with username and password set.
* @param {http.IncomingMessage} req - the request object
 * @param {http.ServerResponse} res - the response object
*/

function createSession(email, password) {
    console.log(username, password);
    var user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    console.log('user', user);
    if (!user) return failure(req, res, "Usename/Password not found.  Please try again.");
    bcrypt.compare(password, user.cryptedPassword, (err, result) => {
        if (err) return serveError(req, res, 500, err);
        console.log('result', result);
        if (result) success(req, res, user);
        else return failure(req, res, "Username/Password not found. Please try again.");

    });

}

module.exports = createSession;