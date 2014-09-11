var fs = require('fs');
var htmlParser = require('htmlparser2');
var util = require('util')
var http = require('http')
var async = require('async')


var ImageDownload = function(filePath){  
	var self = this;
	self.callback = null
  
  self.save = function(res){
  	var imagedata = '';
  	res.setEncoding('binary');

	  res.on('data', function(chunk){
	      imagedata += chunk
	  });

	  res.on('end', function(){
	  		fs.writeFile(filePath, imagedata, 'binary', function(err){
				  if (err) throw err        
				  console.log("Generated " + filePath); 				  
				  self.callback()     
				});
	  });
  }  

  return self;
}

var getBadgeColor = function(percentage){
    var color = "red"    
    if(percentage > 85){
      color = "brightgreen"
    }else if(percentage > 70){
      color = "green"
    }else if(percentage > 50){
      color = "orange"
    }
    return color;
}

var CoverageBadgeFactory = function(coverageResult, rootFolder){
  var factory = this;
  factory.text = "Coverage";
  factory.status = "";
  factory.color = "";
  factory.imageDownload = new ImageDownload(rootFolder + '/coverage_status.svg');

  var total = 0;
  for(var key in coverageResult){
    total += coverageResult[key];
  };

  var callback;

  this.onComplete = function(cb){
    factory.imageDownload.callback = cb
  }

  factory.status = (total/4).toFixed(2)
  factory.color = getBadgeColor(factory.status)

  this.saveBadge = factory.imageDownload.save;

  return this;
}



var TestBadgeFactory = function(testResult, jscsPassed, rootFolder){
  var factory = this
  factory.text = "Test";
  testResult.tests += 1;//For adding the JSCS test
  testResult.passes += jscsPassed? 1 : 0;
  factory.status =  testResult.passes + "/" + testResult.tests;
  factory.color = getBadgeColor((testResult.passes / testResult.tests) * 100);
  factory.imageDownload = new ImageDownload(rootFolder + '/test_status.svg');

  var callback;

  this.onComplete = function(cb){
    factory.imageDownload.callback = cb;
  }

  factory.saveBadge = factory.imageDownload.save;

}



var BadgeFactory = function(rootFolder, jsonFileDest, jscsPassed, callback, grunt, scpPath){

	var getParser = function(coverageResult){
	  var watch = false;
	  var keys = ["statement","branches", "functions", "lines"];  
	  var counter = 0;
   	return new htmlParser.Parser({
      onopentag: function(name, attribs){
        if(name === "h2"){
            watch = true;
        }
      },
      ontext: function(text){
        if(watch && text.indexOf('%') > -1){
          text = text.trim()
          coverageResult[keys[counter]] = parseInt(text.substring(0, text.length-1))
          counter++;
        }                
      },
      onclosetag: function(tagname){
        if(tagname === "h2"){
        	watch = false;
        }          
      }
	  });
	}

	var generateBadges = function(coverageResult, testResult, callback){    
	  var testBadge = new TestBadgeFactory(testResult, jscsPassed, rootFolder);
	  var coverageBadge = new CoverageBadgeFactory(coverageResult, rootFolder);

	  var getPayload = function(text, status, color){    
	      return { host: 'img.shields.io', path : util.format("/badge/%s-%s-%s.svg", text, status, color)}
	  }
	  async.parallel([
	        function(cb){
	          coverageBadge.onComplete(cb)
	          http.request(getPayload(coverageBadge.text, coverageBadge.status, coverageBadge.color), coverageBadge.saveBadge).end();          
	        },
	        function(cb){
	          testBadge.onComplete(cb)
	          http.request(getPayload(testBadge.text, testBadge.status, testBadge.color), testBadge.saveBadge).end();  
	        }
	    ], function(err, result){
	        console.log("BADGE Generetaion COMPLETED");	  	        
	        grunt.tasks(['shell:scp:'+ scpPath]);     
	        callback();
	    })    
	}

	var consolidateCoverageResults = function(){       
	  var coverageResult = {};  
	  var parser = getParser(coverageResult)

	  var getTestResults = function(){	  
	    fs.readFile(rootFolder + '/' + jsonFileDest, {encoding : 'utf-8'}, function (err, data) {
	      if (err) throw err;   
	      generateBadges(coverageResult, JSON.parse(data.split('=')[0]).stats, callback)      
	    });
	  };

	  fs.readFile(rootFolder + '/lcov-report/index.html', {encoding : 'utf-8'}, function (err, data) {
	    if (!err){
	      parser.write(data);
	      parser.end();
	      getTestResults();     
	    }else{
	      console.log("Badge generation failed");
	      console.log(err);
	      callback();
	    }       
  	});      
	}

	consolidateCoverageResults()

}

exports.generateBadges = BadgeFactory