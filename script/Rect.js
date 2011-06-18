spriteCow.Rect = (function() {
	function Rect(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	
	var RectProto = Rect.prototype;
	
	return Rect;
})();