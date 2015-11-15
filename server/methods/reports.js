Meteor.methods({

  // createReport: function (name) {
  //   Reports.insert({
  //     name: name,
  //     createdAt: new Date()
  //   });
  // }

  // getReport: function (reportId) {
  //   return Reports.findOne(reportId);
  // },

  // addTasks: function (reportId, tasks) {
  //   var report = getReport(reportId);

  //   if(report) {
  //     Reports.update(reportId, { $set: { tasks: tasks }});
  //   } else {
  //     throw new Meteor.Error('report-not-found');
  //   }
  // },

  // addCriteria: function (reportId, criteria) {
  //   var report = getReport(reportId);

  //   if(report) {
  //     Reports.update(reportId, { $set: { criteria: criteria }});
  //   } else {
  //     throw new Meteor.Error('report-not-found');
  //   }
  // },

  // calculateReport: function (reportId, estimations) {
  //   var report = getReport(reportId);

  //   if(report) {
  //     Meteor.reporst.update(reportId, { $set: { result: calculations }});
  //   } else {
  //     throw new Meteor.Error('report-not-found');
  //   }
  // }

});