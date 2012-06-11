spriteCow.Toolbar = (function() {
	function SpriteCowToolbar($appendToElm) {
		var toolbar = this,
			$container = $('' +
				'<div class="toolbar">' +
					'<span class="feedback"></span>' +
				'</div>' +
			'').appendTo( $appendToElm );
		
		$container.on('mouseenter', 'div[role=button]', function() {
			var $button = $(this);
			toolbar.feedback( $button.hasClass('no-label') ? $button.text() : '' );
		});

		$container.on('click', 'div[role=button]', function() {
			var $button = $(this),
				toolName = $button.data('toolName'),
				event = new $.Event( toolName );
			
			event.isActive = $button.hasClass('active');

			if ( !toolbar.trigger(event).isDefaultPrevented() ) {
				$button.toggleClass('active');
			}

			event.preventDefault();
		});
		
		toolbar.$container = $container;
		toolbar._$feedback = $container.find('span.feedback');
	}
	
	var SpriteCowToolbarProto = SpriteCowToolbar.prototype = new spriteCow.MicroEvent();
	
	SpriteCowToolbarProto.addItem = function(toolName, text, opts) {
		opts = opts || {};

		var $button = $('<div role="button"/>').addClass(toolName).text(text).data('toolName', toolName);

		if (opts.noLabel) {
			$button.addClass('no-label');
		}
		if (opts.active) {
			$button.addClass('active');
		}

		this._$feedback.before( $button );

		return this;
	};

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
			$feedback.css('font-weight', 'bold');
			
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
		this.$container.find('.' + toolName + '[role=button]').addClass('active');
		return this;
	};
	
	SpriteCowToolbarProto.deactivate = function(toolName) {
		this.$container.find('.' + toolName + '[role=button]').removeClass('active');
		return this;
	};
	
	SpriteCowToolbarProto.isActive = function(toolName) {
		return this.$container.find('.' + toolName + '[role=button]').hasClass('active');
	};
	
	return SpriteCowToolbar;
})();
	
	