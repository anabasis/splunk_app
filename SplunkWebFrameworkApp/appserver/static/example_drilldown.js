require([
    "splunkjs/mvc",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/postprocessmanager",
    "splunkjs/mvc/eventsviewerview",
    "splunkjs/mvc/chartview",
    "splunkjs/mvc/tableview",
    "splunkjs/mvc/splunkmapview",
    "splunkjs/mvc/simplexml/ready!"
], function(
    mvc,
    SearchManager,
    PostProcessManager,
    EventsViewer,
    ChartView,
    TableView,
    SplunkMapView
) {

    // Define the search managers and postprocess search managers
    var searchmain = new SearchManager({
        id: "main-search",
        search: "index=_internal | head 100 | fields *",
        preview: true,
        cache: true
    });

    var searchsub1 = new PostProcessManager({
        id: "subsearch1",
        managerid: "main-search",
        search: " | stats count by sourcetype"
    });

    var searchsub2 = new PostProcessManager({
        id: "subsearch2",
        managerid: "main-search",
        search: " | fields sourcetype, source, host"
    });

    var searchmap = new SearchManager({
        id: "map-search",
        search: "| inputlookup earthquakes.csv | rename Lat as lat Lon as lon | geostats count",
        preview: true,
        cache: true
    });

    // Set up the views
    var myeventsviewer = new EventsViewer({
        id: "example-eventsviewer",
        managerid: "main-search",
        type: "raw",
        "raw.drilldown": "inner",
        count: 3,
        el: $("#myeventsviewer")
    }).render();

    var mychart = new ChartView({
        id: "example-chart",
        managerid: "subsearch1",
        type: "bar",
        drilldown: "all",
        drilldownRedirect: false,
        el: $("#mychart")
    }).render();

    var mytable = new TableView({
        id: "example-table",
        managerid: "subsearch2",
        pageSize: 3,
        wrap: true,
        drilldown: "cell",
        el: $("#mytable")
    }).render();

    var mymap = new SplunkMapView({
        id: "example-splunkmap",
        managerid: "map-search",
        drilldownRedirect: false,
        el: $("#mymap")
    }).render();

    // Set up event handlers to customize drilldown behavior
    mychart.on("click:legend", function(e) {
        // Displays a data object in the console--the legend text
        console.log("Clicked the chart legend: ", e.name2);
    });

    mychart.on("click:chart", function(e) {
        // Displays a data object in the console
        console.log("Clicked the chart: ", e.value);
    });

    mytable.on("click", function(e) {
        // Bypass the default behavior
        e.preventDefault();

        // Displays a data object in the console
        console.log("Clicked the table:", e.data);
    });

    mymap.on("click:marker", function(e) {
        // Displays a data object in the console
        console.log("Clicked the map: ", e.data['row.count'] + " earthquakes near (" + e.data['row.latitude'] + ", " +e .data['row.longitude'] + ")");
    });

});
