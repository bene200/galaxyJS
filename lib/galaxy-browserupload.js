var upload = function(galaxy, file, historyId, success){
    var apiKey = galaxy.getApiKey();
    var baseUrl = galaxy.getGalaxyUrl();

    var fd = new FormData();
    fd.append("key", apiKey);
    fd.append('tool_id', "upload1");
    fd.append("history_id", historyId);
    var toolInput = {
        "file_type": "auto",
        "dbkey": "?",
        "files_0|NAME": file.name,
        "files_0|type": "upload_dataset"
    };
    fd.append("inputs", JSON.stringify(toolInput));
    fd.append("files_0|file_data", file);
    $.ajax({
        url: baseUrl + "/api/tools",
        type: "POST",
        data: fd,
        mimeType: "multipart/form-data",
        cache: false,
        contentType: false,
        processData: false,
        success: function(response) {
            success(response);
        },
        error: function(jqXHR, textStatus, errorMessage) {
            throw errorMessage; // Optional
        }
    });
};

module.exports = upload;