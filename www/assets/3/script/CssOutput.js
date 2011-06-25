spriteCow.CssOutput = (function() {
	function bgPosVal(offset) {
		if (offset) {
			return ' -' + offset + 'px';
		}
		return ' 0';
	}
	
	function CssOutput($appendTo) {
		this._$container = $('<code class="css-output">\n\n\n\n\n</code>').appendTo( $appendTo );
		this.backgroundFileName = '';
		this.path = 'imgs/';
		this.rect = new spriteCow.Rect(0, 0, 0, 0);
		this.useTabs = true;
		this.useBgUrl = true;
		this.selector = '.sprite';
	}
	
	var CssOutputProto = CssOutput.prototype;
	
	CssOutputProto.update = function() {
		var indent = this.useTabs ? '\t' : '    ',
			rect = this.rect,
			$container = this._$container;
		
		$container.empty()
			.append( $('<span class="selector"/>').text(this.selector) )
			.append(' {\n');
		
		if (this.useBgUrl && this.backgroundFileName) {
			$container.append( indent + "background: url('" )
				.append( $('<span class="path"/>').text( this.path ) )
				.append( $('<span class="file"/>').text( this.backgroundFileName ) )
				.append("') no-repeat");
		}
		else {
			$container.append( indent + "background-position:" );
		}
		
		$container.append(
			bgPosVal(rect.x) + bgPosVal(rect.y) + ';\n' +
			indent + 'width: ' + rect.width + 'px;\n' +
			indent + 'height: ' + rect.height + 'px;\n' +
			'}'
		);
		
	};
	
	return CssOutput;
})();

