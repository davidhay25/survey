
const request = require('request');
const  host = "http://home.clinfhir.com:8054/baseR4/";
var cors = require('cors')

function setup(app) {

    //app.options

    app.options('/proxy/*', cors({origin:'*'}));

    app.get('/proxy/*',function(req,res) {
        executeQuery(req.url,res)
    });

    app.put('/proxy/*',function(req,res) {
        var body = '';
        req.on('data', function (data) {
            body += data;
        });

        req.on('end', function () {
            let options = {method:'PUT',body:body};
            executeQuery(req.url,res,options)
        })


    });

    app.post('/proxy/*',function(req,res) {
        var body = '';
        req.on('data', function (data) {
            body += data;
        });

        req.on('end', function () {
            let options = {method:'POST',body:body};
            executeQuery(req.url,res,options)
        })
    })

    app.patch('/proxy/*',function(req,res) {
        var body = '';
        req.on('data', function (data) {
            body += data;
        });

        req.on('end', function () {
            let options = {method:'PATCH',body:body};
            options.headers = {'content-type':'application/json-patch+json'}
            executeQuery(req.url,res,options)
        })
    })
}

function executeQuery(inUrl,res,options) {
    options = options || {}
    let qry = inUrl.substr(7)
    options.url = host + qry;
    //let url = host + qry;
    console.log(options)

    request(options, function (error, response, body) {
        res.statusCode = response.statusCode;
        res.setHeader('Content-Type', 'application/fhir+json')
        res.setHeader('Access-Control-Allow-Origin',"*");

        res.setHeader('Access-Control-Allow-Headers', 'content-type');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');


//console.log(res.heade)
        res.send(body)
    });
}

module.exports= {
    setup : setup
}