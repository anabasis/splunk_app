require([
], function() {
    $(function() {
        var $win = $(window),
            $body = $("body"),
            w_width = $win.width();

        // 레이어 드래그
        $(".draggable").each(function(index) {
            var $this = $(this);

            /* [NO OVERWRITE][2017/01/18] */
            in_box_pos($this, index, true);
            $(window).on("resize", function() {
                /* [NO OVERWRITE][2017/01/18] */
                in_box_pos($this, index, false);
            });

            // 닫기
            $(".inbox_close", $(this)).on("click", function(e) {
                e.preventDefault();

                $parentDiv = $(this).parent().parent();

                /* [NO OVERWRITE][2017/01/18] */
                $this.fadeOut("fast", function() {
                    if ($parentDiv.hasClass("attack_origins")) {
                        in_box_pos($('.draggable.attack_origins'), 0, true);
                    } else if ($parentDiv.hasClass("attack_targets")) {
                        in_box_pos($('.draggable.attack_targets'), 0, true);
                    } else if ($parentDiv.hasClass("attack_types")) {
                        in_box_pos($('.draggable.attack_types'), 0, true);
                    } else if ($parentDiv.hasClass("live_attacks")) {
                        in_box_pos($('.draggable.live_attacks'), 0, true);
                    }
                });


                $bottom_nav = $(".bottom_nav");
                if ($parentDiv.hasClass("attack_origins")) {
                    $(".attack_origins", $bottom_nav).removeClass("on").find("span:last").text("Off");
                } else if ($parentDiv.hasClass("attack_targets")) {
                    $(".attack_targets", $bottom_nav).removeClass("on").find("span:last").text("Off");
                } else if ($parentDiv.hasClass("attack_types")) {
                    $(".attack_types", $bottom_nav).removeClass("on").find("span:last").text("Off");
                } else if ($parentDiv.hasClass("live_attacks")) {
                    $(".live_attacks", $bottom_nav).removeClass("on").find("span:last").text("Off");
                } else if ($parentDiv.hasClass("replay")) {
                    $(".replay", $bottom_nav).removeClass("on").find("span:last").text("Replay");
                } else if ($parentDiv.hasClass("filter_setting")) {
                    $(".filter_setting", $bottom_nav).removeClass("on");
                }
            });

            // 드래그 요소로 변경
            $this.draggable({
                stop: function(e, ui) {
                    // 위치값 저장
                    var $eId = e.target.id;
                    var pos = {};
                    pos.top = ui.position.top;
                    pos.left = ui.position.left;
                    // local storage setItem
                    localStorage.setItem(index + "_top", pos.top);
                    localStorage.setItem(index + "_left", pos.left);
                }
            });
        });

        var body_class = $("#attackBody").attr("class") || '';
        if (body_class == '') $("#attackBody").addClass("green");
        $(".main_color select").change(function() {
            var $this = $(this);

            /* [NO OVERWRITE][2017/01/18] */
            $("#attackBody").removeClass().addClass($this.find("option:selected").text().toLowerCase());
        });

        // 위치지정
        /* [NO OVERWRITE][2017/01/18] */
        function in_box_pos($this, index, initable) {
            // local storage getItem

            /* [NO OVERWRITE][2017/01/18] */
            var el_top = '',
                el_left = '';

            /* [NO OVERWRITE][2017/01/18] */
            if (!initable) {
                el_top = localStorage.getItem(index + "_top") || '';
                el_left = localStorage.getItem(index + "_left") || '';
            }

            var doc_h = $(document).height(),
                bottom_nav_pos = $(".bottom_nav").offset().top,
                d_v = ((bottom_nav_pos / doc_h) * 100);

            // 위치값 없으면 기본 자리 지정 top
            if (el_top == "") {
                if ($this.hasClass("in_box_1")) {
                    _$this = $(".in_box_1");
                    el_top = (d_v - ((_$this.height() / doc_h) * 100) - 1) + '%';
                } else if ($this.hasClass("in_box_2")) {
                    _$this = $(".in_box_2");
                    el_top = (d_v - ((_$this.height() / doc_h) * 100) - 1) + '%';
                } else if ($this.hasClass("in_box_3")) {
                    _$this = $(".in_box_3");
                    el_top = (d_v - ((_$this.height() / doc_h) * 100) - 1) + '%';
                } else if ($this.hasClass("in_box_4")) {
                    _$this = $(".in_box_4");
                    el_top = (d_v - ((_$this.height() / doc_h) * 100) - 1) + '%';
                } else if ($this.hasClass("in_box_5")) {
                    el_top = "15%";
                } else if ($this.hasClass("in_box_6")) {
                    el_top = "15%";
                } else if ($this.hasClass("in_box_7")) {
                    el_top = "15%";
                }
            }

            // 위치값 없으면 기본 자리 지정 left
            if (el_left == "") {
                if ($this.hasClass("in_box_1")) {
                    el_left = "0%";
                } else if ($this.hasClass("in_box_2")) {
                    el_left = "15.82%";
                } else if ($this.hasClass("in_box_3")) {
                    el_left = "31.64%";
                } else if ($this.hasClass("in_box_4")) {
                    el_left = "52.12%";
                } else if ($this.hasClass("in_box_5")) {
                    el_left = "80%";
                } else if ($this.hasClass("in_box_6")) {
                    el_left = "25%";
                } else if ($this.hasClass("in_box_7")) {
                    el_left = "5%";
                }
            }

            if (el_top.indexOf("%") <= 0) el_top += 'px';
            if (el_left.indexOf("%") <= 0) el_left += 'px';
            $this.css({
                'position': 'absolute',
                'top': el_top,
                'left': el_left
            });
        }

        // 하단 버튼
        $(".bottom_nav ul a").on("click", function(e) {
            e.preventDefault();
            var $this = $(this);
            if ($this.hasClass("attack_origins")) {
                bottom_nav_toggle($this, "attack_origins");
            } else if ($this.hasClass("attack_targets")) {
                bottom_nav_toggle($this, "attack_targets");
            } else if ($this.hasClass("attack_types")) {
                bottom_nav_toggle($this, "attack_types");
            } else if ($this.hasClass("live_attacks")) {
                bottom_nav_toggle($this, "live_attacks");
            } else if ($this.hasClass("filter_setting")) {
                if ($this.hasClass("on")) {
                    $(".in_box.filter_setting").fadeOut();
                    $(this).removeClass("on");
                } else {
                    $(".in_box.filter_setting").fadeIn();
                    $(this).addClass("on");


                }
            }
        });

        // 하단 버튼 토글
        function bottom_nav_toggle($obj, eTarget) {
            if ($obj.hasClass("on")) {
                /* [NO OVERWRITE][2017/01/18] */
                $(".in_box." + eTarget).fadeOut("fast", function() {
                    in_box_pos($('.draggable.' + eTarget), 0, true);
                });
                $obj.removeClass("on").find("span:last").text("Off");
            } else {
                /* [NO OVERWRITE][2017/01/18] */
                $(".in_box." + eTarget).fadeIn("fast", function() {
                    in_box_pos($('.draggable.' + eTarget), 0, true);
                });
                $obj.addClass("on").find("span:last").text("On");
            }
        }

        // 셋팅 화살표 위치
        setting_arrow_pos();
        $(window).on("resize", setting_arrow_pos());

        function setting_arrow_pos() {
            var $track = $(".in_box.setting .track"),
                $arr = $(".in_box.setting .track .arrow"),
                pos_arr = 0,
                arrow_pos = $arr.data("val");
            pos_arr = ($track.width() * (arrow_pos / 100)) - ($arr.width() / 2) + 1
            $arr.css({
                'left': pos_arr
            });
        }
    });
});
