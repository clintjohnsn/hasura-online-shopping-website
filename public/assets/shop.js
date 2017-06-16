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
    
    
});

