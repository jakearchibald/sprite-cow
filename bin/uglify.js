var jsp     = require("uglify-js").parser;
var pro     = require("uglify-js").uglify;

var js = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (chunk) {
	js += chunk;
});

process.stdin.on('end', function () {
	var ast = jsp.parse(js); // parse code and get the initial AST
	ast = pro.ast_lift_variables(ast);
	ast = pro.ast_mangle(ast); // get a new AST with mangled names
	ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
	var final_code = pro.gen_code(ast); // compressed code here
	process.stdout.write(final_code);
	process.stdout.on('drain', function() {
		process.exit(0);
	});
});
