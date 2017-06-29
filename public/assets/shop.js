var username;
var userid;
var useremail;
var user = {username, userid, useremail}

var renderPage = function renderPage(data) {
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
			data[i].item_details.img = "/images/default.png";
		}
		//prepare the item model
		var itemModel = `<div class="col-xs-12 col-sm-3 item">
							<a href=${linkToItem}>
								<figure class="figure">
									<h3>${data[i].item_details.name}</h3>
	                            	<img class="img-thumbnail img-responsive mx-auto" src=${data[i].item_details.img}>
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

			  	//check if retailer logged in
			  	   $.ajax({
					  type: 'POST',
					  url: "http://data.vcap.me/v1/query",
					  data: JSON.stringify({
					    "type": "select",
					    "args": {
					      "table": "retailers",
					      "columns": ["id"],
					      "where":{"id":user.userid}
					    }
					  }),
					  error: function(e) {  
					  },
					  success:function(data){
					  	if (!$.isEmptyObject(data)){
						  	//user is retailer
						  	var addItemBtn = '<a href="/newItem"><button class = "btn btn-success">Add an Item</button></a>';
						  	$('.navbar-right').prepend(addItemBtn);
					  	}
					  },
					  dataType: "json",
					  contentType: "application/json"
					});


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

    //search
    $("#srchbtn").on("click",function () {
		var searchTerm = $("#searchTerm").val();
	   
	    //make post req to get itemIds from item table matching the req
        $.ajax({
		  type: 'POST',
		  url: "http://data.vcap.me/v1/query",
		  data: JSON.stringify({
				"type": "select",
				"args": {
					"table": "items",
					"columns":["id"],
					"where": {
						"$or":[
						{"name": {"$ilike":"%"+searchTerm+"%"}},
						{"brand":{"$ilike":"%"+searchTerm+"%"}},
						{"Material":{"$ilike":"%"+searchTerm+"%"}}
						]
					}
				}
			}),
		  error: function(e) {  
		    console.log(e);
		  },
		  success:function(data){
		  	var itemIds = [];
		  	for (var i = data.length - 1; i >= 0; i--) {
		  		itemIds.push(data[i].id);
		  	}
		  	//post req to get item details of the item_id from sellingItems table
		  	 $.ajax({
				  type: 'POST',
				  url: "http://data.vcap.me/v1/query",
				  data: JSON.stringify({
						"type": "select",
						"args": {
							"table": "sellingItems",
							"columns":["item_id","retailer_id","price","added",{
								
								"name" :"item_details",
								"columns":["name","img"]
								
							},{
								
								"name" :"retailer_details",
								"columns":["name"]
							}],
							"where": {"item_id":{"$in": itemIds }},
							
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
		  },
		  dataType: "json",
		  contentType: "application/json"
		});
	});

	//make search work with enter key press
	$("#searchTerm").keyup(function (e) { //keypress triggers it twice
		if(e.which === 13){//enter key pressed
			$("#srchbtn").click();	//trigger search button click event
		}
	});
	//search based on the url
	//get url
	 var urlParams;
      (window.onpopstate = function () {
          var match,
              pl     = /\+/g,  // Regex for replacing addition symbol with a space
              search = /([^&=]+)=?([^&]*)/g,
              decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
              query  = window.location.search.substring(1);

          urlParams = {};
          while (match = search.exec(query))
             urlParams[decode(match[1])] = decode(match[2]);
      })();

      // if url like /shop?searchTerm=item, urlParams.searchTerm = "item" 
     if (urlParams.searchTerm){
     	//search for searchTerm
     	$('#searchTerm').val(urlParams.searchTerm);
     	$('#srchbtn').click();//trigger search btn click
     }

});

