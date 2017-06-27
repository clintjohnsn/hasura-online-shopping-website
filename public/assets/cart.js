var username;
var userid;
var useremail;
var user = {username, userid, useremail}

//function to extract query string data
function getParameterByName(name, url) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


$(function () {
	
	//setup ajax
	$.ajaxSetup({
	  xhrFields: {
	    withCredentials: true
	  },
	  crossDomain: true
	});	

	//implement logout 
    $("#loginbtn").on("click",function(){
      $.ajax({
        type: 'POST',
        url: "http://auth.vcap.me/user/logout",
        error: function(e) {  
          console.log(e);
          window.location = '/';
        },
        success:function(data){
          window.location = '/';
        },
        dataType: "json",
        contentType: "application/json"
      });
    });

    //get user data into var user
    //sync because other req need the user id
    $.ajax({
        type: 'POST',
        url: "http://auth.vcap.me/user/account/info",
        async: false,
        error: function(e) {  
        	//tell user they aren't logged in
        	alert("You are not logged in. You need to log in to access your cart");
            window.location = '/';

          //if not signed in, add link to /accountCreation
          // $("#signedInUser").on("click",function(){
          //   window.location = '/accountCreation';
          // });
        },
        success:function(data){
          user.userid = data.hasura_id;
          user.username = data.username;
          user.useremail = data.email;

          if (user.userid > 0){
            console.log("You are logged in as "+ user.userid + ": " + user.useremail);
            //change login to logout, change signin to user name
            $("#changeToLogout").html("Logout");
            $("#signedInUser").html(user.username);
          }
        },
        dataType: "json",
        contentType: "application/json"
      });

    //an item looks like this
    // <a href="#" class="list-group-item">First item<span class="badge">Rs 200</span></a>

    var totalPrice = 0;
    //post req to get all items in cart
    $.ajax({
	  type: 'POST',
	  url: "http://data.vcap.me/v1/query",
	  data: JSON.stringify({
	    "type": "select",
	    "args": {
	      "table": "carts",
	      "columns" :["item_id","retailer_id",{
	      	"name":"item_details",
	      	"columns":["name"]
	      }],
	    "where" :{
	        "user_id" :user.userid  
	      }
	    }
	  }),
	  error: function(e) {  
	    console.log(e);
	  },
	  success:function(data){
	  	for (var i = data.length - 1; i >= 0; i--) {
	  		var itemname = data[i].item_details.name;
	  		var itemId = data[i].item_id;
	  		var retailerId = data[i].retailer_id;
	  		//post req for the price of each item
	  		//req is sync becus itemname of each item needs to be rendered after each request in the loop
	  		    $.ajax({
				  type: 'POST',
				  url: "http://data.vcap.me/v1/query",
				  async: false,
				  data: JSON.stringify({
				    "type": "select",
				    "args": {
				      "table": "sellingItems",
				      "columns" :["price"],
					  	"where" :{
				       		"item_id" :itemId,
					       	"retailer_id": retailerId
				      }
				    }
				  }),
				  error: function(e) {  
				    console.log(e);
				  },
				  success:function(data){
			  		//insert values into the item format
			  		var linkToItem = `/viewItem?item=${itemId}&ret=${retailerId}`;
				  	var listItem = `<li class="list-group-item"><a href = ${linkToItem} >${itemname}</a> <span class = "remove label label-warning">remove</span><span class="badge">Rs ${data[0].price}</span></li>`
				  	//append to the list
				  	$('.list-group').append(listItem);

				  	//totalling the amt
				  	totalPrice += data[0].price;
				  },
				  dataType: "json",
				  contentType: "application/json"
				});
	  		}


	  	//add remove option on li
	  	 $('.remove').on('click',function () {
	    	//get item_id
	    	var itemUrl = $(this).parent().find('a').attr('href');
	    	var itemId = getParameterByName('item',itemUrl);
	    	var retailerId = getParameterByName('ret', itemUrl);

	    	//post req to delete item
	    	$.ajax({
				  type: 'POST',
				  url: "http://data.vcap.me/v1/query",
				  data: JSON.stringify({
				    "type": "delete",
				    "args": {
				      "table": "carts",
					  	"where" :{
					  		"item_id" :itemId,
					  		"retailer_id" : retailerId,
					  		"user_id" :user.userid
					  	}
				    }
				  }),
				  error: function(e) {  
				    console.log(e);
				  },
				  success:function(data){
				  	window.location = '/cart';
				  },
				  dataType: "json",
				  contentType: "application/json"
				});



	    });

	  	//totalPrice to be inserted
	  	$('#totalPrice').html(totalPrice);	

	  },
	  dataType: "json",
	  contentType: "application/json"
	});

    //proceed to checkout
    $("#proceedToCheckout").on('click',function(){
	    //make sure shipping address and pincode are there
    	if ($('#shipaddr').val().length > 0 && $('#pincode').val().length > 0 ){
    		//proceed
    	}
    	else{
    		if ($('#shipaddr').val().length == 0){
    			alert("Please fill in a shipping address first.");
    		}
    		else{
    			alert("Please fill in a pincode first.");
    		}
    	}
    });

   
});