spriteCow.CssOutput = (function() {
	function pxVal(val) {
		val = Math.round(val);
		return val ? val + 'px' : '0';
	}

	function bgPercentVal(offset) {
		if (offset) {
			return round(offset * 100, 3) + '%';
		}
		return '0';
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
		this.scaledWidth = 0;
		this.scaledHeight = 0;
		this.useTabs = true;
		this.useBgUrl = true;
		this.percentPos = false;
		this.bgSize = false;
		this.selector = '.sprite';
		this._addEditEvents();
	}
	
	var CssOutputProto = CssOutput.prototype;
	
	CssOutputProto.update = function() {
		var indent = this.useTabs ? '\t' : '    ';
		var rect = this.rect;
		var $code = this._$code;
		var widthMultiplier = this.bgSize ? this.scaledWidth / this.imgWidth : 1;
		var heightMultiplier = this.bgSize ? this.scaledHeight / this.imgHeight : 1;
		var $file;
		
		$code.empty()
			.append( $('<span class="selector"/>').text(this.selector) )
			.append(' {\n');
		
		if (this.useBgUrl && this.backgroundFileName) {
			$code.append( indent + "background: url('" );
			$file = $('<span class="file"/>')
				.append( $('<span data-inline-edit="file-path"/>').text( this.path ) )
				.append( $('<span class="file-name"/>').text( this.backgroundFileName ) );
			
			$code.append( $file ).append( "') no-repeat " );
		}
		else {
			$code.append( indent + "background-position: " );
		}

		if (this.percentPos) {
			$code.append(
				bgPercentVal( rect.x / -(rect.width - this.imgWidth) ) + ' ' +
				bgPercentVal( rect.y / -(rect.height - this.imgHeight) ) + ';\n'
			);
		}
		else {
			$code.append(
				pxVal(-rect.x * widthMultiplier) + ' ' +
				pxVal(-rect.y * heightMultiplier) + ';\n'
			);
		}

		if (this.bgSize) {
			$code.append(
				indent + 'background-size: ' +
				pxVal(this.scaledWidth) + ' ' +
				pxVal(this.scaledHeight) + ';\n'
			);
		}
		
		$code.append(
			indent + 'width: ' + pxVal(rect.width * widthMultiplier) + ';\n' +
			indent + 'height: ' + pxVal(rect.height * heightMultiplier) + ';\n' +
			'}'
		);
	};
	
	CssOutputProto._addEditEvents = function() {
		var cssOutput = this;

		new spriteCow.InlineEdit( cssOutput._$container ).bind('file-path', function(event) {
			var newVal = event.val;
			cssOutput.path = newVal;
			cssOutput.update();
			localStorage.setItem('cssOutputPath', newVal);
		});
	};
	
	return CssOutput;
})();

