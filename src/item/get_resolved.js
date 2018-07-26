var resourceGet = require("../resource/get");
var pathNormalize = require("../path/normalize");

module.exports = function( Cldr, path, attributes ) {
	// Resolve path
	var normalizedPath = pathNormalize( path, attributes );

	return resourceGet( Cldr._resolved, normalizedPath );
};
