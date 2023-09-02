require('dotenv').config();
const express = require('express');
const http = require('http');
const https = require('https');
const logger = require('morgan');
const path = require('path');
const mongoose = require("mongoose");
const { Bounty } = require('./models/bounty');
const app = express();

const databaseURL = process.env.MONGODB_URI + process.env.MOGBODB_DATABASE_NAME;
mongoose.connect(
    databaseURL, 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

app.use(logger('dev'));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/bounty/:url', async (req, res) => {
    const taskUrl = req.params.url;
    // Check DB for bounty
    const bounty = await Bounty.get({url:taskUrl});
    if (bounty){
      res.json({error: false, data: bounty});
    } else {
      res.json({error: false, data: null});
    }
});

let attemptedPort = Number(process.env.DEFAULT_PORT);
const server = http.createServer(app).listen(attemptedPort);
server.on('listening', (d) => {
    if (process.env.DEFAULT_PORT != attemptedPort) {
        console.log('Address is already in use. Using different port...');
    }
    console.log('Server is listening at', `${server.address().address}:${server.address().port}`);
  });
server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      attemptedPort++;
      setTimeout(() => {
        server.close();
        server.listen(attemptedPort);
      }, 1000);
    }
  });
// https.createServer(options, app).listen(443)