$(function () {

	$('#signinbtn').on("click",function () {
		
		if($("#inputEmail").val().length!=0 && $("#inputPassword").val().length !=0 ){

			$.ajax({
			  type: 'POST',
			  url: "http://auth.vcap.me/login",
			  data: JSON.stringify({
			    "password":$('#inputPassword').val(),
			    "email":$('#inputEmail').val()
			  }),
			  error: function(e) {	
			    console.log(e);
			    alert("FAILED: " + JSON.parse(e.responseText).message);
			    location.reload();
			  },
			  success:function(data){
			  	
			  	// window.location = '/shop';

			  },
			  dataType: "json",
			  contentType: "application/json"
			});


		}
		else{
			if($("#inputEmail").val().length == 0)
				alert("Email is required");
			else if ($("#inputPassword").val().length ==0 )
				alert("Password is required");
			else
				alert("something went wrong");
		}



	});


});