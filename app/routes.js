
var mongoose = require('mongoose');
var Food = mongoose.model('Food');
var User = mongoose.model('User');
var Place = mongoose.model('Place');
var WishList = mongoose.model('WishList');
var slug = require('slug');
var multer=require('multer');
var upload= multer({dest: './uploads'});
var fs=require('fs');


var id = 0;

module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		res.render('index');
	});


	app.get('/login', function(req, res) {
		res.render('login', { message: req.flash('login') });
	});

	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile',
		failureRedirect : '/login',
		failureFlash : true
	}));


	app.get('/signup', function(req, res) {
		res.render('signup', { message: req.flash('signup') });
	});

	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile',
		failureRedirect : '/signup',
		failureFlash : true
	}));

	
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile', {
			user : req.user
		});
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	app.get('/tables', isLoggedIn, function(req, res){
		User.findOne({email: req.user.email},
					 function(err,list,count){res.render('table',{main_title:'Food Journal',title:'Food Journal',list:req.user.lists});});
	});

	app.get('/write/table', isLoggedIn, function(req, res){
		res.render('write');
	});

	app.post('/write/table', isLoggedIn, function(req, res){
		var new_list = Place();
		new_list.title = req.body.title;
		console.log("Date input", req.body.date);
		new_list.items = [];
		

		
		User.findOneAndUpdate(
								{email: req.user.email},
								{$push:{lists: new_list}},
								{safe: true, upsert: true},
								function(err,list,count){res.redirect('/tables');});
		});
	
	app.get('/table/:slug', isLoggedIn, function(req, res){
		

		var req_list = [];
		req.user.lists.forEach(function (value){
			if(value.title===req.params.slug)
				req_list=value;

		});
		/*for(var i = 0; i < req.user.lists.length; i++){
			if(req.user.lists[i].title === req.params.slug){
				req_list = req.user.lists[i];
			}
		}
		*/
		User.findOne({email: req.user.email},
					 function(err,user,count){
					 	res.render('food',{title: req_list.title, list_items: req_list.items});
		});
	});
	
	app.post('/table/:slug', isLoggedIn, upload.single('image'),function(req, res){
		
		var req_list = [];
		var list_url = "/table/" + req.params.slug;
		for(var i = 0; i < req.user.lists.length; i++){
			if(req.user.lists[i].title === req.params.slug){
				req_list = req.user.lists[i];
				var food= new Food({
					name: req.body.name,
					 comment: req.body.comment,
					 checked: false, 
					});

				var data=fs.readFileSync(req.file.path);
				food.imagebase64= new Buffer(data).toString('base64');
				food.imagetype=req.file.mimetype;


				req_list.items.push(food);
				req.user.lists[i] = req_list;
			}
		}

		User.findOneAndUpdate(
								{email: req.user.email},
								{$set:{lists: req.user.lists}},
								{safe: true, upsert: true},
								function(err,list,count){res.redirect(list_url);
		});
	});

	app.post('/food/:slug', isLoggedIn, function(req, res){
		var slug=req.params.slug;

		var removed_items = [];

	
		if(typeof(req.body.itemCheckbox) == 'string'){
			removed_items.push(req.body.itemCheckbox);
		}
		
		else{
			req.body.itemCheckbox.forEach(function(value){
				removed_items.push(value);
			});
			/*for(var i = 0; i < req.body.itemCheckbox.length; i++){
				removed_items.push(req.body.itemCheckbox[i]);
			}*/
		}

		var req_list = [];
		var index = 0;


		

		for(var i = 0; i < req.user.lists.length; i++){
			if(req.user.lists[i].title == slug){
				req_list = req.user.lists[i];
				index = i;
			}
		}


		for(var i = 0; i < req_list.items.length; i++){
			for(var j = 0; j < removed_items.length; j++){
				if(req_list.items[i].name == removed_items[j]){
					req_list.items[i].checked = true;
				}
			}
		}

		req.user.lists[index] = req_list;
		User.findOneAndUpdate(
								{email: req.user.email},
								{$set:{lists: req.user.lists}},
								{safe: true, upsert: true},
								function(err,list,count){res.redirect('/table/'+slug);
		});
	});
	

	app.get('/wishlist', isLoggedIn, function(req, res) {

		var req_wishlist=req.user.wish;
		console.log("checkoff is on checkoff", req.query.checkoff);
		  if(req.query.checkoff){
			for(i=0; i<req.user.wish.length; i++){
				if(req.user.wish[i].name==req.query.checkoff)
					req_wishlist[i].checked=true;
			}
		}


	  	
		 User.findOneAndUpdate({email: req.user.email},
		 	{$set:{wish: req_wishlist}},
		 	{safe: true, upsert: true},
		 	function(err,list,count){
				res.render('wishlist', {wish:req_wishlist});
	 	 });
		
	  
	});

	
	app.get('/api/wishlist', isLoggedIn, function(req, res) {
		
		console.log("checkoff is", req.query.checkoff);
		var req_wishlist=req.user.wish;
		console.log("checkoff is on name", req.query.name);
		  if(req.query.name){
			for(i=0; i<req.user.wish.length; i++){
				if(req.user.wish[i].name==req.query.name)
					req_wishlist[i].checked=true;
			}
		}


	  	
		 User.findOneAndUpdate(
		 	{email: req.user.email},
		 	{$set:{wish: req_wishlist}},
		 	{safe: true, upsert: true},
		 	function(err,list,count){
				res.render('wishlist', {wish:req_wishlist});
	 	 });

		
	});




	app.post('/api/wishlist/create', isLoggedIn,function(req, res) {
	  var wishlist= new WishList({
	   	name: req.body.name,
	   	checked: false
	   });

	  req.user.wish.push(wishlist);

	 	User.findOneAndUpdate(
			{email: req.user.email},
			{$set:{wish: req.user.wish}},
		 	{safe: true, upsert: true},
		function(err,user,count){
			res.render('wishlist',{wish:user.wish});



		});

	 });


};


function isLoggedIn(req, res, next){
	if (req.isAuthenticated())
		return next();
	res.redirect('/login');
}