spriteCow.CssOutput = (function() {
	function bgPixelVal(offset) {
		if (offset) {
			return ' -' + offset + 'px';
		}
		return ' 0';
	}

	function bgPercentVal(offset) {
		if (offset) {
			return ' ' + round(offset * 100, 3) + '%';
		}
		return ' 0';
	}

	function round(num, afterDecimal) {
		var multiplier = Math.pow(10, afterDecimal || 0);
		return Math.round(num * multiplier) / multiplier;
	}
	
	function CssOutput($appendTo) {
		var $container = $('<div class="css-output"></div>').appendTo( $appendTo );
		this._$container = $container;
		this._$code = $('<code>\n\n\n\n\n</code>').appendTo( $container );
		this.backgroundFileName = '';
		this.path = 'cssOutputPath' in localStorage ? localStorage.getItem('cssOutputPath') : 'imgs/';
		this.rect = new spriteCow.Rect(0, 0, 0, 0);
		this.imgWidth = 0;
		this.imgHeight = 0;
		this.useTabs = true;
		this.useBgUrl = true;
		this.percentPos = false;
		this.selector = '.sprite';
		this._addEditEvents();
	}
	
	var CssOutputProto = CssOutput.prototype;
	
	CssOutputProto.update = function() {
		var indent = this.useTabs ? '\t' : '    ',
			rect = this.rect,
			$code = this._$code,
			$file;
		
		$code.empty()
			.append( $('<span class="selector"/>').text(this.selector) )
			.append(' {\n');
		
		if (this.useBgUrl && this.backgroundFileName) {
			$code.append( indent + "background: url('" );
			$file = $('<span class="file"/>')
				.append( $('<span class="file-path"/>').text( this.path ) )
				.append( $('<span class="file-name"/>').text( this.backgroundFileName ) );
			
			$code.append( $file ).append( "') no-repeat" );
		}
		else {
			$code.append( indent + "background-position:" );
		}

		if (this.percentPos) {
			$code.append(
				bgPercentVal( rect.x / -(rect.width - this.imgWidth) ) +
				bgPercentVal( rect.y / -(rect.height - this.imgHeight) ) +
				';\n'
			);
		}
		else {
			$code.append( bgPixelVal(rect.x) + bgPixelVal(rect.y) + ';\n' );
		}
		
		$code.append(
			indent + 'width: ' + rect.width + 'px;\n' +
			indent + 'height: ' + rect.height + 'px;\n' +
			'}'
		);
	};
	
	CssOutputProto._addEditEvents = function() {
		var cssOutput = this,
			$container = cssOutput._$container,
			$input = $('<input type="text"/>').appendTo( $container ).hide(),
			inputTopPadding  = parseInt( $input.css('padding-top') ),
			inputTopBorder   = parseInt( $input.css('border-top-width') ),
			inputLeftPadding = parseInt( $input.css('padding-left') ),
			inputLeftBorder  = parseInt( $input.css('border-left-width') ),
			isEditingPath;
		
		$input.hide();
		
		$container.delegate('.file', 'click', function() {
			var $path = $(this).find('.file-path'),
				position = $path.position();
				
			if (isEditingPath) { return; }
			isEditingPath = true;
			
			$input.show().css({
				top:  position.top  - inputTopPadding  - inputTopBorder,
				left: position.left - inputLeftPadding - inputLeftBorder,
				width: Math.max( $path.width(), 50 )
			}).val( $path.text() ).focus();
		});
		
		function endPathEdit() {
			var newVal = $input.val();
			$input.hide();
			cssOutput.path = newVal;
			cssOutput.update();
			localStorage.setItem('cssOutputPath', newVal);
			isEditingPath = false;
		}
		
		$input.blur(endPathEdit).keyup(function(event) {
			if (event.keyCode === 13) {
				$input.blur();
				event.preventDefault();
			}
		});
	};
	
	return CssOutput;
})();

