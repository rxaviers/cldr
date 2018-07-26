/**
 * Function inspired by jQuery Core, but reduced to our use case.
 */
module.exports = function( obj ) {
	return obj !== null && "" + obj === "[object Object]";
};
