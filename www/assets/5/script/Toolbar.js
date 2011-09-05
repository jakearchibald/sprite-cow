spriteCow.Toolbar = (function() {
	function SpriteCowToolbar($appendToElm) {
		var toolbar = this,
			$container = $('' +
				'<div class="toolbar">' +
					'<div role="button" class="open-img"><div>Open</div></div>' +
					'<div role="button" class="no-label reload-img"><div>Reload current image</div></div>' +
					'<div role="button" class="select-sprite active"><div>Select Sprite</div></div>' +
					'<div role="button" class="pick-bg"><div>Pick Background</div></div>' +
					'<div role="button" class="no-label invert-bg"><div>Toggle Dark Background</div></div>' +
					'<span class="feedback"></span>' +
				'</div>' +
			'').appendTo( $appendToElm ),
			$children = $container.children(),
			toolNames = [
				'openImg',
				'reloadImg',
				'selectSprite',
				'selectBg',
				'invertBg',
			];
			
		toolNames.forEach(function(toolName, i) {
			// avoiding jquery's event system so file dialogs can be launched
			$children.eq(i).click(function(event) {
				toolbar.trigger(toolName);
				event.preventDefault();
			});
		});
		
		$container.delegate('div[role=button]', 'mouseenter', function() {
			var $button = $(this);
			toolbar.feedback( $button.hasClass('no-label') ? $button.text() : '' );
		});
		
		toolbar._$feedback = $children.slice(-1);
		toolbar._toolNames = toolNames;
		toolbar._$children = $children;
		toolbar.$container = $container;
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
			$feedback.css('font-weight', 'bold')
			
			if ($.support.transition) {
				$feedback.transition({ color: 'red' }, {
					duration: 3000
				});
			}
			else {
				$feedback.css('color', 'red');
			}
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
		this._$children.eq( this._toolNames.indexOf(toolName) )
			.addClass('active');
			
		return this;
	};
	
	SpriteCowToolbarProto.deactivate = function(toolName) {
		this._$children.eq( this._toolNames.indexOf(toolName) )
			.removeClass('active');
			
		return this;
	};
	
	SpriteCowToolbarProto.isActive = function(toolName) {
		return this._$children.eq( this._toolNames.indexOf(toolName) )
			.hasClass('active');
	};
	
	return SpriteCowToolbar;
})();
	
	