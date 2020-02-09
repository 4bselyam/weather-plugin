$.fn.weather = function (options) {

    // Vars
    var params = $.extend({
        key: ''
    }, options);

    if (params.key.length == 0) $('.input').find('h3').html("You've forgotten to write your <a href='https://home.openweathermap.org/api_keys'>API key</a>").css('color', 'red');

    var $card = $('.card');
    var $result = $card.find('.result');
    var city;

    // Events

    // Обработчик enter
    $('body').keypress(function (event) {
        city = $card.find('input[name=city]').val();
        if (event.which == 13) {
            if (city.length == 0) $('.input').find('h3').html('The input is empty!');
            json(city);
        };
    });

    //  Обработчик клика по кнопке
    $('.search').click(function () {
        city = $card.find('input[name=city]').val();
        if (city.length == 0) $('.input').find('h3').html('The input is empty!');
        json(city);
    });

    // Functions

    //JSON-запрос
    function json(city) {
        $.getJSON('https://api.openweathermap.org/data/2.5/forecast?q=' + city + '&appid=' + params.key + 'c&units=metric')
            .done(function (result) {
                updateData(result);
            })
            .fail(function (error) {
                console.error(error.responseJSON['cod'] + ' ' + error.responseJSON['message']);
                if (error.responseJSON['cod'] == 404) $('.input').find('h3').html("There isn't such city!");
            });
    }

    // Вставка контента
    function updateData(data) {
        $card.addClass('active');
        $result.html('<h3>' + data['city']['name'] + '</h3>');
        $result.append('<h1>' + Math.round(data['list'][0]['main']['temp']) + '°<span></span></h1>');
        $result.append('<p class="desc">' + data['list'][0]['weather'][0]['main'] + '</p>');


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

    // Прогноз на 5 дней вперёд
    function day(data) {
        var temp = [];
        var img = [];
        var min_temp = [];
        var max_temp = [];
        var wind = []
        var nowDay = new Date().getDate();
        var nowMonth = new Date().getMonth();
        var nowYear = new Date().getFullYear();

        $result.append('<ul></ul>')

        for (i = 0; i < data['cnt']; i++) {
            var date = data['list'][i]['dt_txt'];

            if (date.includes('12:00:00')) {
                temp.push(Math.round(data['list'][i]['main']['temp']) + '&deg;');
                min_temp.push(Math.round(data['list'][i]['main']['temp_min']) + '&deg;');
                max_temp.push(Math.round(data['list'][i]['main']['temp_max']) + '&deg;');
                wind.push(Math.round(data['list'][i]['wind']['speed']) + ' m/s');
                img.push(data['list'][i]['weather'][0]['icon']);
            }
        }


        for (i = 0; i < temp.length; i++) {
            var nowDay = new Date().getDate() + 1 + i;
            var nowStringDate = new Date(nowYear, nowMonth, nowDay).toDateString().split(' ', 2);
            $result.find('ul').append('<li>' + nowStringDate[0] + '<p class="feature"><img src="https://openweathermap.org/img/wn/' + img[i] + '@2x.png" width="25">' + temp[i] + '</p><p class="other">Min: ' + min_temp[i] + ' Max: ' + max_temp[i] + '<span>Wind speed: ' + wind[i] + '</span></p></li>')
        }
    }
};