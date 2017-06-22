var username;
var userid;
var useremail;
var user = {username, userid, useremail}

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
          //if not signed in, add link to /accountCreation
          $("#signedInUser").on("click",function(){
            window.location = '/accountCreation';
          });
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
				       		"item_id" :data[i].item_id,
					       	"retailer_id": data[i].retailer_id 
				      }
				    }
				  }),
				  error: function(e) {  
				    console.log(e);
				  },
				  success:function(data){
			  		//insert values into the item format
				  	var listItem = `<a href="#" class="list-group-item">${itemname}<span class="badge">Rs ${data[0].price}</span></a>`
				  	//append to the list
				  	$('.list-group').append(listItem);
				  	//total
				  	totalPrice += data[0].price;
				  },
				  dataType: "json",
				  contentType: "application/json"
				});
	  		}

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