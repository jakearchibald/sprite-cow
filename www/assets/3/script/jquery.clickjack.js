(function($) {
	var $doc = $(document);
	
	$.fn.clickjack = function($clickTarget) {
		$clickTarget = $( $clickTarget );
		
		var hideCss = {
			top: -5000,
			left: 0
		};
		
		$clickTarget.css( hideCss ).css({
			opacity: 0,
			position: 'absolute'
		});
		
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
					$clickTarget.css( hideCss );
					pointerIsInside = false;
				}
			}
			
		});
		
		function clickjack(pageX, pageY) {
			var targetPos = $clickTarget.position(),
				targetOffset = $clickTarget.offset(),
				newPos = {
					top:  targetPos.top  - (targetOffset.top  - pageY) - 5,
					left: targetPos.left - (targetOffset.left - pageX) - 5
				};
			
			$clickTarget.css( newPos );
		}
	};
	
})(jQuery);