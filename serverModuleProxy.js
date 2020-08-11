
const request = require('request');
const  host = "http://home.clinfhir.com:8054/baseR4/";

function setup(app) {

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
}

function executeQuery(inUrl,res,options) {
    options = options || {}
    let qry = inUrl.substr(7)
    options.url = host + qry;
    //let url = host + qry;
    //console.log(url)

    request(options, function (error, response, body) {
        res.statusCode = response.statusCode;
        res.setHeader('Content-Type', 'application/fhir+json')
        res.setHeader('Access-Control-Allow-Origin',"*");

        res.send(body)
    });
}

module.exports= {
    setup : setup
}