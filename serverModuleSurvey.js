ObjectId = require('mongodb').ObjectID;

function setup(app,db) {


    app.delete('/survey/:id',function(req,res) {
        console.log('delete: ' + req.params.id)

        let id = new ObjectId(req.params.id)
        let filter = {'_id':id}
        let update = {$set : {deleted:true}}

        console.log (filter, update)

        db.collection("survey").updateOne(filter,update,function (err, result) {
            console.log(result.result.n)
            res.json()
        })

    });



    app.get('/survey/results',function(req,res) {

        //var survey = db.collection('survey');
        console.log("survey")

        let query = {deleted:null};

        db.collection("survey").find({$query: query}).toArray(function (err, doc) {
            if (err) {
                res.status(500);
                console.log(err)
                res.json({err: err});
            } else {
               let summary = {};

                doc.forEach(function (survey, inx) {
                    survey.resources.forEach(function (resource) {
                        let type = resource.name;
                        summary[type] = summary[type] || {count:0,contactable:0,dev:0,prod:0,notes:[]};
                        summary[type].count ++;
                        summary[type].type = type;
                        if (resource.deployType == 'dev') {summary[type].dev ++}
                        if (resource.deployType == 'prod') {summary[type].prod ++}
                        if (resource.notes) {
                            summary[type].notes.push(resource.notes)
                        }
                       if (survey.contact) {
                           summary[type].contactable ++;
                       }
                    })
                });

                //convert to array as easier for client
                let rtn = [];
                for (var item in summary) {


                    rtn.push(summary[item])
                }

                res.json(rtn)
            }
        })
    })



    app.get('/survey/product/:name',function(req,res) {

        let name = req.params.name;
console.log(name)
        //var survey = db.collection('survey');
        console.log("p")

        let query = {product:name,deleted:null};

        db.collection("survey").find({$query: query}).toArray(function (err, doc) {
            if (err) {
                res.status(500);
                console.log(err)
                res.json({err: err});
            } else {

                let result = []

                doc.forEach(function (d) {
                    let item = {_id:d._id,date:d.date,product:d.product,resources:[]}
                    if (d.resources) {
                        d.resources.forEach(function (resource) {
                            item.resources.push({name:resource.name})
                        });
                    }
                    result.push(item)




                });

                res.json(result)
            }
        })
    })



    app.post('/survey',function(req,res){

        var body = '';
        req.on('data', function (data) {
            body += data;
        });

        req.on('end', function () {
            var jsonBody = {};
            //just swallow errors for now
            try {
                jsonBody = JSON.parse(body);

                db.collection("survey").insert(jsonBody, function (err, result) {
                    if (err) {
                        console.log('Error inserting survey result ')
                        res.status(500);
                        res.json({err:err});
                    } else {
                        console.log(result.insertedIds[0])
                        res.json({id:result.insertedIds[0]});
                    }
                });


            } catch (ex) {
                res.status(500);
                res.json({err:ex});

            }


            //res.end();
        });

    });


}

module.exports= {
    setup : setup
}