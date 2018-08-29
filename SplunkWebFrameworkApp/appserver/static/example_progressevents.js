require([
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/simplexml/ready!"
], function(SearchManager) {

    // Create the search manager
    var mysearch = new SearchManager({
        id: "search1",
        app: "search",
        cache: false,
        search: "index=_internal | head 50000"
    });

    mysearch.on('search:failed', function(properties) {
        // Print the entire properties object
        console.log("FAILED:", properties);
        document.getElementById("progresstext").innerHTML="Failed!";
    });

    mysearch.on('search:progress', function(properties) {
        // Print just the event count from the search job
        console.log("IN PROGRESS.\nEvents so far:", properties.content.eventCount);
        document.getElementById("progresstext").innerHTML="In progress with " + properties.content.eventCount + " events...";
    });

    mysearch.on('search:done', function(properties) {
        // Print the search job properties
        console.log("DONE!\nSearch job properties:", properties.content);
        document.getElementById("progresstext").innerHTML="Done!";
    });
});
