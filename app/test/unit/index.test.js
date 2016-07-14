/**/
var test = require('unit.js'),
    util_index = require('../js/util/index.js');
// just for example of tested value
var example = util_index.check_account_name('Alan');
// assert that example variable is a string
test.string(example);
// or with Must.js
test.must(example).be.a.string();
// or with assert
test.assert(typeof example === 'string');