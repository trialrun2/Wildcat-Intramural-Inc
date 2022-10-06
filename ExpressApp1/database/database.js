var sqlite3 = require('better-sqlite3');

const Database = require('better-sqlite3');
var db = new Database('db/development.sqlite3');

/*

new sqlite3.Database('./users.db', sqlite3.OPEN_Create, (err) => {
    if (err && err.code == "SQLITE_CANTOPEN") {
        createDatabase();
        return;
    } else if (err) {
        console.log("Getting error " + err);
        exit(1);
    }
    runQueries(db);
})

function createDatabase() {
    var newdb = new sqlite3.Database('user.db', (err) => {
        if (err) {
            console.log("Getting error " + err);
            exit(1);
        }
        createTables(newdb);
    });
}
//creating database tables here
//creates leagues database with ID, name, and date
//creates status table to tell if league is open or not
//1 means league is open 0 means league is closed
function createTables(newdb) {
    newdb.exec(`
    create table users (
        user_id int primary key not null,
        league_name text not null,
        league_dateTime text not null
    );
    insert into leagues (league_id, league_name, league_dateTime)
        values (1, 'Basketball', 'Sunday, 5:30PM'),
               (2, 'Flag Football', 'Monday, 8:00PM'),
               (3, 'Baseball', 'Tuesday, 7:30PM');

    create table league_status(
        league_id int not null,
        league_status int not null
    );

    insert into league_status (league_id, league_status)
        values(1, 1),
              (2, 1),
              (3, 0);
        `, () => {
        runQueries(newdb);
    });
}



function runQueries(db) {
    db.all(`select league_name, league_dateTime from leagues l
    inner join league_status ls on l.league_id = ls.league_id
   where league_status = ?`, 1, (err, rows) => {
        rows.forEach(row => {
            console.log(row.league_name + "\t" + row.league_dateTime + "\t" + row.league_status);
        });
    });
}*/