var validate = require("../validate");

module.exports = function( value, name ) {
	validate( "E_MISSING_PARAMETER", typeof value !== "undefined", {
		name: name
	});
};
