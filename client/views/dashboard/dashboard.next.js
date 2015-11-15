Template['dashboard'].helpers({
	listState: function () {
		return Session.get("viewState") === "list";
	},
	builderState: function () {
		return Session.get("viewState") === "builder";
	},

	detailsState: function () {
		return Session.get("viewState") === "details";
	}
});

Template['dashboard'].events({
	'click [data-action="add-report"]': function (event) {
		Session.set('viewState', "builder");
	},

	'click [data-action="reports-list"]': function (event) {
		Session.set('viewState', "list");
	},
});

Template.dashboard.onCreated(function () {
	Session.set('viewState', "list");
});