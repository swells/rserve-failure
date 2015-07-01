#!/usr/bin/env node

/* 
 * usage: $ node index.js
 *
 * Toggle `EVENTS_ON` to `true` to make the scaleR code work and `false` to
 * make it fail.
 */

var deployr   = require('deployr'),
    ENDPOINT  = 'http://localhost:7400', 
    EVENTS_ON = true;

//
// Authenticate, create new project, and start the code execution
//
var ruser = deployr.configure({ host: ENDPOINT })
    .auth('testuser', 'changeme')
    .io('/r/project/create')
    .error(function(err) {
        console.log(err)
    })
    .end(function(res) {
        var project = res.get('project').project;
        console.log('Created project: "' + project + '"');
        exe(project);
    });

//
// Execute consecutive R code blocks on the same project then close the project.
//
function exe(project) {

    console.log('\nstart....');

    ruser.code('Sys.getpid();', project)
        .data({ enableConsoleEvents: EVENTS_ON })
        .error(function(err) { console.log(err); })
        .end(function(res) {
	        console.log(res.get('console'));
        })
        .code('RevoScaleR:::rxStartBxlServer()', project)
        .data({ enableConsoleEvents: EVENTS_ON })        
        .error(function(err) { console.log(err); })
        .end(function(res) {
            console.log('Pass... 1');
        })
        .code('rxDataStep(iris)', project)
        .data({ enableConsoleEvents: EVENTS_ON })        
        .error(function(err) { console.log(err); })
        .end(function(res) {
            console.log('Pass... 2');
        })
        .code('rxSummary(~., iris)', project)
        .data({ enableConsoleEvents: EVENTS_ON })        
        .error(function(err) { console.log(err); })
        .end(function(res) {
            console.log('Pass... 3');
        })
        .ensure(function() {
            ruser.release(project)
                .then(function(res) {
                    console.log('Closed project: "' + project + '"');
                }, function(err) {
                    console.log('Failed to close project: "' + project + '"');
                    console.log(err);
                });
        });
}
