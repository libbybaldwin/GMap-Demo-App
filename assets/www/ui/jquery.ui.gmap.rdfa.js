 /*!
 * jQuery UI Google Maps 2.0
 * http://code.google.com/p/jquery-ui-map/
 *
 * Copyright (c) 2010 Johan Säll Larsson
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

	jQuery.fn.extend({
	
		items: getItems
	
	});
	
	function splitTokens(s) {
		if (s && /\S/.test(s))
		  return s.replace(/^\s+|\s+$/g,'').split(/\s+/);
		return [];
	}
	
	function getItems(types) {
		var selector = jQuery.map(splitTokens(types), function(t) {
			return '[typeof~="'+t.replace(/"/g, '\\"')+'"]';
		}).join(',') || '*';
		// filter results to only match top-level items
		// because [attr] selector doesn't work in IE we have to
		// filter the elements. http://dev.jquery.com/ticket/5637
		return jQuery(selector, this).filter(function() {
			return (this.getAttribute('typeof') != null);
		});
	}

	
	function getItem(node, list) {
		
		node.children().each(function() {
			
			var childNode = $(this);
			var property = childNode.attr('property');
			
			if ( property != undefined && property != null && property != '' && typeof property == 'string' ) {
				if ( !list[property] ) {
					list[property] = {};
				}
				if ( childNode.attr('content') != undefined ) {
					list[property].content = childNode.attr('content');
				}
				if ( childNode.attr('href') != '' ) {
					list[property].href = childNode.attr('href');
				}
				if ( childNode.attr('rel') != undefined ) {
					list[property].rel = childNode.attr('rel');
				}
				if ( childNode.attr('src') != undefined ) {
					list[property].src = childNode.attr('src');
				}
				if ( childNode.text() != '' ) {
					list[property].text = childNode.text();
				}
			}
			
			getItem(childNode, list);
			
		});
		
		return list;
		
	}
	
	$.extend($.ui.gmap, {
  		
		rdfa: function(ns, callback) {
			
			var items = jQuery(document).items(ns);
			//console.log(items);
			items.each(function(i, node) {
				var item = getItem($(node), []);
				$.ui.gmap._trigger(callback, i, $(node), item);
				//console.log(item);
			});
	
		}
		
	});

} (jQuery) );