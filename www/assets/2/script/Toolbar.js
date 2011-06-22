spriteCow.Toolbar = (function() {
	function SpriteCowToolbar($appendToElm) {
		var toolbar = this,
			$container = $('' +
				'<div class="toolbar">' +
					'<div role="button" class="open-img"><div>Select Image</div></div>' +
					'<div role="button" class="select-sprite active"><div>Select Sprite</div></div>' +
					'<div role="button" class="pick-bg"><div>Pick Background</div></div>' +
					'<span class="feedback"></span>' +
				'</div>' +
			'').appendTo( $appendToElm ),
			$children = $container.children(),
			toolNames = [
				'openImg',
				'selectSprite',
				'selectBg'
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
	
	SpriteCowToolbarProto.feedback = function(msg, severe) {
		var $feedback = this._$feedback,
			initialColor = '#555';
		
		// opacity 0.999 to avoid antialiasing differences when 1
		$feedback.transitionStop(true).text(msg).css({
			opacity: 0.999,
			color: initialColor,
			'font-weight': 'normal'
		});
		
		if (severe) {
			$feedback.css('font-weight', 'bold').transition({ color: 'red' }, {
				duration: 3000
			});
		}
		else {
			$feedback.animate({
				// should be using delay() here, but http://bugs.jquery.com/ticket/6150 makes it not work
				// need to specify a dummy property to animate, cuh!
				_:0
			}, 3000);
		}
		
		$feedback.transition({ opacity: 0 }, {
			duration: 2000
		});
		
		return this;
	};
	
	SpriteCowToolbarProto.activate = function(toolName) {
		this._$children.removeClass('active')
			.eq( this._toolNames.indexOf(toolName) )
			.addClass('active');
		
	};
	
	return SpriteCowToolbar;
})();
	
	