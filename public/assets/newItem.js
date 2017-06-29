var username;
var userid;
var useremail;
var user = {username, userid, useremail}

$(function () {

	//dropdown ui
	 $('.dropdown-menu a').click(function(){
    $('#category').text($(this).text());
    });
    


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
        	alert("You are not logged in. You need to log in to access this page");
            window.location = '/';
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

      $('#mainForm').on('submit', function(){
	      
	      	//post req to submit form data
	        $.ajax({
                  type: 'POST',
                  url: "http://data.vcap.me/v1/query",
                  data: JSON.stringify({
                    "type": "insert",
                    "args": {
                    	"table": "items",
                    	"objects":[{
                    		"name":$('#name').val(),
                    		"brand":$('#brand').val(),
                    		"Description":$('#Description').val(),
                    		"Material":$('#Material').val()
                    	}],
                    "returning":["id"]  
                    }
                  }),
                  error: function(e) {  
                    console.log(e);
                  },
                  success:function(data){
                  	var itemId = data.returning[0].id;
        			$.ajax({
		                  type: 'POST',
		                  url: "http://data.vcap.me/v1/query",
		                  data: JSON.stringify({
		                    "type": "insert",
		                    "args": {
		                    	"table": "sellingItems",
		                    	"objects":[{
		                    		"item_id":itemId,
		                    		"retailer_id":user.userid,
		                    		"price":$('#price').val(),
		                    		"quantity":$('#quantity').val(),
		                    		"category":$('#category').val().toLowerCase()
		                    	}]  
		                    }
		                  }),
		                  error: function(e) {  
		                    console.log(e);
		                  },
		                  success:function(data){
		                  	var form = $('#mainForm')[0]; // You need to use standard javascript object here
							var formData = new FormData(form);
						    $.ajax({
							    url: '/uploadImg',
							    data: formData,
							    type: 'POST',
							    contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
							    processData: false, // NEEDED, DON'T OMIT THIS
							    success: function (returndata){
							    	//returndata is the location of the image

							    		if (returndata.location === 'none'){
							    			//if no img was uploaded
							    			alert("success! Add another?");
										  	window.location = '/newItem';

							    		}else{

								    	//update the new location
								    	  $.ajax({
											  type: 'POST',
											  url: "http://data.vcap.me/v1/query",
											  data: JSON.stringify({
											    "type": "update",
											    "args": {
											      "table": "items",
											       "$set" : { "img" : returndata.location},
												  "where" :{"id" :itemId}
											    }
											  }),
											  error: function(e) {  
											    console.log(e);
											  },
											  success:function(data){
											  	alert("success! Add another?");
											  	window.location = '/newItem';
											  },
											  dataType: "json",
											  contentType: "application/json"
											});
							    		}
							    }
							});
		                  },
		                  dataType: "json",
		                  contentType: "application/json"
		                });      	
                  },
                  dataType: "json",
                  contentType: "application/json"
                });
      	return false;//cancel the default form submit event
	  });



});