const userModel = require('../models/usersModel.js');

function search(req, res) {
    let userName = req.query.userName;
    userModel.getUser(userName, function(error, results) {
        res.json(results);
    })
}

module.exports = {
    search: search
};