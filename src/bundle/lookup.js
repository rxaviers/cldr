var coreLikelySubtags = require("../core/likely_subtags");
var coreRemoveLikelySubtags = require("../core/remove_likely_subtags");
var coreSubtags = require("../core/subtags");
var arrayForEach = require("../util/array/for_each");

/**
 * bundleLookup( minLanguageId )
 *
 * @Cldr [Cldr class]
 *
 * @cldr [Cldr instance]
 *
 * @minLanguageId [String] requested languageId after applied remove likely subtags.
 */
module.exports = function( Cldr, cldr, minLanguageId ) {
	var availableBundleMap = Cldr._availableBundleMap,
		availableBundleMapQueue = Cldr._availableBundleMapQueue;

	if ( availableBundleMapQueue.length ) {
		arrayForEach( availableBundleMapQueue, function( bundle ) {
			var existing, maxBundle, minBundle, subtags;
			subtags = coreSubtags( bundle );
			maxBundle = coreLikelySubtags( Cldr, cldr, subtags );
			minBundle = coreRemoveLikelySubtags( Cldr, cldr, maxBundle );
			minBundle = minBundle.join( Cldr.localeSep );
			existing = availableBundleMapQueue[ minBundle ];
			if ( existing && existing.length < bundle.length ) {
				return;
			}
			availableBundleMap[ minBundle ] = bundle;
		});
		Cldr._availableBundleMapQueue = [];
	}

	return availableBundleMap[ minLanguageId ] || null;
};
