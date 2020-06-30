const express = require('express')

const app = express();


let surveyModule = require("./serverModuleSurvey.js")

var MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb://127.0.0.1:27017/clinfhir', function(err, ldb) {
    if(err) {
        //throw err;
        console.log('>>> Mongo server not running')
    } else {
        db = ldb;
        //  orionModule.setup(app,db);
        smartModule.setup(app,db);
        surveyModule.setup(app,db);
    }
});
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