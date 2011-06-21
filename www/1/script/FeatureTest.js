spriteCow.FeatureTest = (function() {
	function FeatureTest($appendTo) {
		var $container = $('<div class="feature-test-results" />'),
			$results = $('<ul/>');
		
		this._$container = $container.appendTo($appendTo);
		this._$results = $results.appendTo($container);
		this.allPassed = true;
	}
	
	var FeatureTestProto = FeatureTest.prototype;
	
	FeatureTestProto.addResult = function(pass, msg) {
		this.allPassed = this.allPassed && pass;
		
		$('<li/>').text(msg).prepend( pass ? '<span class="pass">pass</span> ' : '<span class="fail">fail</span> ' )
			.appendTo( this._$results );
	};
	
	return FeatureTest;
})();