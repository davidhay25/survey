
/*
* certbot keys at /etc/letsencrypt/live/survey.clinfhir.com/fullchain.pem
* keyfile /etc/letsencrypt/live/survey.clinfhir.com/privkey.pem
* "certbot renew" to renew keys (2020-09-28)
* */

const express = require('express')
const http = require('http');
const https = require('https');

const app = express();
const fs = require('fs');

let request = require('request');


try {
    // Certificate - https://itnext.io/node-express-letsencrypt-generate-a-free-ssl-certificate-and-run-an-https-server-in-5-minutes-a730fbe528ca
    const privateKey = fs.readFileSync('/etc/letsencrypt/live/survey.clinfhir.com/privkey.pem', 'utf8');
    const certificate = fs.readFileSync('/etc/letsencrypt/live/survey.clinfhir.com/cert.pem', 'utf8');
    const ca = fs.readFileSync('/etc/letsencrypt/live/survey.clinfhir.com/chain.pem', 'utf8');

    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
    };

    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(443, () => {
        console.log('HTTPS Server running on port 443');
    });

} catch (ex) {
    console.log("SSL not enabled, starting HTTP server (temp for developing)")

    let port = 8080
    let server = http.createServer(app).listen(port);
    console.log('server listening on port ' + port)

}

app.use('/', express.static(__dirname,{index:'/survey.html'}));



//--- ssl proxy

app.get('/proxy/:query',function(req,res) {
    let host = "http://home.clinfhir.com:8054/baseR4/";
    let qry = req.url.substr(7)

    let url = host + qry
    console.log(url)


    request(url, function (error, response, body) {

        res.statusCode = response.statusCode;
        res.setHeader('Content-Type', 'application/fhir+json')

        res.send(body)


    });



})


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