const express = require('express');
const session = require('express-session');
const path = require('path');
const https = require('https');
const bcrypt = require('bcrypt');
require('dotenv').config();

const PORT = process.env.PORT || 5000

const app = express();

app.use(session({
    secret: 'my-super-secret-secret!',
    resave: false,
    saveUninitialized: true
}))


const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.post('/api/getQuestions', handleQuestions);
app.post("/login", handleLogin);
app.post("/register", handleRegister);
app.post("/logout", handleLogout);
app.post("/api/save", storeGame);
app.get("/api/history", showHistory);
app.get('/home', function(request, response) {
    if (request.session.loggedin) {
        response.send('Welcome back, ' + request.session.userName + '!');
    } else {
        response.send('Please login to view this page!');
    }
    response.end();
});
app.get('/', (req, res) => res.render('pages/index'))
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

let questionList = [];

function handleQuestions(req, res) {
    const startURL = "https://opentdb.com/api.php?";
    //console.log(req.body);
    let amount = req.body.amount;
    let category = req.body.category;
    let difficulty = req.body.difficulty;
    const url = startURL + `amount=${amount}` + ((category != 'any') ? `&category=${category}` : '') + ((difficulty != 'any') ? `&difficulty=${difficulty}` : '') + `&type=multiple`;
    getQuestions(url, data => {
        storeQuestions(data.results);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(questionList));
    });
}

function getQuestions(url, callback) {
    const options = {
        hostname: 'opentdb.com',
        path: url,
        method: 'GET'
    }
    const req = https.request(options, res => {
        res.on('data', d => {
            callback(JSON.parse(d));
        })
    })

    req.on('error', error => {
        console.error(error)
    })

    req.end()
}


function storeQuestions(questions) {
    for (let i = 0; i < questions.length; i++) {
        let question = { question: questions[i].question, correct_answer: questions[i].correct_answer, incorrect_answers: questions[i].incorrect_answers }; //just saves the question, the correct answer, and the incorrect answers and not the other data
        questionList.push(question); //adds it to the questionList array
    }
}

async function handleLogin(req, res) {
    let userName = req.body.userName;
    let userPassword = req.body.userPassword;
    if (userName && userPassword) {
        let userData = await getUser(userName);
        if (bcrypt.compareSync('userPassword', userData[0]['userPassword'])) {
            pool.query('SELECT * FROM users WHERE "userName" = $1::text', [userName], function(error, results, fields) {
                //console.log(error);
                //console.log(results);
                if (results.rows.length > 0) {
                    req.session.loggedin = true;
                    req.session.userName = userName;
                    req.session.userId = results.rows[0]['userId'];
                    res.redirect('/');
                } else {
                    res.send('Incorrect Username and/or Password.');
                }
                res.end();
            });
        } else {
            console.log("Passwords don't match.");
        }
    } else {
        res.send('Please enter Username and Password.');
        res.end();
    }
}

function getUser(userName) {
    return new Promise(function(fulfilled, rejected) {
        pool.query('SELECT * FROM users WHERE "userName"=$1', [userName], function(error, results, fields) {
            if (results.rows.length > 0) {
                //console.log(results.rows);
                //return result
                fulfilled(results.rows);
            } else {
                console.log(error);
                console.log("Couldn't get user data.");
                rejected(error);
            }
        });
    })
}

function handleRegister(req, res) {
    let userName = req.body.userName;
    let userPassword = req.body.userPassword;
    let hash = bcrypt.hashSync('userPassword', 10);
    if (userName && userPassword) {
        pool.query('INSERT INTO users ("userName", "userPassword") VALUES ($1, $2)', [userName, hash], function(error, results, fields) {
            if (!error) {
                console.log("Saved user to database");
                res.redirect('/login.html');
            } else {
                res.status(500);
                console.log("Could not save user to database");
            }
            res.end();
        });
    } else {
        res.status(400);
        res.end();
    }
}

function handleLogout(req, res) {
    //destroy session
    req.session.loggedin = false;
}

function storeGame(req, res) {
    let score = req.body.score;
    let nowDate = new Date();
    var date = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
    if (score && date) {
        pool.query('INSERT INTO games ("userId", "score", "date") VALUES ($1, $2, $3)', [req.session.userId, score, date], function(error, results, fields) {
            //console.log(error);
            //console.log(results);
            if (!error) {
                //maybe save score in session?
                console.log("Saved game to database");
            } else {
                res.status(500);
                console.log(error);
                console.log('Could not save game to database');
            }
            res.end();
        });
    } else {
        res.status(400);
        res.end();
    }
}

function getGames(userId) {
    return new Promise(function(fulfilled, rejected) {
        pool.query('SELECT * FROM games WHERE "userId"=$1', [userId], function(error, results, fields) {
            if (results.rows.length > 0) {
                //console.log(results.rows);
                //return results.rows;
                console.log("successfully grabbed games");
                fulfilled(results.rows);
            } else {
                console.log("Couldn't get games.");
                console.log(error);
                rejected(error);
            }
        });
    })
}

async function showHistory(req, res) {
    let userId = req.session.userId;
    if (userId) {
        let userData = await getGames(userId);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(userData));
    } else {
        res.status(400);
        res.end();
    }
}