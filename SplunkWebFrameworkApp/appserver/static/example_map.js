require([
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/postprocessmanager",
    "splunkjs/mvc/tableview",
    "splunkjs/mvc/splunkmapview",
    "splunkjs/mvc/simplexml/ready!"
], function(
    SearchManager,
    PostProcessManager,
    TableView,
    SplunkMapView
) {

    // Define the search manager and postprocess manager
    var searchmain = new SearchManager({
        id: "search-map",
        search: "| inputlookup earthquakes.csv | search  Region=Washington",
        preview: true,
        cache: true
    });

    var searchsub1 = new PostProcessManager({
        id: "search-splunkmap",
        managerid: "search-map",
        search: "| rename Lat as lat, Lon as lon | geostats count"
    });

    // Set up a table for displaying marker info
    new TableView({
        id: "markerinfo",
        managerid: "search-map",
        el: $("#markerinfotable")
    }).render();

    // Set up the Splunk map
    var mysplunkmap = new SplunkMapView({
        id: "example-splunkmap",
        managerid: "search-splunkmap",
        drilldown: true,
        drilldownRedirect: true,
        tileSource: "splunk",
        "mapping.map.zoom": 7,
        "mapping.map.center": "(47.5,-120)", // Center on Washington state
        "mapping.markerLayer.markerOpacity": 0.6,
        "mapping.markerLayer.markerMinSize": 15,
        el: $("#mysplunkmapview")
    }).render();

    // Capture click data and display the object in the console
    mysplunkmap.on("click:marker", function(e) {
        e.preventDefault();

        // Display a data object in the console
        console.log("Map click: ", e.data['row.count'] + " earthquakes near (" + e.data['row.latitude'] + ", " +e .data['row.longitude'] + ")");
    });

});
