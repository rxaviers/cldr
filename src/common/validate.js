var createError = require("./create_error");

module.exports = function( code, check, attributes ) {
	if ( !check ) {
		throw createError( code, attributes );
	}
};
