const express = require('express')
const http = require('http');
const app = express();

let surveyModule = require("./serverModuleSurvey.js")
const dbName = "survey";
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb://127.0.0.1:27017', {useUnifiedTopology: true},function(err, client) {
    if (err) {
        //throw err;
        console.log('>>> Mongo server not running')
    } else {
        console.log('Db connect OK')
        const db = client.db(dbName);


        surveyModule.setup(app,db);
        //client.close();

    }
});

console.log('xx')
let port = 8080
let server = http.createServer(app).listen(port);


app.use('/', express.static(__dirname,{index:'/survey.html'}));


console.log('server listening on port ' + port)

/*

//enable SSL - https://aghassi.github.io/ssl-using-express-4/
const https = require('https');
const sslOptions = {
    key: fs.readFileSync('./keys/key.pem'),
    cert: fs.readFileSync('./keys/cert.pem'),
    passphrase:'ne11ieh@y'
};

https.createServer(sslOptions, app).listen(8443)
console.log('server listening via TLS on port 8443');

*/