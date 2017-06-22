var express = require('express');
var app = express();

var ejs = require('ejs');
app.set('view engine','ejs');

var request = require ('request');


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

app.get('/viewItem',function(req,res){
	/*
		req query looks like this
		'/viewItem?item=3&ret=4'
	*/
	
	var itemId = req.query.item;
	var retailerId = req.query.ret;
	//make a request for itemId
		//set options for request
	var options = {
		uri: 'http://data.vcap.me/v1/query',
		method: 'POST',
		json : true,
		body:{
			"type": "select",
			"args": {
				"table": "sellingItems",
				"columns":["price","quantity","added",{
					
					"name" :"item_details",
					"columns":["name","img","brand","Description","Material"]
					
				},{
					
					"name" :"retailer_details",
					"columns":["location","name"]
				}],
				"where": {"item_id": itemId,"retailer_id":retailerId}
			}
		}
	}
		//the callback function after the request
	function callback(error, response, body){
		// console.log(response);

		if(!error && response.statusCode == 200){

		   	res.render('viewItem',{data:body[0]}); 

		}else{
			console.log(error);
			res.send("Oops! That's an error");
		}
	}

		//make the actual request
	request(options, callback);
});

app.get('/cart',function(req,res){
   res.render('cart'); 
});


//local
app.listen(8080);
console.log("listening on port 8080");
