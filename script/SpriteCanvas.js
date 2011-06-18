spriteCow.SpriteCanvas = (function() {
	function pixelsEquivalent(pixels1, offset1, pixels2, offset2) {
		if ( pixels1[offset1 + 3] === 0 && pixels2[offset2 + 3] === 0 ) {
			// if both have alpha zero, they're the same
			return true;
		}
		// otherwise only true if both pixels have equal RGBA vals
		for (var i = 4; i--;) if ( pixels1[offset1 + i] !== pixels2[offset2 + i] ) {
			return false;
		}
		return true;
	};
	
	function allArrayOrTrue(arr1, arr2) {
		for (var i = arr1.length; i--;) if ( !( arr1[i] || arr2[i] ) ) {
			return false;
		}
		return true;
	}
	
	function allArrayFalse(arr1) {
		for (var i = arr1.length; i--;) if ( arr1[i] ) {
			return false;
		}
		return true;
	}
	
	function SpriteCanvas() {
		this.canvas = $('<canvas/>')[0];
		this._bgData = [0, 0, 0, 0];
	}
	
	var SpriteCanvasProto = SpriteCanvas.prototype = new spriteCow.MicroEvent;
	
	SpriteCanvasProto.setImg = function(img) {
		var canvas = this.canvas,
			context = canvas.getContext('2d');
		
		canvas.width = img.width;
		canvas.height = img.height;
		
		context.drawImage(img, 0, 0);
		
		this._img = img;
	};
	
	SpriteCanvasProto.setBg = function(pixelArr) {
		this._bgData = pixelArr;
	};
	
	SpriteCanvasProto.trimBg = function(rect) {
		var edgeBgResult;
		
		rect = this._restrictRectToBoundry(rect);
		
		do {
			edgeBgResult = this._edgesAreBg(rect);
			rect = this._contractRect(rect, edgeBgResult);
		} while ( rect.height && rect.width && !allArrayFalse(edgeBgResult) );
		
		return rect;
	};
	
	SpriteCanvasProto._restrictRectToBoundry = function(rect) {
		var canvas = this.canvas;
		
		rect.x = Math.max(rect.x, 0);
		rect.y = Math.max(rect.y, 0);
		rect.width  = Math.min(rect.width,  canvas.width  - rect.x);
		rect.height = Math.min(rect.height, canvas.height - rect.y);
		return rect;
	}
	
	SpriteCanvasProto.expandToSpriteBoundry = function(rect, callback) {
		var edgeBgResult = this._edgesAreBg(rect),
			edgeBoundsResult = this._edgesAtBounds(rect);
			
		// expand
		while ( !allArrayOrTrue(edgeBgResult, edgeBoundsResult) ) {
			rect = this._expandRect(rect, edgeBgResult, edgeBoundsResult);
			edgeBgResult = this._edgesAreBg(rect);
			edgeBoundsResult = this._edgesAtBounds(rect);
			// callback(); // for debugging
		}
		
		// trim edges of bg
		rect = this._contractRect(rect, edgeBgResult);
		
		return rect;
	};
	
	SpriteCanvasProto._edgesAreBg = function(rect) {
		// look at the pixels around the edges
		var canvas = this.canvas,
			pixels = canvas.getContext('2d').getImageData(rect.x, rect.y, rect.width, rect.height).data;
		
		return [
			this._pixelsContainOnlyBg(pixels, 0, 4, rect.width * 4),
			this._pixelsContainOnlyBg(pixels, (rect.width - 1) * 4, rect.width * 4, pixels.length),
			this._pixelsContainOnlyBg(pixels, rect.width * 4 * (rect.height - 1), 4, pixels.length),
			this._pixelsContainOnlyBg(pixels, 0, rect.width * 4, pixels.length)
		];
	};
	
	SpriteCanvasProto._edgesAtBounds = function(rect) {
		var canvas = this.canvas;
		
		return [
			rect.y === 0,
			rect.x + rect.width === canvas.width,
			rect.y + rect.height === canvas.height,
			rect.x === 0
		];
	};
	
	SpriteCanvasProto._pixelsContainOnlyBg = function(pixels, start, channelInterval, end) {
		var bg = this._bgData;
		
		for (var i = start; i < end; i += channelInterval) {
			if ( !pixelsEquivalent(bg, 0, pixels, i) ) {
				return false;
			}
		}
		return true;
	};
	
	SpriteCanvasProto._expandRect = function(rect, edgeBgResult, edgeBoundsResult) {
		if ( !edgeBgResult[0] && !edgeBoundsResult[0] ) {
			rect.y--;
			rect.height++;
		}
		if ( !edgeBgResult[1] && !edgeBoundsResult[1] ) {
			rect.width++;
		}
		if ( !edgeBgResult[2] && !edgeBoundsResult[2] ) {
			rect.height++;
		}
		if ( !edgeBgResult[3] && !edgeBoundsResult[3] ) {
			rect.x--;
			rect.width++;
		}
		
		return rect;
	};
	
	SpriteCanvasProto._contractRect = function(rect, edgeBgResult) {
		if ( edgeBgResult[0] && rect.height ) {
			rect.y++;
			rect.height--;
		}
		if ( edgeBgResult[1] && rect.width ) {
			rect.width--;
		}
		if ( edgeBgResult[2] && rect.height ) {
			rect.height--;
		}
		if ( edgeBgResult[3] && rect.width ) {
			rect.x++;
			rect.width--;
		}
		
		return rect;
	};
	
	return SpriteCanvas;
})();