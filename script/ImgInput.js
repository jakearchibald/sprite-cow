spriteCow.ImgInput = (function() {
	function ImgInput($container, $dropZone) {
		var imgInput = this,
			$fileInput = $('<input type="file" accept="image/*" class="upload-input">').appendTo( $container ),
			$styledButton = $('<div role="button" class="select-btn">Select Image</div>').appendTo( $container ),
			$dropIndicator = $('<div class="drop-indicator"></div>').appendTo( $dropZone );
		
		// todo - handles drag & drop
		imgInput.fileName = '';
		
		$fileInput.change(function(event) {
			var file = this.files[0];
			imgInput.fileName = file.fileName;
			file && imgInput._fileToImg(file);
		});
		
		// calling click on a file input needs a direct link to a user-triggered event, so we can't use jquery
		$styledButton[0].addEventListener('click', function(event) {
			imgInput.openDialog();
			event.preventDefault();
		}, false);
		
		imgInput._fileInput = $fileInput[0];
		imgInput._addDropEvents($dropZone);
	}
	
	var ImgInputProto = ImgInput.prototype = new spriteCow.MicroEvent;
	
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
				imgInput._fileToImg(file);
			}
		}, false);
	};
	
	ImgInputProto.openDialog = function() {
		this._fileInput.click();
	};
	
	return ImgInput;
})();