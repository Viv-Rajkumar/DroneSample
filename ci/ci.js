var badgeFactory = require('./badge_factory');
//var

var gitBranchName;  
var jscsPassed;
var defaultConfig = {
  publishedFolder : "coverage",
  scpBranchPath : {master : "temp", next : "temp_next"},
  jsonReportFileName : "results.json",
  jscsReportFileName : "jscs.txt"
};
var grunt = null;
var config = null;

var codeStyleTestCompleted = function(err, stdout, stderr, callback){
	jscsPassed = err?false:true;
	console.log("******** JSCS ******* " + jscsPassed);
	callback()
}

var onCoverageCompleted = function(err, stdout, stderr, callback){//Needs to be refactored	
	badgeFactory.generateBadges(config.publishedFolder, config.jsonReportFileName, jscsPassed, callback, grunt, config.scpBranchPath[gitBranchName]);
}

var setGitBranch = function(err, stdout, stderr, callback){
	if(err) throw err;
	gitBranchName = stdout.trim();
	callback();
}  
	
exports.init = function(_grunt, ciConfig){
	grunt = _grunt;
	config = ciConfig || defaultConfig;
}

exports.coverageCompleted = onCoverageCompleted;
exports.gitBranchDetected = setGitBranch;
exports.codeStyleChecker = codeStyleTestCompleted;

