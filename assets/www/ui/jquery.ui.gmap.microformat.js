 /*!
 * jQuery UI Google Maps 2.0
 * http://code.google.com/p/jquery-ui-map/
 *
 * Copyright (c) 2010-2011 Johan Säll Larsson
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
 *      jquery.ui.core.js
 *      jquery.ui.widget.js
 *		jquery.ui.map.js
 */

( function($) {
	
	/* see http://en.wikipedia.org/wiki/XHTML_Friends_Network */
	var XFN = [ 
		'friend', 
		'contact', 
		'acquaintance'
	];
	
	/* Supported properties */
	var properties = [
		'summary',
		'description',
		'url', 
		'photo',
		'street-address', 
		'postal-code', 
		'locality',
		'region',
		'latitude',
		'longitude',
		'startDate', 
		'dtstart', 
		'endDate', 
		'dtend', 
		'duration', 
		'eventType', 
		'category', 					  		
		'fn',
		'name',
		'nickname', 
		'title', 
		'role',
		'org', 
		'tel',
		'reviewer',
		'dtreviewed',
		'rating'
	];

	
	$.extend($.ui.gmap, {
		
		version: '1.0',
		
		microformat: function(ns, callback) {
			$('.'+ns).each(function(i, node) {
				$.ui.gmap._trigger(callback, i, $(node), getItem($(node), []));
			});
		}
		
	});
	
	function hasProperty(property) {
		for( var i = 0; i < properties.length; i++) {
			if ( properties[i] === property ) {
				return true;
			}
		};
		return false;
	}
	
	function hasXFN(xfn) {
		for( var i = 0; i < XFN.length; i++) {
			if ( XFN[i] === xfn ) {
				return true;
			}
		};
		return false;
	}
	
	function getItem(node, list) {
		
		node.children().each(function() {
			
			var childNode = $(this);
			
			if ( childNode.attr('class') != undefined ) {
				$.each(childNode.attr('class').split(' '), function(i, c) {
					if ( c.length > 0 && hasProperty(c) ) {
						if ( !list[c] ) {
							list[c] = {};
						}
						if ( childNode.attr('id') != '' ) {
							list[c].id = childNode.attr('id');
						}
						if ( childNode.attr('title') != '' ) {
							list[c].title = childNode.attr('title');
						}
						if ( childNode.attr('href') != undefined ) {
							list[c].href = childNode.attr('href');
						}
						if ( childNode.attr('src') != undefined ) {
							list[c].src = childNode.attr('src');
						}
						if ( childNode.text() != '' ) {
							list[c].text = childNode.text();
						}
					}
				});
			}
			
			if ( childNode.attr('rel') != undefined ) {
				$.each(childNode.attr('rel').split(' '), function(i, c) {
					if ( c.length > 0 && hasXFN(c) ) {
						if (!list[c]) {
							list[c] = [];
						}
						list[c].push({ 'text': childNode.text(), 'href': childNode.attr('href') });
					}
				});
			}
			
			getItem(childNode, list);
			
		});
		
		return list;
		
	}

} (jQuery) );