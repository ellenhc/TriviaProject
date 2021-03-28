const userModel = require('../models/usersModel.js');

/*function search(req, res) {
    let userName = req.query.userName;
    userModel.getUser(userName, function(error, results) {
        res.json(results);
    })
}*/

function create(req, res) {
    let userName = req.query.userName;
    let userPassword = req.query.userPassword;
    userModel.createUser(userName, userPassword, function(error, results) {
        res.json(results);
    })
}

module.exports = {
    // search: search,
    create: create
};