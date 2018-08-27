require([
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/chartview",
    "splunkjs/mvc/eventsviewerview",
    "splunkjs/mvc/simplexml/ready!"
], function(
    SearchManager,
    ChartView,
    EventsViewerView
) {

    // Instantiate the views and search manager
    var mysearch = new SearchManager({
        id: "search1",
        preview: true,
        cache: true,
        status_buckets: 300,
        search: "index=_internal | head 1000 | stats count by sourcetype"
    });

    var mychart = new ChartView ({
        id: "chart1",
        managerid: "search1",
        type: "bar",
        el: $("#mychart")
    }).render();

    var myeventsviewer = new EventsViewerView ({
        id: "eviewer1",
        managerid: "search1",
        el: $("#myeventsviewer")
    }).render();
});
