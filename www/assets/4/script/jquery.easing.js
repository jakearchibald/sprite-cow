$.extend( $.easing, {
	easeInQuad: function ( x, t, b, c, d ) {
		return c * ( t /= d ) * t + b;
	},
	easeOutQuad: function ( x, t, b, c, d ) {
		return -c * ( t /= d ) * ( t - 2 ) + b;
	}
});