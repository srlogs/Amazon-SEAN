require('dotenv').config()
const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const saltRounds = 10;
const config = require('../models/config.js');
const { runInNewContext } = require('vm');



/*  Connection to the database   */
var con = mysql.createConnection(config);

con.connect(function(err) {
    if(err) {
        throw err;
    }
    console.log("database is connected");
});

/*  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------  */

/*  Registration of the consumers  */
router.post('/users/register', (req, res, next) => {
    var query = "CREATE TABLE IF NOT EXISTS userdata(username VARCHAR(100), phone VARCHAR(15), email VARCHAR(100) NOT NULL, password VARCHAR(100), role VARCHAR(20), PRIMARY KEY(email))";
    con.query(query, (err, result) => {
        if(err) throw err;
        console.log("Table created successfully!");
    });
    let role = "customer";

    // Hashing the password 
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        var query = "INSERT INTO userdata (username, phone, email, password, role) VALUES ?";
        let values = [
            [req.body.username, req.body.phone, req.body.email, hash, role]
        ];
        con.query(query, [values], (err, result) => {
            if(err) throw err;
            console.log("Data inserted successfully!");
        });
    });
    res.sendStatus(200);
});

/*  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------  */

/*  Login module of the consumers   */
router.post('/users/login', (req, res, next) => {
    var query = "SELECT * from userdata WHERE email = ?";
    let values = [
        req.body.email
    ];
    con.query(query, values, (err, result) => {
        if(err) throw err;
        if(result.length > 0) {
            const email = req.body.email;
            const user = { email : email};
            //  Generate accessToken 
            const accessToken = jwt.sign(user, process.env.TOKEN_SECRET);

            // Comparing passwords
            bcrypt.compare(req.body.password, result[0].password, (err, isMatch) => {
                if(err) throw err;
                if(isMatch) {
                    res.json({accessToken : accessToken, status : 200});
                }
                else {
                    res.sendStatus(400);
                }
            })
        }
        else {
            res.sendStatus(400);
        }
    });
});


/*  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------  */

/*  Authenticate JWT tokens */
function authenticate(req, res, next) {
    const authHeader = req.headers['token'];
    const token = authHeader && authHeader.split(' ')[0];
    if(token == null) {
        return res.sendStatus(401);
    }
    jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
        if(err) throw err;
        req.user = data;
        next();
    });
}

/*  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------  */

/*  Getting consumer data */
router.post('/users/data', authenticate, (req, res, next) => {
    con.query("SELECT * FROM userdata WHERE email = ?", req.user.email, (err, result) => {
        if(err)  throw err;
        res.send(result);
    } )
})

module.exports = router;

