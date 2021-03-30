let currentQuestionIndex = 0;
let questionList = [];
let score = 0;

function getCurrentQuestion() {
    return questionList[currentQuestionIndex];
}

function getOneQuestion() {
    //GRAB VALUES FROM FORM
    let numQuestions = $('#amount').val();
    let category = $('#category').val();
    let difficulty = $('#difficulty').val();
    let type = 'multiple';

    let params = { amount: numQuestions, category: category, difficulty: difficulty, type: type, };
    //console.log(params);

    $.post('/api/getQuestions', params, function(data, status) {
        //console.log(data);
        questionList = data;
        renderOneQuestion();
    });

}

function renderOneQuestion() {
    /*removes previous page content*/
    const $node = $(document.body);
    $node.empty();
    renderStats($node);

    /*renders current question to page*/
    const currentQuestion = getCurrentQuestion();
    const $container = $(document.createElement("div")); //creates a div to hold the question content
    $container.addClass("trivia-container"); //adds a class to that div

    const $questionDiv = $(document.createElement("div")); //adds a div to hold the question itself
    $questionDiv.addClass("question-div"); //adds a class to style the question
    $questionDiv.html(`<h1>${currentQuestion.question}</h1>`); //adds the question text as an h1
    $node.append($container); //adds trivia-container to page
    $container.append($questionDiv); //adds questionDiv to page

    const $answerContainer = $(document.createElement("div")); //creates container to hold the answers
    $answerContainer.addClass("answer-container"); //adds a class to that container

    const $correctAnswerDiv = $(document.createElement("div")); //creates a div to show the user the correct answer
    $correctAnswerDiv.addClass("show-answer");

    let randomAnswer = [0, 1, 2, 3]; //has same length as number of possible answers
    //Shuffles array to get a number in no particular order using the Fisher Yates method
    for (i = randomAnswer.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * i)
        k = randomAnswer[i]
        randomAnswer[i] = randomAnswer[j]
        randomAnswer[j] = k
    }
    randomAnswer.forEach((i) => {
        if (i == 3) {
            const $answer = $(document.createElement("div"));
            $answer.html(`<p>${currentQuestion.correct_answer}</p>`);
            $answer.addClass("answer");
            $answerContainer.append($answer);

            //add a click handler for CORRECT answer
            $answer.click(() => {
                if (!$container.hasClass("done")) {
                    $container.addClass("done"); //adds class "done"

                    $answer.css("background-color", "#007849"); //change background-color to green
                    $answer.css("transition", "all 1.5s"); //adds gradual transition to green color

                    score++; //increments the score
                    const $scoreBox = $(document.querySelector(".score-box"));
                    $scoreBox.html(renderScore());
                }
            })
        } else {
            const $answer = $(document.createElement("div"));
            $answer.html(`<p>${currentQuestion.incorrect_answers[i]}</p>`);
            $answer.addClass("answer");
            $answerContainer.append($answer);

            //add a click handler for INCORRECT answers
            $answer.click(() => {
                if (!$container.hasClass("done")) {
                    $container.addClass("done"); //adds class "done"

                    $answer.css("background-color", "#C30916"); //change background-color to red
                    $answer.css("transition", "all 1.5s"); //adds a gradual transition to red color
                }
            })
        }
    });

    $container.append($answerContainer); //adds the answer container to page
    renderButton(); //adds next button once an answer has been clicked
    $container.append($correctAnswerDiv);
}

function renderButton() {
    const $node = $(document.querySelector(".trivia-container"));

    const $buttonContainer = $(document.createElement("div"));
    $buttonContainer.addClass("btn-container");

    const $nextButton = $(document.createElement("span"));
    $nextButton.html(`Next &#9658`);
    $nextButton.addClass("btn");
    $buttonContainer.append($nextButton);
    $nextButton.click(() => {
        currentQuestionIndex++; //increments the currentQuestionIndex to go to next q when fxn is called
        //renders the next question if the questions have not been exhausted
        if (currentQuestionIndex != questionList.length) {
            renderOneQuestion();
        } else {
            renderGoodbye();
        }
    })

    $node.append($buttonContainer);
}

function renderGoodbye() {
    /*save score to games table*/
    $.post("/api/save", { score: score }, function(data) {
        console.log("Back from the server with:");
        console.log(data);
    })

    /*removes question/answer content*/
    const $node = $(document.querySelector(".trivia-container"));
    $node.empty();

    /*shows message and play again button */
    const $goodbyeContainer = $(document.createElement("div"));
    $goodbyeContainer.addClass("goodbye-div");
    $goodbyeContainer.html(`<p>Thanks for playing!</p>`);

    const $playAgain = $(document.createElement("div"));
    $playAgain.addClass("play-again");
    $playAgain.html(`Play Again?`);
    $goodbyeContainer.append($playAgain);

    $node.append($goodbyeContainer);

    /*reloads page to go back to the original form when play again is clicked*/
    $playAgain.click(() => {
        location.reload();
    })
}

function renderStats($node) {
    const $statsBox = $(document.createElement("div"));
    $statsBox.addClass("stats-box");
    $node.append($statsBox);

    const $scoreBox = $(document.createElement("div"));
    $scoreBox.addClass("score-box");
    $scoreBox.html(renderScore());
    $statsBox.append($scoreBox);
}

function renderScore() {
    return `<p id="score">Score</p><h3>${score} / ${questionList.length}</h3>`;
}