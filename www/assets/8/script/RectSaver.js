spriteCow.RectSaver = (function() {
	function RectSaver(canvas) {
		this._canvas = $('canvas', canvas).get(0);
		this._context = this._canvas.getContext('2d');
	}

	var RectSaverProto = RectSaver.prototype;

	RectSaverProto.save = function(rect) {
		// Retrieve the area of canvas drawn on.
		var imageData = this._context.getImageData(rect.x, rect.y, rect.width, rect.height);

		// Create a new canvas and put the retrieve image data on it
		var newCanvas = document.createElement("canvas");
		newCanvas.width = rect.width;
		newCanvas.height = rect.height;

		newCanvas.getContext('2d').putImageData(imageData, 0, 0);
		Canvas2Image.saveAsPNG(newCanvas);
	}
	
	return RectSaver;
})();