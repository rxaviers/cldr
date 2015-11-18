// Type definitions for Cldrjs v0.4.3
// Project: https://github.com/rxaviers/cldrjs
// Definitions by: Grégoire Castre <https://github.com/gcastre/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

interface Supplemental {
	(path: string | string[]): string | string[] | Object | Object[];
	weekData: WeekData;
	timeData: TimeData;
}

interface WeekData {
	(path: string | string[]): string | string[] | Object | Object[];
	firstDay(): string;
	minDays(): number;
}

interface TimeData {
	(path: string | string[]): string | string[] | Object | Object[];
	allowed(): string;
	preferred(): string;
}

interface Cldr extends CldrCore, CldrEvent {

}

interface CldrCore {

	/**
	 * Resolved or unresolved [1] CLDR JSON data
	 * Note: Unresolved processing is only available after loading cldr/unresolved.js extension module.
	 * @param {Object} json Resolved or unresolved [1] CLDR JSON data
	 * @returns {void}
	 */
	load(...json: Object[]): void;


	/**
	 * Create a Globalize instance.
	 * @param {string} Locale string of the instance.
	 * @returns {Globalize} A Globalize instance
	 */
	new (locale: string): CldrInstance;

	/**
	 * Allow user to override locale separator "-" (default) | "_".
	 * According to http://www.unicode.org/reports/tr35/#Unicode_language_identifier, both "-" and "_" are valid locale separators (eg. "en_GB", "en-GB").
	 * According to http://unicode.org/cldr/trac/ticket/6786 its usage must be consistent throughout the data set.
	 */
	localeSep: string;
}

interface CldrEvent {

	/**
	 * Add a listener function to the specified event globally (for all instances).
	 */
	on(event: string, listener: Function): void;

	/**
	 * Add a listener function to the specified event globally (for all instances). It will be automatically removed after it's first execution.
	 */
	once(event: string, listener: Function): void;

	/**
	 * Remove a listener function from the specified event globally (for all instances).
	 */
	off(event: string, listener: Function): void;
}

interface CldrInstance extends CldrInstanceCore, CldrInstanceEvent, CldrInstanceSupplemental, CldrInstanceUnresolved { }

interface CldrInstanceCore {
	/**
	 * Attributes is an Object created during instance initialization (construction) and are used internally by .get() to replace dynamic parts of an item path.
	 * Note: language, script, territory (also aliased as region), and maxLanguageId are computed by adding likely subtags according to the specification.
	 */
	attributes: {
		/**
		 * Holds the bundle lookup match based on the available loaded CLDR data, obtained by following
		 */
		bundle: string;
		/**
		 * Language Subtag (spec)
		 */
		language: string;
		/**
		 * Language Id (spec)
		 * Note: languageId is always in the succint form, obtained by removing the likely subtags from maxLanguageId according to the specification.
		 */
		languageId: string;
		/**
		 * Computed by adding likely subtags
		 */
		maxLanguageId: string;
		/**
		 * Computed by removing likely subtags
		 */
		minlanguageId: string;
		/**
		 * Region Subtag (spec)
		 */
		region: string;
		/**
		 * Script Subtag (spec)
		 */
		script: string;
		/**
		 * Region Subtag (spec)
		 */
		territory: string;
		variant: string;
	};

	/**
	 * Get the item data given its path, or undefined if missing.
	 */
	get(path: string | string[]): string | string[] | Object | Object[];


	/**
	 * It's an alias for .get([ "main/{languageId}", ... ]).
	 */
	main(path: string | string[]): string | string[] | Object | Object[];
}

interface CldrInstanceEvent {
	/**
	 * Add a listener function to the specified event for this instance.
	 */
	on(event: string, listener: Function): void;

	/**
	 * Add a listener function to the specified event for this instance. It will be automatically removed after it's first execution.
	 */
	once(event: string, listener: Function): void;

	/**
	 * Remove a listener function from the specified event for this instance.
	 */
	off(event: string, listener: Function): void;
}

interface CldrInstanceSupplemental {
	/**
	 * It's an alias for .get([ "supplemental", ... ]).
	 */
	supplemental: Supplemental;
}

interface CldrInstanceUnresolved {
	/**
	 * Overload (extend) .get() to get the item data or lookup by following locale inheritance, set a local resolved cache if it's found (for subsequent faster access), or return undefined.
	 */
	get(path: string | string[]): string | string[] | Object | Object[];
}

declare var Cldr: Cldr;
