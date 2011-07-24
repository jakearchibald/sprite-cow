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
	
	if ($.browser.opera) { // I feel dirty
		docElm.className += ' opera';
		//featureTests.addResult( false, 'Transition issues (Hope to work around these soon)' );	
	}
	
	return featureTests;
})(document);