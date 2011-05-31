 /*!
 * jQuery UI Google Map 3.0-alpha
 * http://code.google.com/p/jquery-ui-map/
 *
 * Copyright (c) 2010 - 2011 Johan S�ll Larsson
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Depends:
 *      jquery.ui.map.js
 */

( function($) {

	$.extend($.ui.gmap.prototype, {
		 
		/**
		 * Gets the current position
		 * @a: function(status, position)
		 * @b:object, see https://developer.mozilla.org/en/XPCOM_Interface_Reference/nsIDOMGeoPositionOptions
		 */
		getCurrentPosition: function(a, b) {
			if ( navigator.geolocation ) {
				navigator.geolocation.getCurrentPosition ( 
					function(position) {
						$.ui.gmap._trigger(a, "OK", position);
					}, 
					function(error) {
						$.ui.gmap._trigger(a, error, null);
					}, 
					b 
				);	
			} else {
				$.ui.gmap._trigger(a, "NOT_SUPPORTED", null);
			}
		}
	
	});
	
} (jQuery) );
