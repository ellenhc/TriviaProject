function createUser() {
    let userName = $("#userName").val();
    let userPassword = $("#userPassword").val();
    $.get("/create", { userName: userName, userPassword: userPassword }, function(data) {
        for (var i = 0; i < data.list.length; i++) {
            let user = data.list[i];
            $("#results").append("<p> Welcome, " + user.userName + "</p>");
        }
    })
}