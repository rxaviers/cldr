var arrayIsArray = require("./array/is_array");

module.exports = function( somethingOrArray ) {
	return arrayIsArray( somethingOrArray ) ?  somethingOrArray : [ somethingOrArray ];
};
