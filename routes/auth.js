/**
 * Created by rs on 04/07/16.
 */
var express = require('express');
var app = express();

var passport = require('passport'),
	FacebookStrategy = require('passport-facebook').Strategy,
	GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const facebookOptions = {
	clientID: process.env.FACEBOOK_CLIENT_ID,
	clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
	callbackURL: 'http://localhost:3000/api/auth/facebook/callback',
	profileFields: ['id', 'displayName', 'photos', 'emails', 'gender']
};

const googleOptions = {
	clientID: process.env.GOOGLE_CLIENT_ID,
	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	callbackURL: 'http://localhost:' + app.get('port') + '/auth/google/callback',
	scope: "openid profile email"
};

passport.use(new FacebookStrategy(facebookOptions, function(accessToken, refreshToken, profile, done) {
	console.log("Profile is printed from here: " + profile);
	console.log("Access token: " + accessToken);

	console.log(profile._json);
	if (!profile._json.name) return done(new Error('Can\'t find name in facebook'));
	var firstName = profile._json.name,
		lastName = '';
	var spaceIndex = profile._json.name.indexOf(' ');

	if (spaceIndex > -1) {
		firstName = profile._json.name.substr(0, spaceIndex);
		lastName = profile._json.name.substr(spaceIndex);
	} else {
		return done(new Error('Can\'t find names to fill the facebook'))
	}
	return done(null, {firstName: firstName, lastName: lastName});
	//connection
	//	.model('User', models.User, 'users')
	//	.findOrCreate({
	//			email: profile._json.email
	//		}, {
	//			profileId: profile.id,
	//			displayName: profile.displayName,
	//			email: profile._json.email,
	//			lastName: lastName,
	//			firstName: firstName,
	//			photoUrl: profile._json.avatar_url,
	//			userAuthType: 'facebook',
	//			gender: profile._json.gender
	//		}, function(err, user, created) {
	//			return done(err, user);
	//		}
	//	);
}));

//Google
passport.use(new GoogleStrategy(googleOptions, function(accessToken, refreshToken, profile, done) {
	console.log("Profile is printed from here: " + profile);
	console.log("Access token: " + accessToken);

	console.log(profile._json);
	var firstName = profile._json.name.givenName,
		lastName = profile._json.name.familyName;
	var userAuthType = 'google';
	connection
		.model('User', models.User, 'users')
		.findOrCreate({
				email: profile._json.emails[0].value
			}, {
				displayName: profile.displayName,
				email: profile._json.emails[0].value,
				lastName: lastName,
				firstName: firstName,
				profileId: profile._json.id,
				accessToken: accessToken,
				googleUrls: profile._json.urls,
				photoUrl: profile._json.image.url,
				googlePlusUrl: profile._json.url,
				occupation: profile._json.occupation,
				gender: profile._json.gender,
				userAuthType: userAuthType
			}, function(err, user, created) {
				console.log("Created: " + created);
				console.log("USer : " + user);
				return done(err, user);
			}
		);
}));

const authenticateCB = (req, res, next) => {
	//FIXME Check how user gets populated here -
	console.log('Inside authenticate CB!');
	if (req.isAuthenticated()) {
		req.session.auth = true;
		req.session.userId = req.user._id;
		req.session.user = req.user;
		req.session.admin = req.user.admin;
	}
	if (req.user.approved) {
		res.json(req.user);
	} else {
		res.json({'message': 'not approved'});
	}
};
app.get('/auth/google', passport.authenticate('google'));

app.get('/auth/google/callback',
	passport.authenticate('google', {failureRedirect: '/#login'}), authenticateCB);

app.get('/auth/facebook',
	passport.authenticate('facebook', {scope: ['email']}),//gender not a valid scope
	function(req, res) {
		// The request will be redirected to facebook for authentication, so this
		// function will not be called.
		console.log("Facebook callback");
	});

app.get('/auth/facebook/callback',
	passport.authenticate('facebook', {failureRedirect: '/#login'}), authenticateCB);

module.exports = app;