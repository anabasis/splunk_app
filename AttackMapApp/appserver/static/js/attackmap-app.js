require([
	"jquery",
	"/static/app/attack_threat_map/js/vue.min.js"
], function($, Vue) {
	/* fix : $.browser.msie error in safari */
	if (!jQuery.browser) {
		jQuery.browser = {};
		jQuery.browser.mozilla = /mozilla/.test(navigator.userAgent.toLowerCase()) && !/webkit/.test(navigator.userAgent.toLowerCase());
		jQuery.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
		jQuery.browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
		jQuery.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());
	}

	(function() {
		"use strict";

		var root = window;
		/* constants */
		var /* const */MAX_ROW_SIZE = 10;

		/* variables */
		var liveAttackList = [];
		
		
		var attackMapPage;
		if(typeof exports !== 'undefined') {
			attackMapPage = exports;
		} else {
			attackMapPage = window.attackMapPage = {};
		}

		var clock = new Vue({
		    el: '#clock',
		    data: {
		        time: '',
		        date: ''
		    }
		});
		var week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
		var timerID = setInterval(updateTime, 1000);
		updateTime();
		
		function updateTime() {
		    var cd = new Date();
		    clock.time = zeroPadding(cd.getHours(), 2) + ':' + zeroPadding(cd.getMinutes(), 2) + ':' + zeroPadding(cd.getSeconds(), 2);
		    clock.date = zeroPadding(cd.getFullYear(), 4) + '-' + zeroPadding(cd.getMonth()+1, 2) + '-' + zeroPadding(cd.getDate(), 2) + ' ' + week[cd.getDay()];
		}
		
		function zeroPadding(num, digit) {
			var zero = '';
			for(var i = 0; i < digit; i++) {
				zero += '0';
			}
			return (zero + num).slice(-digit);
		}
		
		/* */
		function showAlert(msg) {
			alert(msg);
		}

		/*--------------------------------------------------------------------------*/
		function refreshLiveAttacks() {
			var html = '';
			var index = 0;

			for (index = liveAttackList.length - 1; index >= 0; index--) {
				var item = liveAttackList[index];

		                html += '<li>';
		                html += '<span class="timestamp">' + item.attack_time.substring(11, 19) + '</span>';
		                html += '<span class="source_ip">' + item.src_ip + '</span>';
		                html += '<span class="ctr_img"><img src="' + attackD3Map.handler.getCountryFlagUrl(item.dst_country) + '" alt=""></span>';
		                html += '<span class="ctr_nm">' + attackD3Map.handler.getCountryName(item.dst_country) + '</span>';
		                html += '<span class="dest_city">' + item.dst_city + '</span>';
		                html += '<span class="atk_type" style="color:' + attackD3Map.handler.getPortColor(item.dst_port) + ';">' + attackD3Map.handler.getPortName(item.dst_port) + '</span>';

		                html += '<span class="port">' + item.dst_port + '</span>';
		                html += '</li>';
			}

			/* blank */
			var blankSize = MAX_ROW_SIZE - liveAttackList.length;
			for (index = 0; index < blankSize; index++) {
				html += '<li>';
				html += '<span class="timestamp">&nbsp;</span>';
				html += '</li>';
			}

			$('#liveAttackBody').html(html);
		}

		/* */
		function onClear() {
			/* */
			attackD3Map.handler.clearDataUIAll();

			liveAttackList = [];
			refreshLiveAttacks();
			updateDdosSrcTopN([]);
			updateDdosDstTopN([]);
			updateAttackTypeTopN([]);
		}

		/* */
		function addLiveAttack(entry) {
			if (liveAttackList.length >= MAX_ROW_SIZE) {
				liveAttackList.shift();
			}
			liveAttackList.push(entry);

			/* */
			refreshLiveAttacks();
		}

		function updateDdosSrcTopN(arrTopN) {
			var html = '';
			var index = 0;

			for (index = 0; index < arrTopN.length
					&& index < MAX_ROW_SIZE; index++) {
                var item = arrTopN[index];
                html += '<li>';
                html += '<span class="no">' + item.value + '</span>';
                html += '<span class="ctr_img"><img src="' + item.imgUrl + '" alt=""></span>';
                html += '<span class="ctr_nm">' + item.name + '</span>';
                html += '</li>';
			}

			/* blank */
			var blankSize = MAX_ROW_SIZE - arrTopN.length;
			for (index = 0; index < blankSize; index++) {
				html += '<li>';
				html += '<span class="no">&nbsp;</span>';
				html += '</li>';
			}

			$('#attackOriginBody').html(html);
		}

		function updateDdosDstTopN(arrTopN) {
			var html = '';
			var index = 0;

            for (index = 0; index < arrTopN.length && index < MAX_ROW_SIZE; index++) {
				var item = arrTopN[index];
				html += '<li>';
				html += '<span class="no">' + item.value + '</span>';
				html += '<span class="ctr_img"><img src="' + item.imgUrl + '" alt=""></span>';
				html += '<span class="ctr_nm">' + item.name + '</span>';
				html += '</li>';
            }

			/* blank */
			var blankSize = MAX_ROW_SIZE - arrTopN.length;
			for (index = 0; index < blankSize; index++) {
				html += '<li>';
				html += '<span class="no">&nbsp;</span>';
				html += '</li>';
			}

			$('#attackTargetBody').html(html);
		}

		function updateAttackTypeTopN(arrTopN) {
			var html = '';
			var index = 0;

			for (index = 0; index < arrTopN.length && index < MAX_ROW_SIZE; index++) {
				var item = arrTopN[index];
				html += '<li>';
				html += '<span class="no">' + item.value + '</span>';
				html += '<span class="type">' + item.type + '</span>';
				html += '<span class="atk_type" style="color:' + item.color + ';">' + item.attackName + '</span>';
				html += '<span class="port">' + item.attackNo + '</span>';
				html += '</li>';
			}

			/* blank */
			var blankSize = MAX_ROW_SIZE - arrTopN.length;
			for (index = 0; index < blankSize; index++) {
				html += '<li>';
				html += '<span class="no">&nbsp;</span>';
				html += '</li>';
			}

			$('#attackTypeBody').html(html);
		}

		/* */
		function onTimeTick(timeFmtString) {
			/* */
			//$('#attackTimer').html('' + timeFmtString);
			
		}
		

		function zeroPadding(num, digit) {
		    var zero = '';
		    for(var i = 0; i < digit; i++) {
		        zero += '0';
		    }
		    return (zero + num).slice(-digit);
		}



		/*--------------------------------------------------------------------------*/

		/* */
		function initAfterLoading() {
			/*
			 * TO DO
			 */
		}

		/*
		 * public
		 * --------------------------------------------------------
		 */
		/* */
		function init() {
			//console.log("attackmap-app init...");

			$('#mainColorSelector').on('change', function() {
				attackD3Map.handler.setMapMainColor($(this).val());
			});

			var mainColor = attackD3Map.attackFilter.getMainColor();
			$('#mainColorSelector').val(mainColor);
			var mainColorClass = $('#mainColorSelector').find("option:selected").text().toLowerCase();
			$("#attackBody").removeClass().addClass(mainColorClass);

			/* */
			attackD3Map.handler.setOnViewDidLoad(function() {
				initAfterLoading();
			});

			attackD3Map.handler.setOnClear(function() {
				onClear();
			});

			/* */
			attackD3Map.handler.setOnAddedLiveAttackTable(function(
					entry) {
				addLiveAttack(entry);
			});

			attackD3Map.handler.setOnChangedDdosSrcTopN(function(
					arrTopN) {
				updateDdosSrcTopN(arrTopN);
			});

			attackD3Map.handler.setOnChangedDdosDstTopN(function(
					arrTopN) {
				updateDdosDstTopN(arrTopN);
			});

			attackD3Map.handler.setOnChangedAttackTypeTopN(function(
					arrTopN) {
				updateAttackTypeTopN(arrTopN);
			});

			/* */
			attackD3Map.handler.setOnTimeTick(function(timetick) {
				onTimeTick(timetick);
			});

			/* */
			attackD3Map.handler.init("#attackMap");
			attackD3Map.handler.doScheduler();
		}
		attackMapPage.init = init;
		
		(function(){
			init();
		}());
		
/*
		window.attackMapPage = { 
			init: init
		};
*/
	}());
});
