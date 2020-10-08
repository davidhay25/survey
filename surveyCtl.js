
angular.module("sampleApp")
    .controller('surveyCtrl',
        function ($scope,$http,modalService) {
            $scope.input = {deployType:{}, notes:{}}

           // $scope.input.component = "{resourceType:Observation}"

            $scope.lst = []

            $http.get('./allResources.json').then(
                function(data) {
                    //console.log(data.data);
                    $scope.allResources = data.data;
                    $scope.allResources.sort(function(a,b) {
                        if (a.name > b.name) {
                            return 1
                        } else {
                            return -1;
                        }
                    });

                    $scope.fullResourceList = $scope.allResources.slice();
                    $scope.setFilter("")
                    $scope.input.fhirVersion4 = true
                    makeAllResourceList()
                }
            );


            $scope.checkProduct = function(product){
                let url = "/survey/product/" + product
                $http.get(url).then(
                    function (data) {
                        console.log(data)
                        $scope.previous = data.data;

                    }, function (err) {
                        //console.log(err)
                        //alert('Unable to contact survey server')
                    }
                );
            }

            $scope.selectPreviousItem = function(item) {
                $scope.currentItem = item;

                console.log(item)
            }

            $scope.deletePreviousItem = function(item){
                var modalOptions = {
                    closeButtonText: "No, I've changed my mind'",
                    actionButtonText: 'Yep, sure do',
                    headerText: 'Delete previous survey',
                    bodyText: "Are you sure you want to remove this survey?"
                };

                modalService.showModal({}, modalOptions).then(function () {

                    let url = "/survey/" + item._id
                    $http.delete(url).then(
                        function(data) {
                            alert('survey has been removed')
                            $scope.checkProduct(item.product)
                        }, function (err) {
                            alert('Sorry, there was an error removing this surver. Please post a message in the clinFHIR zulip stream')
                        }
                    )
                })
            }

            function makeAllResourceList(triggerVersion) {

                if ( $scope.allResources) {
                    $scope.allResources.length = 0;
                }


                if ($scope.fullResourceList) {
                    $scope.fullResourceList.forEach(function (item) {

                        let include = false;
                        if ($scope.input.fhirVersion2 && item.version.indexOf('R2') > -1) {include = true}
                        if ($scope.input.fhirVersion3 && item.version.indexOf('R3') > -1) {include = true}
                        if ($scope.input.fhirVersion4 && item.version.indexOf('R4') > -1) {include = true}
                        //if (item.version.indexOf(version)> -1) {
                        // $scope.allResources.push(item)
                        //}

                        if (include) {
                            $scope.allResources.push(item)
                        }
                    });

                    $scope.lst = $scope.allResources.slice();       //update the display
                    $scope.input.selectedOnly = false;
                    $scope.setFilter($scope.input.filter)           //show the filter
                }

            }


            function loadSurveyResults(){
                $http.get('survey/results').then(
                    function (data) {
                        $scope.results = data.data;

                    }, function (err) {
                        console.log(err)
                        alert('Unable to contact survey server')
                    }
                );
            }
            loadSurveyResults()

            $scope.$watch(function(scope) { return scope.input.fhirVersion2 },
                function(newValue) {
                    makeAllResourceList('R2')
                }
            );
            $scope.$watch(function(scope) { return scope.input.fhirVersion3 },
                function(newValue) {
                    makeAllResourceList('R3')
                }
            );
            $scope.$watch(function(scope) { return scope.input.fhirVersion4 },
                function(newValue) {
                    makeAllResourceList('R4')
                }
            );

            $scope.selectedOnly = function(so) {
                //console.log(so)
                if (so) {
                    $scope.lst.length = 0;
                    $scope.allResources.forEach(function (item) {
                        var name = item.name; //.toLowerCase();
                        if ($scope.input.selected[name]) {
                            $scope.lst.push(item)
                        }
                    })
                } else {
                    $scope.setFilter($scope.input.filter)
                }


            };

            $scope.setFilter = function(filter) {
                if (filter !== "" && filter !== undefined) {
                    filter = filter.toLowerCase()

                    $scope.lst.length = 0;
                    $scope.allResources.forEach(function (item) {
                        var name = item.name.toLowerCase();
                        if (name.indexOf(filter) > -1) {
                            $scope.lst.push(item)
                        }
                    })
                } else {
                    $scope.lst.length = 0;
                    $scope.allResources.forEach(function (item) {

                        $scope.lst.push(item)
                    })

                }
            };


            $scope.submit = function() {

                var modalOptions = {
                    closeButtonText: "No, I'm not finished",
                    actionButtonText: 'Yes, all finished',
                    headerText: 'Save survey',
                    bodyText: "Are you sure you're ready to save the survey? It can be repeated any number of times for different products."
                };

                if ($scope.input.contact) {
                    //modalOptions.bodyText "Thanks for supplying your email. " +
                } else {

                }


                modalService.showModal({}, modalOptions).then(function () {
                    let result = {name:$scope.input.name,contact : $scope.input.contact,resources:[]};


                    result.date = new Date().toLocaleDateString(
                        'en-gb',
                        {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }
                    )

                    //result.date = new Date().toString()
/*
                    var today = new Date();
                    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
                    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                    result.date  = date+' '+time;
*/

                    //result.date = new Date().toISOString();
                    result.product = $scope.input.product;
                    result.fhirVersion2 = $scope.input.fhirVersion2;
                    result.fhirVersion3 = $scope.input.fhirVersion3;
                    result.fhirVersion4 = $scope.input.fhirVersion4;
                    $scope.allResources.forEach(function (item) {
                        var name = item.name;
                        if ($scope.input.selected[name]) {
                            let resource = {name:name,deployType : $scope.input.deployType[name], notes: $scope.input.notes[name]};

                            result.resources.push(resource)
                        }

                    });

                    console.log(result)

                    $http.post('/survey',result).then(
                        function (data) {
                            loadSurveyResults()
                            alert('Survey has been saved. Thanks for responding')
                        }, function (err) {
                            console.log(err)
                            alert('Sorry, there was an error saving the survey. Can you please raise an issue on the clinFHIR stream of the FHIR chat?')
                        }
                    )
                })





            }

            $scope.checked = function(row){
                if (row) {
                    if (! $scope.input.deployType[row.name]) {
                        $scope.input.deployType[row.name] = 'dev'
                    }

                }

            };


        $scope.canShowDEP = function (row) {
            console.log(row.name)
            if ($scope.input.filter) {
                if (row.name.indexOf($scope.input.filter) > -1) {
                    return true
                } else {
                    return false;
                }
            } else {
                return true;
            }

        }


    });
