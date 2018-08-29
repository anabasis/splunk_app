require.config({
	paths: {
		attackmap_helper: '/static/app/attack_threat_map/js/attackmap-helper',
		attackmap_app: '/static/app/attack_threat_map/js/attackmap-app'
	},
	shim: {
		'attackmap_helper' : {
			exports: 'attackD3Map'
		},
		'attackmap_app': {
			deps: ['attackmap_helper'], 
			exports: 'attackMapPage' 
		}
	}
});



define(function(require, exports, module){
	// Base class for custom views
	var SimpleSplunkView = require('splunkjs/mvc/simplesplunkview');
	//require("/static/app/attack_threat_map/js/attackmap-helper.js");
	//require("/static/app/attack_threat_map/js/attackmap-app.js");
	require('attackmap_helper');
	require('attackmap_app');

	// Define the custom view class
	var AttackDDoSView = SimpleSplunkView.extend({
		className: "attackDDoSView",
		options: {
			viewId : "AttackDDoSView"
		},
		output_mode: "json",
		initialize: function() {
			SimpleSplunkView.prototype.initialize.apply(this, arguments);

			//console.log("enter AttackDDoSView.initialize()");
			
		},
	        createView: function() {
			//console.log("enter AttackDDoSView.createView()");
			/*
			* TO DO
			*/
			window.attackMapPage.init();

			return this;
	        },
		// Making the data look how we want it to for updateView to do its job
		formatData: function(data) {
			//console.log("enter AttackDDoSView.formatData():"+JSON.stringify(data));
			return data; // this is passed into updateView as 'data'
		},
	        updateView: function(view, data) {
			//console.log("enter AttackDDoSView.updateView():"+JSON.stringify(data));
			/*
			* TO DO
			*/
			try {
				var result = {};
				result.list = [];

				/*
				{"_time":"2017-03-31T17:52:35.000+09:00",
				"src":"31.248.86.154","src_lat":"32.809","src_lon":"-117.03","src_country":"usa",
				"dst":"10.53.200.26","dst_lat":"37.786","dst_lon":"-122.436","dst_country":"usa","type":"SANDPAPER"},
				*/
				var dlength = data.length;
				for (var index = dlength-1; index >= 0; index--) {
					var datum = data[index];
		                     /* */
					var entry = {
						"attack_time": datum._time.substring(0,10)+' '+datum._time.substring(11,19),

						"src_ip": datum.src,
						"src_lat": datum.src_lat,
						"src_lon": datum.src_lon,
						"src_country": datum.src_country,
						"src_city": "unknown",
						"src_port": window.attackD3Map.utils.rand(1, 10000),

						"dst_ip": datum.dst,
						"dst_lat": datum.dst_lat,
						"dst_lon": datum.dst_lon,
						"dst_country": datum.dst_country,
						"dst_city": "unknown",
						"dst_port": window.attackD3Map.utils.rand(1, 10000),

						/* reserved */
						"seq": 0,
						"attack_mode": "D",
						"attack_name": datum.type,
						"protocol": "TCP",
						"byte_cnt": 1,
						"packet_cnt": 1
					};

					result.list.push(entry);
				}

				//  var currentDt = new Date();
				//  console.log("current date:"+window.attackD3Map.utils.formattedMilliTime(currentDt));
				//  console.log("result.list:"+JSON.stringify(result.list));

				window.attackD3Map.handler.addDdosListToBuffer(result);
			} catch (e) { 
				console.log(e);
				/* ignore */ }
		},
		//Override the render function to make the view do something
		//In this example: print to the page and to the console
		render: function() {
			var that = this;
			//console.log("enter AttackDDoSView.render():param1="+this.settings.get("param1"));

			// Print to the page
			//this.$el.html("Hello, world!");
			
			

			return this;
		}
	});
	return AttackDDoSView;
});
