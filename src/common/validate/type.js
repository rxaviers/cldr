var validate = require("../validate");

module.exports = function( value, name, check, expected ) {
	validate( "E_INVALID_PAR_TYPE", check, {
		expected: expected,
		name: name,
		value: value
	});
};
