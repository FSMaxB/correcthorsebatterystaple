/**
 * That's a Battery Staple!
 * Correct Horse!
 *
 * @author John Van Der Loo
 * @version 1.2
 * @license MIT
 *
 * @returns    {CorrectHorseBatteryStaple}
 * @constructor
 */
function CorrectHorseBatteryStaple() {
	"use strict";

	var self = this;

	/**
	 * Application configuration
	 * @type {Object}
	 */
	this.config = {
		storageKey:       "CHBSOptions"
	};

	this.data = [];

	this.wordlists = {};

	this.words = [];

	/**
	 * UI references
	 * @private
	 * @type {Object}
	 */
	this.ui = {
		$passwordBox: $("#txt"),
		$btnGenerate: $("#btn-generate")
	};

	/**
	 * Shorthand to localStorage
	 * @private
	 * @type {LocalStorage}
	 */
	this.storage = window.localStorage || false;

	// Default options
	this.defaults = {
		firstUpper:    true,
		minWords:      4,
		language: "english",
		separator:     " "
	};

	/**
	 * Session options
	 * @type {Object}
	 */
	this.options = {};

	// Set some sane defaults
	this.options = $.extend(this.options, this.defaults);

	/**
	 * Set an option and optionally save it to LocalStorage if required.
	 *
	 * @param    {string} key
	 * @param    {*}  value
	 */
	this.setOption = function(key, value) {
		this.options[key] = value;

		if ( this.options.saveOptions === true ) {
			this.saveOptions();
		}
	};


	/**
	 * Save Options to LocalStorage
	 */
	this.saveOptions = function() {
		self.storage.setItem(self.config.storageKey, JSON.stringify(self.options));
	};


	/**
	 * Remove Options from LocalStorage
	 */
	this.destroyOptions = function() {
		self.storage.removeItem(self.config.storageKey);
	};


	/**
	 * Update the UI for an option.
	 *
	 * @param    {string}    key
	 * @param    {string}    value
	 */
	this.setUIOption = function(key, value) {
		var $el = $("[data-option='" + key + "']");

		if ( $el.is("input[type=checkbox]") ) {
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

		for ( opt in this.options ) {
			if ( this.options.hasOwnProperty(opt) ) {
				self.setUIOption(opt, this.options[opt]);
			}
		}

	};

	/**
	 * Set a config option from the UI
	 *
	 * @param {HTMLElement} el
	 */
	this.setOptionFromUI = function(el) {
		var $el = $(el),
			val = $el.val();

		if ( $el.is("[type=checkbox]") ) {
			val = $el.prop("checked");
		}

		self.setOption($el.data("option"), val);
	};


	/**
	 * Load a data file and fire an optional callback.
	 * The data file is assumed to be a CSV list of words and will be
	 * split in to an array of words and appended to the main data key
	 *
	 * @param {string} language Language to load
	 * @param {Function} [callback] optional callback
	 */
	this.loadData = function(language, callback) {

		$.get("data/" + language + ".txt", function(content, textStatus) {

			if (!self.wordlists[language]) {
				self.wordlists[language] = content.toString().split("\n");
				if (self.wordlists[language][self.wordlists[language].length - 1] === '') {
					self.wordlists[language].pop();
				}
			}
			self.data = self.wordlists[language]

			if ( callback ) {
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
	 * Generate a uniformly distributed random integer using
	 * the crypto API. It will be a number in the range starting
	 * with lower and up to (but without) upper.
	 *
	 * @param {number} lower The lower bound of the range of numbers.
	 * @param {number} upper The upper bound of the range of numbers (not included).
	 */
	this.getUniformRandomInteger = function(lower, upper) {
		lower = Math.round(lower);
		upper = Math.round(upper);

		var difference = upper - lower;

		if (difference <= 0) {
			throw Error("The upper bound is not greater than the lower bound.");
		}

		// get a cryptoObject to access the Crypto-API
		var cryptoObject = window.crypto || window.msCrypto;

		if ((!cryptoObject) || (typeof cryptoObject.getRandomValues !== "function") || (!Uint32Array)) {
			var message = "Your browser has no secure source of random numbers.";
			alert(message)
			throw Error(message);
		}

		var maxUint32 = Math.pow(2, 32) - 1;
		var maxRandomNumber = Math.floor(maxUint32 / difference) * difference;
		var randomArray = new Uint32Array(1);

		/*
		 * Generate random numbers until they are smaller than
		 * maxRandomNumber. This is necessary because if the
		 * number is bigger than maxRandomNumber, the modulo
		 * operator will introduce a bias.
		 */
		do {
			cryptoObject.getRandomValues(randomArray);
		} while (randomArray[0] > maxRandomNumber);

		return lower + (randomArray[0] % difference);
	}


	/**
	 * Retrieve a number of random words from our dataset
	 *
	 * @param {number} n Number of words to get
	 *
	 * @returns {Array}  The array of words
	 */
	this.getRandomWords = function(n) {
		var len = this.data.length,
			rand = this.getUniformRandomInteger(0, len),
			i, word;

		for ( i = 0; i < n; i++ ) {
			word = this.data[rand];
			word = this.options.firstUpper ? word.charAt(0).toUpperCase() + word.slice(1) : word;
			this.words.push(word);
			rand = this.getUniformRandomInteger(0, len);
		}

		return this.words;
	};

	this.calculateEntropy = function(words) {
		return Math.floor(Math.log(Math.pow(this.data.length, words))/Math.log(2));
	}

	/**
	 * Generate example passwords:
	 *
	 * Generates passwords with equivalent strengths to
	 * the given number of words.
	 */
	this.generateEquivalentPasswords = function(words) {
		var possibilities = Math.pow(this.data.length, words);

		// lowercase letters
		var lowercasePassword = [];
		var lowercaseLength = Math.floor(Math.log(possibilities)/Math.log(26));
		for (var i = 0; i < lowercaseLength; i++) {
			lowercasePassword.push(this.getUniformRandomInteger(97, 123));
		}
		$("#lcase-password").text(String.fromCharCode.apply(this, lowercasePassword));
		$("#lcase-length").text(lowercaseLength);

		// alphanumeric
		var alphanumPassword = [];
		var alphanumLength = Math.floor(Math.log(possibilities)/Math.log(62));
		for (var i = 0; i < alphanumLength; i++) {
			var character = 91;
			while (((character >= 91) && (character <= 96))
				|| ((character >= 58) && (character <= 64))) {
				character = this.getUniformRandomInteger(48, 123);
			}
			alphanumPassword.push(character);
		}
		$("#alnum-password").text(String.fromCharCode.apply(this, alphanumPassword));
		$("#alnum-length").text(alphanumLength);

		// printable ascii
		var asciiPassword = [];
		var asciiLength = Math.floor(Math.log(possibilities)/Math.log(94));
		for (var i = 0; i < asciiLength; i++) {
			asciiPassword.push(this.getUniformRandomInteger(33, 127));
		}
		$("#ascii-password").text(String.fromCharCode.apply(this, asciiPassword));
		$("#ascii-length").text(asciiLength);
	}


	/**
	 * Generate a password
	 */
	this.generate = function() {
		$('#wordlist-size').text(this.data.length);

		this.words = [];

		this.options.minWords = parseInt(this.options.minWords, 10) || this.defaults.minWords;
		this.options.language = this.options.language || this.defaults.language;

		this.fullPassword = this.getWords();

		this.ui.$passwordBox.val(this.fullPassword).trigger("change");
		$("#display-entropy").text(this.calculateEntropy(this.options.minWords));
		this.generateEquivalentPasswords(this.options.minWords);

		return this.fullPassword;
	};


	/**
	 * Get words from the wordlist
	 *
	 * @param    {number}    [numWords]    Number of words to get
	 */
	this.getWords = function(numWords) {
		var fullword;

		if ( numWords === undefined ) {
			numWords = this.options.minWords;
		}

		this.getRandomWords(numWords);

		//generate a full string to test against min length
		fullword = this.words.join(this.options.separator);

		return fullword;
	};

	/**
	 * Convert a string to an array of characters
	 *
	 * @param {string} str The string
	 * @returns {(Array|boolean)}  Array of characters
	 */
	this.stringToArray = function(str) {
		var chars = [],
			i = 0,
			len = str.length || 0,
			theChar = "";

		if ( typeof(str) !== "string" && len === 0 ) {
			return false;
		}

		for ( i; i < len; i++ ) {
			theChar = str.substring(i, i + 1);
			chars.push(theChar);
		}
		return chars;
	};

	/**
	 * Bind all UI related events
	 */
	this.bindEvents = function() {
		var clickEvent = !!("ontouchstart" in window) ? "touchend" : "click";

		//Update options when UI is updated
		$("[data-option]").on("keyup change", function() {
			self.setOptionFromUI(this);
		});

		this.ui.$btnGenerate.on(clickEvent + " keypress", function() {
			self.loadData(self.options.language || self.defaults.language, function () {
				self.generate();
			})
		});

		this.ui.$passwordBox.on("keyup change", function() {
			$(this).parent().find("em").html($(this).val().length);
		});

		// Update the saveOptions option
		$("#save-options").on("change", function() {
			if ( $(this).prop("checked") === true ) {
				self.saveOptions();
			}
			// If we no longer wish to save, destroy our LS entry
			else {
				self.destroyOptions();
			}

		});

		$(".fieldset")
			.on(clickEvent, "legend", function() {
			$(this).closest(".fieldset").toggleClass("active");
		});

	};


	/**
	 * Initialize this horse
	 */
	this.init = function() {

		// Load options from the LocalStorage if present
		if ( this.storage && this.storage.getItem(this.config.storageKey) ) {
			try {
				this.options = JSON.parse(this.storage.getItem(this.config.storageKey));
				this.setAllUIOptions();

			} catch ( e ) {
				console.log("Could not parse settings from LocalStorage");
			}

		}

		// no local storage available, read the options from the UI
		else {
			$("[data-option]").each(function() {
				self.setOptionFromUI(this);
			});
		}


		// Load the default words
		this.loadData(this.options.language || this.defaults.language, function() {
			self.generate();
		});

		// Bind Events
		this.bindEvents();
	};


	this.init();

	return this;

}

// Set up for AMD inclusion
if (typeof define === "function") {
	define(["jquery"], function() {
		"use strict";
		return CorrectHorseBatteryStaple;
	});
}
else {
	window.CHBS = new CorrectHorseBatteryStaple();
}

/*
 This software is licensed under the MIT License:

 Copyright (c) 2013, John Van Der Loo
 Copyright (c) 2016, Max Bruckner

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
