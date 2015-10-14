var argv = require('minimist')(process.argv.slice(2)),
    clayman = require('./'),
    FS = require("q-io/fs"),
    path = require('path'),
    q = require('q');

var opts = {
    output: argv.output || "diff.css"
};

if (!argv.base) {
    console.error('\x1b[36m', 'You must provide a base file using the --base flag', '\x1b[0m');
    process.exit(1);
}

if (!argv._ || argv._.length === 0) {
    console.error('\x1b[36m', 'You must include files to diff against', '\x1b[0m');
    process.exit(1);
}

if (!argv.output) {
    console.log('\x1b[36m', 'No output file selected, will output to ./diff.css', '\x1b[0m');
}

var filePromiseList = [argv.base].concat(argv._).map(function (path) {
    return FS.read(path);
});

q.all(filePromiseList).then(function (files_as_strings) {
    var diff = clayman.difference.apply(clayman, files_as_strings);

    return FS.write(opts.output, diff.toString());
}, function (error) {
    console.error('\x1b[36m', error, '\x1b[0m');
    throw error;
}).then(function () {
    console.log('\x1b[36m', "You may find your output at " + opts.output, '\x1b[0m');
    process.exit(0);
}, function (error) {
    process.exit(1);
});

