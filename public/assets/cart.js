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
    //async because other req need the user id
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






});