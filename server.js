
/*
* certbot keys at /etc/letsencrypt/live/survey.clinfhir.com/fullchain.pem
* keyfile /etc/letsencrypt/live/survey.clinfhir.com/privkey.pem
* "certbot renew" to renew keys (2020-09-28)
* */

//https://javascript.info/async-await

const express = require('express')
const http = require('http');
//const https = require('https');
//const cors = require('cors')
const app = express();
const fs = require('fs');

const request = require('request')

//let fhirServer = "http://home.clinfhir.com:8054/baseR4/";
 let fhirServer = "https://alexapiuat.medtechglobal.com/FHIR/";

let accessToken;        //upadted by getToken()

//otherwise get a leaf nod error...
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

let port = 8080
let server = http.createServer(app).listen(port);
console.log('server listening on port ' + port)

app.use('/', express.static(__dirname,{index:'/medtech.html'}));


app.post('/query',function(req,res){
    let body = ""
    req.on('data', function (data) {
        body += data;
    });

    req.on('end', function (data) {
        //body += data;
        console.log('body: ' + body)

        //this is a self executing async function, so can use wait to get an access token...
        void async function() {
            if (! accessToken) {
                console.log('getting access token...')
                await getToken();
                console.log('got access token...')
            }

            let response = await sendQuery(body)
            if (response.success) {
                res.send(response.response)
            } else {
                // see if the error was an expired token. If it was, then get another token and
                //try again. Only do this once though...
                console.log('There was an error - retrying...')
                await getToken();
                response = await sendQuery(body)
                if (response.success) {
                    res.send(response.response)
                } else {
                    console.log("No luck. I'm giving up...")
                    res.status(500);
                    console.log(response.response)
                    res.send(response.response)
                }
            }
        }()

    })


})


function sendQuery(qry) {
    return new Promise(function (resolve,reject) {
        let url = fhirServer + qry
        console.log('Calling: ' + url)

        if (!accessToken['access_token']) {
            console.log('No access token...')
            resolve({success:false,response:'No access token...'})
            return;
        }

        const options = {
            url: url,
            headers: {
                'mt-facilityid': "F2N060-E",
                'Authorization': 'Bearer ' +  accessToken['access_token']
            }
        };

        //console.log(options)
        console.log('sending request...')
        request.get(options, function optionalCallback(err, httpResponse, body) {
            console.log('got response...')
            if (err) {
                resolve({success:false,response:err})
            }
            resolve({success:true,response:body})
        })
    })
}

app.post('/token',function(req,res){

    getToken().then(
        function(token){
            res.send(token)
        }
    )


})


//get a token from the auth server. returns a Promise so we can support async / await in the call...
function getToken() {
    return new Promise(function (resolve,reject) {
        let url = "https://login.microsoftonline.com/8a024e99-aba3-4b25-b875-28b0c0ca6096/oauth2/v2.0/token"
        let clientID = "2d56a4a7-4134-4646-8552-841c036587a3"
        let secret = "W1.ob7rYbj34_5M~Mhs2XH80H.H7P57~tX"
        let grantType = "client_credentials"
        let scope = "api://bf7945a6-e812-4121-898a-76fea7c13f4d/.default"

        const formData = {'Client_id':clientID,'Client_secret':secret,'Grant_type':grantType,Scope:scope}

        let options = {};
        options.url = url;
        options.form = formData;
        options.headers = {'content-type':'application/x-www-form-urlencoded'}
        options.headers.host = "login.microsoftonline.com"

        request.post(options, function optionalCallback(err, httpResponse, body) {
            if (err) {
                console.log(err)
                reject("Unable to get access token")
            }
            accessToken = JSON.parse(body);
            //console.log(accessToken)

            //console.log(body)
            resolve(body)

        });
    })


}


