$.fn.weather = function (options) {

    // ---------Vars---------
    var params = $.extend({
        key: '',
        slideSpeed: 400
    }, options);

    if (!params.key)
        $('.input').find('h3')
            .html("You've forgotten to write your <a href='https://home.openweathermap.org/api_keys'>API key</a>")
            .css('color', '#e74c3c');

    var $card = $('.card'),
        $result = $card.find('.result'),
        city = 0;

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
                } else if (error.responseJSON['cod'] == 401)
                    $('.input').find('h3').html("Your API key is wrong!");
            });
    }

    // Вставка контента
    function updateData(data) {
        $card.addClass('active');

        // Информация про город, чистоту неба и температура
        city = data['city']['name'];
        $result.html('<h3></h3>');

        if (city.length >= 10) {
            for (i = 0; i < 8; i++) {
                $result.find('h3').append(city[i]);
            }
            $result.find('h3').append('..,' + data['city']['country']);
        } else {
            $result.html('<h3>' + data['city']['name'] + ', ' + data['city']['country'] + '</h3>');
        }

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
        var temp = [],
            img = [],
            min_temp = [],
            max_temp = [],
            wind = [],
            hourTemp = [],
            hourIcon = [],

            // Дата для прогноза по часам
            dateTxt = [],
            dayTxt = [],
            hourTxt = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
            hourForecast = [{
                day: 1
            }];

        var nowMonth = (new Date().getMonth() + 1).toString(),
            nowYear = new Date().getFullYear();

        nowMonth.length == 1 ? nowMonth = (0).toString() + nowMonth.toString() : nowMonth = nowMonth;

        // Дата для прогноза на 5 вперед 
        var nowDay = new Date().getDate().toString();
        nowDay.length == 1 ? nowDay = (0).toString() + nowDay.toString() : nowDay = nowDay;


        $result.append('<ul></ul>');

        // Получаю дату, часы и данные о погоде
        for (i = 0; i < data['cnt']; i++) {
            var date = data['list'][i]['dt_txt'],
                currDate = nowYear + '-' + nowMonth + '-' + nowDay;
            dateTxt.push(date.split(' ', 2));
            dateTxt[i].splice(1);
            dateTxt[i] = dateTxt[i][0];

            // Убираю всё, что связано с сегодняшним днём
            // if (dateTxt[i].includes(currDate)) {
            // dateTxt.splice(dateTxt.indexOf(currDate))
            // }

            // Убираем "пустые" элементы

            // dayTxt.push(dateTxtSplit[i][0]);
            // dayTxt = dayTxt.filter(function (x) {
            //     return x !== undefined && x !== null;
            // });

            // Получаю данные о погоде
            if (date.includes('12:00:00')) {
                temp.push(Math.round(data['list'][i]['main']['temp']) + '&deg;');
                min_temp.push(Math.round(data['list'][i]['main']['temp_min']) + '&deg;');
                max_temp.push(Math.round(data['list'][i]['main']['temp_max']) + '&deg;');
                wind.push(Math.round(data['list'][i]['wind']['speed']) + ' m/s');
                img.push(data['list'][i]['weather'][0]['icon']);
            }

            if ((data['list'][i]['dt_txt']).includes(dateTxt[i])) {
                hourTemp.push(data['list'][i]['main']['temp'])
            }
        }

        console.log(hourTemp);


        // Генерирую данные на странице
        for (i = 0; i < temp.length; i++) {
            var nowDay = new Date().getDate() + 1 + i,
                nowStringDate = new Date(nowYear, nowMonth, nowDay).toDateString().split(' ', 2);

            $result.find('ul').append('<li>' + nowStringDate[0] + '<p class="feature"><img src="https://openweathermap.org/img/wn/' + img[i] + '@2x.png" width="25" alt="weather icon">'
                + temp[i] + '</p><p class="other">Min: ' + min_temp[i]
                + ' Max: ' + max_temp[i]
                + '<span>Wind speed: ' + wind[i] + '</span></p></li><div class="temp-hourly"></div>');
        }

        // Вставляю часы в список
        for (i = 0; i < hourTxt.length; i++) {
            $result.find('ul .temp-hourly').append('<p>' + hourTxt[i] + '</p>');
        }

        // Клик для открытия блока "по часам"
        $result.find('ul .temp-hourly').hide();
        $result.find('ul li').click(function () {
            var findDiv = $(this).next('.temp-hourly'),
                findWrapper = $(this).closest('ul');

            if (findDiv.is(':visible')) {
                findDiv.slideUp(parseInt(params.slideSpeed));
            } else {
                findWrapper.find('.temp-hourly').slideUp(parseInt(params.slideSpeed));
                findDiv.slideDown(parseInt(params.slideSpeed));
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