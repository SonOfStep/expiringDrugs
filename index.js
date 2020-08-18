// ==UserScript==
// @name Expired Drugs
// @name:ru Истекающие ЛС
// @version 0.8.3
// @updateURL https://raw.githubusercontent.com/SonOfStep/expiringDrugs/master/index.js
// @author Omar "SonOfStep" Nurmakhanov
// @match *://172.30.149.11:8282/OE/appointment/remsandapps*
// @grant none
// ==/UserScript==

$(window).on("load", function(){
    "use strict";

    function setFilter( start, end ){

        return new Promise( (resolve, reject) => {

            let dateNow =  ( new Date );
            let dateEndNextMonth = new Date( dateNow.getFullYear(), dateNow.getMonth() + 2, 0 );

            if ( start == undefined ){
                start = "" + dateNow.getDate() + " " + getCustomMonth( dateNow.getMonth() ) + " " + dateNow.getFullYear();
            };

            if ( end == undefined ){
                end = "" + dateEndNextMonth.getDate() + " " + getCustomMonth( dateEndNextMonth.getMonth() ) + " " + dateEndNextMonth.getFullYear();
            };

            let request = $.ajax({
                'type': 'POST',
                url: '/OE/appointment/getremainsbynursefilter',
                data:{
                    lsname: $('#lsname_rems').val(),
                    series: $('#series_rems').val(),
                    party: $('#party_rems').val(),
                    budget: $('#budget_rems').val(),
                    dateb: start,
                    datee: end,
                    YII_CSRF_TOKEN: YII_CSRF_TOKEN
                }
            });

            request.done( msg => { resolve(msg) });
            request.fail( msg => { reject(msg) });

        } )
    }//Установка фильтра

    function getCustomMonth( num ){
        let months = [
            'Янв',
            'Фев',
            'Мар',
            'Апр',
            'Май',
            'Июн',
            'Июл',
            'Авг',
            'Сен',
            'Ноя',
            'Дек',
        ];
        switch (num){
            case 0 :
                return months[num];
                break;
            case 1 :
                return months[num];
                break;
            case 2 :
                return months[num];
                break;
            case 3 :
                return months[num];
                break;
            case 4 :
                return months[num];
                break;
            case 5 :
                return months[num];
                break;
            case 6 :
                return months[num];
                break;
            case 7 :
                return months[num];
                break;
            case 8 :
                return months[num];
                break;
            case 9 :
                return months[num];
                break;
            case 10 :
                return months[num];
                break;
            case 11 :
                return months[num];
                break;
            default:
                return NaN;
        }
    } // Функция возвращающая первые 3 буквы месяца, необходима для коректной установки фильтра времени

    function loadStorage( storage ){
        return new Promise( ( resolve, reject ) => {
            let request = $.ajax({
                'type':'POST',
                url: baseUrl+'/appointment/getremainsbynurse',
                'data': {
                    userstorid: storage,
                    num: 1,
                    flag: flag_rems,
                    asc: 1,
                    count: 100,
                    YII_CSRF_TOKEN: YII_CSRF_TOKEN
                }
            });

            request.done( msg => {
                resolve( msg )
            });

            request.fail( msg => {
                reject( msg )
            });

        } )
    }

    $("body").append(`
<div class='drugs-expired-soon'>
<h4 class="drugs-expired-soon__head">Список ЛС, у которых в скоро закончится срок годности</h4>
<ol class="drugs-expired-soon__list">
</ol>
<button class="drugs-expired-soon__btn">Свернуть</button>
</div>
`);
    $(".drugs-expired-soon").css({
        "display": 			"flex",
        "flexDirection": 	"column",
        "position": 		"fixed",
        "bottom": 			"5px",
        "left" : 			"10px",
        "width": 			$(window).width() - 20,
        "backgroundColor": 	"#fff",
        "color": 			"#000",
        "padding":			"5px 10px 50px 10px",
        "maxHeight": 		"500px",
        "minHeight": 		"50px",
        "maxWidth": 		$(window).width(),
        "boxShadow":        "0px 0px 10px 1px rgba(0,0,0,0.5)",
        "overflow-x":        "none"
    });
    $(".drugs-expired-soon__btn").css({
        "outline": "none",
        "width": "135px",
        "text-shadow": "none",
        "borderRadius": "0",
        "position": "absolute",
        "bottom": "10px",
        "border": "2px solid #105dae",
        "background": "#105dae",
        "color": "#fff"
    })

    setFilter().then(
        result => {

            console.log(result);

            $("#subdrugst option").each( (i) => {

                loadStorage($("#subdrugst option:nth-child(" + ( i + 1 ) +")").attr("value")).then(
                    result => {
                        $("ol.drugs-expired-soon__list").append(result);
                        $('.drugs-expired-soon__list tr').replaceWith(function(){
                            return $("<li />", {html: $(this).html()});
                        });
                        $('.drugs-expired-soon__list li td').replaceWith(function(){
                            return $("<span />", {html: $(this).html()});
                        });
                    },
                    error => {console.log(error)}
                )

            });
            $('#reset_filter_rems').trigger("click");
        },
        error => console.log(error)
    );

    if (localStorage.getItem("rollExpiredDrugs") == "true"){
        $(".drugs-expired-soon").css({"max-height": "43px"});
        $(".drugs-expired-soon").css({"max-width": "155px"});
        $(".drugs-expired-soon__list, .drugs-expired-soon__head").css({color: "#fff"});
    }

    $('.drugs-expired-soon__btn').toggle(function () {
        $(".drugs-expired-soon").animate({"max-width": $(window).width()}, {duration: "400", easing: "swing"});
        $(".drugs-expired-soon").animate({"max-height": "500px"}, {duration: "400", easing: "swing"});
        setTimeout( function(){$(".drugs-expired-soon__list, .drugs-expired-soon__head").animate({color: "#000"}, 400)}, 600 );
        $(".drugs-expired-soon__btn").text("Свернуть");
        localStorage.setItem('rollExpiredDrugs', 'false');
    }, function () {

        setTimeout( function(){
            $(".drugs-expired-soon").animate({"max-height": "43px"}, {duration: "400", easing: "swing"});
            $(".drugs-expired-soon").animate({"max-width": "155px"}, {duration: "400", easing: "swing"});
        }, 100 );
        $(".drugs-expired-soon__list, .drugs-expired-soon__head").animate({color: "#fff"}, {duration: 400});
        $(".drugs-expired-soon__btn").text("Развернуть");
        localStorage.setItem('rollExpiredDrugs', 'true');
    });
});
