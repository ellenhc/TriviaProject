const express = require('express');
const session = require('express-session');
const path = require('path');
const https = require('https')
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

function handleLogin(req, res) {
    let userName = req.body.userName;
    let userPassword = req.body.userPassword;
    if (username && password) {
        pool.query('SELECT * FROM users WHERE "userName" = ? AND "userPassword" = ?', [userName, userPassword], function(error, results, fields) {
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.userName = userName;
                res.redirect('/home');
            } else {
                res.send('Incorrect Username and/or Password!');
            }
            res.end();
        });
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }
}