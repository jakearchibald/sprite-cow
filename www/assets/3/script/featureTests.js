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
	featureTests.addResult( $.support.transition, 'CSS3 transitions' );
	
	if ($.browser.opera) { // I feel dirty
		featureTests.addResult( false, "Survives jQuery's attempt to break backgrounds on <body>" );	
		featureTests.addResult( false, 'Opening file dialog from click() listeners' );	
		featureTests.addResult( false, 'General layout & transition issue (Hope to work around these soon)' );	
	}
	
	return featureTests;
})();