# tslt
A commandline tool of javascript template engine based on EJS.

# installation
* npm install tslt (-g)

# usage
```javascript
var TSLT = require('tslt');
var options = {
  src: 'src.zip',
  template: 'template.ejs',
  dest: 'dest.html'
  /*
  global: '$$',
  delimiter: '@'
  */
};
var t = new TSLT(options);
t.convert(function(res){
  console.log(res);
});

```

# options
        -s, --src file             The input file to process
        -S, --srcStr String        The input string
        -d, --dest file            The output file
        -t, --template file        The EJS template file
        -T, --templateStr String   The EJS template string
        -g, --global String        global variable. default is $
        -D, --delimiter char       delimiter char


# use command

 * Use json file
 * * tslt -s src.json -t template.ejs
 * Use zip file
 * * tslt -s src.zip -t template.ejs
 * Use string
 * * tslt -S '{\"name\": \"john\", \"job\": \"teacher\"}' -T '<%=$.name%> is a <%=$.job%>'


Project home: https://github.com/boybobo/tslt.git