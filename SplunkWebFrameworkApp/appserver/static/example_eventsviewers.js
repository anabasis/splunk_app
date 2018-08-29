require([
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/eventsviewerview",
    "splunkjs/mvc/simplexml/ready!"
], function(
    SearchManager,
    EventsViewer
) {

    // Set up a search manager
    var search1 = new SearchManager({
        id: "example-search",
        search: "index=_internal | head 100",
        preview: true,
        cache: true
    });

    // Create 3 events viewers: list, table, and raw
    var listviewer = new EventsViewer({
        id: "example-eventsviewer-list",
        managerid: "example-search",
        type: "list",
        "list.drilldown": "outer",
        drilldownRedirect: true,
        "list.wrap": true,
        count: 3,
        pagerPosition: "top",
        showPager: true,
        rowNumbers: false,
        el: $("#myeventsviewer-list")
    }).render();

    var tableviewer = new EventsViewer({
        id: "example-eventsviewer-table",
        managerid: "example-search",
        type: "table",
        "table.drilldown": true,
        drilldownRedirect: true,
        "table.sortColumn": "sourcetype",
        "table.sortDirection": "asc",
        "table.wrap": true,
        count: 3,
        showPager: false,
        rowNumbers: false,
        el: $("#myeventsviewer-table")
    }).render();

    var rawviewer = new EventsViewer({
        id: "example-eventsviewer-raw",
        managerid: "example-search",
        type: "raw",
        "raw.drilldown": "inner",
        drilldownRedirect: true,
        count: 3,
        pagerPosition: "top",
        showPager: true,
        rowNumbers: false,
        el: $("#myeventsviewer-raw")
    }).render();
});
