
angular.module("sampleApp")
    .controller('surveyCtrl',
        function ($scope,$http,modalService,$localStorage) {
            $scope.input = {deployType:{}, notes:{}}


            $http.get("calls.json").then(
                function (data) {
                    $scope.calls = data.data;
                }
            )



/*
            let clientID = "2d56a4a7-4134-4646-8552-841c036587a3"
            let secret = "W1.ob7rYbj34_5M~Mhs2XH80H.H7P57~tX"
            let grantType = "client_credentials"
            let scope = "api://bf0c0db0-08e7-4ed8-bb85-8d5676869424/.default"
*/

            $scope.makeCall = function(call) {
               // let qry = "Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|AAA7777"
                $scope.currentCall = call
                delete $scope.result;
                //let qry = "Patient?name=hay"
                //qry = ""
                $http.post('/query',call.url).then(
                    function(data) {
                        console.log(data)
                        $scope.result = data.data
                    }, function (err) {
                        console.log("fail: " + err)
                    }
                )
            }


            $scope.test = function() {
                let qry = "Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|AAA7777"
                //let qry = "Patient?name=hay"
                //qry = ""
                $http.post('/query',qry).then(
                    function(data) {
                        console.log(data)
                    }, function (err) {
                        console.log("fail: " + err)
                    }
                )

            }


            $scope.getToken = function(){


                $http.post('/token').then(
                    function(data) {
                        $scope.result = data.data;
                    },function(err) {
                        alert(angular.toJson(err))
                    }
                )
/*
                return
                let url = "https://login.microsoftonline.com/8a024e99-aba3-4b25-b875-28b0c0ca6096/oauth2/v2.0/token"
                let body = "Client_id="+ clientID;
                body += "&Client_secret=" + secret;
                body += "&Grant_type=" + grantType;
                body += "&scope=" + scope;





                let config = {headers:{'content-type':'application/x-www-form-urlencoded'}}
                config.method = "POST";
                config.data = body;
                config.url = url

                $http(config).then(
                    //$http.post(url,body,config).then(
                    function(data) {
                        console.log(data)
                    },function(err) {
                        console.log(err)
                    }
                )
*/
            }

    });
