spriteCow.featureTests = (function() {
	var testElm = document.createElement('a');
	
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
	
	if ($.browser.opera) { // I feel dirty
		featureTests.addResult( false, 'Backgrounds on both html & body' );	
		featureTests.addResult( false, 'Opening file dialog from click() events' );	
		featureTests.addResult( false, 'General layout & transition issue (Hope to work around these soon)' );	
	}
	
	return featureTests;
})();