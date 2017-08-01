jobQueue = new JobCollection('jobQueue', { noCollectionSuffix: true });
jobQueue.allow({
  // Grant full permission to admin only
  admin: function (userId, method, params) {
    return Roles.userIsInRole(userId,'admin')
  }
});

const queue = jobQueue.processJobs(
  'interproscan',
  {
    concurrency: 4,
    payload: 1
  },
  function(job, callback){
    console.log(job.data.geneId)
    job.done()
    callback()
  })

Meteor.startup(function () {
  // Normal Meteor publish call, the server always
  // controls what each client can see
  

  // Start the myJobs queue running
  return jobQueue.startJobServer();
});
