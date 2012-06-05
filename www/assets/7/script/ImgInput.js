spriteCow.ImgInput = (function() {
	function ImgInput($container, $dropZone, tutorialUrl) {
		var imgInput = this,
			$fileInput = $('<input type="file" accept="image/*" class="upload-input">').appendTo( document.body ),
			$buttons = $('<div class="start-buttons"/>').appendTo( $container ),
			$selectButton = $('<div role="button" class="select-btn lg-button">Open Image</div>').appendTo( $buttons ),
			$demoButton = $('<div role="button" class="demo-btn lg-button">Show Example</div>').appendTo( $buttons ),
			$dropIndicator = $('<div class="drop-indicator"></div>').appendTo( $dropZone );
		
		imgInput.fileName = 'example.png';
		imgInput._fileInput = $fileInput[0];
		imgInput._addDropEvents($dropZone);
		//imgInput._lastFile = undefined;
		
		$fileInput.change(function(event) {
			var file = this.files[0];
			file && imgInput._openFileAsImg(file);
			this.value = '';
		});
		
		imgInput.fileClickjackFor( $selectButton );
		
		$demoButton.click(function(event) {
			imgInput.loadImgUrl( tutorialUrl );
			event.preventDefault();
		});
		
	}
	
	var ImgInputProto = ImgInput.prototype = new spriteCow.MicroEvent;
	
	ImgInputProto._openFileAsImg = function(file) {
		var imgInput = this,
			reader = new FileReader;
		
		imgInput._lastFile = file;
		imgInput.fileName = file.fileName || file.name;
		
		reader.onload = function() {
			imgInput.loadImgUrl(reader.result);
		};
		reader.readAsDataURL(file);
	};
	
	ImgInputProto._addDropEvents = function($dropZone) {
		var dropZone = $dropZone[0],
			imgInput = this;
		
		dropZone.addEventListener('dragenter', function(event) {
			event.stopPropagation();
			event.preventDefault();
		}, false);
		
		dropZone.addEventListener('dragover', function(event) {
			event.stopPropagation();
			event.preventDefault();
			$dropZone.addClass('drag-over');
		}, false);
		
		dropZone.addEventListener('dragleave', function(event) {
			event.stopPropagation();
			event.preventDefault();
			$dropZone.removeClass('drag-over');
		}, false);
		
		dropZone.addEventListener('drop', function(event) {
			event.stopPropagation();
			event.preventDefault();
			$dropZone.removeClass('drag-over');
			var file = event.dataTransfer.files[0];
			
			if ( file && file.type.slice(0,5) === 'image' ) {
				imgInput._openFileAsImg(file);
			}
		}, false);
	};
	
	ImgInputProto.loadImgUrl = function(url) {
		var imgInput = this,
			img = new Image;
		
		img.onload = function() {
			imgInput.trigger('load', img);
		};
		img.src = url;
	};
	
	ImgInputProto.reloadLastFile = function() {
		this._lastFile && this._openFileAsImg( this._lastFile );
	};
	
	ImgInputProto.fileClickjackFor = function( $elm ) {
		$elm.fileClickjack( this._fileInput );
	};
	
	return ImgInput;
})();