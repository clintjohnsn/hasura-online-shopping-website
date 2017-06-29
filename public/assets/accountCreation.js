$(function(){
	
	//set up ajax
	 $.ajaxSetup({
    	xhrFields: {
       	withCredentials: true
	    },
	    crossDomain: true
    });
	 
	 //sign up button implementation
	$("#signupbtn").on("click",function () {




		if ($("#inputPassword")[0].value === $("#ReInputPassword")[0].value && $("#inputPassword")[0].value.length >= 8 &&
				$('#inputEmail').val().length != 0 && $('#inputUsername').val().length != 0 
			){
		
			$.ajax({
			  type: 'POST',
			  url: "http://auth.vcap.me/signup",
			  data: JSON.stringify({
			    "username":$('#inputUsername').val(),
			    "password":$('#inputPassword').val(),
			    "email":$('#inputEmail').val()
			  }),
			  error: function(e) {	
			    console.log(e);
			    alert("FAILED: " + JSON.parse(e.responseText).code+ "\n username and email must be unique");
			    // location.reload();
			  },
			  success:function(data){

			  	if($('input[type="checkbox"]').prop("checked") == true){
			  		//add hasura_id to retailers table

			  		$.ajax({
						  type: 'POST',
						  url: "http://data.vcap.me/v1/query",
						  headers: { 'Authorization' : `Bearer ${data.auth_token}` },
						  data: JSON.stringify({
								"type": "insert",
								"args": {
									"table": "retailers",
									"objects" :[{
											"id": data.hasura_id,
											"name":$("#inputFullname").val(),
											"location":$('#address').val()
										}]
								}
							}),
						  error: function(e) {	
						    console.log(e);
						    alert("FAILED: " + JSON.parse(e.responseText).message);
						  },
						  success:function(data){
						  	window.location = '/shop';	
						  },
						  dataType: "json",
						  contentType: "application/json"
						});	

	            }
	            else{
			  	//add the hasura_id to customUsers table 
	            	
			  		$.ajax({
					  type: 'POST',
					  url: "http://data.vcap.me/v1/query",
					  headers: { 'Authorization' : `Bearer ${data.auth_token}` },
					  data: JSON.stringify({
							"type": "insert",
							"args": {
								"table": "usersCustom",
								"objects" :[{
										"id": data.hasura_id,
										"name":$("#inputFullname").val(),
										"address":$('#address').val()
									}]
							}
						}),
					  error: function(e) {	
					    console.log(e);
					    alert("FAILED: " + JSON.parse(e.responseText).message);
					  },
					  success:function(data){
					  	window.location = '/shop';	
					  },
					  dataType: "json",
					  contentType: "application/json"
					});	
			  	
	            }
			  },
			  dataType: "json",
			  contentType: "application/json"
			});
		}
		else{
			if($("#inputPassword")[0].value.length < 8){
				alert("password should be a minimum of 8 characters");
			}
			else if ($("#inputPassword")[0].value !== $("#ReInputPassword")[0].value){
			alert("Passwords don't match; Please Re-Enter Passwords");
			}
			else if ($('#inputEmail').val().length == 0){
				alert("Email is required");
			}
			else if($('#inputUsername').val().length == 0 ){
				alert("A man needs a name");
			}
			else{
				alert("Something went wrong.");
			}
		}
	});


});



