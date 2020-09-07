// ==UserScript==
// @name Expired Drugs
// @name:ru Истекающие ЛС
// @version 0.8.4
// @updateURL https://raw.githubusercontent.com/SonOfStep/expiringDrugs/master/index.js
// @author Omar "SonOfStep" Nurmakhanov
// @match *://172.30.149.11:8282/OE/appointment/remsandapps*
// @grant none
// ==/UserScript==

$(window).on("load", function(){
  "use strict";

  $('head').append(`<style>

.wrapper-text{
margin: 5px 0;
}
.wrapper-list{
margin: 5px 0;
padding: 0;
}

.drugs-expired-soon{
display: flex;
flex-direction: column;
position: fixed;
bottom: 5px;
left: 10px;
width: calc( 100vw - 40px );
background-color:#fff;
color: #000;
padding: 5px 10px 50px 10px;
max-width: calc(100vw);
width: auto;
min-width: 155px;
box-shadow: 0px 0px 10px 1px rgba(0,0,0,0.5);
}
.drugs-expired-soon__period{}
.drugs-expired-soon__head{}
.drugs-expired-soon__btn{
outline: none;
width: 135px;
text-shadow: none;
border-radius: 0;
position: absolute;
bottom: 10px;
border: 2px solid #105dae;
background: #105dae;
color: #fff;
}
.drugs-expired-soon__list{
opacity: 1;
max-height: 25vh;
min-height: 65px;
overflow-x: auto;
overflow-y: none;
list-style: decimal inside none;
}


</style>`);

  // Последнее число месяца
  function getLastDayOfMonth( year, month ){
    let date = new Date(year, month + 1, 0);
    return date.getDate();
  }

  function setFilter( start, end ){

    return new Promise( (resolve, reject) => {

      let dateNow =  ( new Date );
      let dateEndNextMonth = new Date( dateNow.getFullYear(), dateNow.getMonth() + 2, dateNow.getDate() );

      if ( start == undefined ){
        start = "" + dateNow.getDate() + " " + getCustomMonth( dateNow.getMonth() ) + " " + dateNow.getFullYear();
      };

      if ( end == undefined ){
        end = "" + dateEndNextMonth.getDate() + " " + getCustomMonth( dateEndNextMonth.getMonth() ) + " " + dateEndNextMonth.getFullYear();
      };

      console.log(end);

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
      'Окт',
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
<small class="drugs-expired-soon__period wrapper-text">С 02 02 по 02 03</small>
<h4 class="drugs-expired-soon__head wrapper-text">Список ЛС, у которых в скоро закончится срок годности</h4>
<ol class="drugs-expired-soon__list wrapper-list">
</ol>
<button class="drugs-expired-soon__btn">Свернуть</button>
</div>
`);



  setFilter().then(
    result => {

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
            $('#reset_filter_rems').trigger("click");
          },
          error => {console.log(error)}
        )

      });
    },
    error => console.log(error)
  );
  if (localStorage.getItem("rollExpiredDrugs") == "true"){
    $(".drugs-expired-soon__head").hide();
    $(".drugs-expired-soon__list").hide();
    $(".drugs-expired-soon__period").hide();
  }

  $(".drugs-expired-soon__btn").on("click", () => {
    $(".drugs-expired-soon__head").toggle();
    $(".drugs-expired-soon__list").toggle();
    $(".drugs-expired-soon__period").toggle();
    if ( $(".drugs-expired-soon__period").css("display") === "none" ) {
      localStorage.setItem("rollExpiredDrugs", "true");      
    } else {
      localStorage.setItem("rollExpiredDrugs", "false");
    };
    
  })
});
