(function($, undefined) {
	/*
		Get a supported css property name for a css property
		Will search common vendor prefixes for supported value.
		
		usage:
			getCssPropertyName('borderRadius');
			// returns...
			// 'borderRadius' if supported, else...
			// 'MozBorderRadius' if supported, else...
			// 'WebkitBorderRadius' if supported, else...
			// etc etc, else ''
	 */
	var easings = {
			easeInQuad: 'cubic-bezier(0.550, 0.085, 0.680, 0.530)',
			easeInCubic: 'cubic-bezier(0.550, 0.055, 0.675, 0.190)',
			easeInQuart: 'cubic-bezier(0.895, 0.030, 0.685, 0.220)',
			easeInQuint: 'cubic-bezier(0.755, 0.050, 0.855, 0.060)',
			easeInSine: 'cubic-bezier(0.470, 0.000, 0.745, 0.715)',
			easeInExpo: 'cubic-bezier(0.950, 0.050, 0.795, 0.035)',
			easeInCirc: 'cubic-bezier(0.600, 0.040, 0.980, 0.335)',
			easeOutQuad: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
			easeOutCubic: 'cubic-bezier(0.215, 0.610, 0.355, 1.000)',
			easeOutQuart: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
			easeOutQuint: 'cubic-bezier(0.230, 1.000, 0.320, 1.000)',
			easeOutSine: 'cubic-bezier(0.390, 0.575, 0.565, 1.000)',
			easeOutExpo: 'cubic-bezier(0.190, 1.000, 0.220, 1.000)',
			easeOutCirc: 'cubic-bezier(0.075, 0.820, 0.165, 1.000)',
			easeInOutQuad: 'cubic-bezier(0.455, 0.030, 0.515, 0.955)',
			easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
			easeInOutQuart: 'cubic-bezier(0.770, 0.000, 0.175, 1.000)',
			easeInOutQuint: 'cubic-bezier(0.860, 0.000, 0.070, 1.000)',
			easeInOutSine: 'cubic-bezier(0.445, 0.050, 0.550, 0.950)',
			easeInOutExpo: 'cubic-bezier(1.000, 0.000, 0.000, 1.000)',
			easeInOutCirc: 'cubic-bezier(0.785, 0.135, 0.150, 0.860)'
		},
		$testElm = $('<b/>'),
		transitionend = 'transitionend webkitTransitionEnd oTransitionEnd',
		getCssPropName = (function() {
			var style = $testElm[0].style,
				prefixes = ['Webkit', 'O', 'ms', 'Moz'],
				cache = {};
	
			return function(propertyName) {
				if ( propertyName in cache ) {
					return cache[propertyName];
				}
	
				var supportedValue = '',
					i = prefixes.length,
					upperCamelPropertyName,
					camelPropertyName = propertyName.replace(/-([a-z])/ig, function( all, letter ) {
						return letter.toUpperCase();
					});
	
				if ( camelPropertyName in style ) {
					supportedValue = propertyName;
				}
				else {
					// uppercase first char
					upperCamelPropertyName = camelPropertyName.slice(0,1).toUpperCase() + camelPropertyName.slice(1);
					while (i--) if ( prefixes[i] + upperCamelPropertyName in style ) {
						supportedValue = (prefixes[i] + upperCamelPropertyName).replace( /([A-Z])/g, '-$1' ).toLowerCase();
						break;
					}
				}
	
				return cache[propertyName] = supportedValue;
			}
		})(),
		transitionProp = getCssPropName('transition');
	
	easings.swing = easings.easeInOutQuart;
	
	/*
		usage:
			$('#blah').transition({
				transform: 'scale(2)'
			});
			
			Only works on browsers that support CSS3 transitions
			
		parameters:
			properties - Properties to animate. Browser prefixes will be used
			             where needed.
			opts - Options
			
		options:
			duration - Lenth of animation in ms
			easing - TODO
			complete - Called when animation completes
			queue - A Boolean indicating whether to place the animation in the
			        effects queue. If false, the animation will begin immediately.
	*/
	$.fn.transition = function(properties, opts) {
		if (!transitionProp) {
			return this.animate(properties, opts);
		}
		
		opts = $.extend({
			duration: 500,
			easing: 'swing',
			complete: $.noop
		}, opts || {});
		
		var translatedProps = {},
			propsStr = '';
			
		$.each(properties, function(key, value) {
			var prop = getCssPropName(key);
			if (prop) {
				translatedProps[prop] = value;
				propsStr += (propsStr ? ',' : '') + prop;				
			}
		});
		
		this.queue(function(next) {
			var $elm = $(this);
			
			function complete() {
				$elm.unbind(transitionend, complete);
				// Opera requires the transition duration set to 0, else transitions remain active *shrugs*
				$elm.css(transitionProp, '').vendorCss('transition-duration', '0');
				opts.complete();
				// need to use set timeout else next animation won't transition
				setTimeout(next,0);
			}
			
			// using setTimeout to let any .css() calls apply, eg $('#blah').css('top', 50).transition({ top: 0 })
			setTimeout(function() {
				$elm.bind(transitionend, complete)
					.css( transitionProp, 'all ' + (+opts.duration/1000) + 's ' + (easings[opts.easing] || opts.easing) )
					.vendorCss('transition-property', propsStr);
					
				// opera needs the new CSS applied after a render
				setTimeout(function() {
					$elm.css(translatedProps);
				}, 0);
			}, 0);
		});
		
		return this;
	};
	
	/*
		usage:
			$('#blah').transitionStop(true)
			
			Works the same as jquery.fn.stop, but for animations started via .transition.
			
			Skip to end not supported yet
	*/
	$.fn.transitionStop = function(clearQueue) {
		return this.stop(clearQueue).vendorCss(transitionProp, '');
	};
	
	/*
		usage:
			$('#blah').vendorCss('border-radius', '10px');
			
			Works as .css, but property names will use vendor prefixes such as -webkit- if needed
	*/
	$.fn.vendorCss = function(prop, value) {
		if (typeof prop == 'object') {
			for (var key in prop) {
				this.vendorCss( key, prop[key] );
			}
			return this;
		}
		prop = getCssPropName(prop);
		return arguments.length > 1 ? this.css(prop, value) : this.css(prop);
	};
	
	$.support.transition = !!transitionProp;
	
})(jQuery);