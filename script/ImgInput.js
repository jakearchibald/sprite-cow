spriteCow.ImgInput = (function() {
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
	
	return ImgInput;
})();