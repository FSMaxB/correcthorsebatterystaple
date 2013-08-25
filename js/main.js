
/**
 * That's a Battery Staple!
 * Correct Horse!
 *
 * @author John Van Der Loo
 * @version 1.2
 * @license MIT
 *
 * @returns	{CorrectHorseBatteryStaple}
 */
function CorrectHorseBatteryStaple() {
	"use strict";

	var self = this;

	// Application configuration
	this.config = {
		storageKey: "CHBSOptions",
		randomNumberPool: 10
	};

	this.data = [];

	this.dataSets = {};

	this.words = [];

	// UI references
	this.ui = {
		$passwordBox: $("#txt"),
		$btnGenerate: $("#btn-generate")
	};

	// Shorthand to localStorage
	this.storage = window.localStorage || false;

	// Default options
	this.defaults = {
		minLength: 10,
		firstUpper: true,
		minWords: 3,
		appendNumbers: true,
		separator: "-"
	};

	// Session options
	this.options = {};

	// Set some sane defaults
	this.options = $.extend(this.options, this.defaults);

	// Application configurations
	this.config = {
		storageKey: "CHBSOptions",
		randomNumberPool: 10
	};


	/**
	 * Set an option and optionally save it to LocalStorage if required.
	 *
	 * @param	{String} key
	 * @param	{*}  value
	 */
	this.setOption = function(key, value) {
		this.options[key] = value;

		if (this.options.saveOptions === true) {
			this.saveOptions();
		}
	};


	/**
	 * Save Options to LocalStorage
	 */
	this.saveOptions = function() {
		self.storage.setItem( self.config.storageKey, JSON.stringify(self.options) );
	};


	/**
	 * Remove Options from LocalStorage
	 */
	this.destroyOptions = function() {
		self.storage.removeItem( self.config.storageKey );
	};


	/**
	 * Update the UI for an option.
	 *
	 * @param	{String}	key
	 * @param	{String}	value
	 */
	this.setUIOption = function(key, value) {
		var $el = $("[data-option='"+key+"']");

		if ($el.is("input[type=checkbox]")) {
			$el.prop("checked", value);
			return;
		}

		$el.val(value);

	};


	/**
	 * Set all UI options based on the current options.
	 */
	this.setAllUIOptions = function() {
		var opt;

		for (opt in this.options) {
			if (this.options.hasOwnProperty(opt)) {
				self.setUIOption(opt, this.options[opt]);
			}
		}

	};

	/**
	 * Set a config option from the UI
	 *
	 * @param {Node} el
	 */
	this.setOptionFromUI = function(el) {
		var $el = $(el),
			val = $el.val();

		if ($el.is("[type=checkbox]")) {
			val = $el.prop("checked");
		}

		self.setOption( $el.data("option"), val );
	};


	/**
	 * Load a data file and fire an optional callback.
	 * The data file is assumed to be a CSV list of words and will be
	 * split in to an array of words and appended to the main data key
	 *
	 * @param {String} file File to load
	 * @param {Function} [callback] optional callback
	 */
	this.loadData = function(file, callback) {

		$.get("data/"+file, function(content, textStatus) {

			self.dataSets[file] = content.toString().split(",");
			self.data = self.data.concat( self.dataSets[file] );

			if (callback) {
				callback.call(this, content, textStatus);
			}

		}, "text");

		// @TODO: Turn this in to a .ajax() request and add Error handler
		//  error: function(xhr, status, error) {
		//	if (!console.warn) {
		//		return;
		//	}
		//  console.warn("An AJAX error occured: \nError: " + error);
		//	console.warn("This likely means an issue on the server or the connection between the client and server.\n\nPlease try to again later. If this error persists, please contact the site administrator.");
		//  }

	};


	/**
	 * Retrieve a number of random words from our dataset
	 *
	 * @param {Number} n Number of words to get
	 *
	 * @returns {Array}  The array of words
	 */
	this.getRandomWords = function(n){
		var len = this.data.length,
			rand = Math.floor(Math.random() * len),
			i, word;

		for (i = 0; i < n; i++) {
			word = this.data[rand];
			word = this.options.firstUpper ? word.charAt(0).toUpperCase() + word.slice(1) : word;
			this.words.push(word);
			rand = Math.floor(Math.random()*len);
		}

		return this.words;
	};


	/**
	 * Generate a password
	 */
	this.generate = function(){

		this.words = [];

		this.ui.$passwordBox.empty();

		this.options.minWords = parseInt(this.options.minWords, 10) || this.defaults.minWords;
		this.options.minLength = parseInt(this.options.minLength, 10) || this.defaults.minLength;


		this.getWords();
	};


	/**
	 * Get words from the wordlist
	 *
	 * @param	{Number}	numWords	Number of words to get
	 */
	this.getWords = function(numWords){
		var fullword;

		if (numWords === undefined) {
			numWords = this.options.minWords;
		}

		this.getRandomWords( numWords );

		//generate a full string to test against min length
		fullword = this.words.join( this.options.separator.substring(0,1)||"" );

		//recurse untill our password is long enough;
		if (fullword.length < this.options.minLength) {
			this.getWords(1);
		}
		else {
			//once we have enough words
			fullword = this.join(this.words, this.stringToArray(this.options.separator) );
			this.ui.$passwordBox.val(fullword).trigger("change");
			return;
		}
	};

	/**
	 * Join a set of words with random separators
	 *
	 * @param	{Array}		words		Array of words
	 * @param	{String}	separators	String that will be split to separators
	 * @returns	{String}
	 */
	this.join = function(words, separators) {
		var wordsLen,
			i,
			theString = "",
			symbol = "";

		wordsLen = words.length;

		if (this.options.appendNumbers) {
			words.push(Math.ceil(Math.random()* this.config.randomNumberPool ));
			wordsLen = words.length;
		}

		for (i = 0; i < wordsLen; i++) {

			if (i !== wordsLen - 1) {
				symbol = this.getSeparator(separators);
			}
			else {
				symbol = '';
			}

			theString += words[i] + symbol;
		}
		return theString ;
	};


	/**
	 * Convert a string to an array of characters
	 *
	 * @param {String} str The string
	 * @returns {Array}  Array of characters
	 */
	this.stringToArray = function(str) {
		var chars  = [],
			i = 0,
			len = str.length || 0,
			theChar = "";

		if (typeof(str) !== "string" && len === 0) {
			return false;
		}

		for (i; i < len; i++) {
			theChar = str.substring(i,i+1);
			chars.push(theChar);
		}
		return chars;
	};


	/**
	 * Get a random separator from the separators array
	 *
	 * @param	{Array}	seps
	 * @returns	{String}
	 */
	this.getSeparator = function(seps) {
		return seps[ Math.floor( Math.random() * seps.length ) ] || "";
	};


	/**
	 * Bind all UI related events
	 */
	this.bindEvents = function() {
		var clickEvent = !!("ontouchstart" in window) ? "touchend" : "click";

		//Update options when UI is updated
		$("[data-option]").on("keyup change", function(){
			self.setOptionFromUI(this);
		});

		this.ui.$btnGenerate.on(clickEvent + " keypress", function() { self.generate(); } );

		this.ui.$passwordBox.on("keyup change", function() {
			$(this).parent().find("em").html( $(this).val().length );
		});

		// Update the saveOptions option
		$("#save-options").on("change", function() {
			if ($(this).prop("checked") === true) {
				self.saveOptions();
			}
			// If we no longer wish to save, destroy our LS entry
			else {
				self.destroyOptions();
			}

		});

		//$("#jargon").on("change", function(){
		//	var file = "jargon.txt";
		//
		//	if ($(this).is(":checked")){
		//		if (!self.dataSets[file]) {
		//			self.loadData(file);
		//		}
		//		else {
		//			self.data = self.data.concat(self.dataSets[file]);
		//		}
		//	}
		//	else {
		//		self.data = self.dataSets["wordlist.txt"];
		//	}
		//
		//});


		$("fieldset").on(clickEvent, "legend", function() {
			$(this).closest("fieldset").toggleClass("active");
		});

	};


	/**
	 * Initialize this horse
	 */
	this.init = function() {

		// Load options from the LocalStorage if present
		if (this.storage && this.storage.getItem( this.config.storageKey )) {
			try {
				this.options = JSON.parse(this.storage.getItem( this.config.storageKey ));
				this.setAllUIOptions();

			} catch (e) {
				console.log("Could not parse settings from LocalStorage");
			}

		}

		// no local storage available, read the options from the UI
		else {
			$("[data-option]").each(function(k,v) {
				self.setOptionFromUI(this);
			});
		}


		// Load the default words
		this.loadData("wordlist.txt", function(){
			self.generate();
		});

		// Bind Events
		this.bindEvents();
	};


	this.init();

	return this;

}

var CHBS = new CorrectHorseBatteryStaple();

/*
	This software is licensed under the MIT License:

	Copyright (c) 2013, John Van Der Loo

	Permission is hereby granted, free of charge, to any person obtaining a copy of this
	software and associated documentation files (the "Software"), to deal in the Software
	without restriction, including without limitation the rights to use, copy, modify, merge,
	publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
	to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
	INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
	PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
	HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
	OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
