const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const saltRounds = 10;
const config = require('../models/config.js');

var con = mysql.createConnection(config);

con.connect(function(err) {
    if(err) {
        throw err;
    }
    console.log("database is connected");
})


module.exports = router;

