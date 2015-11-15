Router.route('/', function () {
	this.render('dashboard');
});

Router.route('/logout', function () {
	Meteor.logout();
	this.redirect('/');
});

Router.onBeforeAction(function () {
	if(!Meteor.userId()) {
		this.render('home');
	} else {
		this.next();
	}
});