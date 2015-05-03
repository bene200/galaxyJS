var GalaxyJS = function(url, apiKey){
    //An object instance is invoked with the base URL of the 
    //Galaxy instance and the developer's API key
    var baseUrl = url;
    var apiKey = apiKey;
    
    //Depends on the request and file system node modules
    var request = require('request');
    var fs = require('fs');

    this.getGalaxyUrl = function(){
        //Returns base URL
        return url;
    }; 
    this.getApiKey = function(){
        //Returns API key
        return apiKey;
    };
    this.setGalaxyUrl = function(newUrl){
        url = newUrl;
    };
    this.setApiKey = function(newKey){
        apiKey = newKey;
    };

    var makeUrl = function(url, args){
        //Creates the URL for a http-request
        //URL consists of base URL, endpoint, and the API key
        //as well as additional arguments for GET requests
        var request = baseUrl + url + "?key=" + apiKey;
        for(var el in args){
            request += "&" + el + "=" + args[el];
        }
        return request;
    };

    this.getHistories = function(callback){
        //Returns all of the user's histories
        performRequest("/api/histories/", "GET", {key: apiKey}, callback);
    };

    this.createHistory = function(histName, callback){
        //Creates a new empty history named "histName"
        var path = makeUrl("/api/histories/");
        performRequest(path, "POST", { name: histName }, callback);  
    };

    this.deleteWorkflow = function(workflowID, callback){
        //Deletes workflow with ID "workflowID"
        var data = {
            purge: "true"
        };
        var path = makeUrl("/api/workflows/" + workflowID + "/", data);
        performRequest(path, "REMOVE", {}, callback);
    };

    this.uploadToHistory = function(file, fileName, historyId, callback){
        //Uploads a file from memory (so "file" has type string) to a history
        //Performs a multipart form upload

        //The file is passed as a readable stream. I have not managed
        //to create a functioning stream directly from a string so the file
        //is written to a temporary file first. 
        //This definitely needs work.
        fs.writeFile(__dirname + '/upload.fasta', file, function(){
            var read = fs.createReadStream(__dirname + "/upload.fasta");
            var payload = {
                "key" : apiKey,
                "tool_id": "upload1",
                "history_id": historyId
            };
            var toolInput = {
                "file_type": "auto",
                "dbkey": "?",
                "files_0|NAME": fileName,
                "files_0|type": "upload_dataset"
            };
            payload.inputs = JSON.stringify(toolInput);
            payload["files_0|file_data"] = read;
            var path = baseUrl + "/api/tools/";
            performRequest(path, "POST", payload, callback, true);
        });
    };

    this.executeWorkflow = function(inputId, workflowId, historyId, callback){
        //Executes a workflow given 
        // - ID of the input file
        // - History ID
        // - Workflow ID
        //The output is passed to the callback
        var data = {
            workflow_id: workflowId,
            history: historyId,
            ds_map: {
                "5": {
                    src: "hda",
                    id: inputId
                }
            }
        };
        var path = makeUrl("/api/workflows");
        performRequest(path, "POST", data, callback);
    };

    this.getDatasetContent = function(datasetId, callback){
        //Returns the content of dataset with ID "datasetId"
        var path = makeUrl("/datasets/" + datasetId + "/display/", { preview: true });
        performRequest(path, "GET", {}, callback);
    };

    this.getJob = function(jobID, callback){
        //Gets job by ID
        var path = makeUrl("/api/jobs");
        performRequest(path, "GET", {}, function(jobList){
            jobList = JSON.parse(jobList);
            for(var i=0; i<jobList.length; i++){
                if(jobList[i].id === jobID){
                    callback(jobList[i]);
                    break;
                }
            }
        });
    };

    var performRequest = function(url, method, data, success, filePost) {
        //Makes a http call
        //method can be GET, POST, or DELETE
        var opts = {
            uri: url,
            method: method
        };
        if(method === "POST"){
            //if a file needs to be uploaded data is 
            //submitted as Form Data
            if(filePost){
                opts.formData = data;
            }
            //otherwise the data is submitted as JSON
            else {
                opts.json = data;
            }
        }
        request(
            opts,
            function(err, res, body) {
                success(body);
            });
    };

};

module.exports = GalaxyJS;