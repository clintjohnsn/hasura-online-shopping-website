//rating star js
// Starrr plugin (https://github.com/dobtco/starrr)
var __slice = [].slice;

(function($, window) {
  var Starrr;

  Starrr = (function() {
    Starrr.prototype.defaults = {
      rating: void 0,
      numStars: 5,
      change: function(e, value) {}
    };

    function Starrr($el, options) {
      var i, _, _ref,
        _this = this;

      this.options = $.extend({}, this.defaults, options);
      this.$el = $el;
      _ref = this.defaults;
      for (i in _ref) {
        _ = _ref[i];
        if (this.$el.data(i) != null) {
          this.options[i] = this.$el.data(i);
        }
      }
      this.createStars();
      this.syncRating();
      this.$el.on('mouseover.starrr', 'span', function(e) {
        return _this.syncRating(_this.$el.find('span').index(e.currentTarget) + 1);
      });
      this.$el.on('mouseout.starrr', function() {
        return _this.syncRating();
      });
      this.$el.on('click.starrr', 'span', function(e) {
        return _this.setRating(_this.$el.find('span').index(e.currentTarget) + 1);
      });
      this.$el.on('starrr:change', this.options.change);
    }

    Starrr.prototype.createStars = function() {
      var _i, _ref, _results;

      _results = [];
      for (_i = 1, _ref = this.options.numStars; 1 <= _ref ? _i <= _ref : _i >= _ref; 1 <= _ref ? _i++ : _i--) {
        _results.push(this.$el.append("<span class='glyphicon .glyphicon-heart-empty'></span>"));
      }
      return _results;
    };

    Starrr.prototype.setRating = function(rating) {
      if (this.options.rating === rating) {
        rating = void 0;
      }
      this.options.rating = rating;
      this.syncRating();
      return this.$el.trigger('starrr:change', rating);
    };

    Starrr.prototype.syncRating = function(rating) {
      var i, _i, _j, _ref;

      rating || (rating = this.options.rating);
      if (rating) {
        for (i = _i = 0, _ref = rating - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          this.$el.find('span').eq(i).removeClass('glyphicon-heart-empty').addClass('glyphicon-heart');
        }
      }
      if (rating && rating < 5) {
        for (i = _j = rating; rating <= 4 ? _j <= 4 : _j >= 4; i = rating <= 4 ? ++_j : --_j) {
          this.$el.find('span').eq(i).removeClass('glyphicon-heart').addClass('glyphicon-heart-empty');
        }
      }
      if (!rating) {
        return this.$el.find('span').removeClass('glyphicon-heart').addClass('glyphicon-heart-empty');
      }
    };

    return Starrr;

  })();
  return $.fn.extend({
    starrr: function() {
      var args, option;

      option = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return this.each(function() {
        var data;

        data = $(this).data('star-rating');
        if (!data) {
          $(this).data('star-rating', (data = new Starrr($(this), option)));
        }
        if (typeof option === 'string') {
          return data[option].apply(data, args);
        }
      });
    }
  });
})(window.jQuery, window);

$(function() {
  return $(".starrr").starrr();
});

$( document ).ready(function() {
      
  $('#hearts').on('starrr:change', function(e, value){
    $('#count').html(value);
  });
  
  $('#hearts-existing').on('starrr:change', function(e, value){
    $('#rated').html("You rated: ");
    $('#count-existing').html(value);
    $('#countRatings').hide();  
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var username;
var userid;
var useremail;
var user = {username, userid, useremail}

function editOptionFunction () {
      //make new comment form visible
      $('#newComment').slideDown();
      //get content of your comment
      var comment = $('#yourComment p').html();
      //fill text area with existing comment
      $('#newComment textarea').val(comment);
      // hide the existing comment
      $('#yourComment').hide();
      //change submit comment button to update comment
      $("#submitComment").html("Update"); 
   }

$(function(){
    
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
        url: "http://auth.clint.hasura.me/user/logout",
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
        url: "http://auth.clint.hasura.me/user/account/info",
        async: false,
        error: function(e) {  

          //hide cart if user is not logged in
          $('#cart').hide();

          //hide addtocart button if user is not logged in
          $('#addToCart').hide();

          //hide new comment if user is not logged in
           $('#newComment').hide();

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
            url: "http://data.clint.hasura.me/v1/query",
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

    //get url parameters

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
    /*
      '/viewItem?item=3&ret=4' becomes
      urlParams={
        "item": 3,
        "ret" :4
      }
    */

    //review

    //show/hide the comment section
    $(".glyphicon-link").on('click',function () {
        $("#commentSection").slideToggle();
        
    });

    //fetch all reviews on the item id=urlParams.item
    $.ajax({
        type: 'POST',
        url: "http://data.clint.hasura.me/v1/query",
        data: JSON.stringify({
          "type": "select",
          "args": {
            "table": "reviews",
            "columns":["user_id","rating","review",{
              "name": "user_details",
              "columns":["name"]
            }],
            "where": {"item_id": urlParams.item }
          }
        }),
        error: function(e) {  
          console.log(e);
        },
        success:function(data){
          //add the data as comments
          for (var i = data.length - 1; i >= 0; i--) {
            if (data[i].review == null){
              data[i].review = "";
            }
            //your comment needs to be highlighted cus your'e a special snowflake
            if (data[i].user_id === user.userid ){
              //if you have rated
              if (data[i].rating){
                 var commentFormat=`<div id ="yourComment" class='commented'>
                   <h6><span class='glyphicon glyphicon-user'></span> ${data[i].user_details.name}
                   <span id = "userRating">${data[i].rating}</span><span class="glyphicon glyphicon-star"></span>
                   <span id ="editOption">  Edit</span></h6> 
                   <p>${data[i].review}</p></div>`;
              }
              //if you have not rated
              else{
                 var commentFormat=`<div id ="yourComment" class='commented'>
                   <h6><span class='glyphicon glyphicon-user'></span> ${data[i].user_details.name}
                    <span id ="editOption">  Edit</span></h6>
                   <p>${data[i].review}</p></div>`;
              }
               //keep your comment on top
              $('#submittedComments').prepend(commentFormat);
              //hide the new comment box, now only edit option exists
              $('#newComment').hide();
              //edit option onclick function
             $("#editOption").on('click',editOptionFunction);
            
            }
            else{
                //if user has rated
                if (data[i].rating){
                  var comment = `<div class="commented"><h6><span class="glyphicon glyphicon-user"></span>${data[i].user_details.name} 
                  <span id = "userRating">${data[i].rating}</span><span class="glyphicon glyphicon-star"></span></h6><p>${data[i].review}</p></div>`;
                }
                else{ //no rating available
                  var comment = `<div class="commented"><h6><span class="glyphicon glyphicon-user"></span> 
                    ${data[i].user_details.name}</h6><p>${data[i].review}</p></div>`;
                }
              $("#submittedComments").append(comment);
            }
          }  

        },
        dataType: "json",
        contentType: "application/json"
      });

    //new comment 

    //when a new comment is submitted   
   $("#submitComment").on("click",function(){
      //get comment
      var comment=document.getElementById('comment').value;
      //get user name
       $.ajax({
      type: 'POST',
      url: "http://data.clint.hasura.me/v1/query",
      data: JSON.stringify({
        "type": "select",
        "args": {
          "table": "usersCustom",
          "columns":["name"],
          "where": {"id": user.userid}
        }
      }),
      error: function(e) {  
        console.log(e);
      },
      success:function(data){
        //prepare comment
        var commentFormat=`<div id ="yourComment" class='commented'><h6><span class='glyphicon glyphicon-user'></span> ${data[0].name} <span id ="editOption">  Edit</span></h6><p>${comment}</p></div>`;

        //post req to insert the comment
         $.ajax({
            type: 'POST',
            url: "http://data.clint.hasura.me/v1/query",
            data: JSON.stringify({
              "type": "insert",
              "args": {
                "table": "reviews",
                "objects":[{
                  "user_id":user.userid,
                  "item_id":urlParams.item,
                  "review":comment
                }]
              }
            }),
            error: function(e) {
            if (JSON.parse(e.responseText).error == 'Uniqueness violation. duplicate key value violates unique constraint "reviews_pkey"'){
              //insert failed,try updating the new comment
              console.log("There is already a review/ rating, trying to update..")              
              $.ajax({
                  type: 'POST',
                  url: "http://data.clint.hasura.me/v1/query",
                  data: JSON.stringify({
                    "type": "update",
                    "args": {
                      "table": "reviews",
                      "$set" : {
                        "review" : comment,
                      },
                      
                    "where" :{"item_id":urlParams.item,
                        "user_id" :user.userid  
                      }
                    }
                  }),
                  error: function(e) {  
                    console.log(e);
                  },
                  success:function(data){
                    console.log("update successful");
                    //keep your comment on top
                    $('#submittedComments').prepend(commentFormat);
                    //hide the new comment box, now only edit option exists
                    $('#newComment').hide();
                    //edit option onclick function
                   $("#editOption").on('click',editOptionFunction);
                  },
                  dataType: "json",
                  contentType: "application/json"
                });
              }else{
                console.log(e);
              }
            },
            success:function(data){
              //keep your comment on top
              $('#submittedComments').prepend(commentFormat);
              //hide the new comment box, now only edit option exists
              $('#newComment').hide();
              //edit option onclick function
             $("#editOption").on('click',editOptionFunction);
            },
            dataType: "json",
            contentType: "application/json"
          });
      },
      dataType: "json",
      contentType: "application/json"
    });
   });

   
    //ratings- get the avg rating and no of ratings data for the item
    //a post req to get aggregate data from the view
    $.ajax({
        type: 'POST',
        url: "http://data.clint.hasura.me/v1/query",
        data: JSON.stringify({
          "type": "select",
          "args": {
            "table": "ratingsView",
            "columns":["*"],
            "where" :{"item_id":urlParams.item }
          }
        }),
        error: function(e) {  
          console.log(e);
        },
        success:function(data){

          var rating;
          var no_rating;
          if($.isEmptyObject(data[0])){
            // console.log(data);
            rating = 0;
            no_rating = 0; 
          }
          else if (data[0].avg_rating == null){
            rating = 0;
            no_rating = 0; 
          }else{
            rating = data[0].avg_rating;
            no_rating = data[0].no_of_ratings;
          }
          // display the avg rating
          // round to a single decimal
          var avgRating = rating.toPrecision(2) 
          $("#count-existing").html(avgRating);
          // display the no of ratings
          $("#noOfRatings").html(no_rating);

        },
        dataType: "json",
        contentType: "application/json"
      });
    //insert/update user ratings
    $('#hearts-existing').on('starrr:change', function(e, value){
      //value is the rating the user gave
      //post req to insert
      $.ajax({
        type: 'POST',
        url: "http://data.clint.hasura.me/v1/query",
        data: JSON.stringify({
          "type": "insert",
          "args": {
            "table": "reviews",
            "objects":[{
              "item_id":urlParams.item,
              "user_id":user.userid,
               "rating":value 
            }]
          }
        }),
        error: function(e) {  
          if (JSON.parse(e.responseText).error == 'Uniqueness violation. duplicate key value violates unique constraint "reviews_pkey"'){
            console.log("There is already a review/ rating, trying to update..")
            //another rating/review exists ,gotta update
            //post req to update reviews table 
              $.ajax({
                  type: 'POST',
                  url: "http://data.clint.hasura.me/v1/query",
                  data: JSON.stringify({
                    "type": "update",
                    "args": {
                      "table": "reviews",
                      "$set" : {
                        "rating" : value,
                      },
                      
                    "where" :{"item_id":urlParams.item,
                        "user_id" :user.userid  
                      }
                    }
                  }),
                  error: function(e) {  
                    console.log(e);
                  },
                  success:function(data){
                    console.log("review/rating updated");
                  },
                  dataType: "json",
                  contentType: "application/json"
                });

          }else{
            console.log(e);
          }
        },
        success:function(data){},
        dataType: "json",
        contentType: "application/json"
      });


    });

    //addToCart
    $('#addToCart').on('click',function () {
       //post req to add to table carts
        $.ajax({
            type: 'POST',
            url: "http://data.clint.hasura.me/v1/query",
            data: JSON.stringify({
              "type": "insert",
              "args": {
                "table":"carts",
                "objects":[{
                  "user_id": user.userid,
                  "item_id": urlParams.item,
                  "retailer_id": urlParams.ret
                }]
              }
            }),
            error: function(e) {  
              //already in cart?
              if (JSON.parse(e.responseText).error == 'Uniqueness violation. duplicate key value violates unique constraint "carts_pkey"'){
                alert("Already in cart");
                $('#addToCart').prop("disabled",true);
                var added = "<span class='glyphicon glyphicon-ok'></span> In Cart"
                $('#addToCart').html(added);
              }
              else{
                console.log(e);
              }
            },
            success:function(data){
              var added = "<span class='glyphicon glyphicon-ok'></span> In Cart"
              $('#addToCart').html(added);
             $('#addToCart').prop("disabled",true);

            },
            dataType: "json",
            contentType: "application/json"
          });
    });

    // search
    $("#srchbtn").on('click',function(){
      var searchTerm = $("#searchTerm").val();
      window.location = `/shop?searchTerm=${searchTerm}`;

    });

      //make search work with enter key press
  $("#searchTerm").keyup(function (e) { //keypress triggers it twice
    if(e.which === 13){//enter key pressed
      $("#srchbtn").click();  //trigger search button click event
    }
  });
    
});
