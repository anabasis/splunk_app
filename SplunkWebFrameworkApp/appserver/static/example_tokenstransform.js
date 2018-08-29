require([
    "splunkjs/mvc",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/dropdownview",
    "splunkjs/mvc/tableview",
    "splunkjs/mvc/tokenforwarder",
    "splunkjs/mvc/simplexml/ready!"
], function(
    mvc,
    SearchManager,
    DropdownView,
    TableView,
    TokenForwarder
) {

    // Display a list of fields choices for searching
    var fieldChoices = new DropdownView({
        id: "fieldChoices",
        choices: [
            {label:"host", value: "host"},
            {label:"sourcetype", value: "sourcetype"},
            {label:"source", value: "source"},
            {label:"status", value: "status"},
            {label:"message", value: "message"} // Only valid when index=_internal
        ],
        default: "host",
        showClearButton: false,
        value: mvc.tokenSafe("$selectedField$"),
        el: $("#fieldChoices")
    }).render();


    // Method 1: Return a transformed token value
    // Create a search manager that transforms a token
    var search_method1 = new SearchManager({
        id: "search_method1",
        cache: true,
        search: mvc.tokenSafe("$selectedField|makeSearchQuery1$")
    });

    // Transform $selectedField$ and return a value. $selectedField$ is not affected.
    mvc.setFilter('makeSearchQuery1', function(selectedField) {
        var searchQuery1 = (selectedField==="message")
            ? "index=_internal | top 3 message"
            : "* | top 3 " + selectedField;
        return searchQuery1;
    });


    // Method 2: Forward one token to form a new one
    // Create a search manager that uses token forwarding
    var search_method2 = new SearchManager({
        id: "search_method2",
        cache: true,
        search: mvc.tokenSafe("$searchQuery2$ ")
    });

    // Form a new token $searchQuery2$ from $selectedField$
    new TokenForwarder('$selectedField$', '$searchQuery2$', function(selectedField) {
        var searchQuery2 = (selectedField === "message")
            ? "index=_internal | top 3 message"
            : "* | top 3 " + selectedField;
        return searchQuery2;
    });

    // Display the results for each method
    var mytable1 = new TableView({
        id: "mytable1",
        managerid: "search_method1",
        el: $("#mytable1")
    }).render();

    var mytable2 = new TableView({
        id: "mytable2",
        managerid: "search_method2",
        el: $("#mytable2")
    }).render();
});
