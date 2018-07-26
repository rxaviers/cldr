var validateType = require("../type");
var isPlainObject = require("../../../util/is_plain_object");

module.exports = function( value, name ) {
	validateType( value, name, typeof value === "undefined" || isPlainObject( value ), "Plain Object" );
};
