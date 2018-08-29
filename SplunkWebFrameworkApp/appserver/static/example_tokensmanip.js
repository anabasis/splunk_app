require([
    "splunkjs/mvc",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/dropdownview",
    "splunkjs/mvc/tableview",
    "splunkjs/mvc/textinputview",
    "splunkjs/mvc/simplexml/ready!"
], function(
    mvc,
    SearchManager,
    DropdownView,
    TableView,
    TextInputView
) {

    // Search query is based on the selected index
    var indexsearch = new SearchManager({
        id: "indexsearch",
        cache: true,
        search: mvc.tokenSafe("$searchQuery$")
    });

    // Display an arbitrary list of indexes
    var indexlist = new DropdownView({
        id:"indexlist",
        choices: [
            {label: "main", value: "main"},
            {label: "_internal", value: "_internal"},
            {label: "_audit", value: "_audit"},
            {label: "<all>", value: "all"} // Not a valid index name
        ],
        showClearButton: false,
        value: mvc.tokenSafe("$indexName$"),
        el: $("#indexlist")
    }).render();

    // When the $indexName$ token changes, form the search query
    var defaultTokenModel = mvc.Components.get("default");
    defaultTokenModel.on("change:indexName", function(formQuery, indexName) {
        var newQuery = " | stats count by sourcetype, index";
        if (indexName == "all") {
            newQuery = "index=_internal OR index=_audit OR index=main" + newQuery;
        } else {
            newQuery = "index=" + indexName + newQuery;
        }
        // Update the $searchQuery$ token value
        defaultTokenModel.set('searchQuery', newQuery);
    });

    // Display the search results
    var textinput1 = new TextInputView({
        id: "textinput1",
        value: mvc.tokenSafe("$searchQuery$"),
        el: $("#text1")
    }).render();
    var tableindex = new TableView({
        id: "tableindex",
        managerid: "indexsearch",
        pageSize: 5,
        el: $("#tableindex")
    }).render();
});
