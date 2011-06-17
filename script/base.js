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
		
		var SpriteCanvasProto = SpriteCanvas.prototype = new MicroEvent;
		
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
			
			do {
				edgeBgResult = this._edgesAreBg(rect);
				rect = this._contractRect(rect, edgeBgResult);
			} while ( rect.height && rect.width && !allArrayFalse(edgeBgResult) );
			
			return rect;
		};
		
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
	
	var SelectColor = (function() {
		
		function SelectColor($canvas) {
			this._$canvas = $canvas;
			this._context = $canvas[0].getContext('2d');
			this._listeners = [];
		}
		
		var SelectColorProto = SelectColor.prototype = new MicroEvent;
		
		SelectColorProto.activate = function() {
			var selectColor = this,
				canvasX, canvasY,
				context = selectColor._context,
				$canvas = selectColor._$canvas;
			
			selectColor._listeners.push([
				$canvas, 'mousedown', function(event) {
					//if (event.which !== 0) { return; }
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
		
		var SelectAreaProto = SelectArea.prototype = new MicroEvent;
		
		SelectAreaProto.activate = function() {
			var selectArea = this,
				rect = new Rect(0, 0, 0, 0),
				startX, startY,
				startPositionX, startPositionY,
				isDragging,
				$document = $(document);
			
			
			selectArea._listeners.push([
				selectArea._$area, 'mousedown', function(event) {
					//if (event.which !== 0) { return; }
					var offset = selectArea._$area.offset();
					startX = event.pageX;
					startY = event.pageY;
					// firefox like coming up with fraction values from offset()
					startPositionX = Math.floor(event.pageX - offset.left);
					startPositionY = Math.floor(event.pageY - offset.top);
					
					rect = new Rect(
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
	
	var SpriteCowToolbar = (function() {
		function SpriteCowToolbar($appendToElm) {
			var toolbar = this,
				$container = $('' +
					'<div class="toolbar">' +
						'<div role="button" class="select-sprite active"><div>Select Sprite</div></div>' +
						'<div role="button" class="pick-bg"><div>Pick Background</div></div>' +
						'<div role="button" class="copy-css"><div>Copy CSS</div></div>' +
						'<span class="feedback"></span>' +
					'</div>' +
				'').appendTo( $appendToElm ),
				$children = $container.children(),
				toolNames = [
					'selectSprite',
					'selectBg',
					'copyCss'
				];
				
			toolNames.forEach(function(toolName, i) {
				$children.eq(i).click(function(event) {
					toolbar.trigger(toolName);
					event.preventDefault();
				});
			});
			
			toolbar._$feedback = $children.slice(-1);
			toolbar._toolNames = toolNames;
			toolbar._$children = $children;
		}
		
		var SpriteCowToolbarProto = SpriteCowToolbar.prototype = new MicroEvent;
		
		SpriteCowToolbarProto.feedback = function(msg) {
			// opacity 0.999 to avoid antialiasing differences when 1
			this._$feedback.stop(true, true).text(msg).css('opacity', 0.999).animate({
				// should be using delay() here, but http://bugs.jquery.com/ticket/6150 makes it not work
				// need to specify a dummy property to animate, cuh!
				_:0
			}, 3000).animate({
				opacity: 0
			}, 2000);
			
			return this;
		};
		
		SpriteCowToolbarProto.activate = function(toolName) {
			console.log(this._toolNames.indexOf(toolName))
			this._$children.removeClass('active')
				.eq( this._toolNames.indexOf(toolName) )
				.addClass('active');
			
		};
		
		return SpriteCowToolbar;
	})();
	
	var SpriteCanvasView = (function() {
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
			this.currentRect = new Rect(0, 0, 0, 0);
			this._selectArea = selectArea;
			this._selectColor = selectColor;
			
			$container.append( $canvas ).append( this._$highlight ).appendTo( $appendToElm );
			
			selectArea.bind('select', function(rect) {
				var spriteRect = spriteCanvas.trimBg(rect);
				if (spriteRect.width && spriteRect.height) { // false if clicked on transparent pixel
					spriteRect = spriteCanvas.expandToSpriteBoundry(rect);
				}
				else {
					spriteCanvasView._highlightRect(rect);
				}
				spriteCanvasView._setCurrentRect(spriteRect);
			});
			
			selectColor.bind('move', function(color) {
				spriteCanvasView.trigger('bgColorHover', color);
			});
		}
		
		var SpriteCanvasViewProto = SpriteCanvasView.prototype = new MicroEvent;
		
		SpriteCanvasViewProto._setCurrentRect = function(rect) {
			this.currentRect = rect;
			this._highlightRect(rect);
			this.trigger('rectChange', rect);
		};
		
		SpriteCanvasViewProto._highlightRect = function(rect) {
			this._$highlight.css({
				left: rect.x,
				top: rect.y,
				width: rect.width,
				height: rect.height,
				display: 'block'
			});
		};
		
		SpriteCanvasViewProto.setTool = function(mode) {
			var selectArea = this._selectArea,
				selectColor = this._selectColor;
			
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
	
	var ImgInput = (function() {
		function ImgInput($container, $dropzone) {
			var imgInput = this,
				$fileInput = $('<input type="file" accept="image/*" class="upload-input">').appendTo( $container ),
				$styledButton = $('<div role="button" class="select-btn">Select Image</div>').appendTo( $container );
			
			// todo - handles drag & drop
			imgInput.fileName = '';
			
			$fileInput.change(function(event) {
				var file = this.files[0];
				imgInput.fileName = file.fileName;
				file && imgInput._fileToImg(file);
			});
			
			// calling click on a file input needs a direct link to a user-triggered event, so we can't use jquery
			$styledButton[0].addEventListener('click', function(event) {
				event.preventDefault();
				$fileInput[0].click();
			}, false);
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
		function bgPosVal(offset) {
			if (offset) {
				return ' -' + offset + 'px';
			}
			return ' 0';
		}
		
		function CssOutput($appendTo) {
			this._$container = $('<code class="css-output">CSS code</code>').appendTo( $appendTo );
			this.backgroundFileName = '';
			this.path = 'images/';
			this.rect = new Rect(0, 0, 0, 0);
			this.useTabs = true;
			this.useBgUrl = true;
			this.selector = '.whatever';
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
	
	// init
	(function() {
		function colourBytesToCss(color) {
			if (color[3] === 0) {
				return 'transparent';
			}
			return 'rgba(' + color[0] + ', ' + color[1] + ', ' + color[2] + ', ' + String( color[3] / 255 ).slice(0, 5) + ')';
		}
		
		var $canvasContainer  = $('.canvas-inner'),
			$codeContainer    = $('.further-detail'),
			$pageContainer    = $('.container'),
			$toolbarContainer = $('.toolbar-container'),
			spriteCanvas      = new SpriteCanvas(),
			spriteCanvasView  = new SpriteCanvasView( spriteCanvas, $canvasContainer ),
			imgInput          = new ImgInput( $canvasContainer ),
			cssOutput         = new CssOutput( $codeContainer ),
			toolbar           = new SpriteCowToolbar( $toolbarContainer );
			
		// TODO: open button
		
		imgInput.bind('load', function(img) {
			spriteCanvas.setImg(img);
			spriteCanvasView.setTool('selectSprite');
			cssOutput.backgroundFileName = imgInput.fileName;
			$pageContainer.removeClass('intro');
		});
		
		spriteCanvasView.bind('rectChange', function(rect) {
			cssOutput.rect = rect;
			cssOutput.update();
		});
		
		spriteCanvasView.bind('bgColorHover', function(color) {
			toolbar.feedback( colourBytesToCss(color) );
		});
		
		toolbar.bind('selectBg', function() {
			var toolName = 'selectBg';
			spriteCanvasView.setTool(toolName);
			toolbar.activate(toolName)
		});
		
		toolbar.bind('selectSprite', function() {
			var toolName = 'selectSprite';
			spriteCanvasView.setTool(toolName);
			toolbar.activate(toolName)
		});
	})();
	
})(document);