const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const routes = require('./routes/route.js');

app.use(cors());
app.use(bodyParser.json());
app.use('/api', routes);

app.listen(port, () => {
    console.log("server is up!");
});
