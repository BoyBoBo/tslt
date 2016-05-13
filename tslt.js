var ejs = require('ejs');
var fs = require('fs-extra');
var jszip = require('jszip');
var S = require('string');
var promise = require('promise');
var commandLineArgs = require('command-line-args');
var getUsage = require('command-line-usage');

var TSLT = function(options){
  var src = options.src;
  var srcStr = options.srcStr;
  var dest = options.dest;
  var template = options.template;
  var templateStr = options.templateStr;
  var globalChar = options.global ? options.global : '$';
  var delimiter = options.delimiter ? options.delimiter : '%';
  this.convert = function(callback){
    var render = function(data){
      var res;
      var srcData = {};
      srcData[globalChar] = data;
      var destData = ejs.render(templateContent, srcData);
      if(dest) {
        fs.writeFileSync(dest, destData);
      } else {
      }

      if(callback) {
        callback(destData);
      } else {}
    };
    ejs.delimiter = delimiter;
    var templateContent;
    var srcContent;
    if(template) {
      templateContent = fs.readFileSync(template).toString();
    } else if(templateStr) {
      templateContent = templateStr;
    } else {
      templateContent = '<' + delimiter + '=' + globalChar + delimiter + '>';
    }
    
    if(src) {
      if(S(src).endsWith('.zip')) {
        var zipData = fs.readFileSync(src);
        jszip.loadAsync(zipData)
        .then(function(zip){
          var promises = [];
          zip.forEach(function(path, entry){
            if(entry.name !== 'manifest.json') {
              promises.push(zip.file(entry.name).async('string'));
            } else {}
          });
          return promise.all(promises);
        }, function(err){
          console.error(err);
        })
        .then(function(texts){
          var merged = {};
          texts.forEach(function(text){
            var singleData = JSON.parse(text);
            for(var k in singleData) {
              merged[k] = singleData[k];
            }
          });
          render(merged);
        }, function(err){
          console.error(err);
        });
      } else {
        srcContent = fs.readFileSync(src).toString(); 
        render(JSON.parse(srcContent));
      }
    } else if(srcStr){
      render(JSON.parse(srcStr));
    } else {
      console.error('no input data');
      return;
    }
  };
};
module.exports = TSLT;