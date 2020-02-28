# Weather Plugin v1.0
Weather plugin
1. In index.html file create such structure:
<div class="card">
       <div class="input">
           <h3>Enter your city</h3>
           <input type="text" autofocus required placeholder="Your city..." name="city">
           <a class="search">Search</a>
           <p>If there are several cities in the world, then add the <a href="https://countrycode.org/">country code</a><br>Example: Odessa, US</p>
       </div>
       <div class="result"></div>
   </div>
1.1. Add CSS, JS and fonts (CDN):
CSS/fonts (head):
<link rel="stylesheet" href="https://github.com/4bselyam/weather-plugin/blob/master/css/reset.css">
<link rel="stylesheet" href="https://github.com/4bselyam/weather-plugin/blob/master/css/style.css">
<link href="https://fonts.googleapis.com/css?family=Sintony:400,700&display=swap" rel="stylesheet">
JS (body): 
<script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
<script src="https://github.com/4bselyam/weather-plugin/blob/master/js/weather.js"></script>
<script src="js/main.js"></script>

2. In main.js write this: 
$('body').weather({
   key: '',
 slideSpeed: 
});

2.1. In field “key” write your own API key. You can get it from here: your API key.
2.2. It must be like this: 
$('body').weather({
   key: 'b6907d289e10d714a6e88b30761fae22',
 slideSpeed: 800 //ms
});




3. Variable types:
Variable
Type
key
String
slideSpeed
Int

