(function($) {
	var $doc = $(document);
	
	$.fn.fileClickjack = function($fileInput) {
		$fileInput = $( $fileInput );
		
		var hideCss = {
				top: -5000,
				left: 0
			},
			// don't know how to feature detect this, but much better method for these browsers,
			// means we can style the cursor etc
			supportsClickMethod = $.browser.webkit || $.browser.mozilla;
		
		$fileInput.css( hideCss ).css({
			opacity: 0,
			position: 'absolute'
		});
		
		if (supportsClickMethod) {
			function openInput(event) {
				$fileInput[0].click();
				event.preventDefault();
			}
			
			this.each(function() {
				// must use addEventListener to keep the click listener in the stack
				this.addEventListener('click', openInput, false);
			});
			
			return this;
		}
		
		var fileInputWidth = $fileInput.width();
		
		this.each(function() {
			var $this = $(this),
				thisOffset,
				thisWidth,
				thisHeight,
				pointerIsInside = false;
			
			$this.mouseenter(function(event) {
				if (pointerIsInside) { return; }
				pointerIsInside = true;
				thisOffset = $this.offset();
				thisWidth  = $this.outerWidth();
				thisHeight = $this.outerHeight();
				$doc.bind('mousemove', onMove);
				clickjack( event.pageX, event.pageY );
			});
			
			function onMove(event) {
				var inBounds = event.pageY >= thisOffset.top &&
				               event.pageX >= thisOffset.left &&
							   event.pageY <= thisOffset.top + thisHeight &&
							   event.pageX <= thisOffset.left + thisWidth;
				
				if (inBounds) {
					clickjack( event.pageX, event.pageY );
				}
				else {
					$doc.unbind('mousemove', onMove);
					$fileInput.css( hideCss );
					pointerIsInside = false;
				}
			}
			
		});
		
		function clickjack(pageX, pageY) {
			var targetPos = $fileInput.position(),
				targetOffset = $fileInput.offset(),
				newPos = {
					top:  targetPos.top  - (targetOffset.top  - pageY) - 5,
					left: targetPos.left - (targetOffset.left - pageX) - fileInputWidth + 5
				};
			
			$fileInput.css( newPos );
		}
		
		return this;
	};
	
})(jQuery);