spriteCow.Toolbar = (function() {
	function SpriteCowToolbar($appendToElm) {
		var toolbar = this,
			$container = $('' +
				'<div class="toolbar">' +
					'<div role="button" class="open-img"><div>Open</div></div>' +
					'<div role="button" class="select-sprite active"><div>Select Sprite</div></div>' +
					'<div role="button" class="pick-bg"><div>Pick Background</div></div>' +
					'<div role="button" class="copy-css"><div>Copy CSS</div></div>' +
					'<span class="feedback"></span>' +
				'</div>' +
			'').appendTo( $appendToElm ),
			$children = $container.children(),
			toolNames = [
				'openImg',
				'selectSprite',
				'selectBg',
				'copyCss'
			];
			
		toolNames.forEach(function(toolName, i) {
			// avoiding jquery's event system so file dialogs can be launched
			$children.eq(i)[0].addEventListener('click', function(event) {
				toolbar.trigger(toolName);
				event.preventDefault();
			}, false);
		});
		
		toolbar._$feedback = $children.slice(-1);
		toolbar._toolNames = toolNames;
		toolbar._$children = $children;
	}
	
	var SpriteCowToolbarProto = SpriteCowToolbar.prototype = new spriteCow.MicroEvent;
	
	SpriteCowToolbarProto.feedback = function(msg) {
		// opacity 0.999 to avoid antialiasing differences when 1
		this._$feedback.stop(true, true).text(msg).css('opacity', 0.999).animate({
			// should be using delay() here, but http://bugs.jquery.com/ticket/6150 makes it not work
			// need to specify a dummy property to animate, cuh!
			_:0
		}, 3000).animate({
			opacity: 0
		}, 2000);
		
		return this;
	};
	
	SpriteCowToolbarProto.activate = function(toolName) {
		this._$children.removeClass('active')
			.eq( this._toolNames.indexOf(toolName) )
			.addClass('active');
		
	};
	
	return SpriteCowToolbar;
})();
	
	