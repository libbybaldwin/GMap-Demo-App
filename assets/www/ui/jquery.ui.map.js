 /*!
 * jQuery UI Google Map 2.0
 * http://code.google.com/p/jquery-ui-map/
 *
 * Copyright (c) 2010 - 2011 Johan Säll Larsson
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
 */

( function($) {
	
	jQuery.fn.extend( {
		
		click: function(callback) { 
			return this.addEventListener('click', callback);
		},
		
		rightclick: function(callback) {
			return this.addEventListener('rightclick', callback);
		},
		
		dblclick: function(callback) {
			return this.addEventListener('dblclick', callback);
		},
		
		mouseover: function(callback) {
			return this.addEventListener('mouseover', callback);
		},
		
		mouseout: function(callback) {
			return this.addEventListener('mouseout', callback);
		},
		
		drag: function(callback) {
			return this.addEventListener('drag', callback );
		},
		
		dragend: function(callback) {
			return this.addEventListener('dragend', callback );
		},
		
		triggerEvent: function(type) {
			google.maps.event.trigger(this.get(0), type);		
		},
		
		addEventListener: function(type, callback) {
			if ( google.maps && this.get(0) instanceof google.maps.MVCObject ) {
				google.maps.event.addListener(this.get(0), type, callback );
			} else {
				this.bind(type, callback);	
			}
			return this;
		}
		
	});
	
	$.widget( "ui.gmap", {
			
			options: {
				backgroundColor : null,
				center: ( google.maps ) ? new google.maps.LatLng(0.0, 0.0) : null,
				disableDefaultUI: false,
				disableDoubleClickZoom: false,
				draggable: true,
				draggableCursor: null,
				draggingCursor: null,
				keyboardShortcuts: true,
				mapTypeControl: true,
				mapTypeControlOptions: null,
				mapTypeId: ( google.maps ) ? google.maps.MapTypeId.ROADMAP : null,
				navigationControl: true,
				navigationControlOptions: null,
				noClear: false,
				scaleControl: false,
				scaleControlOptions: null,
				scrollwheel: false,
				streetViewControl: true,
				streetViewControlOptions: null,
				zoom: 5,
				callback: null
			},
			
			_create: function() {
				$.ui.gmap.instances[this.element.attr('id')] = { map: new google.maps.Map( this.element[0], this.options ), markers: [], bounds: null, services: [] };
			},
			
			_init: function() {
				$.ui.gmap._trigger(this.options.callback, this.getMap() );
				return $(this.getMap());
			},
			
			_setOption: function(key, value) {
				$.Widget.prototype._setOption.apply(this, arguments);
				this.getMap().setOptions(this.options);
			},
			
			/**
			 * Adds a LatLng to the bounds.
			 */
			addBounds: function(latLng) {
				var instances = $.ui.gmap.instances[this.element.attr('id')];
				if ( !instances.bounds ) {
					instances.bounds = new google.maps.LatLngBounds(); 
				}
				instances.bounds.extend(latLng);
				instances.map.fitBounds(instances.bounds);
			},
			
			/**
			 * Adds a control to the map
			 * @param panel:jQuery/Node/String
			 * @param position:google.maps.ControlPosition, http://code.google.com/intl/sv-SE/apis/maps/documentation/javascript/reference.html#ControlPosition
			 */
			addControl: function(panel, position) {
				this.getMap().controls[position].push($.ui.gmap._unwrap(panel));
			},
			
			/**
			 * Adds a Marker to the map
			 * @param opts:google.maps.MarkerOptions, http://code.google.com/intl/sv-SE/apis/maps/documentation/javascript/reference.html#MarkerOptions
			 * @param callback:function(map:google.maps.Map, marker:Marker)
			 * @return $(google.maps.Marker)
			 */
			addMarker: function(opts, callback) {
				var marker = new google.maps.Marker( jQuery.extend( { 'map': this.getMap(), 'bounds':false }, opts) );
				this.getMarkers().push( marker );
				if ( marker.bounds ) {
					this.addBounds(marker.getPosition());
				}
				$.ui.gmap._trigger(callback, this.getMap(), marker );
				return $(marker);
			},
			
			/**
			 * Adds an InfoWindow to the map
			 * @param opts:google.maps.InfoWindowOptions, http://code.google.com/intl/sv-SE/apis/maps/documentation/javascript/reference.html#InfoWindowOptions
			 * @param callback:function(InfoWindow:google.maps.InfoWindowOptions)
			 * @return $(google.maps.InfoWindowOptions)
			 */
			addInfoWindow: function(opts, callback) {
				var iw = new google.maps.InfoWindow(opts);
				$.ui.gmap._trigger(callback, iw);
				return $(iw);
			},
			
			/**
			 * Computes directions between two or more places.
			 * @param request:google.maps.DirectionsRequest, http://code.google.com/intl/sv-SE/apis/maps/documentation/javascript/reference.html#DirectionsRequest
			 * @param opts:google.maps.DirectionsRendererOptions, http://code.google.com/intl/sv-SE/apis/maps/documentation/javascript/reference.html#DirectionsRendererOptions
			 * @param callback:function(success:boolean, result:google.maps.DirectionsResult), http://code.google.com/intl/sv-SE/apis/maps/documentation/javascript/reference.html#DirectionsResult
			 */
			displayDirections: function(request, opts, callback) { 
				var instance = $.ui.gmap.instances[this.element.attr('id')];
				if ( !instance.services.DirectionsService ) {
					instance.services.DirectionsService = new google.maps.DirectionsService();
				}
				if ( !instance.services.DirectionsRenderer ) {
					instance.services.DirectionsRenderer = new google.maps.DirectionsRenderer();
				}
				instance.services.DirectionsRenderer.setOptions(jQuery.extend({'map': instance.map}, opts));
				instance.services.DirectionsService.route( request, function(result, status) {
					if ( status === google.maps.DirectionsStatus.OK ) {
						if ( opts.panel ) {
							instance.services.DirectionsRenderer.setDirections(result);
						}
					} else {
						instance.services.DirectionsRenderer.setMap(null);
					}
					$.ui.gmap._trigger(callback, ( status === google.maps.DirectionsStatus.OK ), result);
				});
			},
			
			/**
			 * Displays the panorama for a given LatLng or panorama ID.
			 * @param panel:jQuery/String/Node
			 * @param opts?:google.maps.StreetViewPanoramaOptions, http://code.google.com/intl/sv-SE/apis/maps/documentation/javascript/reference.html#StreetViewPanoramaOptions
			 */
			displayStreetView: function(panel, opts) {
				var instance = $.ui.gmap.instances[this.element.attr('id')];
				instance.services.StreetViewPanorama = new google.maps.StreetViewPanorama($.ui.gmap._unwrap(panel), opts);
				instance.map.setStreetView(instance.services.StreetViewPanorama);
			},
			
			/**
			 * Returns the marker(s) with a specific property and value, e.g. 'category', 'airports'
			 * @param property:String - the property to search within
			 * @param value:String - the query
			 * @param callback:function(found:boolean, marker:google.maps.Marker)
			 */
			findMarker : function(property, value, callback) {
				$.each( this.getMarkers(), function(i, marker) {
					$.ui.gmap._trigger(callback, ( marker[property] === value ), marker);
				});
			},
			
			/**
			 * Extracts meta data from the HTML
			 * @param type:String - rdfa, microformats or microdata 
			 * @param ns:String - the namespace
			 * @param callback:function(item:jQuery, result:Array<String>)
			 */
			loadMetadata: function(type, ns, callback) { 
				if ( type === 'rdfa' ) {
					$.ui.gmap.rdfa(ns, callback);
				} else if ( type === 'microformat') {
					$.ui.gmap.microformat(ns, callback);
				} else if ( type === 'microdata') {
					$.ui.gmap.microdata(ns, callback);
				}
			},
			
			/**
			 * Adds fusion data to the map.
			 * @param opts:google.maps.FusionTablesLayerOptions, http://code.google.com/intl/sv-SE/apis/maps/documentation/javascript/reference.html#FusionTablesLayerOptions
			 */
			loadFusion: function(opts) {
				var instance = $.ui.gmap.instances[this.element.attr('id')];
				if ( !instance.services.FusionTablesLayer ) {
					instance.services.FusionTablesLayer = new google.maps.FusionTablesLayer();
				}
				instance.services.FusionTablesLayer.setOptions(opts);
				instance.services.FusionTablesLayer.setMap(this.getMap());
			},
			
			/**
			 * Adds markers from KML file or GeoRSS feed
			 * @param id:String - an identifier for the RSS e.g. 'rss_dogs'
			 * @param url:String - URL to feed
			 * @param opts:google.maps.KmlLayerOptions, http://code.google.com/intl/sv-SE/apis/maps/documentation/javascript/reference.html#KmlLayerOptions
			 */
			loadKML: function(id, url, opts) {
				var instance = $.ui.gmap.instances[this.element.attr('id')];
				if ( !instance.services[id] )
					instance.services[id] = new google.maps.KmlLayer(url, jQuery.extend({'map': instance.map }, opts)); 
			},
			
			/**
			 * A service for converting between an address and a LatLng.
			 * @param request:google.maps.GeocoderRequest
			 * @param callback:function(success:boolean, result:google.maps.GeocoderResult), http://code.google.com/intl/sv-SE/apis/maps/documentation/javascript/reference.html#GeocoderResult
			 */
			search: function(request, callback) {
				var instance = $.ui.gmap.instances[this.element.attr('id')];
				if ( !instance.services.Geocoder ) {
					instance.services.Geocoder = new google.maps.Geocoder();
				}
				instance.services.Geocoder.geocode( request, function(result, status) {
					$.ui.gmap._trigger(callback, ( status === google.maps.GeocoderStatus.OK ), result);
				});
			},
			
			/**
			 * Returns the map.
			 * @return google.maps.Map
			 */
			getMap: function() {
				return $.ui.gmap.instances[this.element.attr('id')].map;
			},
			
			/**
			 * Returns all markers.
			 * @return Array<google.maps.Marker>
			 */
			getMarkers: function() {
				return $.ui.gmap.instances[this.element.attr('id')].markers;
			},
			
			/**
			 * Returns a service by its service name
			 * @param id:string
			 */
			getService: function(id) {
				return $.ui.gmap.instances[this.element.attr('id')].services[id];
			},
			
			/**
			 * Clears all the markers and added event listeners.
			 */
			clearMarkers: function() {
				$.each( this.getMarkers(), function(i,m) {
					google.maps.event.clearInstanceListeners(m);
					m.setMap(null);
					m = null;
				});
				$.ui.gmap.instances[this.element.attr('id')].markers = [];
			},
			
			/**
			 * Destroys the plugin.
			 */
			destroy: function() {
				this.clearMarkers();
				google.maps.event.clearInstanceListeners(this.getMap());
				$.each($.ui.gmap.instances[this.element.attr('id')].services, function (i, obj) {
					obj = null;
				});
				$.Widget.prototype.destroy.call( this );
			}
			
	});

	$.extend($.ui.gmap, {
        
		version: "2.0",
		instances: [],
		
		_trigger: function(callback) {
			if ( $.isFunction(callback) ) {
				callback.apply(this, Array.prototype.slice.call(arguments, 1));
			}
		},
		
		_unwrap: function unwrap(obj) {
			if ( !obj ) {
				return null;
			} else if ( obj instanceof jQuery ) {
				return obj[0];
			} else if ( obj instanceof Object ) {
				return obj;
			}
			return document.getElementById(obj);
		}
			
	});

} (jQuery) );