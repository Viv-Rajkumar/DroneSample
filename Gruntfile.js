module.exports = function(grunt){

  var ci = require('./ci/badge_generator')    
  var ISTANBUL_COMMAND = "istanbul cover node_modules/mocha/bin/_mocha -- ";   

  grunt.initConfig({
    shell : {
      test : {
        command: ISTANBUL_COMMAND + "-R mocha-unfunk-reporter"
      },
      jscs : {
        command:"jscs . -r text > coverage/jscs.txt",
        options : {         
          callback : ci.jscsResult
        }
      },
      scp : {      
        command: function(path){          
          return "scp -r ./coverage/lcov-report/*  root@visualiser.maidsafe.net:/usr/maidsafe/" + path + "/frontend/test_results"
        }        
      },
      ci : {
        command : ISTANBUL_COMMAND + "-R json-cov > " + ci.rootFolder + "/results.json",
        options : {
          callback : ci.consolidateCoverageResults 
        }
      },
      gitBranch : {
        command : "git rev-parse --abbrev-ref HEAD",
        options : {
          callback : ci.setGitBranch
        }
      }
    },
    clean: {
      test: [ci.rootFolder]
    },
    mkdir : {
       test : {
        options: {          
          create: [ci.rootFolder]
        }
      }
    }
  });


  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mkdir');
  
  ci.init(grunt);

  grunt.registerTask('test', ["clean:test", 'mkdir:test', 'shell:jscs', 'shell:test']);//Test 
  grunt.registerTask('ci', ["shell:gitBranch", "clean:test", 'mkdir:test', 'shell:jscs', 'shell:ci', 'shell:test']);//'shell:test-cov', 'shell:scp']);//Test Coverage results 
};
