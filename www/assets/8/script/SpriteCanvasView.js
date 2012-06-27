(function() {
	var Highlight = (function() {
		function Highlight($appendTo) {
			this._$container = $('<div class="highlight"/>').appendTo( $appendTo );
		}
		
		var HighlightProto = Highlight.prototype;
		
		HighlightProto.moveTo = function(rect, animate) {
			var $container = this._$container.transitionStop(true),
				destination = {
					left: rect.x,
					top: rect.y,
					width: rect.width,
					height: rect.height,
					opacity: 1
				};
			
			
			if (rect.width && rect.height) {
				$container.css('display', 'block');
				
				if (animate) {
					$container.transition(destination, {
						duration: 200,
						easing: 'easeOutQuad'
					});
				}
				else {					
					$container.vendorCss(destination);				
				}
			}
			else {
				this.hide(animate);
			}
		};
		
		HighlightProto.hide = function(animate) {
			var $container = this._$container.transitionStop(true);
			
			if (animate) {
				var currentLeft = parseInt( $container.css('left') ),
					currentTop = parseInt( $container.css('top') );
				
				$container.transition({
					left: currentLeft + $container.width()  / 2,
					top:  currentTop  + $container.height() / 2,
					width: 0,
					height: 0,
					opacity: 0
				}, {
					duration: 200,
					easing: 'easeInQuad'
				});
			}
			else {
				$container.css('display', 'none');
			}
		};
		
		HighlightProto.setHighVisOnDark = function(highVis) {
			this._$container[highVis ? 'addClass' : 'removeClass']('high-vis');
			return this;
		}
		
		return Highlight;
	})();
	
	var SelectColor = (function() {
		
		function SelectColor($eventArea, $canvas) {
			this._$canvas = $canvas;
			this._$eventArea = $eventArea;
			this._context = $canvas[0].getContext('2d');
			this._listeners = [];
		}
		
		var SelectColorProto = SelectColor.prototype = new spriteCow.MicroEvent;
		
		SelectColorProto.activate = function() {
			var selectColor = this,
				canvasX, canvasY,
				context = selectColor._context,
				$eventArea = selectColor._$eventArea;
			
			selectColor._listeners.push([
				$eventArea, 'mousedown', function(event) {
					if (event.button !== 0) { return; }
					var color = selectColor._getColourAtMouse(event.pageX, event.pageY);
					selectColor.trigger( 'select', color );
					event.preventDefault();
				}
			]);
			
			selectColor._listeners.push([
				$eventArea, 'mousemove', function(event) {
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
		function SelectArea($eventArea, $area, highlight) {
			this._$area = $area;
			this._$eventArea = $eventArea;
			this._highlight = highlight;
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
				selectArea._$eventArea, 'mousedown', function(event) {
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
					
					selectArea._highlight.moveTo(rect);
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
					selectArea._highlight.moveTo(rect);
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
		
		return SelectArea;
	})();
	
	spriteCow.SpriteCanvasView = (function() {
		function SpriteCanvasView(spriteCanvas, $appendToElm) {
			var spriteCanvasView = this,
				$container = $('<div class="sprite-canvas-container"/>'),
				$canvas = $( spriteCanvas.canvas ).appendTo( $container ),
				// this cannot be $appendToElm, as browsers pick up clicks on scrollbars, some don't pick up mouseup http://code.google.com/p/chromium/issues/detail?id=14204#makechanges
				highlight = new Highlight( $container ),
				selectArea = new SelectArea( $container, $canvas, highlight ),
				selectColor = new SelectColor( $canvas, $canvas );
				
			this._$container = $container;
			this._$bgElm = $appendToElm;
			this._spriteCanvas = spriteCanvas;
			this._highlight = highlight;
			this._selectArea = selectArea;
			this._selectColor = selectColor;
			
			$container.appendTo( $appendToElm );
			
			selectArea.bind('select', function(rect) {
				var spriteRect = spriteCanvas.trimBg(rect);
				if (spriteRect.width && spriteRect.height) { // false if clicked on bg pixel
					spriteRect = spriteCanvas.expandToSpriteBoundry(rect);
					spriteCanvasView._setCurrentRect(spriteRect);
				}
				else {
					highlight.hide(true);
				}
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
			this._highlight.moveTo(rect, true);
			this.trigger('rectChange', rect);
		};
		
		SpriteCanvasViewProto.setTool = function(mode) {
			var selectArea = this._selectArea,
				selectColor = this._selectColor;
			
			this._highlight.hide();
			selectArea.deactivate();
			selectColor.deactivate();
			
			switch (mode) {
				case 'select-sprite':
					selectArea.activate();
					break;
				case 'select-bg':
					selectColor.activate();
					break;
			}
		};
		
		SpriteCanvasViewProto.setBg = function(color) {
			if ( $.support.transition ) {
				this._$bgElm.transition({ 'background-color': color }, {
					duration: 500
				});								
			}
			else {
				this._$bgElm.css({ 'background-color': color });
			}
			
			this._highlight.setHighVisOnDark( color === '#000' );
		};
		
		return SpriteCanvasView;
	})();
	
})();