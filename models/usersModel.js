const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

//console.log("DB URL: " + db_url);
//const pool = new Pool({ connectionString: db_url });
const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});
pool.connect();

/*function getUser(userName, callback) {
    let sql = 'SELECT * FROM users WHERE "userName" = $::text';
    let params = [userName];
    pool.query(sql, params, function(err, db_results) {
        if (err) {
            throw err;
        } else {
            let results = {
                success: true,
                list: db_results.rows
            };
            callback(null, results);
        }
    });
}*/

function createUser(userName, userPassword, callback) {
    let sql = 'INSERT INTO users ("userName", "userPassword") VALUES ($:::userName, $::userPassword)';
    let params = [userName, userPassword];
    pool.query(sql, params, function(err, db_results) {
        if (err) {
            throw err;
        } else {
            let results = {
                success: true,
                list: db_results.rows
            };
            callback(null, results);
        }
    });
}

module.exports = {
    createUser: createUser
};