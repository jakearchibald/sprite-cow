(function() {
	var SelectColor = (function() {
		
		function SelectColor($canvas) {
			this._$canvas = $canvas;
			this._context = $canvas[0].getContext('2d');
			this._listeners = [];
		}
		
		var SelectColorProto = SelectColor.prototype = new spriteCow.MicroEvent;
		
		SelectColorProto.activate = function() {
			var selectColor = this,
				canvasX, canvasY,
				context = selectColor._context,
				$canvas = selectColor._$canvas;
			
			selectColor._listeners.push([
				$canvas, 'mousedown', function(event) {
					if (event.button !== 0) { return; }
					var color = selectColor._getColourAtMouse(event.pageX, event.pageY);
					selectColor.trigger( 'select', color );
					event.preventDefault();
				}
			]);
			
			selectColor._listeners.push([
				$canvas, 'mousemove', function(event) {
					var color = selectColor._getColourAtMouse(event.pageX, event.pageY);
					selectColor.trigger( 'move', color );
				}
			]);
			
			selectColor._listeners.forEach(function(set) {
				set[0].bind.apply( set[0], set.slice(1) );
			});
			
			return selectColor;
		};
		
		SelectColorProto.deactivate = function() {
			this._listeners.forEach(function(set) {
				set[0].unbind.apply( set[0], set.slice(1) );
			});
			
			return this;
		};
		
		SelectColorProto._getColourAtMouse = function(pageX, pageY) {
			var offset = this._$canvas.offset(),
				x = pageX - Math.floor(offset.left),
				y = pageY - Math.floor(offset.top);
			
			return this._context.getImageData(x, y, 1, 1).data;
		};
		
		return SelectColor;
	})();
	
	var SelectArea = (function() {
		function SelectArea($area, $highlight) {
			this._$area = $area;
			this._$highlight = $highlight;
			this._listeners = [];
		}
		
		var SelectAreaProto = SelectArea.prototype = new spriteCow.MicroEvent;
		
		SelectAreaProto.activate = function() {
			var selectArea = this,
				rect = new spriteCow.Rect(0, 0, 0, 0),
				startX, startY,
				startPositionX, startPositionY,
				isDragging,
				$document = $(document);
			
			
			selectArea._listeners.push([
				selectArea._$area, 'mousedown', function(event) {
					if (event.button !== 0) { return; }
					var offset = selectArea._$area.offset();
					startX = event.pageX;
					startY = event.pageY;
					// firefox like coming up with fraction values from offset()
					startPositionX = Math.floor(event.pageX - offset.left);
					startPositionY = Math.floor(event.pageY - offset.top);
					
					rect = new spriteCow.Rect(
						startPositionX,
						startPositionY,
						1, 1
					);
					
					selectArea._highlightRect(rect);
					selectArea._$highlight.css('display', 'block');
					isDragging = true;
					event.preventDefault();
				}
			]);
			
			selectArea._listeners.push([
				$document, 'mousemove', function(event) {
					if (!isDragging) { return; }
					
					rect.x = startPositionX + Math.min(event.pageX - startX, 0);
					rect.y = startPositionY + Math.min(event.pageY - startY, 0);
					rect.width = Math.abs(event.pageX - startX) || 1;
					rect.height = Math.abs(event.pageY - startY) || 1;
					selectArea._highlightRect(rect);
				}
			]);
			
			selectArea._listeners.push([
				$document, 'mouseup', function(event) {
					if (!isDragging) { return; }
					isDragging = false;
					selectArea.trigger('select', rect);
				}
			]);
			
			selectArea._listeners.forEach(function(set) {
				set[0].bind.apply( set[0], set.slice(1) );
			});
			
			return selectArea;
		};
		
		SelectAreaProto.deactivate = function() {
			this._listeners.forEach(function(set) {
				set[0].unbind.apply( set[0], set.slice(1) );
			});
			
			return this;
		};
		
		SelectAreaProto._highlightRect = function(rect) {
			this._$highlight.css({
				left: rect.x,
				top: rect.y,
				width: rect.width,
				height: rect.height
			});
		};
		
		return SelectArea;
	})();
	
	spriteCow.SpriteCanvasView = (function() {
		function SpriteCanvasView(spriteCanvas, $appendToElm) {
			var spriteCanvasView = this,
				$container = $('<div class="sprite-canvas-container"/>'),
				$canvas = $( spriteCanvas.canvas ),
				$highlight = $('<div class="highlight"/>'),
				selectArea = new SelectArea($canvas, $highlight),
				selectColor = new SelectColor($canvas);
				
			this._$container = $container;
			this._spriteCanvas = spriteCanvas;
			this._$highlight = $highlight;
			this.currentRect = new spriteCow.Rect(0, 0, 0, 0);
			this._selectArea = selectArea;
			this._selectColor = selectColor;
			
			$container.append( $canvas ).append( this._$highlight ).appendTo( $appendToElm );
			
			selectArea.bind('select', function(rect) {
				var spriteRect = spriteCanvas.trimBg(rect);
				if (spriteRect.width && spriteRect.height) { // false if clicked on bg pixel
					spriteRect = spriteCanvas.expandToSpriteBoundry(rect);
				}
				else {
					spriteCanvasView._highlightRect(rect);
				}
				spriteCanvasView._setCurrentRect(spriteRect);
			});
			
			selectColor.bind('select', function(color) {
				spriteCanvasView.trigger('bgColorSelect', color);
				spriteCanvas.setBg(color);
			});
			
			selectColor.bind('move', function(color) {
				spriteCanvasView.trigger('bgColorHover', color);
			});
		}
		
		var SpriteCanvasViewProto = SpriteCanvasView.prototype = new spriteCow.MicroEvent;
		
		SpriteCanvasViewProto._setCurrentRect = function(rect) {
			this.currentRect = rect;
			this._highlightRect(rect);
			this.trigger('rectChange', rect);
		};
		
		SpriteCanvasViewProto._highlightRect = function(rect) {
			if (rect && rect.width && rect.height) {
				this._$highlight.css({
					left: rect.x,
					top: rect.y,
					width: rect.width,
					height: rect.height,
					display: 'block'
				});				
			}
			else {
				this._$highlight.css('display', 'none');
			}
		};
		
		SpriteCanvasViewProto.setTool = function(mode) {
			var selectArea = this._selectArea,
				selectColor = this._selectColor;
			
			this._highlightRect();
			selectArea.deactivate();
			selectColor.deactivate();
			
			switch (mode) {
				case 'selectSprite':
					selectArea.activate();
					break;
				case 'selectBg':
					selectColor.activate();
					break;
			}
		};
		
		return SpriteCanvasView;
	})();
	
})();