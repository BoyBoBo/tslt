#!/usr/bin/env node

var ejs = require('ejs');
var fs = require('fs-extra');
var jszip = require('jszip');
var S = require('string');
var promise = require('promise');
var commandLineArgs = require('command-line-args');
var getUsage = require('command-line-usage');

const cli = commandLineArgs([
  { name: 'src', alias: 's', type: String, defaultOption: true},
  { name: 'srcStr', alias: 'S', type: String},
  { name: 'dest', alias: 'd', type: String},
  { name: 'template', alias: 't', type: String },
  { name: 'templateStr', alias: 'T', type: String },
  { name: 'global', alias: 'g', type: String, defaultValue: '$' },
  { name: 'delimiter', alias: 'D', type: String, defaultValue: '%' },
  { name: 'help', alias: 'h' }
]);
const optionDefinitions = [
  {
    name: 'src', description: 'The input file to process',
    alias: 's', type: String, typeLabel: '[underline]{file}'
  },
  {
    name: 'srcStr', description: 'The input string',
    alias: 'S', type: String, typeLabel: '[underline]{String}'
  },
  {
    name: 'dest', description: 'The output file',
    alias: 'd', type: String, typeLabel: '[underline]{file}'
  },
  {
    name: 'template', description: 'The EJS template file',
    alias: 't', type: String, typeLabel: '[underline]{file}'
  },
  {
    name: 'templateStr', description: 'The EJS template string',
    alias: 'T', type: String, typeLabel: '[underline]{String}'
  },
  {
    name: 'global', description: 'global variable. default is $',
    alias: 'g', type: String, typeLabel: '[underline]{String}'
  },
  {
    name: 'delimiter', description: 'delimiter char',
    alias: 'D', type: String, typeLabel: '[underline]{char}'
  }
];

const docOptions = {
  title: 'TSLT',
  description: 'A commandline tool of javascript template engine based on EJS.',
  examples: [
  	{
  		desc: '1. Use json file',
  		example: 'tslt -s src.json -t template.ejs'
  	},
    {
      desc: '2. Use zip file',
      example: 'tslt -s src.zip -t template.ejs'
    },
  	{
  		desc: '3. Use string',
  		example: 'tslt -S \'{\\\"name\\\": \\\"john\\\", \\\"job\\\": \\\"teacher\\\"}\' -T \'<%=$.name%> is a <%=$.job%>\''
  	}
  ],
  footer: 'Project home: [underline]{https://github.com/boybobo/tslt.git}'
};

const options = cli.parse();


var src = options.src;
var srcStr = options.srcStr;
var dest = options.dest;
var template = options.template;
var templateStr = options.templateStr;
var globalChar = options.global;
var delimiter = options.delimiter;
var help = options.help;

var convert = function(data){
  var srcData = {};
  srcData[globalChar] = data;
  var destData = ejs.render(templateContent, srcData);

  if(dest) {
    fs.writeFileSync(dest, destData);
  } else {
    console.log(destData);
  }
};

if(help) {
	console.log(getUsage(optionDefinitions, docOptions));
} else {
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
        convert(merged);
      }, function(err){
        console.error(err);
      });
    } else {
      srcContent = fs.readFileSync(src).toString(); 
      convert(JSON.parse(srcContent));
    }
	} else if(srcStr){
    convert(JSON.parse(srcStr));
	} else {
		console.error('no input data');
		return;
	}	
}