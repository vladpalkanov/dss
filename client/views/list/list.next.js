Template['list'].helpers({
	reports: function () {
		return Reports.find({});
	}
});

Template['list'].events({
	'click [data-action="open-report"]': function (event, template) {
		event.preventDefault();
		var	reportId = event.currentTarget.getAttribute('data-reportId');

		Session.set('reportId', reportId);
		Session.set('viewState', "details");
	}
});
