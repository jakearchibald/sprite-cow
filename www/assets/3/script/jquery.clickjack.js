(function($) {
	$.fn.clickjack = function($clickTarget) {
		$clickTarget = $( $clickTarget );
		
		var hideCss = {
			top: -5000,
			left: 0
		};
		
		$otherElm.css( hideCss ).css({
			opacity: 0,
			position: 'absolute'
		});
		
		this.each(function() {
			var $this = $(this);
			
			$this.mouseenter(function(event) {
				$this.bind('mousemove', clickjack);
				clickjack(event);
			});
			
			$this.mouseleave(function() {
				$this.unbind('mousemove', clickjack);
				$clickTarget.css( hideCss );
			});
			
			function clickjack(event) {
				var targetPos = $clickTarget.position(),
					targetOffset = $clickTarget.offset();
					
				$this.css({
					top: targetPos.top - (targetOffset.top - event.pageY),
					left: targetPos.left - (targetOffset.left - event.PageX)
				});
			}
		});
	};
})(jQuery);