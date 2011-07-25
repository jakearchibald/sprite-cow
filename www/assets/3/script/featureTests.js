spriteCow.featureTests = (function(document) {
	var testElm = document.createElement('a'),
		docElm = document.documentElement;
	
	function canvas() {
		return !!document.createElement('canvas').getContext;
	}
	function fileApi() {
		return !!( window.File && window.FileReader );
	}
	function w3EventListeners() {
		return !!testElm.addEventListener;
	}
	
	var featureTests = new spriteCow.FeatureTest( $('.feature-test') );
	
	featureTests.addResult( canvas(), '<canvas> element' );
	featureTests.addResult( fileApi(), 'File & FileReader' );
	featureTests.addResult( w3EventListeners(), 'addEventListener on elements' );
	featureTests.addResult( $.support.transition, 'CSS3 transitions' );
	
	if ($.browser.opera) { // I feel dirty, need these for some CSS tweaks
		docElm.className += ' opera';	
	}
	
	return featureTests;
})(document);