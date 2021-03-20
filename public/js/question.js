let currentQuestionIndex = 0;
let questionList = [];

function getCurrentQuestion() {
    return questionList[currentQuestionIndex];
}

function getOneQuestion() {
    //GRAB VALUES FROM FORM
    let numQuestions = $('#amount').val();
    let category = $('#category').val();
    let difficulty = $('#difficulty').val();
    let type = 'multiple';

    let params = { amount: numQuestions, type: type, category: category, difficulty: difficulty };
    //console.log(params);

    $.get('/api/getQuestions', params, function(data, status) {
        console.log(data);
        questionList.concat(data);
        renderOneQuestion();
    });

}

function renderOneQuestion() {
    /*step 1 - remove previous page content*/
    //const node = document.querySelector("body");
    const $node = $(document.body);
    $node.empty();
    //renderStats(node);

    /*step 2 - renders current question to page*/
    const currentQuestion = getCurrentQuestion();
    const $container = document.createElement("div"); //creates a div to hold the question content
    $container.addClass("trivia-container"); //adds a class to that div

    const $questionDiv = document.createElement("div"); //adds a div to hold the question itself
    $questionDiv.addClass("question-div"); //adds a class to style the question
    $questionDiv.html(`<h1>${currentQuestion.question}</h1>`); //adds the question text as an h1
    $node.append(container); //adds trivia-container to page
    $container.append(questionDiv); //adds questionDiv to page

    const $answerContainer = document.createElement("div"); //creates container to hold the answers
    $answerContainer.addClass("answer-container"); //adds a class to that container

    const $correctAnswerDiv = document.createElement("div"); //creates a div to show the user the correct answer
    $correctAnswerDiv.addClass("show-answer");
}