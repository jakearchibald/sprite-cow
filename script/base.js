(function(document) {
	var MicroEvent = function(){}
	MicroEvent.prototype = {
		bind: function(event, fct){
			this._events = this._events || {};
			this._events[event] = this._events[event]	|| [];
			this._events[event].push(fct);
		},
		unbind: function(event, fct){
			this._events = this._events || {};
			if( event in this._events === false ) { return; }
			this._events[event].splice(this._events[event].indexOf(fct), 1);
		},
		trigger: function(event /* , args... */){
			this._events = this._events || {};
			if( event in this._events === false  ) { return; }
			for(var i = 0, args = Array.prototype.slice.call(arguments, 1); i < this._events[event].length; i++) {
				this._events[event][i].apply( this, args )
			}
		}
	};
	
	var Rect = (function() {
		function Rect(x, y, width, height) {
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
		}
		
		var RectProto = Rect.prototype;
		
		RectProto.contains = function(point) {
			return (point.x > this.x) &&
			       (point.y > this.y) &&
				   (point.x < this.x + this.width) &&
				   (point.y < this.y + this.height);
		};
		
		return Rect;
	})();
	
	
	var SpriteCanvas = (function() {
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
		
		function SpriteCanvas() {
			this.canvas = $('<canvas/>')[0];
			this._bgData = [0, 0, 0, 0];
		}
		
		var SpriteCanvasProto = SpriteCanvas.prototype;
		
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
		
		SpriteCanvasProto.expandToSpriteBoundry = function(region, callback) {
			this.currentRegion = region;
			var edgeBgResult = this._edgesAreBg(region),
				edgeBoundsResult = this._edgesAtBounds(region);
				
			// expand
			while ( !allArrayOrTrue(edgeBgResult, edgeBoundsResult) ) {
				region = this._expandRegion(region, edgeBgResult, edgeBoundsResult);
				edgeBgResult = this._edgesAreBg(region);
				edgeBoundsResult = this._edgesAtBounds(region);
				// callback(); // for debugging
			}
			
			// trim edges of bg
			region = this._contractRegion(region, edgeBgResult);
			
			return region;
		};
		
		SpriteCanvasProto._edgesAreBg = function(region) {
			// look at the pixels around the edges
			var canvas = this.canvas,
				pixels = canvas.getContext('2d').getImageData(region.x, region.y, region.width, region.height).data;
			
			return [
				this._pixelsContainOnlyBg(pixels, 0, 4, region.width * 4),
				this._pixelsContainOnlyBg(pixels, (region.width - 1) * 4, region.width * 4, pixels.length),
				this._pixelsContainOnlyBg(pixels, region.width * 4 * (region.height - 1), 4, pixels.length),
				this._pixelsContainOnlyBg(pixels, 0, region.width * 4, pixels.length)
			];
		};
		
		SpriteCanvasProto._edgesAtBounds = function(region) {
			var canvas = this.canvas;
			
			return [
				region.y === 0,
				region.x + region.width === canvas.width,
				region.y + region.height === canvas.height,
				region.x === 0
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
		
		SpriteCanvasProto._expandRegion = function(region, edgeBgResult, edgeBoundsResult) {
			if ( !edgeBgResult[0] && !edgeBoundsResult[0] ) {
				region.y--;
				region.height++;
			}
			if ( !edgeBgResult[1] && !edgeBoundsResult[1] ) {
				region.width++;
			}
			if ( !edgeBgResult[2] && !edgeBoundsResult[2] ) {
				region.height++;
			}
			if ( !edgeBgResult[3] && !edgeBoundsResult[3] ) {
				region.x--;
				region.width++;
			}
			
			return region;
		};
		
		SpriteCanvasProto._contractRegion = function(region, edgeBgResult) {
			if ( edgeBgResult[0] && region.height ) {
				region.y++;
				region.height--;
			}
			if ( edgeBgResult[1] && region.width ) {
				region.width--;
			}
			if ( edgeBgResult[2] && region.height ) {
				region.height--;
			}
			if ( edgeBgResult[3] && region.width ) {
				region.x++;
				region.width--;
			}
			
			return region;
		};
		
		return SpriteCanvas;
	})();
	
	var SpriteCanvasView = (function() {
		
		
		function SpriteCanvasView(spriteCanvas, $appendToElm) {
			var spriteCanvasView = this,
				$container = $('<div class="sprite-canvas-container"/>'),
				$canvas = $( spriteCanvas.canvas );
				
			this._$container = $container;
			this._spriteCanvas = spriteCanvas;
			this._$highlight = $('<div class="highlight"/>')
			
			$container.append( $canvas ).append( this._$highlight ).appendTo( $appendToElm );
			
			$canvas.mousedown(function(event) {
				var offset = $canvas.offset(),
					rect = new Rect(
						event.pageX - offset.left,
						event.pageY - offset.top,
						1, 1
					),
					spriteRect = spriteCanvas.expandToSpriteBoundry(rect, function() {
						spriteCanvasView._highlightRegion(rect);
					});
					
				spriteCanvasView._highlightRegion(spriteRect);
			});
		}
		
		var SpriteCanvasViewProto = SpriteCanvasView.prototype;
		
		SpriteCanvasViewProto._highlightRegion = function(rect) {
			this._$highlight.css({
				left: rect.x,
				top: rect.y,
				width: rect.width,
				height: rect.height
			});
		};
		
		return SpriteCanvasView;
	})();
	
	var ImgInput = (function() {
		function ImgInput($container, $dropzone) {
			var imgInput = this,
				$fileInput = $('<input type="file" accept="image/*">').appendTo( $container );
			
			// creates file input element & handles drag & drop
			
			$fileInput.change(function(event) {
				var file = this.files[0];
				file && imgInput._fileToImg(file);
			});
			
			// fires an event with a base64 <img> when it's ready to use
		}
		
		var ImgInputProto = ImgInput.prototype = new MicroEvent;
		
		ImgInputProto._fileToImg = function(file) {
			var imgInput = this,
				reader = new FileReader;
			
			reader.onload = function() {
				var img = new Image;
				img.onload = function() {
					imgInput.trigger('load', img);
				};
				img.src = reader.result;
			};
			reader.readAsDataURL(file);
		};
		
		return ImgInput;
	})();
	
	var CssOutput = (function() {
		
		function CssOutput(imgName, left, top, width, height) {
			
		}
		
		var CssOutputProto = CssOutput.prototype;
		
		CssOutputProto.toString = function(shorthandBg, tabs) {
			
		};
		
		return CssOutput;
	})();
	
	var SpriteSelector = (function() {
		
		function SpriteSelector($container) {
			$container = $( $container );
			
			var spriteSelector = this,
				spriteCanvas = new SpriteCanvas(),
				spriteCanvasView = new SpriteCanvasView( spriteCanvas, $container ),
				imgInput = new ImgInput( $container );
			
			imgInput.bind('load', function(img) {
				spriteCanvas.setImg(img);
			});
		}
		
		var SpriteSelectorProto = SpriteSelector.prototype;
		
		return SpriteSelector;
	})();
	
	
	// here we go...
	var spriteSelector = new SpriteSelector('#sprite-selector');
})(document);