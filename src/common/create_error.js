
var arrayForEach = require("../util/array/for_each");
var objectKeys = require("../util/object/keys");

module.exports = function( code, attributes ) {
	var error, message;

	message = code + ( attributes && JSON ? ": " + JSON.stringify( attributes ) : "" );
	error = new Error( message );
	error.code = code;

	// extend( error, attributes );
	arrayForEach( objectKeys( attributes ), function( attribute ) {
		error[ attribute ] = attributes[ attribute ];
	});

	return error;
};
