var mongoose = require('mongoose');
var URLSlugs = require('mongoose-url-slugs');
var bcrypt   = require('bcrypt-nodejs');

var WishList = mongoose.Schema({
    name:{type: String, required:true},
    checked: Boolean
});

var Food = mongoose.Schema({
    name: {type: String, required:true},
    comment:{type: String, required:true},
    checked: Boolean,
    imagebase64: String,
    imagetype: String
});



var Place = mongoose.Schema({
    title: {type: String, required:true},
    uploaded:{type:Date, default: Date.now},
    items: {type: [Food], unique: false, sparse: true}
});

var User = mongoose.Schema({
    first_name: String,
    middle_name: String,
    last_name: String,
    email: String,
    password: String,
    lists: {type: [Place], unique: false, sparse: true},
    wish:[WishList]
});

// Generate a hash for the password.
User.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Compares Hashed password with passed in password.
User.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};




module.exports = mongoose.model('WishList', WishList);
module.exports = mongoose.model('Food', Food);
module.exports = mongoose.model('Place', Place);
module.exports = mongoose.model('User', User);

