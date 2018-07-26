var Cldr = require("../../../src/core.js");
var parentLookup = require("../../../src/bundle/parent_lookup.js");
var parentLocalesJson = require("cldr-data/supplemental/parentLocales.json");

require("../../../src/unresolved.js");

describe( "Bundle Parent Lookup", function() {

	beforeAll(function() {
		Cldr.load( parentLocalesJson );
	});

	it( "should truncate locale", function() {
		expect( parentLookup( Cldr, [ "pt", "BR" ].join( Cldr.localeSep ) ) ).to.equal( "pt" );
	});

	it( "should end with root", function() {
		expect( parentLookup( Cldr, "en" ) ).to.equal( "root" );
	});

	it( "should use supplemental resource", function() {
		expect( parentLookup( Cldr, [ "en", "IN" ].join( Cldr.localeSep ) )).to.equal( [ "en", "001" ].join( Cldr.localeSep ) );
	});

});
