const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const app = express();
const PORT = 4000;

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// cors middleware
app.use(cors());

const apiRoute = require('./api');

// LOADING routes
app.use('/api',apiRoute);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

