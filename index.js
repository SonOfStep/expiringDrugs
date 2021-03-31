// ==UserScript==
// @name Expired Drugs
// @name:ru Истекающие ЛС
// @version 0.9.1
// @updateURL https://raw.githubusercontent.com/SonOfStep/expiringDrugs/master/index.js
// @author Omar "SonOfStep" Nurmakhanov
// @match *://172.30.149.11:8282/OE/appointment/remsandapps*
// @grant none
// ==/UserScript==

(function () {
    "use strict";

    $(window).on("load", function () {
        /**
     * Функция устанавливает начальную и конечную дату для фильтра поиска лекарственных средств
     * @param {string} start - начальная дата в формате d mmm yyyy
     * @param {string} end - конечная дата в формате d mmm yyyy
     */
        const setDateOfSearchFilter = async (start, end, callback = () => {}) => {
            const request = await $.ajax({
                type: "POST",
                url: "/OE/appointment/getremainsbynursefilter",
                data: {
                    lsname: $("#lsname_rems").val(),
                    series: $("#series_rems").val(),
                    party: $("#party_rems").val(),
                    budget: $("#budget_rems").val(),
                    dateb: start,
                    datee: end,
                    YII_CSRF_TOKEN: YII_CSRF_TOKEN
                },
                success: () => {
                    callback();
                }
            })

            return request
        }

        /**
     * Функция возвращает данные в виде HTML c информацией о лекарствах
     * @param {string} storageLocation - место хранения лекарственных средств
     */
        const loadDrugs = async (storageLocation) => {
            let fetchedData = ""
            let request = await $.ajax({
                type: "POST",
                url: baseUrl + "/appointment/getremainsbynurse",
                data: {
                    userstorid: storageLocation,
                    num: 1,
                    flag: flag_rems,
                    asc: 1,
                    count: 100,
                    YII_CSRF_TOKEN: YII_CSRF_TOKEN
                },
                success: (data) => {
                    fetchedData = data.replace(/tr/gi, "li").replace(/td/gi, "span")
                }
            });

            return fetchedData;
        }

        /**
    * Функция возвращает строку с первой заглавной буквой
    * @param {string} string - строка
    */
        const capitalizeFirstLetter = string => string.charAt(0).toUpperCase() + string.slice(1)

        const formatForFilter = date => "" + date.getDate() + " " + capitalizeFirstLetter(date.toLocaleDateString('ru-RU', {month: 'short'}).slice(0,3)) + " " + date.getFullYear()

        const NOW_DATE = new Date()
        const CURRENT_DATE = formatForFilter(NOW_DATE)
        const DATE_IN_MONTH = NOW_DATE.setDate( NOW_DATE.getDate() + 30 )
        const CURRENT_DATE_IN_MONTH = formatForFilter(NOW_DATE)

        $("head").append(
            `<style>.wrapper-text{margin:5px 0}.wrapper-list{margin:5px 0;padding:0}.wrapper-block{padding:5px 10px 50px 10px}.duration{display:flex;flex-direction:row;position:fixed;bottom:5px;left:10px;overflow:hidden;width:calc(100vw - 40px);background-color:#fff;color:#000;max-width:calc(100vw);min-width:155px;box-shadow:0 0 10px 1px rgba(0,0,0,.5)}.duration__expired,.duration__expires{flex:1 1 100%;padding:0 10px}.duration__list li:nth-child(2n){background-color:#2196f3;color:#fff}.duration__list li span:nth-child(n+4){display:none}.duration__list li span:nth-child(3){color:#d41d1a}.duration__btns{position:absolute;bottom:10px;left:10px}.duration__btn{text-shadow:none;border-radius:0;outline:0;width:135px;border:2px solid #105dae;background:#105dae;color:#fff}.duration__btn:hover{background:#105dae}.duration__list{opacity:1;max-height:25vh;min-height:65px;overflow-x:auto;overflow-y:none;list-style:decimal inside none}</style>`
        );

        $("body").append(
            `<div class='duration wrapper-block hide'><div class="duration__expires"><small class="duration__period wrapper-text">С ${ CURRENT_DATE } по ${ CURRENT_DATE_IN_MONTH }</small><h4 class="duration__head wrapper-text">Список ЛС, у которых скоро закончится срок годности</h4><ol class="duration__list wrapper-list"></ol></div><div class="duration__expired"><small class="duration__period wrapper-text">По сегоднешний день</small><h4 class="duration__head wrapper-text">Список ЛС, у которых закончился срок действия</h4><ol class="duration__list wrapper-list"></ol></div><div class="duration__btns"><button id="collapse" class="duration__btn">Свернуть</button></div></div>`
        );
        let promise = setDateOfSearchFilter( CURRENT_DATE, CURRENT_DATE_IN_MONTH, async () => {
            $("#subdrugst option").each(async ( index ) => {
                let storage = $("#subdrugst option:nth-child(" + ( index + 1 ) + ")").attr(
                    "value"
                );

                $(".duration__expires .duration__list").append(
                    await loadDrugs(storage)
                );

                if ( $("#subdrugst option").length === index + 1 ){
                    setDateOfSearchFilter("1 Янв 2020", CURRENT_DATE, async () => {
                        $("#subdrugst option").each(async ( index ) => {
                            let storage = $("#subdrugst option:nth-child(" + ( index + 1 ) + ")").attr(
                                "value"
                            );
                            $(".duration__expired .duration__list").append(
                                await loadDrugs(storage)
                            );

                            if ( $("#subdrugst option").length === index + 1 ){
                                $('#reset_filter_rems').trigger("click"); // Обнуление фильтров
                            }

                        })
                    })
                }
            })

        })

        if (localStorage.getItem("rollExpiredDrugs") == "true"){
            $(".duration__period").hide();
            $(".duration__head").hide();
            $(".duration__list").hide();
            $('.duration').css({'width': '155px'})
            $(".duration__btn#collapse").text("Развернуть");
        }

        $(".duration__btn#collapse").on("click", () => {
            $(".duration__period").toggle();
            $(".duration__head").toggle();
            $(".duration__list").toggle();
            if ( $(".duration__list").css("display") === "none" ) {
                $(".duration__btn#collapse").text("Развернуть");
                $('.duration').css({'width': '155px'})
                localStorage.setItem("rollExpiredDrugs", "true");
            } else {
                $(".duration__btn#collapse").text("Свернуть");
                $('.duration').css({'width': 'calc( 100vw - 40px )'})
                localStorage.setItem("rollExpiredDrugs", "false");
            };

        })
    })
})()
