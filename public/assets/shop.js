var username;
var userid;
var useremail;
var user = {username, userid, useremail}

function renderPage(data) {
	//clear the list
	$('#itemContainer').html('');
	//if no data obtained, tell user
	if(data[0] == null){
		$('#itemContainer').html('nothing found :(');
	}
	// for all the items in the array data
	for (var i = 0; i < data.length; i++) {
		//prepare the link to the item in /viewItem
		var linkToItem = `/viewItem?item=${data[i].item_id}&ret=${data[i].retailer_id}`;
		//put default img for item if it doesnt exist
		if(data[i].item_details.img == null){
			data[i].item_details.img = {"location":"/images/default.png"};
		}
		//prepare the item model
		var itemModel = `<div class="col-xs-12 col-sm-3 item">
							<a href=${linkToItem}>
								<figure class="figure">
									<h3>${data[i].item_details.name}</h3>
	                            	<img class="img-thumbnail img-responsive mx-auto" src=${data[i].item_details.img.location}>
	                            	<figcaption class="figure-caption">
	                            	 ${data[i].retailer_details.name} - Rs ${data[i].price}</figcaption>
	                        	</figure>
	                        </a>
	                    </div> `;	
		//append the item models
		$('#itemContainer').append(itemModel);
	}
}


$(function(){
    //some js for the ui
	    //make categories togglable
    $(".nav-stacked li").on("click",function(){
      $(".nav-stacked li").removeClass("active");
      $(this).addClass("active");
    });
    
    if( $("#toggle-menu").is(":visible") )
    $("#categories").removeClass("in");
    
    	//dropdown menu changes title on select
    $('.dropdown-menu a').click(function(){
    $('#selectedItemDropdown').text($(this).text());
    });
    
    //set up ajax to use the cookie
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

    //get user data into var user and 
    //change login to logout, change signin to user name
    $.ajax({
			  type: 'POST',
			  url: "http://auth.vcap.me/user/account/info",
			  error: function(e) {	
			    console.log(e);

			    //hide cart
			    $('#cart').hide();

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
				  	$("#changeToLogout").html("Logout");
				  	$("#signedInUser").html(user.username);
			  	}
			  },
			  dataType: "json",
			  contentType: "application/json"
			});

    //get items list using a post req
    //initial req, get "all" items in desc time of adding
    $.ajax({
		  type: 'POST',
		  url: "http://data.vcap.me/v1/query",
		  data: JSON.stringify({
		    "type": "select",
		    "args": {
		      "table": "sellingItems",
		      "columns": ["item_id","retailer_id","price","added",{
			      	"name":"item_details",
			      	"columns":["name","img"]
			      },{
			      	"name":"retailer_details",
			      	columns:["name"]
			      }],
			"order_by":["-added"]
		    }
		  }),
		  error: function(e) {  
		    console.log(e);
		  },
		  success:function(data){
	  	    //render the items
		    renderPage(data);
		  },
		  dataType: "json",
		  contentType: "application/json"
		});


    //on click handlers for categories
    $(".nav-stacked li").on("click",function(){
    	//get name of category clicked
    	var categoryName = $(this).children('a').html().toLowerCase();
    	//post req to get the list of items

		//check what the "sort by" dropdown menu says and set the "order_by" property of the data api
		var sortby = $("#selectedItemDropdown").html();
		if (sortby == 'New'){
			var orderby = "-added";
		}
		else if (sortby == 'Price-Low to High'){
			var orderby = "price"; 			
		}
		else if (sortby == 'Price-High to Low'){
			var orderby = "-price";
		}

		//if categoryName selected is "ALL"
    	if (categoryName === "all"){

		//post req for all list items
		   $.ajax({
				  type: 'POST',
				  url: "http://data.vcap.me/v1/query",
				  data: JSON.stringify({
				    "type": "select",
				    "args": {
				      "table": "sellingItems",
				      "columns": ["item_id","retailer_id","price","added",{
					      	"name":"item_details",
					      	"columns":["name","img"]
					      },{
					      	"name":"retailer_details",
					      	columns:["name"]
					      }],
					  "order_by":[orderby]
				    }
				  }),
				  error: function(e) {  
				    console.log(e);
				  },
				  success:function(data){
			  	    //render the items
				    renderPage(data);
				  },
				  dataType: "json",
				  contentType: "application/json"
				});
    	}
    		//if category name is "EVENTS"
    	else if (categoryName === "events"){

    		console.log(categoryName);

    	}
    		//for all other category names
    	else{
    		//post req with the "where" = categoryName
		   $.ajax({
				  type: 'POST',
				  url: "http://data.vcap.me/v1/query",
				  data: JSON.stringify({
				    "type": "select",
				    "args": {
				      "table": "sellingItems",
				      "columns": ["item_id","retailer_id","price","added",{
					      	"name":"item_details",
					      	"columns":["name","img"]
					      },{
					      	"name":"retailer_details",
					      	columns:["name"]
					      }],
					"where":{"category":categoryName},
					"order_by":[orderby]
				    }
				  }),
				  error: function(e) {  
				    console.log(e);
				  },
				  success:function(data){
			  	    //render the items
				    renderPage(data);
				  },
				  dataType: "json",
				  contentType: "application/json"
				});
    	}
    });

    //on-click handlers for the sortBy menu
    $('.dropdown-menu a').click(function(){
		//trigger a click event on the category nav
		$(".nav-stacked").find(".active").trigger("click");

    });


});

