const { Pool } = require("pg");

const db_url = process.env.DATABASE_URL;

console.log("DB URL: " + db_url);
const pool = new Pool({ connectionString: db_url });

function getUser(userName, callback) {
    let sql = 'SELECT * FROM users WHERE "userName" = $1::text';
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
}

module.exports = {
    getUser: getUser
};