require([
         "jquery",
         "/static/app/attack_threat_map/js/d3.v3.min.js",
         "/static/app/attack_threat_map/js/topojson.v0.min.js" 
], function() {
	/* d3 extenstion */
	/* --------------------------------------------------------------- */
	if (!d3.selection.prototype.moveToFront) {
		d3.selection.prototype.moveToFront = function() {
			return this.each(function() {
				this.parentNode.appendChild(this);
			});
		};
	}
	
	if (!d3.selection.prototype.moveToBack) {
		d3.selection.prototype.moveToBack = function() {
			return this.each(function() {
				var firstChild = this.parentNode.firstChild;
				if (firstChild) {
					this.parentNode.insertBefore(this, firstChild);
				}
			});
		};
	}
	
	
	/* */
	/* --------------------------------------------------------------- */
	(function() {
		"use strict";
		
		var root = window;
		var /* const */DEFAULT_MAIN_COLOR = "#4A4A70";
		var /* const */SCHEDULER_INTERVAL_MILLI = 1000;
		
		/* */
		var attackD3Map;
		if(typeof exports !== 'undefined') {
			attackD3Map = exports;
		} else {
			attackD3Map = window.attackD3Map = {};
		}
	
		/* storage */
		/* --------------------------------------------------------------- */
		function setSessionStorage(code, data) {
			if (!!window['sessionStorage']) {
				window.sessionStorage[code] = data;
			}
		}
	
		function getSessionStorage(code) {
			if (!!window['sessionStorage']) {
				return window.sessionStorage[code];
			}
			return null;
		}
	
		function setLocalStorage(code, data) {
			if (!!window['localStorage']) {
				window.localStorage.setItem(code, data);
			}
		}
	
		function getLocalStorage(code) {
			if (!!window['localStorage']) {
				return window.localStorage.getItem(code);
			}
			return null;
		}
	
		/* logger */
		/* --------------------------------------------------------------- */
		var logger = {
			log : function(value) {
				// console.log(""+value);
			}
		};
	
		/* data map */
		/* --------------------------------------------------------------- */
		var dsMap = function() {
			var map = {};
	
			return {
				put : function(key, value) {
					map[key] = value;
				},
				get : function(key) {
					return map[key];
				},
				containsKey : function(key) {
					return key in map;
				},
				containsValue : function(value) {
					for ( var prop in map) {
						if (map[prop] == value)
							return true;
					}
					return false;
				},
				isEmpty : function(key) {
					return (this.size() == 0);
				},
				clear : function() {
					for ( var prop in map) {
						delete map[prop];
					}
				},
				remove : function(key) {
					delete map[key];
				},
				keys : function() {
					var keys = []; // new Array();
					for ( var prop in map) {
						keys.push(prop);
					}
					return keys;
				},
				values : function() {
					var values = []; // new Array();
					for ( var prop in map) {
						values.push(map[prop]);
					}
					return values;
				},
				size : function() {
					var count = 0;
					for ( var prop in map) {
						count++;
					}
					return count;
				}
			}
		};
	
		/* member variables */
		var trailModel = function(r, length) {
			var radius = r, base = radius * 2, height = base * length, detail = 6, head = {
				'x' : radius,
				'y' : radius
			};
	
			var angle1 = Math.PI / 2, angle2 = Math.PI * 3 / 2, points = [];
	
			for (var i = 0; i <= detail; ++i) {
				var a = angle1 + (angle2 - angle1) * (i / detail);
				var x = head.x + radius * Math.cos(a), y = head.y + radius * Math.sin(a);
				points.push([ x - radius, y - radius ]);
			}
			points.push([ height, base / 2 ], points[0]); // for a
															// polygon
	
			return {
				points : points,
				base : base,
				height : radius + height,
				radius : radius,
				center : {
					x : height / 2,
					y : base / 2
				}
			};
		};
	
	
		/* */
		var mapSizer = (function() {
			/* [2017/02/19] modified */
			var /* const */minWidth = screen.width; // 1280;
			var /* const */minHeight = screen.height; // 800;
	
			/*
			function getWidth() {
				if (minWidth < window.innerWidth) {
					return window.innerWidth;
				}
	
				return minWidth;
			}
	
			function getHeight() {
				if (minHeight < window.innerHeight) {
					return window.innerHeight;
				}
	
				return minHeight;
			}
			*/
			function getWidth() {
				return window.innerWidth;
			}
	
			function getHeight() {
				console.log("window.innerHeight : " + window.innerHeight);
				console.log("window.innerHeight : " + window.innerHeight - 220);
				return window.innerHeight - 220;
			}
	
			return {
				getWidth : getWidth,
				getHeight : getHeight
			};
		})();
	
		/**
		 * defined Global fuction.
		 */
		 /* utils */
		/* --------------------------------------------------------------- */
		var utils = {
			isNull : function(value) {
				if (value == null || typeof value == "undefined") {
					return true;
				}
	
				return false;
			},
			isNullEmpty : function(value) {
				if (value == null || typeof value == "undefined" || value == "") {
					return true;
				}
	
				return false;
			},
			isValidCoord : function(coord) {
				if (isFinite(coord)) {
					return true;
				}
	
				return false;
			},
			currentMilliSeconds : function() {
				return Date.now();
			},
			convertFmtToMilli : function(fmtDateTime) {
				/*
				 * not support in safari Date.parse()
				 */
				// return +moment(fmtDateTime, 'YYYY-MM-DD
				// HH:mm:ss').toDate();
				return +new Date(fmtDateTime);
			},
			formattedMilliTime : function(dt) {
				try {
					var yyyy = dt.getFullYear();
					var mm = dt.getMonth() < 9 ? "0" + (dt.getMonth() + 1) : (dt.getMonth() + 1); // getMonth() is zero-based
					var dd = dt.getDate() < 10 ? "0" + dt.getDate() : dt.getDate();
					var hh = dt.getHours() < 10 ? "0" + dt.getHours() : dt.getHours();
					var min = dt.getMinutes() < 10 ? "0" + dt.getMinutes() : dt.getMinutes();
					var ss = dt.getSeconds() < 10 ? "0" + dt.getSeconds() : dt.getSeconds();
					return "".concat(yyyy).concat('-').concat(mm).concat('-').concat(dd).concat(' ').concat(hh).concat(':').concat(min).concat(':').concat(ss);
				} catch (e) {
				}
	
				return '';
			},
	
			isValidIpv4 : function(ipaddress) {
				if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
					return true;
				}
				return false;
			},
	
			/* */
			rand : function(start, end) {
				return Math.floor((Math.random() * (end - start + 1))+ start);
			},
		};
		attackD3Map.utils = utils;
		
		 /* */
		var attackFilter = (function() {
			/* local storage */
			function getValue(key, defValue) {
				var retval = getLocalStorage(key);
				if (utils.isNullEmpty(retval))
					return '' + defValue;
	
				return retval;
			}
	
			function getBooleanValue(key, defValue) {
				return getValue(key) == 'false' ? false : true;
			}
	
			function setValue(key, value) {
				setLocalStorage(key, '' + value);
			}
	
			/* json local storage */
			function getJsonToArray(key) {
				var retjson = getLocalStorage(key);
				if (utils.isNullEmpty(retjson))
					return [];
	
				return JSON.parse(retjson);
			}
	
			function saveArrayToJson(key, arr) {
				var jsonval = JSON.stringify(arr);
				setLocalStorage(key, '' + jsonval);
			}
	
			/* ip subnetmask */
			function ip2long(ip) {
				var components;
	
				if (components = ip
						.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)) {
					var iplong = 0;
					var power = 1;
					for (var i = 4; i >= 1; i -= 1) {
						iplong += power * parseInt(components[i]);
						power *= 256;
					}
					return iplong;
				} else
					return -1;
			}
	
			/* */
			function isIpInSubnet(ip, subnet) {
				var mask, base_ip, long_ip = ip2long(ip);
				if ((mask = subnet.match(/^(.*?)\/(\d{1,2})$/)) && ((base_ip = ip2long(mask[1])) >= 0)) {
					var freedom = Math.pow(2, 32 - parseInt(mask[2]));
					return (long_ip > base_ip) && (long_ip < base_ip + freedom - 1);
				} else
					return false;
			}
	
			/* variables */
			var portFilterArray = getJsonToArray("port_filter");
			var srcIpFilterArray = getJsonToArray("src_ip_filter");
			var srcCntryFilterArray = getJsonToArray("src_cntry_filter");
			var dstCntryFilterArray = getJsonToArray("dst_cntry_filter");
	
			/* */
			return {
				/* tcp on/off */
				isTcpEnabled : function() {
					return getBooleanValue("is_tcp_enabled", true);
				},
				setTcpEnabled : function(enabled) {
					setValue("is_tcp_enabled", enabled);
				},
	
				/* udp on/off */
				isUdpEnabled : function() {
					return getBooleanValue("is_udp_enabled", true);
				},
				setUdpEnabled : function(enabled) {
					setValue("is_udp_enabled", enabled);
				},
	
				/* icmp on/off */
				isIcmpEnabled : function() {
					return getBooleanValue("is_icmp_enabled", true);
				},
				setIcmpEnabled : function(enabled) {
					setValue("is_icmp_enabled", enabled);
				},
	
				/* main-color */
				getMainColor : function() {
					return getValue("main_color", DEFAULT_MAIN_COLOR);
				},
				setMainColor : function(value) {
					setValue("main_color", value);
				},
	
				/* port filter */
				getPortFilterList : function() {
					return portFilterArray;
				},
				indexAtPortFilter : function(portNo) {
					for (var index = 0; index < portFilterArray.length; index++) {
						var entry = portFilterArray[index];
						if (entry.portNo == portNo)
							return index;
					}
	
					return -1;
				},
				isPortFiltered : function(portNo) {
					/* [2017/02/20] modified */
					if (portFilterArray == null || portFilterArray.length == 0)
						return false;
	
					/* */
					if (this.indexAtPortFilter(portNo) >= 0)
						return false;
					return true;
				},
				addPortFilter : function(portNo, portName) {
					if (this.indexAtPortFilter(portNo) >= 0)
						return false;
	
					/* */
					portFilterArray.push({
						"portNo" : portNo,
						"portName" : portName
					});
					saveArrayToJson("port_filter", portFilterArray);
	
					return true;
				},
				removePortFilter : function(portNo) {
					var index = this.indexAtPortFilter(portNo);
					if (index >= 0) {
						portFilterArray.splice(index, 1);
						saveArrayToJson("port_filter", portFilterArray);
					}
				},
	
				/* source ip filter */
				getSrcIpFilterList : function() {
					return srcIpFilterArray;
				},
				indexAtSrcIpFilter : function(ip, netmask) {
					for (var index = 0; index < srcIpFilterArray.length; index++) {
						var entry = srcIpFilterArray[index];
						if (entry.ip == ip && entry.netmask == netmask)
							return index;
					}
	
					return -1;
				},
				isSrcIpFiltered : function(ip) {
					/* [2017/02/20] modified */
					if (srcIpFilterArray == null || srcIpFilterArray.length == 0)
						return false;
	
					/* */
					for (var index = 0; index < srcIpFilterArray.length; index++) {
						var entry = srcIpFilterArray[index];
						var subnet = "" + entry.ip + "/" + entry.netmask;
	
						if (isIpInSubnet(ip, subnet))
							return false;
					}
	
					return true;
				},
				addSrcIpFilter : function(ip, netmask) {
					if (this.indexAtSrcIpFilter(ip, netmask) >= 0)
						return false;
	
					/* */
					srcIpFilterArray.push({
						"ip" : ip,
						"netmask" : netmask
					});
					saveArrayToJson("src_ip_filter", srcIpFilterArray);
	
					return true;
				},
				removeSrcIpFilter : function(ip, netmask) {
					var index = this.indexAtSrcIpFilter(ip, netmask);
					if (index >= 0) {
						srcIpFilterArray.splice(index, 1);
						saveArrayToJson("src_ip_filter", srcIpFilterArray);
					}
				},
	
				/* source country filter */
				getSrcCntryFilterList : function() {
					return srcCntryFilterArray;
				},
				indexAtSrcCntryFilter : function(countryCode) {
					for (var index = 0; index < srcCntryFilterArray.length; index++) {
						var entry = srcCntryFilterArray[index];
						if (entry.code == countryCode)
							return index;
					}
	
					return -1;
				},
				isSrcCntryFiltered : function(countryCode) {
					/* [2017/02/20] modified */
					if (srcCntryFilterArray == null || srcCntryFilterArray.length == 0)
						return false;
	
					/* */
					if (this.indexAtSrcCntryFilter(countryCode) >= 0)
						return false;
	
					return true;
				},
				addSrcCntryFilter : function(countryCode, countryName) {
					// logger.log("countryCode:"+countryCode+",countryName:"+countryName);
	
					if (this.indexAtSrcCntryFilter(countryCode) >= 0)
						return false;
	
					/* */
					srcCntryFilterArray.push({
						"code" : countryCode,
						"name" : countryName
					});
					saveArrayToJson("src_cntry_filter", srcCntryFilterArray);
	
					return true;
				},
				removeSrcCntryFilter : function(countryCode) {
					var index = this.indexAtSrcCntryFilter(countryCode);
					if (index >= 0) {
						srcCntryFilterArray.splice(index, 1);
						saveArrayToJson("src_cntry_filter", srcCntryFilterArray);
					}
				},
	
				/* destination country filter */
				getDstCntryFilterList : function() {
					return dstCntryFilterArray;
				},
				indexAtDstCntryFilter : function(countryCode) {
					for (var index = 0; index < dstCntryFilterArray.length; index++) {
						var entry = dstCntryFilterArray[index];
						if (entry.code == countryCode)
							return index;
					}
	
					return -1;
				},
				isDstCntryFiltered : function(countryCode) {
					/* [2017/02/20] modified */
					if (dstCntryFilterArray == null || dstCntryFilterArray.length == 0)
						return false;
	
					if (this.indexAtDstCntryFilter(countryCode) >= 0)
						return false;
	
					return true;
				},
				addDstCntryFilter : function(countryCode, countryName) {
					if (this.indexAtDstCntryFilter(countryCode) >= 0)
						return false;
	
					/* */
					dstCntryFilterArray.push({
						"code" : countryCode,
						"name" : countryName
					});
					saveArrayToJson("dst_cntry_filter",
							dstCntryFilterArray);
	
					return true;
				},
				removeDstCntryFilter : function(countryCode) {
					var index = this.indexAtDstCntryFilter(countryCode);
					if (index >= 0) {
						dstCntryFilterArray.splice(index, 1);
						saveArrayToJson("dst_cntry_filter",
								dstCntryFilterArray);
					}
				}
			};
		})();
		/* */
		attackD3Map.attackFilter = attackFilter;
		
		/* data map */
		/* --------------------------------------------------------------- */
		var attackConfig = {
			/* init svg */
			id : "attackmap",
			width : mapSizer.getWidth(),
			height : mapSizer.getHeight(),
			zIndex : -1,
	
			/* environment */
			resourceRoot : "/static/app/attack_threat_map",
	
			/* init map */
			mapJsonFilePath : "/dat/combined.json",
			mapDefaultScale : 200,
			mapDefaultRotateX : -160,
			mapDefaultRotateY : 0,
			mapStrokeColor : attackFilter.getMainColor(),
			mapStrokeWidth : "1px",
			mapStrokeOpacity : "1.0",
			mapFillColor : "#2C2C43",
			mapFillOpacity : "0.2",
	
			/* zoom */
			zoomMin : 1,
			zoomMax : 4,
	
			/* country code */
			countryCodeCsvFilePath : "/dat/countries.dat",
	
			/* service port */
			servicePortCsvFilePath : "/dat/portnames.dat",
	
			/* hit */
			hitStrokeWidth : 5,
			hitDuration : 2000,
			hitMaxSize : 50,
			hitContinuousDelay : 50,
	
			/* arrow */
			arrowHeaderSize : 2,
			arrowTrailLength : 25,
			arrowDuration : 2000,
			arrowDisappearDuration : 250,
			arrowDistanceDivide : 750,
	
			/* source trace */
			srcTraceCircleOuterSize : 3,
			srcTraceOuterOpacity : 0.3,
			srcTraceCircleInnerSize : 1.5,
			srcTraceInnerOpacity : 0.4,
			srcTraceMaxSize : 5000,
			srcTraceMaxDurationMilli : 300000,
			srcTraceScatterRange : 3,
			srcTraceTTL : 3600000
		};
		
		 /* service port */
		/* --------------------------------------------------------------- */
		var countryMapper = (function() {
			var countryMapper = new dsMap();
			var countryList = [];
	
			d3.csv(attackConfig.resourceRoot + attackConfig.countryCodeCsvFilePath, function(error, data) {
				if (!utils.isNullEmpty(data) && data.length > 0) {
	
					var tmpList = [];
					$.each(data, function(i, entry) {
						// logger.log(""+entry.code+"-->"+entry.name);
	
						countryMapper.put(entry.code, entry.name);
						tmpList.push({
							"code" : entry.code,
							"name" : entry.name
						});
					});
	
					countryList = tmpList.sort(function(a, b) {
						return b.code - a.code
					});
				}
			});
	
			function getSortedList() {
				return countryList;
			}
	
			/* */
			function toName(countryCode) {
				var name = countryMapper.get(countryCode);
				if (utils.isNullEmpty(name))
					return countryCode;
	
				return name;
			}
	
			/* */
			function toImgUrl(countryCode) {
				if (utils.isNullEmpty(countryCode) || countryCode.length != 2)
					return "";
				return attackConfig.resourceRoot + "/images/flags/" + countryCode.toLowerCase() + ".png";
			}
	
			/* */
			return {
				toName : toName,
				toImgUrl : toImgUrl,
				getSortedList : getSortedList
			};
		})();
		attackD3Map.attackCountryMapper = countryMapper;
	
		/* service port */
		/* --------------------------------------------------------------- */
		var portMapper = (function() {
			var portMapper = new dsMap();
			var nameMapper = new dsMap();
			var portList = [];
	
			d3.csv(attackConfig.resourceRoot + attackConfig.servicePortCsvFilePath, function(error, data) {
				if (!utils.isNullEmpty(data) && data.length > 0) {
					var tmpList = [];
	
					$.each(data, function(i, entry) {
						// logger.log(""+entry.portno+"-->"+entry.name);
	
						portMapper.put(entry.portno, entry.name);
						nameMapper.put(entry.name, entry.portno);
	
						tmpList.push({
							"code" : entry.portno,
							"name" : entry.name
						});
					});
	
					portList = tmpList.sort(function(a, b) {
						return b.code - a.code
					});
				}
			});
	
			function getSortedList() {
				return portList;
			}
	
			function toName(portNo) {
				var name = portMapper.get(portNo);
				if (utils.isNullEmpty(name))
					return portNo;
	
				return name;
			}
	
			function toPortNo(portName) {
				var portNo = nameMapper.get(portName);
				if (utils.isNullEmpty(portNo))
					return "";
	
				return "" + portNo;
			}
	
			function toHslColor(portNo) {
				if (utils.isNullEmpty(portNo))
					return "white";
				var h = portNo % 360;
				var s = 100;
				var l = 70;
	
				return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
			}
	
			/* */
			return {
				toName : toName,
				toPortNo : toPortNo,
				toHslColor : toHslColor,
				getSortedList : getSortedList
			};
		})();
		attackD3Map.attackPortMapper = portMapper;

		
		/* main */
		/* --------------------------------------------------------------- */
		attackD3Map.handler = (function() {
			logger.log("create attack map helper");
	
			/* member variables */
			var svgRoot;
			var mapLayer;
			var traceLayer;
	
			/* */
			var projection;
	
			/* */
			var mapTranslate = [ 0, 0 ];
			var mapScale = 1;
	
			/* */
			var sourceTraceList = [];
	
			/* */
			var enabledView = true;
	
			/* init */
			/* --------------------------------------------------------------- */
			/*
			(function(){
				init("#attackMap");
			}());
			*/
			
			function init(parentId) {
				//console.log("enter init:" + parentId);
	
				if (utils.isNullEmpty(parentId)) {
					parentId = "body";
				}
	
				/* */
				// clean svg
				d3.select(parentId).select("svg").remove();
				
				var width = mapSizer.getWidth(), rotated = 90, height = mapSizer.getHeight();

				//countries which have states, needed to toggle visibility
				//for USA/ etc. either show countries or states, not both
				var usa, canada;
				var states; //track states
				//track where mouse was clicked
				var initX;
				//track scale only rotate when s === 1
				var s = 1;
				var mouseClicked = false;

				//var projection = d3.geo.mercator().scale(153).translate( [ width / 2, height / 1.5 ]).rotate([ rotated, 0, 0 ]); //center on USA because 'murica
				projection = d3.geo
						.mercator()
						.center( [ 0, 5 ] )
						.translate( [ attackConfig.width / 2, attackConfig.height / 2 ] )
						.scale(attackConfig.mapDefaultScale)
						.rotate( [ attackConfig.mapDefaultRotateX, attackConfig.mapDefaultRotateY ] );
						
				var path = d3.geo.path().projection(projection);
				var zoom = d3.behavior.zoom()
					.scaleExtent([attackConfig.zoomMin, attackConfig.zoomMax])
					.on("zoom", function() {
						var t = d3.event.translate;
						s = d3.event.scale;
						var h = 0;

						t[0] = Math.min((width / height) * (s - 1), Math.max(width * (1 - s), t[0]));
						t[1] = Math.min(h * (s - 1) + h * s, Math.max(height * (1 - s) - h * s, t[1]));

						zoom.translate(t);
						
						mapTranslate = d3.event.translate;
						mapScale = d3.event.scale;
						
						/*
						if (s === 1 && mouseClicked) {
							projection.rotate([ rotated + ((d3.mouse(this)[0]) - initX) * 360 / (s * width), 0, 0 ])
							mapLayer.selectAll('path').attr('d', path);
							return;
						}
						*/
						
						
						mapLayer.attr("transform", "translate(" + d3.event.translate.join(",") + ")scale(" + d3.event.scale + ")");
						//mapLayer.selectAll("path").attr("d", d3.geo.path().projection(projection));
						mapLayer.selectAll('path').attr('d', path);
						
						
						//adjust the stroke width based on zoom level
						d3.selectAll(".attackBody_boundary").style("stroke-width", 1 / s);
						
						refreshUpperLayer();
						

						/*
						//toggle state/USA visability
						if (s > 1.5) {
							states.classed('hidden', false);
							usa.classed('hidden', true);
							canada.classed('hidden', true);
						} else {
							states.classed('hidden', true);
							usa.classed('hidden', false);
							canada.classed('hidden', false);
						}
						*/
				});
						
				svgRoot = d3.select(parentId).append("svg")
					.attr("id", attackConfig.id)
					.attr("width", width)
					.attr("height", height)
					//track where user clicked down
					.on("mousedown", function() {
						d3.event.preventDefault();
						//only if scale === 1
						if (s !== 1)
							return;
						initX = d3.mouse(this)[0];
						mouseClicked = true;
					}).on("mouseup", function() {
						if (s !== 1)
							return;
						rotated = rotated + ((d3.mouse(this)[0] - initX) * 360 / (s * width));
						mouseClicked = false;
					}).call(zoom);
					
				var filter = svgRoot.append("filter")
					.attr("id","hitblur")
					.attr("filterUnits", "userSpaceOnUse")
					.append("feGaussianBlur")
					.attr("stdDeviation","3");

				var feature = svgRoot.selectAll("path.feature");

				
				//for tooltip 
				//var offsetL = document.getElementById('map').offsetLeft + 10;
				//var offsetT = document.getElementById('map').offsetTop + 10;

				var path = d3.geo.path().projection(projection);

				//var tooltip = d3.select("#map").append("div").attr("class", "tooltip hidden");

				//need this for correct panning
				mapLayer = svgRoot.append("g");

				//det json data and draw it
				d3.json(attackConfig.resourceRoot + attackConfig.mapJsonFilePath, function(error, world) {
					if (error)
						return console.error(error);

					//countries
					//mapLayer.append("g").attr("class", "boundary").selectAll("boundary")
					mapLayer.append("g").attr("class", "attackBody_boundary").selectAll("path")
						//.data(topojson.feature(world, world.objects.countries).features)
						.data( topojson.object( world, world.objects.countries ).geometries )
						.enter()
						.append("path")
						.attr("name", function(d) {
							return d.properties.name;
						})
						.attr("id", function(d) {
							return d.id;
						})
						.on('click', function() {
							d3.select('.selected').classed('selected', false);
							d3.select(this).classed('selected', true);
						})
						/*.on("mousemove", function(d) {
							label = d.properties.name;
							var mouse = d3.mouse(svgRoot.node()).map(function(d) {
								return parseInt(d);
							});
							tooltip.classed("hidden", false).attr( "style",
									"left:" + (mouse[0] + offsetL) + "px;top:"
											+ (mouse[1] + offsetT) + "px").html(label);
						})
						.on("mouseout", function(d, i) {
							tooltip.classed("hidden", true);
						})*/
						.attr("d", path);
						//.attr("stroke",attackConfig.mapStrokeColor)
						//.attr("stroke-width",attackConfig.mapStrokeWidth)
						//.attr("stroke-opacity",attackConfig.mapStrokeOpacity)
						//.style("fill", attackConfig.mapFillColor)
						//.attr("fill-opacity",attackConfig.mapFillOpacity)
						//.attr("stroke-linejoin","round").attr("stroke-linecap","round").attr("fill-rule","evenodd");
				});
				
				traceLayer = svgRoot.append("g");
	
				/* [2017/01/05] */
				initDataLoading();
			}
	
			/* [2017/01/05] */
			function initDataLoading() {
				/*
				 * TO DO
				 */
				//console.log("enter initDataLoading");
			}
	
			/* */
			function setViewEnabled(enabled) {
				enabledView = enabled;
			}
	
			/* init-point to transformed point */
			function transformedPoint(x, y) {
				return {
					"x" : mapTranslate[0] + (x * mapScale),
					"y" : mapTranslate[1] + (y * mapScale)
				};
			}
			;
	
			/* */
			function setMapMainColor(color) {
				//console.log("setMapMainColor : " + color);
				mapLayer.selectAll("path").attr("stroke", color);
				attackFilter.setMainColor(color);
			}
	
			/* */
			function toX(lng, lat) {
				var x = projection([ lng, lat ])[0];
				return x;
	
				/*
				 * [2016/12/27] 원값을 유지 return mapTranslate[0] + (x *
				 * mapScale);
				 */
			}
	
			/* */
			function toY(lng, lat) {
				var y = projection([ lng, lat ])[1];
				return y;
	
				/*
				 * [2016/12/27] 원값을 유지 return mapTranslate[1] + (y *
				 * mapScale);
				 */
			}
	
			/* */
			function hit(params, delay) {
				if (utils.isNull(svgRoot) || utils.isNull(params))
					return;
	
				/* */
				var point = transformedPoint(params.cx, params.cy);
	
				/* */
				svgRoot.append('circle').attr({
					cx : point.x,
					cy : point.y,
					stroke : params.color,
					fill : 'none',
					'stroke-width' : attackConfig.hitStrokeWidth,
					r : 0
				})
				.attr("filter","url(#hitblur)")
				.style('stroke-opacity', 1)
				.transition()
				.duration(attackConfig.hitDuration)
				.delay(delay)
				.ease('cubic-out')
				.style('stroke-opacity', "0")
				.attr('r', attackConfig.hitMaxSize).remove();
			}
	
			/* */
			function hitEffect(params) {
				hit(params, 0);
				hit(params, attackConfig.hitContinuousDelay);
				hit(params, attackConfig.hitContinuousDelay * 2);
			}
	
			/* */
			function refreshUpperLayer() {
				/* ddos */
				for (var loop = 0; loop < sourceTraceList.length; loop++) {
					var item = sourceTraceList[loop];
					var d3element = item.d3element;
	
					var point = transformedPoint(item.cx, item.cy);
					d3element.selectAll("circle").attr({
						cx : point.x,
						cy : point.y
					});
				}
			}
	
			/* */
			function clearUpperLayer() {
				traceLayer.selectAll("g").remove();
			}
	
			/* SOURCE TRACE */
			function sourceTrace(params) {
				hit(params, 0);
	
				for (var loop = sourceTraceList.length; loop > 0 && (loop > attackConfig.srcTraceMaxSize); loop--) {
					var item = sourceTraceList.shift();
					item.d3element.remove();
				}
	
				/* */
				var baseMilli = utils.currentMilliSeconds() - attackConfig.srcTraceMaxDurationMilli;
				while (sourceTraceList.length > 0) {
					var item = sourceTraceList[0];
	
					if (utils.isNullEmpty(item))
						break;
					if (item.timestamp > baseMilli)
						break;
	
					sourceTraceList.shift();
					item.d3element.remove();
				}
	
				/* scatter effect */
				var scatterX = utils.rand(0, attackConfig.srcTraceScatterRange);
				var scatterY = utils.rand(0, attackConfig.srcTraceScatterRange);
				params.cx += scatterX;
				params.cy += scatterY;
	
				/* */
				var point = transformedPoint(params.cx, params.cy);
	
				/* draw trace */
				var newTrace = traceLayer.append("g");
				newTrace.append("circle").attr({
					cx : point.x,
					cy : point.y,
					fill : params.color,
					r : attackConfig.srcTraceCircleOuterSize
				}).style('opacity', attackConfig.srcTraceOuterOpacity)
				.transition().duration(attackConfig.srcTraceTTL).remove();
	
				newTrace.append("circle").attr({
					cx : point.x,
					cy : point.y,
					fill : params.color,
					r : attackConfig.srcTraceCircleInnerSize
				}).style('opacity', attackConfig.srcTraceInnerOpacity)
				.transition().duration(attackConfig.srcTraceTTL).remove();
	
				/* */
				var history = {
					timestamp : utils.currentMilliSeconds(),
					cx : params.cx,
					cy : params.cy,
					color : params.color,
					d3element : newTrace
				};
	
				sourceTraceList.push(history);
			}
	
			/* */
			function start(params) {
				if (utils.isNull(svgRoot) || utils.isNull(params))
					return;
	
				var start = transformedPoint(params.sx, params.sy);
				var end = transformedPoint(params.dx, params.dy);
	
				var degree = Math.atan2(start.y - end.y, start.x - end.x) * 180 / Math.PI;
	
				/*
				 * [2016/12/06] Deprecated var trailModelLength =
				 * mapDistance/30; var arrowObject =
				 * trailModel(attackConfig.arrowHeaderSize,trailModelLength);
				 */
	
				/* [2017/01/05] modified */
				var mapDistance = Math.sqrt(Math.pow(params.dx - params.sx, 2) + Math.pow(params.dy - params.sy, 2));
				var adjustDuration = attackConfig.arrowDuration * (mapDistance / attackConfig.arrowDistanceDivide);
				if (adjustDuration < 500) {
					adjustDuration = 500;
				}
	
				var arrowObject = trailModel(
						attackConfig.arrowHeaderSize,
						attackConfig.arrowTrailLength);
	
				sourceTrace({
					cx : params.sx,
					cy : params.sy,
					color : params.color
				});
	
				svgRoot
					.append("polygon")
					.attr('points', arrowObject.points)
					.attr('fill', params.color)
					.attr('transform','translate(' + start.x + ',' + start.y+ ') rotate(' + degree + ')')
					.attr('opacity', 0)
					.transition()
					.duration(adjustDuration)
					.ease('linear')
					.attr('transform','translate(' + end.x + ',' + end.y+ ') rotate(' + degree + ')')
					.styleTween("opacity", function() {
						return d3.interpolate(0, 1);
					})
					.each('end', function() {
						/* 사라지는 효과 */
						d3.select(this)
						.transition()
						.duration(attackConfig.arrowDisappearDuration)
						.ease('linear')
						.styleTween("opacity", function() {
							return d3.interpolate(1, 0);
						})
						.each('end', function() {
							d3.select(this).remove();
						});
					hitEffect({
						cx: params.dx,
						cy: params.dy,
						color: params.color
					});
				});
			}
	
			/* */
			function startCurve(params) {
				if (utils.isNull(svgRoot) || utils.isNull(params))
					return;
	
				var start = transformedPoint(params.sx, params.sy);
				var end = transformedPoint(params.dx, params.dy);
	
				/*
				 * [2016/12/06] Deprecated var mapDistance =
				 * Math.sqrt(Math.pow(params.dx-params.sx, 2) +
				 * Math.pow(params.dy-params.sy, 2)); var
				 * trailModelLength = mapDistance/30; var arrowObject =
				 * trailModel(attackConfig.arrowHeaderSize,trailModelLength);
				 */
				var arrowObject = trailModel(attackConfig.arrowHeaderSize,attackConfig.arrowTrailLength);
	
				/* */
				var TODEGREES = 180 / Math.PI;
				var HALFPI = Math.PI / 2;
	
				var angle = Math
						.atan2(start.y - end.y, start.x - end.x);
				var offsetAngle = angle + HALFPI;
				var distance = Math.sqrt(end.x * end.x + end.y * end.y);
				var random = Math.random();
				var radius = distance / 2 * params.offsize;
				var control = {
					x : (start.x + end.x) / 2 + radius * Math.cos(offsetAngle),
					y : (start.y + end.y) / 2 + radius * Math.sin(offsetAngle)
				};
				var pos = arrowObject.height / distance;
	
				var lastPoint = [ start.x, start.y ];
	
				function curve() {
					return function(t) {
						var _1mt = (1 - t), _1mt_sq = _1mt * _1mt, _2_1mt_t = 2 * _1mt * t, _tt = t * t,
	
						x = _1mt_sq * start.x + _2_1mt_t * control.x + _tt * end.x, y = _1mt_sq * start.y + _2_1mt_t * control.y + _tt * end.y;
	
						var angle = Math.atan2(lastPoint[1] - y, lastPoint[0] - x);
						lastPoint[0] = x;
						lastPoint[1] = y;
	
						// PERFORMANCE BOTTLENECK transforming svg
						// elements is slow
						var degree = angle * TODEGREES;
						if (!isNaN(degree)) {
							return 'translate(' + [ x, y ] + ') rotate(' + degree + ', 0, 0)';
						} else {
							return null;
						}
					};
				}
	
				sourceTrace({
					cx : params.sx,
					cy : params.sy,
					color : params.color
				});
	
				var curves = svgRoot.append("polygon").attr('points', arrowObject.points).attr('fill', params.color).attr('opacity', 0);
	
				/* */
                curves.transition().duration(0).ease('linear').attr('transform', curve()(pos)).each('end', function(d, i) {
					pos = pos === 1 ? 0 : pos;
					var _1mpos = 1 - pos;
					var ease = function(t) {
						return t >= 1 ? 1 : (t * _1mpos + pos);
					};
					d3.select(this)
					.transition().duration(attackConfig.arrowDuration)
					.ease(ease)
					.attrTween('transform', curve)
					.styleTween("opacity", function() {
						return d3.interpolate(0, 1);
					})
					.each('end', function() {
						d3.select(this)
						.transition()
						.duration(attackConfig.arrowDisappearDuration)
						.ease('linear')
						.styleTween("opacity", function() {
							return d3.interpolate(1, 0);
						})
						.each('end', function() {
							d3.select(this).remove();
						});
						
						hitEffect({
							cx: params.dx,
							cy: params.dy,
							color: params.color
						});
					});
				});
			}
	
			/* [important] Local Database */
			/* --------------------------------------------------------------- */
			var LocalData = {
				baseTime : '',
				baseTimeMargin : 0,
	
				/* */
				ddosList : [],
				ddosSrcTopNMap : new dsMap(),
				ddosDstTopNMap : new dsMap(),
				/* */
				attackTypeTopNMap : new dsMap()
			};
	
			/* */
			function clearDataUIAll() {
				LocalData.ddosSrcTopNMap.clear();
				LocalData.ddosDstTopNMap.clear();
				LocalData.attackTypeTopNMap.clear();
	
				clearUpperLayer();
			}
	
			/* [important] ddos buffer */
			/* --------------------------------------------------------------- */
			/* */
			function addDdosListToBuffer(result) {
				// console.log("enter addDdosListToBuffer:" +
				// JSON.stringify(result));
	
				if (utils.isNullEmpty(result) || utils.isNullEmpty(result.list) || result.list.length == 0)
					return;
	
				/* adjust this base time against the attack time */
				if (utils.isNullEmpty(LocalData.baseTime)) {
					try {
						var initAtkTime = result.list[0].attack_time;
						/* */
						LocalData.baseTime = initAtkTime;
	
						//console.log("init attack time :" + LocalData.baseTime);
	
						/* */
						var initMilli = utils
								.convertFmtToMilli(initAtkTime);
						var diff = utils.currentMilliSeconds()
								- initMilli;
	
						LocalData.baseTimeMargin = diff;
	
						//console.log("init attack margin :" + LocalData.baseTimeMargin);
	
					} catch (e) {
						/* ignore */
						console.log("exception :" + e);
					}
				}
	
				/* */
				var length = result.list.length;
				for (var idx = 0; idx < length; idx++) {
					var entry = result.list[idx];
					/* */
					LocalData.ddosList.push(entry);
				}
	
			}
	
			/* */
			function addDdosSrcTopN(entry) {
				var key = entry.src_country;
				var mapItem = LocalData.ddosSrcTopNMap.get(key);
	
				if (!utils.isNullEmpty(mapItem)) {
					mapItem.value = mapItem.value + 1;
				} else {
					mapItem = {
						"key" : key,
						"value" : 1,
						"imgUrl" : countryMapper.toImgUrl(key),
						"name" : countryMapper.toName(key)
					};
					LocalData.ddosSrcTopNMap.put(key, mapItem);
				}
			}
	
			/* */
			function addDdosDstTopN(entry) {
				var key = entry.dst_country;
				var mapItem = LocalData.ddosDstTopNMap.get(key);
	
				if (!utils.isNullEmpty(mapItem)) {
					mapItem.value = mapItem.value + 1;
				} else {
					mapItem = {
						"key" : key,
						"value" : 1,
						"imgUrl" : countryMapper.toImgUrl(key),
						"name" : countryMapper.toName(key)
					};
					LocalData.ddosDstTopNMap.put(key, mapItem);
				}
			}
	
			/* */
			function addAttackTypeTopN(type, attackNo, attackName, color) {
				var key = '' + type + '_' + attackNo;
				var mapItem = LocalData.attackTypeTopNMap.get(key);
	
				if (!utils.isNullEmpty(mapItem)) {
					mapItem.value = mapItem.value + 1;
				} else {
					mapItem = {
						"key" : key,
						"value" : 1,
						"type" : type,
						"attackNo" : attackNo,
						"attackName" : attackName,
						"color" : color
					};
					LocalData.attackTypeTopNMap.put(key, mapItem);
				}
			}
	
			/* [important] filter */
			/* --------------------------------------------------------------- */
			/* */
			function isDdosDiscarding(entry) {
				/*
				 * entry:{"src_city":"","dst_country":"KR","byte_cnt":"64","src_lon":"9.00000","dst_lon":"126.97830",
				 * "attack_mode":"D","dst_ip":"101.79.163.170","src_ip":"46.165.254.131","src_lat":"51.00000","src_port":"45411",
				 * "attack_name":"ACL 차단(500000)","protocol":"UDP",
				 * "src_country":"DE","packet_cnt":"1","attack_time":"2017-01-11
				 * 16:29:48",
				 * "dst_city":"Seoul","dst_port":"53413","seq":94695044,"dst_lat":"37.59850"}
				 */
				// [2017/03/28] Deprecated
				/*
				 * if (attackFilter.isDdosEnabled() == false) { return
				 * true; }
				 */
	
				if (utils.isNullEmpty(entry)
						|| utils.isNullEmpty(entry.src_ip)
						|| utils.isNullEmpty(entry.src_lon)
						|| utils.isNullEmpty(entry.src_lat)
						|| utils.isNullEmpty(entry.src_country)
						|| utils.isNullEmpty(entry.dst_ip)
						|| utils.isNullEmpty(entry.dst_lon)
						|| utils.isNullEmpty(entry.dst_lat)
						|| utils.isNullEmpty(entry.dst_port)
						|| utils.isNullEmpty(entry.dst_country))
					return true;
	
				if (attackFilter.isTcpEnabled() == false && entry.protocol == "TCP") {
					// logger.log("tcp discared:"+entry.protocol);
					return true;
				}
				if (attackFilter.isUdpEnabled() == false && entry.protocol == "UDP") {
					// logger.log("udp discared:"+entry.protocol);
					return true;
				}
				if (attackFilter.isIcmpEnabled() == false && entry.protocol == "ICMP") {
					// logger.log("icmp discared:"+entry.protocol);
					return true;
				}
	
				if (attackFilter.isSrcIpFiltered(entry.src_ip)) {
					// logger.log("src ip discared:"+entry.src_ip);
					return true;
				}
				if (attackFilter.isSrcCntryFiltered(entry.src_country)) {
					// logger.log("src country
					// discared:"+entry.src_country);
					return true;
				}
				if (attackFilter.isDstCntryFiltered(entry.dst_country)) {
					// logger.log("dst country
					// discared:"+entry.dst_country);
					return true;
				}
				if (attackFilter.isPortFiltered(entry.dst_port)) {
					// logger.log("port discared:"+entry.dst_port);
					return true;
				}
	
				return false;
			}
	
			/* [important] callback */
			/* --------------------------------------------------------------- */
			var onClear;
			var onViewDidLoad;
			var onAddedLiveAttackTable;
			var onChangedDdosSrcTopN;
			var onChangedDdosDstTopN;
			var onChangedAttackTypeTopN;
			var onTimeTick;
	
			/* */
			function setOnClear(listener) {
				onClear = listener;
			}
	
			/* 맵이 준비되면 실행 */
			function setOnViewDidLoad(listener) {
				onViewDidLoad = listener;
			}
	
			/* ddos live attack 테이블에 신규로 데이터가 추가될 때 */
			function setOnAddedLiveAttackTable(listener) {
				onAddedLiveAttackTable = listener;
			}
	
			/* */
			function setOnChangedDdosSrcTopN(listener) {
				onChangedDdosSrcTopN = listener;
			}
	
			/* */
			function setOnChangedDdosDstTopN(listener) {
				onChangedDdosDstTopN = listener;
			}
	
			/* */
			function setOnChangedAttackTypeTopN(listener) {
				onChangedAttackTypeTopN = listener;
			}
	
			/* */
			function setOnTimeTick(listener) {
				onTimeTick = listener;
			}
	
			/* [important] draw ddos */
			/* --------------------------------------------------------------- */
			function drawDdosIfTime() {
				var currentMilli = utils.currentMilliSeconds() - LocalData.baseTimeMargin;
				var currentDt = new Date(currentMilli);
				var currentTimeString = utils.formattedMilliTime(currentDt);
	
				while (LocalData.ddosList.length > 0) {
					var entry = LocalData.ddosList[0];
	
					if (entry.attack_time <= currentTimeString) {
						// logger.log("attack_time:"+entry.attack_time+",base_time:"+currentTimeString);
	
						LocalData.ddosList.shift();
						drawDdosLine(entry);
					} else {
						break;
					}
				}
	
				/* update top-n table */
				if (typeof onChangedDdosSrcTopN === 'function') {
					var arrTopN = LocalData.ddosSrcTopNMap.values().sort(function(a, b) {
						return b.value - a.value
					});
					onChangedDdosSrcTopN(arrTopN);
				}
	
				if (typeof onChangedDdosDstTopN === 'function') {
					var arrTopN = LocalData.ddosDstTopNMap.values().sort(function(a, b) {
						return b.value - a.value
					});
					onChangedDdosDstTopN(arrTopN);
				}
	
				if (typeof onChangedAttackTypeTopN === 'function') {
					var arrTopN = LocalData.attackTypeTopNMap.values().sort(function(a, b) {
						return b.value - a.value
					});
					onChangedAttackTypeTopN(arrTopN);
				}
			}
	
			/* */
			function drawDdosLine(entry) {
				/* */
				if (isDdosDiscarding(entry))
					return;
	
				/* */
				var srcx = toX(entry.src_lon, entry.src_lat);
				var srcy = toY(entry.src_lon, entry.src_lat);
				var destx = toX(entry.dst_lon, entry.dst_lat);
				var desty = toY(entry.dst_lon, entry.dst_lat);
	
				logger.log("[DDoS] attack_time:" + entry.attack_time+ ",srcx:" + srcx + ",srcy:" + srcy + ",destx:"+ destx + ",desty:" + desty);
	
				if (utils.isValidCoord(srcx) && utils.isValidCoord(srcy) && utils.isValidCoord(destx) && utils.isValidCoord(desty)) {
	
					/* add realtime topN */
					addDdosSrcTopN(entry);
					addDdosDstTopN(entry);
	
					/* */
					var color = portMapper.toHslColor(entry.dst_port);
	
					/* */
					var attackModeName = "DDoS";
					addAttackTypeTopN(attackModeName, entry.dst_port, portMapper.toName(entry.dst_port), color);
	
					/* draw arrow */
					start({
						sx : srcx,
						sy : srcy,
						dx : destx,
						dy : desty,
						color : color
					});
	
					/* update table */
					if (typeof onAddedLiveAttackTable === 'function') {
						onAddedLiveAttackTable(entry);
					}
				}
			}
	
			/* */
			function doScheduler() {
				// console.log("enter scheduler");
	
				try {
					/* update table */
					/*
					if (typeof onTimeTick === 'function') {
						var currentMilli = utils.currentMilliSeconds() - LocalData.baseTimeMargin;
						var currentDt = new Date(currentMilli);
						var currentTimeString = utils.formattedMilliTime(currentDt);
	
						onTimeTick(currentTimeString);
					}
					*/
	
					drawDdosIfTime();
				} catch (e) { /* ignore */
				}
	
				setTimeout(doScheduler, SCHEDULER_INTERVAL_MILLI);
			}
	
			/* Sample Demo Event */
			/* --------------------------------------------------------------- */
			function generateDemoDDoS() {
				// console.log("enter generator");
				try {
					var result = {};
					result.list = [];
	
					for (var index = 0; index < 2; index++) {
						var currentDt = new Date();
						var currentTimeString = utils.formattedMilliTime(currentDt);
	
						var entry = {
							"seq" : 0,
							"attack_time" : currentTimeString,
							"attack_mode" : "D",
							"attack_name" : "Helloworld",
							"src_ip" : "1.1.1.1",
							"src_lat" : utils.rand(-90, 90),
							"src_lon" : utils.rand(-180, 180),
							"src_country" : "kr",
							"src_city" : "seoul",
							"src_port" : utils.rand(1, 10000),
	
							"dst_ip" : "2.2.2.2",
							"dst_lat" : utils.rand(-90, 90),
							"dst_lon" : utils.rand(-180, 180),
							"dst_country" : "us",
							"dst_city" : "newyork",
							"dst_port" : utils.rand(1, 10000),
	
							"protocol" : "TCP",
							"byte_cnt" : 1,
							"packet_cnt" : 1
						};
	
						result.list.push(entry);
					}
	
					addDdosListToBuffer(result);
				} catch (e) { /* ignore */
				}
	
				setTimeout(generateDemoDDoS, SCHEDULER_INTERVAL_MILLI);
			}
	
			/* return */
			return {
				version : '0.1.alpha01',
				init : init,
				doScheduler : doScheduler,
	
				setViewEnabled : setViewEnabled,
	
				/* change */
				setMapMainColor : setMapMainColor,
	
				/* info */
				getPortName : function(portNo) {
					return portMapper.toName(portNo);
				},
				getPortColor : function(portNo) {
					return portMapper.toHslColor(portNo);
				},
				getCountryFlagUrl : function(countryCode) {
					return countryMapper.toImgUrl(countryCode);
				},
				getCountryName : function(countryCode) {
					return countryMapper.toName(countryCode);
				},
	
				/* callback */
				setOnClear : setOnClear,
				setOnViewDidLoad : setOnViewDidLoad,
				setOnAddedLiveAttackTable : setOnAddedLiveAttackTable,
				setOnChangedDdosSrcTopN : setOnChangedDdosSrcTopN,
				setOnChangedDdosDstTopN : setOnChangedDdosDstTopN,
				setOnChangedAttackTypeTopN : setOnChangedAttackTypeTopN,
				setOnTimeTick : setOnTimeTick,
	
				/* [2017/02/18] added */
				clearDataUIAll : clearDataUIAll,
	
				/* [2017/03/31] added */
				addDdosListToBuffer : addDdosListToBuffer,
	
				/* for demo */
				//generateDemoDDoS : generateDemoDDoS
			}
		}());
	}());
	
	/* */
	/* --------------------------------------------------------------- */
	/*
	$(function() {
		$(window).focus(function() {
			attackD3Map.handler.setViewEnabled(true);
		});
	
		$(window).blur(function() {
			attackD3Map.handler.setViewEnabled(false);
		});
	});
	*/
});
