var username;
var userid;
var useremail;
var user = {username, userid, useremail}

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








});

