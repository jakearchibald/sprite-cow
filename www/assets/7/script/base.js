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
			toolbarTop        = new spriteCow.Toolbar( $toolbarContainer );
		
		toolbarTop.addItem('open-img', 'Open').
				   addItem('reload-img', 'Reload Current Image', {noLabel: true}).
				   addItem('select-sprite', 'Select Sprite', {active: true}).
				   addItem('select-bg', 'Pick Background').
				   addItem('invert-bg', 'Toggle Dark Background', {noLabel: true});

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
				toolbarTop.feedback( 'Incorrect background colour set?', true );
			}
		});
		
		spriteCanvasView.bind('bgColorHover', function(color) {
			toolbarTop.feedback( colourBytesToCss(color) );
		});
		
		spriteCanvasView.bind('bgColorSelect', function(color) {
			var toolName = 'select-sprite';
			spriteCanvasView.setTool(toolName);
			toolbarTop.deactivate('select-bg').activate(toolName);
			toolbarTop.feedback( 'Background set to ' + colourBytesToCss(color) );
		});
		
		toolbarTop.bind('open-img', function(event) {
			event.preventDefault();
		});

		toolbarTop.bind('select-bg', function() {
			spriteCanvasView.setTool('select-bg');
			toolbarTop.deactivate('select-sprite');
		});
		
		toolbarTop.bind('select-sprite', function() {
			spriteCanvasView.setTool('select-sprite');
			toolbarTop.deactivate('select-bg');
		});
		
		toolbarTop.bind('reload-img', function(event) {
			imgInput.reloadLastFile();
			event.preventDefault();
		});
		
		imgInput.fileClickjackFor( toolbarTop.$container.find('div.open-img') );
		
		toolbarTop.bind('invert-bg', function() {
			var toolName = 'invert-bg';
			if ( toolbarTop.isActive(toolName) ) {
				spriteCanvasView.setBg('#fff');
			}
			else {
				spriteCanvasView.setBg('#000');
			}
		});
		
		$tutorialLink.click(function(event) {
			imgInput.loadImgUrl( this.href );
			event.preventDefault();
		});
	})();
})(spriteCow);