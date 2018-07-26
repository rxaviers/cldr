var validateType = require("../type");
var arrayIsArray = require("../../../util/array/is_array");

module.exports = function( value, name ) {
	validateType( value, name, typeof value === "string" || arrayIsArray( value ), "String or Array" );
};
