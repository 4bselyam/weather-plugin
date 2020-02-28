$.fn.weather = function (options) {

    // ---------Vars---------
    var params = $.extend({
        key: ''
    }, options);

    if (params.key.length == 0) $('.input').find('h3').html("You've forgotten to write your <a href='https://home.openweathermap.org/api_keys'>API key</a>").css('color', 'red');

    var $card = $('.card');
    var $result = $card.find('.result');
    var city;

    // ---------Events---------

    // Обработчик enter
    $('body').keypress(function (event) {
        city = $card.find('input[name=city]').val();
        city = $.trim(city);
        if (event.which == 13) {
            if (city.length == 0) $('.input').find('h3').html('The input is empty!');
            json(city);
        };
    });

    // Закрытие по esc
    $('body').keydown(function (e) {
        if (e.which == 27) $card.removeClass('active');
    });

    //  Обработчик клика по кнопке
    $('.search').click(function () {
        city = $card.find('input[name=city]').val();
        if (city.length == 0) $('.input').find('h3').html('The input is empty!');
        json(city);
    });

    // ---------Functions---------

    //JSON-запрос
    function json(city) {
        $.getJSON('https://api.openweathermap.org/data/2.5/forecast?q=' + city + '&appid=' + params.key + 'c&units=metric')
            .done(function (result) {
                updateData(result);
            })
            .fail(function (error) {
                console.error(error.responseJSON['cod'] + ' ' + error.responseJSON['message']);
                if (error.responseJSON['cod'] == 404) {
                    $('.input').find('h3').html("There isn't such city!");
                }
            });
    }

    // Вставка контента
    function updateData(data) {
        $card.addClass('active');

        // Информация про город, чистоту неба и температура
        $result.html('<h3>' + data['city']['name'] + ', ' + data['city']['country'] + '</h3>');
        $result.append('<h1>' + Math.round(data['list'][0]['main']['temp']) + '°<span></span></h1>');
        $result.append('<p class="desc">' + data['list'][0]['weather'][0]['main'] + '</p>');

        // Подробная информация при наведении
        $result.find('h1').hover(
            function () {
                $result.find('h1').html('Humidity: ' + data['list'][0]['main']['humidity'] + '%<br>' +
                    'Pressure: ' + data['list'][0]['main']['pressure'] + '<br>' +
                    'Wind speed: ' + Math.round(data['list'][0]['wind']['speed']) + ' m/s<span></span>').css('font-size', '12px');
            },
            function () {
                $result.find('h1').html(Math.round(data['list'][0]['main']['temp']) + '°<span></span>').css('font-size', '36px');
            });
        day(data);
    }

    // Прогноз на перёд (по часам тоже)
    function day(data) {
        var temp = [];
        var img = [];
        var min_temp = [];
        var max_temp = [];
        var wind = []

        var hourTemp = [];
        var hourIcon = [];

        // Дата для прогноза на 5 вперед 
        var nowDay = new Date().getDate();
        var nowMonth = new Date().getMonth();
        var nowYear = new Date().getFullYear();

        // Дата для прогноза по часам
        var dateSplit = [];
        var dateTxtSplit = [];
        var dayTxt = [];
        var hourTxt = [];
        var hourForecast = [];

        $result.append('<ul></ul>');

        // Получаю дату, часы и данные о погоде
        for (i = 0; i < data['cnt']; i++) {
            var date = data['list'][i]['dt_txt'];
            dateSplit.push(date.split('-', 3));
            dateTxtSplit.push(dateSplit[i][2].split(' ', 2));

            // Убираю всё, что связано с сегодняшним днём
            if (dateTxtSplit[i][0] == nowDay) {
                dateTxtSplit[i].splice(dateTxtSplit[i][0].indexOf(nowDay));
            }

            // Убираем "пустые" элементы
            dayTxt.push(dateTxtSplit[i][0]);
            dayTxt = dayTxt.filter(function (x) {
                return x !== undefined && x !== null;
            });

            hourTxt.push(dateTxtSplit[i][1]);
            hourTxt = hourTxt.filter(function (x) {
                return x !== undefined && x !== null;
            });
            hourTxt.splice(8);

            // Получаю данные о погоде
            if (date.includes('12:00:00')) {
                temp.push(Math.round(data['list'][i]['main']['temp']) + '&deg;');
                min_temp.push(Math.round(data['list'][i]['main']['temp_min']) + '&deg;');
                max_temp.push(Math.round(data['list'][i]['main']['temp_max']) + '&deg;');
                wind.push(Math.round(data['list'][i]['wind']['speed']) + ' m/s');
                img.push(data['list'][i]['weather'][0]['icon']);
            }

            for (q = 0; q < hourTxt.length; q++) {
                if (date.includes(hourTxt[q]) && date.includes(dayTxt[q])) {
                    hourTemp.push(Math.round(data['list'][i]['main']['temp']) + '&deg;C');
                    hourIcon.push(data['list'][i]['weather'][0]['icon']);
                }
            }
        }

        console.log(hourIcon, hourTemp)
        noCopy(dayTxt);

        // Генерирую данные на странице
        for (i = 0; i < temp.length; i++) {
            var dataAttr = [1, 2, 3, 4, 5];
            var nowDay = new Date().getDate() + 1 + i;
            var nowStringDate = new Date(nowYear, nowMonth, nowDay).toDateString().split(' ', 2);

            hourForecast.push({ day: dayTxt[i], hour: [hourTxt] })

            $result.find('ul').append('<li>' + nowStringDate[0] + '<p class="feature"><img src="https://openweathermap.org/img/wn/' + img[i] + '@2x.png" width="25" alt="weather icon">' + temp[i] + '</p><p class="other">Min: ' + min_temp[i] + ' Max: ' + max_temp[i] + '<span>Wind speed: ' + wind[i] + '</span></p></li>');
            $result.find('ul').append('<div class="temp-hourly"></div>');
        }

        // Вставляю часы в список
        for (k = 0; k < hourTxt.length; k++) {
            $result.find('ul .temp-hourly').append('<p>' + hourTxt[k].substring(0, hourTxt[k].length - 3) + ':<img src="https://openweathermap.org/img/wn/' + hourIcon[k] + '@2x.png" width="45" alt="weather icon"><span>' + hourTemp[k] + '</span></p>');
        }

        // Клик для открытия блока "по часам"
        $result.find('ul .temp-hourly').hide();
        $result.find('ul li').click(function () {
            var findDiv = $(this).next('.temp-hourly');
            var findWrapper = $(this).closest('ul');

            if (findDiv.is(':visible')) {
                findDiv.slideUp();
            } else {
                findWrapper.find('.temp-hourly').slideUp();
                findDiv.slideDown();
            }
        });
    }

    // Удаляю повторяющююся дату
    function noCopy(a) {
        for (var q = 1, i = 1; q < a.length; ++q) {
            if (a[q] !== a[q - 1]) {
                a[i++] = a[q];
            }
        }

        a.length = i;
        return a;
    }
}