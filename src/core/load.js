var coreSetAvailableBundles = require("./set_available_bundles");
var validatePresence = require("../common/validate/presence");
var validateTypePlainObject = require("../common/validate/type/plain_object");
var alwaysArray = require("../util/always_array");
var jsonMerge = require("../util/json/merge");

/**
 * load( Cldr, source, jsons )
 *
 * @Cldr [Cldr class]
 *
 * @source [Object]
 *
 * @jsons [arguments]
 */
module.exports = function( Cldr, source, jsons ) {
	var i, j, json;

	validatePresence( jsons[ 0 ], "json" );

	// Support arbitrary parameters, e.g., `Cldr.load({...}, {...})`.
	for ( i = 0; i < jsons.length; i++ ) {

		// Support array parameters, e.g., `Cldr.load([{...}, {...}])`.
		json = alwaysArray( jsons[ i ] );

		for ( j = 0; j < json.length; j++ ) {
			validateTypePlainObject( json[ j ], "json" );
			source = jsonMerge( source, json[ j ] );
			coreSetAvailableBundles( Cldr, json[ j ] );
		}
	}

	return source;
};
