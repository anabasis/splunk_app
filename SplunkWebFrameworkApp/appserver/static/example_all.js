require([
    "splunkjs/mvc",
    "splunkjs/mvc/searchmanager",
    "splunkjs/mvc/chartview",
    "splunkjs/mvc/checkboxgroupview",
    "splunkjs/mvc/checkboxview",
    "splunkjs/mvc/dropdownview",
    "splunkjs/mvc/eventsviewerview",
    "splunkjs/mvc/multidropdownview",
    "splunkjs/mvc/radiogroupview",
    "splunkjs/mvc/searchbarview",
    "splunkjs/mvc/searchcontrolsview",
    "splunkjs/mvc/singleview",
    "splunkjs/mvc/tableview",
    "splunkjs/mvc/textinputview",
    "splunkjs/mvc/timelineview",
    "splunkjs/mvc/timerangeview",
    "splunkjs/mvc/simplexml/ready!"
], function(
    mvc,
    SearchManager,
    ChartView,
    CheckboxGroupView,
    CheckboxView,
    DropdownView,
    EventsViewer,
    MultiDropdownView,
    RadioGroupView,
    SearchbarView,
    SearchControlsView,
    SingleView,
    TableView,
    TextInputView,
    TimelineView,
    TimeRangeView
) {

    // Create a token-based search to interact with search controls
    var search1 = new SearchManager({
        id: "example-search1",
        search: mvc.tokenSafe("$searchquery$"),
        earliest_time: mvc.tokenSafe("$earlyval$"),
        latest_time: mvc.tokenSafe("$lateval$"),
        preview: true,
        cache: true,
        status_buckets: 300
    });

    // Create a stats search for chart example
    var search2 = new SearchManager({
        id: "example-search2",
        search: "index=_internal | head 1000 | stats count by sourcetype",
        preview: true,
        cache: true
    });

    // Create a search that returns a single value
    var search3 = new SearchManager({
        id: "example-search3",
        search: "index=_internal | stats count",
        preview: true,
        cache: true,
        earliest_time: "-15m",
        latest_time: "now"
    });

    // Create a search on index names for populating choices
    var search4 = new SearchManager({
        id: "example-search4",
        search: "| eventcount summarize=false index=* index=_* | dedup index | fields index",
        preview: true,
        cache: true
    });

    // Create views
    var timeline1 = new TimelineView({
        id:"example-timeline",
        managerid: "example-search1",
        el: $("#mytimeline")
    }).render();

    var searchbar1 = new SearchbarView({
        id:"example-searchbar",
        managerid: "example-search1",
        value: mvc.tokenSafe("$searchquery$"),
        default: "index=_internal | head 1000",
        timerange_earliest_time: mvc.tokenSafe("$earlyval$"),
        timerange_latest_time: mvc.tokenSafe("$lateval$"),
        el: $("#mysearchbar")
    }).render();

    var timerange1 = new TimeRangeView({
        id:"example-timerange",
        managerid: "example-search1",
        earliest_time: mvc.tokenSafe("$earlyval$"),
        latest_time: mvc.tokenSafe("$lateval$"),
        el: $("#mytimerange")
    }).render();

    var searchcontrols1 = new SearchControlsView({
        id:"example-searchcontrols",
        managerid: "example-search1",
        el: $("#mysearchcontrols")
    }).render();

    var eventsviewer1 = new EventsViewer({
        id:"example-eventtable",
        managerid: "example-search1",
        el: $("#myeventsviewer")
    }).render();

    var table1 = new TableView({
        id:"example-table",
        managerid: "example-search1",
        el: $("#mytable")
    }).render();

    var chart1 = new ChartView({
        id:"example-chart",
        managerid: "example-search2",
        type: "bar",
        el: $("#mychart")
    }).render();

    var single1 = new SingleView({
        id:"example-single",
        managerid: "example-search3",
        beforeLabel: "Event count:",
        el: $("#mysingle")
    }).render();

    var textinput1 = new TextInputView({
        id:"example-textinput",
        default: " Type here",
        el: $("#mytextinput")
    }).render();

    var checkbox1 = new CheckboxView({
        id:"example-checkbox",
        label: "Check me",
        default: true,
        el: $("#mycheckbox")
    }).render();

    var checkboxgroup1 = new CheckboxGroupView({
        id:"example-checkboxgroup1",
        default: "Three",
        el: $("#mycheckboxgroup1")
    }).render();

    var checkboxgroup2 = new CheckboxGroupView({
        id:"example-checkboxgroup2",
        managerid: "example-search4",
        default: "main",
        labelField: "index",
        valueField: "index",
        el: $("#mycheckboxgroup2")
    }).render();

    var radiogroup1 = new RadioGroupView({
        id:"example-radiogroup1",
        default: "One",
        el: $("#myradiogroup1")
    }).render();

    var radiogroup2 = new RadioGroupView({
        id:"example-radiogroup2",
        managerid: "example-search4",
        default: "main",
        labelField: "index",
        valueField: "index",
        el: $("#myradiogroup2")
    }).render();

    var dropdown1 = new DropdownView({
        id:"example-dropdown1",
        default: "One",
        el: $("#mydropdown1")
    }).render();

    var dropdown2 = new DropdownView({
        id:"example-dropdown2",
        managerid: "example-search4",
        default: "main",
        labelField: "index",
        valueField: "index",
        el: $("#mydropdown2")
    }).render();

    var multidropdown1 = new MultiDropdownView({
        id:"example-multidropdown1",
        default: "Two",
        el: $("#mymultidropdown1")
    }).render();

    var multidropdown2 = new MultiDropdownView({
        id:"example-multidropdown2",
        managerid: "example-search4",
        default: "main",
        labelField: "index",
        valueField: "index",
        el: $("#mymultidropdown2")
    }).render();

    // Define a static list of choices for the form controls
    var staticchoices = [
        {label:" One", value: "One"},
        {label:" Two", value: "Two"},
        {label:" Three", value: "Three"}
    ];

    // Populate the form controls with the list of choices
    checkboxgroup1.settings.set("choices", staticchoices);
    dropdown1.settings.set("choices", staticchoices);
    multidropdown1.settings.set("choices", staticchoices);
    radiogroup1.settings.set("choices", staticchoices);

    // Whenever the user changes the timeline, update the search manager
    timeline1.on("change", function() {
        search1.settings.set(timeline1.val());
    });
});
