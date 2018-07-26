var validateType = require("../type");

module.exports = function( value, name ) {
	validateType( value, name, typeof value === "string", "a string" );
};
