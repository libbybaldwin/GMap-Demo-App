 /*!
 * jQuery UI Google Maps 2.0
 * http://code.google.com/p/jquery-ui-map/
 *
 * Copyright (c) 2010-2011 Johan Säll Larsson
 *
 * Microdatajs
 * http://gitorious.org/microdatajs/microdatajs
 * Copyright (c) 2009-2011 Philip Jägenstedt
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
	
		items: getItems,
		itemScope: itemScope,
		itemType: itemType,
		itemId: itemId,
		itemProp: tokenList('itemprop'),
		itemRef: tokenList('itemref'),
		itemValue: itemValue
	
	});
	
	function itemValue() {
		var elm = this.get(0);
		if (this.attr('itemprop') === undefined) {
			return null;
		}
		if (this.itemScope()) {
			return elm;
		}
		switch (elm.tagName.toUpperCase()) {
			case 'META':
				return this.attr('content') || '';
			case 'AUDIO':
			case 'EMBED':
			case 'IFRAME':
			case 'IMG':
			case 'SOURCE':
			case 'VIDEO':
				return resolve(this.attr('src'));
			case 'A':
			case 'AREA':
			case 'LINK':
				return resolve(this.attr('href'));
			case 'OBJECT':
				return resolve(this.attr('data'));
			case 'TIME':
				var datetime = this.attr('datetime');
				if (!(datetime === undefined))
					return datetime;
			default:
				return this.text();
		}
	}
		
	function itemId() {
		return resolve(this.attr('itemid'));
	}
	
	function itemScope() {
		return this.attr('itemscope') != undefined;
	}
	
	function itemType() {
		return this.attr('itemtype') || '';
	}
	
	function splitTokens(s) {
		if (s && /\S/.test(s))
		  return s.replace(/^\s+|\s+$/g,'').split(/\s+/);
		return [];
	 }
	 
	function resolve(url) {
		if (!url)
			return '';
		var img = document.createElement('img');
		img.setAttribute('src', url);
		return img.src;
	}
	
	function getItems(types) {
		var selector = jQuery.map(splitTokens(types), function(t) {
			return '[itemtype~="'+t.replace(/"/g, '\\"')+'"]';
		}).join(',') || '*';
		// filter results to only match top-level items
		// because [attr] selector doesn't work in IE we have to
		// filter the elements. http://dev.jquery.com/ticket/5637
		return jQuery(selector, this).filter(function() {
			return (this.getAttribute('itemscope') != null && this.getAttribute('itemprop') == null);
		});
	}
	
	function tokenList(attr) {
		return function() {
			var tokens = [];
			jQuery.each(splitTokens(this.attr(attr)), function(i, token) {
				if (jQuery.inArray(token, tokens) == -1)
					tokens.push(token);
			});
			return jQuery(tokens);
		};
	}
	
	function getItem($item, list, key, latlngs) {
			
		var result = {};
				
		if ( $item.itemType() ) {
			result.type = $item.itemType();
		}
		
		if ( $item.itemId() ) {
			result.id = $item.itemId();
		}
		
		result.properties = {};
		result.list = list;
		
		$item.children().each(function() {
			
			var $elem = jQuery(this);
			
			var value;
			
			if ( $elem.itemScope() ) {
				value = getItem($elem, list, key, latlngs);
			} else {
				value = $elem.itemValue();
			}
			
			$elem.itemProp().each(function() {
				
				if (!result.properties[this]) {
					result.properties[this] = [];
				}
				
				if ( typeof value != "object" ) {
					result.list[this] = value;
				}

				result.properties[this].push(value);
				
			});
			
			if ( latlngs.length > 0 ) {
				var t = $elem.itemType();
				if ( typeof t == "string" && t.toLowerCase().indexOf('geo') > -1 ) {
					result.properties['geo'][0].properties = latlngs[key];
					result.list['geo'] = new google.maps.LatLng(latlngs[key].latitude[0],latlngs[key].longitude[0]);
				}
			} 
			
		});
		
		return result;
		
	}
	
	function getMetaTag() {
		var latlng = [];
		if ( $.browser.mozilla ) {
			var lats = [];
			var lngs = [];
			var metas = document.getElementsByTagName('meta');
			for ( i = 0; i < metas.length; i++ ) {
				var meta = $(metas[i]);
				if ( meta.attr('itemprop') == 'latitude' ) {
					lats.push(meta.attr('content'));
				} 
				if ( meta.attr('itemprop') == 'longitude' ) {
					lngs.push(meta.attr('content'));
				}
			}
			for ( i = 0; i < lats.length; i++ ) {
				latlng.push({ 'latitude': [lats[i]], 'longitude': [lngs[i]] });
			}
		}
		return latlng;
	}
	
	$.extend($.ui.gmap, {
  		
		version: '1.0',
		
		microdata: function(ns, callback) {
			
			// Mozilla/Firefox adds meta tags in header
			var latlngs = getMetaTag();
			var items = jQuery(document).items(ns);

			items.each(function(i, value) {
				var item = $(value);
				if (item.itemScope()) {
					$.ui.gmap._trigger(callback, i, item, getItem(item, [], i, latlngs));
				}
			});
	
		}
		
	});

} (jQuery) );