(function(spriteCow) {
	// init
	(function() {
		function colourBytesToCss(color) {
			if (color[3] === 0) {
				return 'transparent';
			}
			return 'rgba(' + color[0] + ', ' + color[1] + ', ' + color[2] + ', ' + String( color[3] / 255 ).slice(0, 5) + ')';
		}
		
		if ( !spriteCow.featureTests.allPassed ) {
			document.documentElement.className += ' not-supported';
			// bail
			return;
		}
		
		var $canvasContainer  = $('.canvas-inner'),
			$codeContainer    = $('.code-container'),
			$pageContainer    = $('.container'),
			$toolbarContainer = $('.toolbar-container'),
			$tutorialLink     = $('.tutorial'),
			spriteCanvas      = new spriteCow.SpriteCanvas(),
			spriteCanvasView  = new spriteCow.SpriteCanvasView( spriteCanvas, $canvasContainer ),
			imgInput          = new spriteCow.ImgInput( $canvasContainer, $canvasContainer, $tutorialLink.attr('href') ),
			cssOutput         = new spriteCow.CssOutput( $codeContainer ),
			toolbar           = new spriteCow.Toolbar( $toolbarContainer );
		
		spriteCow.pageLayout.init();
		
		// listeners
		imgInput.bind('load', function(img) {
			spriteCanvas.setImg(img);
			spriteCanvasView.setTool('selectSprite');
			cssOutput.backgroundFileName = imgInput.fileName;
			spriteCow.pageLayout.toAppView();
		});
		
		spriteCanvasView.bind('rectChange', function(rect) {
			cssOutput.rect = rect;
			cssOutput.update();
			if (rect.width === spriteCanvas.canvas.width && rect.height === spriteCanvas.canvas.height) {
				// if the rect is the same size as the whole canvas,
				// it's probably because the background is set wrong
				// let's be kind...
				toolbar.feedback(
					'Background set to: ' + colourBytesToCss( spriteCanvas.getBg() ),
					true
				);
			}
		});
		
		spriteCanvasView.bind('bgColorHover', function(color) {
			toolbar.feedback( colourBytesToCss(color) );
		});
		
		spriteCanvasView.bind('bgColorSelect', function(color) {
			var toolName = 'selectSprite';
			spriteCanvasView.setTool(toolName);
			toolbar.activate(toolName);
			toolbar.feedback( 'Background set to: ' + colourBytesToCss(color) );
		});
		
		toolbar.bind('selectBg', function() {
			var toolName = 'selectBg';
			spriteCanvasView.setTool(toolName);
			toolbar.activate(toolName);
		});
		
		toolbar.bind('selectSprite', function() {
			var toolName = 'selectSprite';
			spriteCanvasView.setTool(toolName);
			toolbar.activate(toolName)
		});
		
		toolbar.bind('openImg', function() {
			imgInput.openDialog();
		});
		
		$tutorialLink.click(function(event) {
			imgInput.loadImgUrl( this.href );
			event.preventDefault();
		});
	})();
	
	// todo:
	// Change font
	// Hover effects on toolbar buttons?
	// favicon
})(spriteCow);