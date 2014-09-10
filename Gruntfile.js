module.exports = function(grunt){

  var path = require('path');
  var builder = require('./ci/badge_generator')
   

  grunt.initConfig({
    branchName : "root@visualiser.maidsafe.net:/usr/maidsafe/temp/test_results",
    shell :{
      test : {
        command:path.join("node_modules",".bin","istanbul") +" cover " + path.join("node_modules", "mocha", "bin", "_mocha") +" -- -R mocha-unfunk-reporter",
        options: {
          stdout: true
        }
      },
      "test-cov" :{
        command: path.join("node_modules",".bin","istanbul") +" cover " + path.join("node_modules", "mocha", "bin", "_mocha") + " -- -R json-cov > " +path.join(builder.rootFolder, "results.json"),
          options: {
          stdout: true,
          callback : builder.consolidateCoverageResults
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
          callback : builder.jscsResult
        }
      },
      scp : {
        command:"scp -r ./coverage/lcov-report <%=branchName%>",
        options: {
          stdout: true
        }
      },
      istanbul :{
        command : [
          path.join("node_modules",".bin","istanbul") +" cover " + path.join("node_modules", "mocha", "bin", "_mocha") +" -- -R mocha-unfunk-reporter",
          path.join("node_modules",".bin","istanbul") +" cover " + path.join("node_modules", "mocha", "bin", "_mocha") + " -- -R json-cov > " +path.join(builder.rootFolder, "results.json"),
          builder.scp
        ].join(';'),
        options : {
          callback : builder.consolidateCoverageResults  
        }
      }
    },
    clean: {
      test: [builder.rootFolder]
    },
    mkdir : {
       test : {
        options: {          
          create: [builder.rootFolder]
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

  grunt.registerTask('test', ['shell:test']);//Test
  grunt.registerTask('istanbul', ["clean:test", 'shell:jscs',  'mkdir:test', 'shell:istanbul', 'shell:test']);//'shell:test-cov', 'shell:scp']);//Test Coverage results
  grunt.registerTask('ctest', ['env:mochaPlain', 'shell:ctest']);//Pushes Test results to CDASH  

};
