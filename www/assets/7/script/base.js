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
		
		var $canvasContainer  = $('.canvas-inner');
		var $codeContainer    = $('.code-container');
		var $tutorialLink     = $('.tutorial');
		var spriteCanvas      = new spriteCow.SpriteCanvas();
		var spriteCanvasView  = new spriteCow.SpriteCanvasView( spriteCanvas, $canvasContainer );
		var imgInput          = new spriteCow.ImgInput( $canvasContainer, $canvasContainer, $tutorialLink.attr('href') );
		var cssOutput         = new spriteCow.CssOutput( $codeContainer );
		var toolbarTop        = new spriteCow.Toolbar('.toolbar-container');
		var toolbarBottom     = new spriteCow.Toolbar('.toolbar-bottom-container');
		
		toolbarTop.
			addItem('open-img', 'Open').
			addItem('reload-img', 'Reload Current Image', {noLabel: true}).
			addItem(
				new spriteCow.ToolbarGroup().
					addItem('select-sprite', 'Select Sprite', {active: true}).
					addItem('select-bg', 'Pick Background')
			).
			addItem('invert-bg', 'Toggle Dark Background', {noLabel: true});

		toolbarTop.$container.addClass('top');

		toolbarBottom.
			addItem('bg-size', 'Scale for retina displays', {noLabel: true}).
			addItem('percent', 'Percentage positioning', {noLabel: true});

		toolbarBottom.$container.addClass('bottom');

		spriteCow.pageLayout.init();
		
		// listeners
		imgInput.bind('load', function(img) {
			spriteCanvas.setImg(img);
			
			cssOutput.imgWidth = spriteCanvas.canvas.width;
			cssOutput.imgHeight = spriteCanvas.canvas.height;
			cssOutput.scaledWidth = Math.round( cssOutput.imgWidth / 2 );
			cssOutput.scaledHeight = Math.round( cssOutput.imgHeight / 2 );

			spriteCanvasView.setTool('select-sprite');
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
			toolbarTop.activate(toolName);
			toolbarTop.feedback( 'Background set to ' + colourBytesToCss(color) );
		});
		
		toolbarTop.bind('open-img', function(event) {
			event.preventDefault();
		});

		toolbarTop.bind('select-bg', function() {
			spriteCanvasView.setTool('select-bg');
		});
		
		toolbarTop.bind('select-sprite', function() {
			spriteCanvasView.setTool('select-sprite');
		});
		
		toolbarTop.bind('reload-img', function(event) {
			imgInput.reloadLastFile();
			event.preventDefault();
		});
		
		imgInput.fileClickjackFor( toolbarTop.$container.find('div.open-img') );
		
		toolbarTop.bind('invert-bg', function(event) {
			if ( event.isActive ) {
				spriteCanvasView.setBg('#fff');
			}
			else {
				spriteCanvasView.setBg('#000');
			}
		});

		toolbarBottom.bind('percent', function(event) {
			cssOutput.percentPos = !event.isActive;
			cssOutput.update();
		});

		toolbarBottom.bind('bg-size', function(event) {
			cssOutput.bgSize = !event.isActive;
			cssOutput.update();
		});
		
		$tutorialLink.click(function(event) {
			imgInput.loadImgUrl( this.href );
			event.preventDefault();
		});
	})();
})(spriteCow);