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
	function tableLayout() {
		testElm.style.display = 'table';
		return testElm.style.display === 'table';
	}
	
	var featureTests = new spriteCow.FeatureTest( $('.feature-test') );
	featureTests.addResult( canvas(), '<canvas> element' );
	featureTests.addResult( fileApi(), 'File & FileReader' );
	featureTests.addResult( w3EventListeners(), 'addEventListener on elements' );
	featureTests.addResult( tableLayout(), 'display: table' );
	//featureTests.addResult( false, 'Random failure' );
	
	return featureTests;
})();