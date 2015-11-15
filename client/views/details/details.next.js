Template['details'].helpers({
	report: function() {
		return Session.get('report');
	},

	positiveCriteria: function() {
		var
			criteria = Session.get('report').criteria;

		return _.where(criteria, {
			positive: true
		}) || [];
	},

	negativeCriteria: function() {
		var
			criteria = Session.get('report').criteria;

		return _.where(criteria, {
			positive: false
		}) || [];
	},

	estimations: function() {
		return Session.get('report').estimations;
	},

	stepOneReport: function() {
		return Session.get('stepOneReport');
	},

	stepTwoReport: function() {
		return Session.get('stepTwoReport');
	},

	stepThreeReport: function() {
		return Session.get('stepThreeReport');
	},

	leaderboard: function() {
		return Session.get('leaderboard');
	},

});

Template['details'].events({

});

Template['details'].onCreated(function() {
	var reportId = Session.get('reportId'),
		report = Reports.findOne(reportId);

	Session.set('report', report);
	stepOneReport();
	stepTwoReport();
	stepThreeReport();
	getLeaderboard();
});

function stepOneReport() {
	var
		report = Session.get('report'),
		stepReport = [];

	_.each(report.estimations, function(task) {
		var
			stepTask = {};

		stepTask.name = task.name;
		stepTask.posCriteria = [];
		stepTask.negCriteria = [];

		_.each(task.posCriteria, function(cr) {
			stepTask.posCriteria.push({
				name: cr.name,
				value: +(cr.value * cr.estimation).toFixed(2)
			});
		});

		_.each(task.negCriteria, function(cr) {
			stepTask.negCriteria.push({
				name: cr.name,
				value: +(cr.value * cr.estimation).toFixed(2)
			});
		});

		stepReport.push(stepTask);
	});

	Session.set('stepOneReport', stepReport);
}

function stepTwoReport() {
	var
		stepOneReport = Session.get('stepOneReport'),
		stepReport = [];

	_.each(stepOneReport, function(task) {
		var
			row = {};

		row.name = task.name;
		row.posSumm = 0;
		row.negSumm = 0;

		_.each(task.posCriteria, function(cr) {
			row.posSumm += cr.value;
		});

		_.each(task.negCriteria, function(cr) {
			row.negSumm += cr.value;
		});

		row.posSumm = +row.posSumm.toFixed(2);
		row.negSumm = +row.negSumm.toFixed(2);

		stepReport.push(row);
	});

	Session.set('stepTwoReport', stepReport);
}

function stepThreeReport() {
	var
		stepTwoReport = Session.get('stepTwoReport'),
		stepReport = [],
		sortedNeg,
		sortedPos;

	sortedPos = _.sortBy(stepTwoReport, function(task) {
		return -task.posSumm;
	});

	sortedNeg = _.sortBy(stepTwoReport, function(task) {
		return task.negSumm;
	});

	_.each(stepTwoReport, function(task) {
		var
			row = {};

		row.name = task.name;

		row.posPlace = findIndex(sortedPos, task, 'posSumm') + 1;
		row.negPlace = findIndex(sortedNeg, task, 'negSumm') + 1;

		stepReport.push(row);
	});

	Session.set('stepThreeReport', stepReport);
}

function getLeaderboard() {
	var
		stepThreeReport = Session.get('stepThreeReport'),
		leaderboard = [];

	_.each(stepThreeReport, function(task) {
		var
			row = {};

		row.name = task.name;
		row.summ = task.posPlace + task.negPlace;

		leaderboard.push(row);
	});

	leaderboard = _.sortBy(leaderboard, function(elem) {
		return -elem.summ;
	});

	_.each(leaderboard, function (elem, idx) {
		elem.place = idx + 1;
	});

	Session.set('leaderboard', leaderboard);
}

// UTILZ

function findIndex(list, obj, field) {
	for (var i = 0; i < list.length; i++) {
		if (+obj[field] === +list[i][field]) {
			return i;
		}
	};
	return -1;
}