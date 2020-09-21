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
.wrapper-block{
padding: 5px 10px 50px 10px;  
}

.duration{
display: flex;
flex-direction: row;
position: fixed;
bottom: 5px;
left: 10px;
overflow: hidden;
width: calc( 100vw - 40px );
background-color:#fff;
color: #000;
max-width: calc(100vw);
min-width: 155px;
box-shadow: 0px 0px 10px 1px rgba(0,0,0,0.5);
}

.duration__expires,
.duration__expired{
flex: 1 1 100%;
padding: 0 10px;
}

.duration__list li:nth-child(2n){
 background-color: #2196f3;
 color: #fff;
}
.duration__list li span:nth-child(n+4){
 display: none;
}
.duration__list li span:nth-child(3){
 color: #d41d1a;
}

.duration__btns{
position: absolute;
bottom: 10px;
left: 10px;
}
.duration__btn{
text-shadow: none;
border-radius: 0;
outline: none;
width: 135px;
border: 2px solid #105dae;
background: #105dae;
color: #fff;
}
.duration__btn:hover{
background: #105dae;
}
.duration__list{
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
  
  const dateNow =  ( new Date );
  const dateEndNextMonth = new Date( dateNow.getFullYear(), dateNow.getMonth() + 2, dateNow.getDate() );

  function setFilter( start, end ){

    return new Promise( (resolve, reject) => {

      let dateNow =  ( new Date );
      let dateEndNextMonth = new Date( dateNow.getFullYear(), dateNow.getMonth() + 2, dateNow.getDate() );

      if ( ( start == undefined ) || ( start == "" ) ){
        start = "" + dateNow.getDate() + " " + getCustomMonth( dateNow.getMonth() ) + " " + dateNow.getFullYear();
      };

      if ( ( end == undefined ) || ( end == "" ) ){
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
<div class='duration wrapper-block hide'>
<div class="duration__expires">
<small class="duration__period wrapper-text">С ${ (new Date).getDate() } ${ getCustomMonth( (new Date).getMonth() ) } по ${ (new Date).getDate() } ${ getCustomMonth( ( new Date( (new Date).getFullYear(), (new Date).getMonth() + 2, (new Date).getDate() ) ).getMonth() ) }</small>
<h4 class="duration__head wrapper-text">Список ЛС, у которых скоро закончится срок годности</h4>
<ol class="duration__list wrapper-list">
</ol>
</div>
<div class="duration__expired">
<small class="duration__period wrapper-text">По ${ (new Date).getDate() } ${ getCustomMonth( (new Date).getMonth() ) }</small>
<h4 class="duration__head wrapper-text">Список ЛС, у которых закончился срок действия</h4>
<ol class="duration__list wrapper-list">
</ol>
</div>
<div class="duration__btns">
<button id="collapse" class="duration__btn">Свернуть</button>
<button id="toggle" class="duration__btn">Сменить</button>  
</div>  
</div>
`);

$(".duration__expired").toggle(); // Скрываю список ЛС с истекшей датой хранения

  setFilter().then(
    result => {

      $("#subdrugst option").each( (i) => {

        loadStorage($("#subdrugst option:nth-child(" + ( i + 1 ) +")").attr("value")).then(
          result => {
            $(".duration__expires .duration__list").append(result);
            $('.duration__expires .duration__list tr').replaceWith(function(){
              return $("<li />", {html: $(this).html()});
            });
            $('.duration__expires .duration__list li td').replaceWith(function(){
              return $("<span />", {html: $(this).html()});
            });
            $('#reset_filter_rems').trigger("click");

            setFilter("1 Фев 2020", "" + dateNow.getDate() + " " + getCustomMonth( dateNow.getMonth() ) + " " + dateNow.getFullYear()).then(
              result => {

                $("#subdrugst option").each( (i) => {

                  loadStorage($("#subdrugst option:nth-child(" + ( i + 1 ) +")").attr("value")).then(
                    result => {
                      $(".duration__expired .duration__list").append(result);
                      $('.duration__expired .duration__list tr').replaceWith(function(){
                        return $("<li />", {html: $(this).html()});
                      });
                      $('.duration__expired .duration__list li td').replaceWith(function(){
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
    $(".duration__btn#collapse").text("Развернуть");
  }

  $(".duration__btn#collapse").on("click", () => {
    $(".duration__head").toggle();
    $(".duration__list").toggle();
    if ( $(".duration__list").css("display") === "none" ) {
      $(".duration__btn#collapse").text("Развернуть");
      localStorage.setItem("rollExpiredDrugs", "true");      
    } else {
      $(".duration__btn#collapse").text("Свернуть");
      localStorage.setItem("rollExpiredDrugs", "false");
    };

  })
  
  $(".duration__btn#toggle").on('click', () => {
    $(".duration__expires").toggle();
    $(".duration__expired").toggle()
  })
});
