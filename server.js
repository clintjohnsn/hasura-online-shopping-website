var express = require('express');
var app = express();
var ejs = require('ejs');
app.set('view engine','ejs');
app.use('/',express.static('./public'));

app.get('/',function(req, res){
   res.sendFile(__dirname+"/public/index.html"); 
});

app.get('/accountCreation',function(req, res){
   res.sendFile(__dirname+ "/public/accountCreation.html"); 
});

app.get('/shop',function(req,res){
   res.render('shop'); 
});

app.listen(8080);
console.log("listening on port 8080");