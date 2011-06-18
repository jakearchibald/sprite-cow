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
		this.path = 'images/';
		this.rect = new spriteCow.Rect(0, 0, 0, 0);
		this.useTabs = true;
		this.useBgUrl = true;
		this.selector = '.sprite';
	}
	
	var CssOutputProto = CssOutput.prototype;
	
	CssOutputProto.update = function() {
		var indent = this.useTabs ? '\t' : '    ',
			rect = this.rect,
			output = this.selector + ' {\n';
			
		if (this.useBgUrl && this.backgroundFileName) {
			output += indent + "background: url('" + this.path + this.backgroundFileName + "') no-repeat";
		}
		else {
			output += indent + "background-position:";
		}
		
		output += bgPosVal(rect.x) + bgPosVal(rect.y) + ';\n';
		output += indent + 'width: ' + rect.width + 'px;\n';
		output += indent + 'height: ' + rect.height + 'px;\n';
		output += '}';
		
		this._$container.text(output);
	};
	
	return CssOutput;
})();

