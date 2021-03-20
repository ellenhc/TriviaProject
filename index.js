const express = require('express')
const path = require('path')
const fs = require('fs')
const https = require('https')
const app = express();
const PORT = process.env.PORT || 5000

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.get('/api/getQuestions', handleQuestions);
app.get('/api/getOneQuestion', getOneQuestion);
app.get('/', (req, res) => res.render('pages/index'))
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))

let questionList = [];

function handleQuestions(req, res) {
    const startURL = "https://opentdb.com/api.php?";
    let amount = req.query.amount;
    let category = req.query.category;
    let difficulty = req.query.difficulty;
    const url = startURL + `amount=${amount}` + ((category != 'any') ? `&category=${category}` : '') + ((difficulty != 'any') ? `&difficulty=${difficulty}` : '') + `&type=multiple`;
    console.log(url);
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

function getOneQuestion(req, res) {
    let question = questionList.pop();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(question));
}