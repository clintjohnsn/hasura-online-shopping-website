$(function(){
    
    $(".nav-stacked li").on("click",function(){
      $(".nav-stacked li").removeClass("active");
      $(this).addClass("active");
    });
    
    if( $("#toggle-menu").is(":visible") )
    $("#categories").removeClass("in");
    
    $('.dropdown-menu a').click(function(){
    $('#selectedItemDropdown').text($(this).text());
    });
    
    $("#loginbtn").on("click",function(){
    	$.ajax({
			  type: 'POST',
			  url: "http://auth.vcap.me/user/logout",
			  error: function(e) {	
			    console.log(e);
			    alert("FAILED");
			  },
			  success:function(data){
			  	window.location = '/';
			  },
			  dataType: "json",
			  contentType: "application/json"
			});
    });

    
});

