module.exports = function(grunt){

  var path = require('path');
  var ci = require('./ci/badge_generator')
   

  grunt.initConfig({
    shell :{
      test : {
        command:path.join("node_modules",".bin","istanbul") +" cover " + path.join("node_modules", "mocha", "bin", "_mocha") +" -- -R mocha-unfunk-reporter",
        options: {
          stdout: true
        }
      },
      "test-cov" :{
        command: path.join("node_modules",".bin","istanbul") +" cover " + path.join("node_modules", "mocha", "bin", "_mocha") + " -- -R json-cov > " +path.join(ci.rootFolder, "results.json"),
          options: {
          stdout: true,
          callback : ci.consolidateCoverageResults
        }
      },
      ctest :{
        command:"ctest -D Experimental",
        options: {
          stdout: true
        }
      },
      jscs : {
        command:"jscs frontend",
        options : {
          stdout: true,
          callback : ci.jscsResult
        }
      },
      "scp-master" : {      
        command: "scp -r ./coverage/lcov-report  root@visualiser.maidsafe.net:/usr/maidsafe/temp/test_results",
        options: {
          stdout: true
        }  
      },
      "scp-next" : {      
        command: "scp -r ./coverage/lcov-report  root@visualiser.maidsafe.net:/usr/maidsafe/temp_next/test_results",
        options: {
          stdout: true
        }  
      },
      istanbul :{
        command : [
          path.join("node_modules",".bin","istanbul") +" cover " + path.join("node_modules", "mocha", "bin", "_mocha") +" -- -R mocha-unfunk-reporter",
          path.join("node_modules",".bin","istanbul") +" cover " + path.join("node_modules", "mocha", "bin", "_mocha") + " -- -R json-cov > " +path.join(ci.rootFolder, "results.json")          
        ].join(';'),
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
    },
    env : {
        mochaPlain : {
          'mocha-unfunk-style' : "plain"
        }
    }
  });


  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks('grunt-env');

  ci.init(grunt)
  grunt.registerTask('test', ['shell:test']);//Test
 // grunt.registerTask('default', ['shell:scp-master'])
  grunt.registerTask('istanbul', ["shell:gitBranch", "clean:test", 'shell:jscs', 'mkdir:test', 'shell:istanbul', 'shell:test']);//'shell:test-cov', 'shell:scp']);//Test Coverage results
  grunt.registerTask('ctest', ['env:mochaPlain', 'shell:ctest']);//Pushes Test results to CDASH  

};
