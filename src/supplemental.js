var Cldr = require("./core");
var supplementalMain = require("./supplemental/main");

var initSuper = Cldr.prototype.init;

/**
 * .init() automatically ran on construction.
 *
 * Overload .init().
 */
Cldr.prototype.init = function() {
	initSuper.apply( this, arguments );
	this.supplemental = supplementalMain( this );
};

module.exports = Cldr;
