Template['builder'].helpers({
	createState: function() {
		return Session.get('builderStep') === 0;
	},

	addTasksState: function() {
		return Session.get('builderStep') === 1;
	},

	addCriteriaState: function() {
		return Session.get('builderStep') === 2;
	},

	setEstimationsState: function() {
		return Session.get('builderStep') === 3;
	},

	isUndoAvailable: function() {
		return Session.get('builderStep') > 0;
	},

	tasks: function() {
		return Session.get('tasks');
	},

	positiveCriteria: function() {
		var
			criteria = Session.get('criteria');
		return _.where(criteria, {
			positive: true
		}) || [];
	},

	negativeCriteria: function() {
		var
			criteria = Session.get('criteria');

		return _.where(criteria, {
			positive: false
		}) || [];
	},

	estimations: function() {
		return Session.get('estimations');
	}
});

/**
 * Create report
 */
Template['builder'].events({
	/**
	 * REPORT
	 */
	'submit [data-action="create-report"]': function(event) {
		event.preventDefault();

		var reportName = event.target['report-name'].value,
			reportId,
			newCriteria;

		if (reportName && reportName !== "") {
			reportId = Reports.insert({
				name: reportName,
				createdAt: new Date(),
				tasks: [],
				criteria: []
			});
		}

		Session.set('reportId', reportId);
		addTask();
		setDefaultCriteria(6);
		Session.set('builderStep', 1);
	},

	'click [data-action="undo"]': function(event) {
		event.preventDefault();
		var currentStep = Session.get("builderStep");
		Session.set('builderStep', currentStep--);
	},

	/**
	 * TASKS
	 */
	'click [data-action="add-task"]': function(event) {
		event.preventDefault();
		addTask();
	},

	'click [data-action="remove-task"]': function(event) {
		var taskId = event.currentTarget.getAttribute('data-taskId');
		removeTask(taskId);
	},

	'submit [data-action="add-tasks"]': function(event, template) {
		event.preventDefault();
		var
			elements = template.find('[data-action="add-tasks"]').elements,
			sessionTasks = Session.get('tasks'),
			tasks = [];


		_.each(sessionTasks, function(task, idx) {
			var name = $("#" + task.id).val();

			tasks.push({
				id: task.id,
				name: name
			});
		});

		updateTasks(tasks);
		Session.set('builderStep', 2);
		Session.set('tasks', getTasks());
	},

	/**
	 * CRITERIA
	 */
	'click [data-action="add-positive-criteria"]': function(event) {
		event.preventDefault();
		addCriteria(true);
	},

	'click [data-action="add-negative-criteria"]': function(event) {
		event.preventDefault();
		addCriteria(false);
	},

	'click [data-action="remove-criteria"]': function(event) {
		var criteriaId = event.currentTarget.getAttribute('data-criteriaId');
		removeCriteria(criteriaId);
	},

	'submit [data-action="add-criteria"]': function(event, template) {
		event.preventDefault();
		var
			sessionCriteria = Session.get('criteria'),
			criteria = [];

		_.each(sessionCriteria, function(c, idx) {
			var
				name = $("#name-" + c.id).val(),
				value = $("#value-" + c.id).val();

			criteria.push({
				id: c.id,
				name: name,
				value: value / 10,
				positive: c.positive
			});

		});

		updateCriteria(criteria);
		createTable();
		Session.set('builderStep', 3);
		Session.set('criteria', getCriteria());
	},

	// ESTIMATIONS
	'submit [data-action="set-estimations"]': function(event, template) {
		event.preventDefault();
		var
			sessionEstimations = Session.get('estimations'),
			estimations = [];

		_.each(sessionEstimations, function(task, idx) {
			var taskEst = {};

			$.extend(taskEst, task);

			_.each(taskEst.posCriteria, function(pCr) {
				var estimation = +$('#' + pCr.id).val();

				pCr.estimation = estimation; 
			});

			_.each(taskEst.negCriteria, function(pCr) {
				var estimation = +$('#' + pCr.id).val();

				pCr.estimation = estimation; 				
			});			

			estimations.push(taskEst);
		});

		updateEstimations(estimations);

		Session.set("viewState", "details");
	}
});

Template.builder.onCreated(function() {
	Session.set('builderStep', 0);
	Session.set('tasks', []);
	Session.set('criteria', []);
	Session.set('estimations', []);
});

// TASKS
function addTask() {
	var
		tasks = Session.get('tasks') || [];

	tasks.push({
		id: new Date().getTime(),
		name: ""
	});

	Session.set('tasks', tasks);
}

function removeTask(taskId) {
	var
		tasks = Session.get('tasks');

	tasks = _.filter(tasks, function(task, idx) {
		return +task.id !== +taskId;
	});

	Session.set('tasks', tasks);
}

function updateTasks(tasks) {
	var
		reportId = Session.get('reportId');

	Reports.update(reportId, {
		$set: {
			tasks: tasks
		}
	});
}

function getTasks() {
	var
		reportId = Session.get('reportId'),
		report = Reports.findOne(reportId);

	if (report) {
		return report.tasks;
	}
}

// CRITERIA

function getCriteria() {
	var
		reportId = Session.get('reportId'),
		report = Reports.findOne(reportId);

	if (report) {
		return report.criteria;
	}
}

function setDefaultCriteria(n) {
	_.times(n, function(idx) {
		if (idx < n / 2) {
			addCriteria(true, idx);
		} else {
			addCriteria(false, idx);
		}
	});
}

function addCriteria(positive, idx) {
	var
		criteria = Session.get('criteria') || [];

	criteria.push({
		id: [new Date().getTime(), idx || ""].join(''),
		name: "",
		positive: positive,
		value: 10
	});

	Session.set('criteria', criteria);
}

function removeCriteria(criteriaId) {
	var
		criteria = Session.get('criteria');

	criteria = _.filter(criteria, function(c) {
		return +c.id !== +criteriaId;
	});

	Session.set('criteria', criteria);
}

function updateCriteria(criteria) {
	var
		reportId = Session.get('reportId');

	Reports.update(reportId, {
		$set: {
			criteria: criteria
		}
	});
}

// ESTIMATIONS

function createTable() {
	var
		tasks = getTasks(),
		criteria = getCriteria(),
		estimations = [];

	_.each(tasks, function(task) {
		var row = {};

		row.id = task.id;
		row.name = task.name;
		row.posCriteria = [];
		row.negCriteria = [];

		_.each(criteria, function(c) {
			var critery = {
				id: [row.id, c.id].join('-'),
				crId: c.id,
				name: c.name,
				value: c.value,
				positive: c.positive
			};

			if (c.positive) {
				row.posCriteria.push(critery);
			} else {
				row.negCriteria.push(critery);
			}
		});

		estimations.push(row);
	});
	console.log(estimations);
	Session.set('estimations', estimations);
}

function updateEstimations(estimations) {
	var
		reportId = Session.get('reportId');

	Reports.update(reportId, {
		$set: {
			estimations: estimations
		}
	});
}