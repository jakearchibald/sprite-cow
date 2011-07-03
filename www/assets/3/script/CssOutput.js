spriteCow.CssOutput = (function() {
	function bgPosVal(offset) {
		if (offset) {
			return ' -' + offset + 'px';
		}
		return ' 0';
	}
	
	function CssOutput($appendTo) {
		var $container = $('<div class="css-output"></div>').appendTo( $appendTo );
		this._$container = $container;
		this._$code = $('<code>\n\n\n\n\n</code>').appendTo( $container );
		this.backgroundFileName = '';
		this.path = 'cssOutputPath' in localStorage ? localStorage.getItem('cssOutputPath') : 'imgs/';
		this.rect = new spriteCow.Rect(0, 0, 0, 0);
		this.useTabs = true;
		this.useBgUrl = true;
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
		
		$code.append(
			bgPosVal(rect.x) + bgPosVal(rect.y) + ';\n' +
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

