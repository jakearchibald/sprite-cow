spriteCow.pageLayout = (function() {
	var $container = $('.container'),
		$header = $('.container > header'),
		$canvasCell = $('.canvas-cell'),
		$canvasInner = $('.canvas-inner'),
		$cowLogo = $('.cow-logo'),
		$footerUl = $('.main-footer ul'),
		$footerP = $('.main-footer p'),
		$cssOutput,
		$startButtons,
		$spriteCanvasContainer,
		$window = $(window),
		$toolbarTop,
		$toolbarBottom,
		currentView = 'intro';
	
	function getContainerWidthPercent() {
		var bodyHorizontalPadding = 40,
			containerRelativeWidth = $container.width() / ( $window.width() - bodyHorizontalPadding );
		
		return Math.round(containerRelativeWidth * 10000) / 100 + '%';
	}
	
	function getAppViewTransitions() {
		// Here we read all the destination styles to animate to when the intro class is removed
		var transitions,
			containerWidth = getContainerWidthPercent();
		
		$container.removeClass('intro');
		
		transitions = [
			{
				duration: 300,
				easing: 'easeInOutQuad',
				targets: [
					[$container, { width: '100%' }],
					[$footerUl, {
						padding: $footerUl.css('padding')
					}],
					[$footerP, {
						padding: $footerP.css('padding')
					}],
					[$startButtons, { opacity: 0 }]
				],
				before: function() {
					$container.width(containerWidth);
					// stops browser reverting to previous scroll position
					$canvasInner.scrollTop(0);
				}
			},
			{
				duration: 500,
				easing: 'easeInOutQuad',
				targets: [
					[$cowLogo, {
						transform: $cowLogo.vendorCss('transform'),
						opacity: $cowLogo.css('opacity'),
						height: $cowLogo.css('height'),
						margin: 0
					}],
					[$container, { width: '100%' }],
					[$header, { height: $header.height() }],
					[$cssOutput, {
						height: $cssOutput.height(),
						'padding-top': $cssOutput.css('padding-top'),
						'padding-bottom': $cssOutput.css('padding-bottom')
					}],
					[$canvasCell, {
						height: $canvasCell.height()
					}],
					[$toolbarTop, {
						height: $toolbarTop.height(),
						'padding-top': $toolbarTop.css('padding-top'),
						'padding-bottom': $toolbarTop.css('padding-bottom'),
						'border-top-width': $toolbarTop.css('border-top-width'),
						'border-bottom-width': $toolbarTop.css('border-bottom-width')
					}],
					[$toolbarBottom, {
						height: $toolbarBottom.height(),
						'padding-top': $toolbarBottom.css('padding-top'),
						'padding-bottom': $toolbarBottom.css('padding-bottom'),
						'border-top-width': $toolbarBottom.css('border-top-width'),
						'border-bottom-width': $toolbarBottom.css('border-bottom-width')
					}]
				],
				before: function() {
				}
			},
			{
				duration: 500,
				easing: 'swing',
				targets: [
					[$spriteCanvasContainer, {opacity: 1}]
				]
			}
		];
		
		$container.addClass('intro');
		
		return transitions;
	}
	
	function doAnimStep(steps, i, callback) {
		var nextStep = steps[i+1],
			step = steps[i],
			duration = step.duration,
			easing = step.easing;
		
		function complete() {
			if (nextStep) {
				doAnimStep(steps, i + 1, callback);
			}
			else {
				callback();
			}
		}
		
		if (step.before) {
			step.before();
		}
		
		step.targets.forEach(function(target, i, targets) {
			target[0].transition(target[1], {
				duration: duration,
				easing: easing,
				complete: i ? $.noop : complete
			});
		});
	}
	
	return {
		init: function() {
			$toolbarTop = $('.toolbar.top');
			$toolbarBottom = $('.toolbar.bottom');
			$startButtons = $('.start-buttons');
			$cssOutput = $('.css-output');
			$spriteCanvasContainer = $('.sprite-canvas-container');
		},
		toAppView: function() {
			if (currentView === 'app') { return; }
			
			var steps = getAppViewTransitions(),
				i = 0;
				
			currentView = 'app';

			if ($.support.transition) {
				doAnimStep(steps, 0, function() {
					var targets = [];
					
					$container.removeClass('intro');
					
					steps.forEach(function(step) {
						targets = targets.concat( step.targets );
					});
					
					targets.forEach(function(target) {
						for ( var propName in target[1] ) {
							target[0].css(propName, '');
						}
					});
				});
			}
			else {
				$container.removeClass('intro');
			}

		}
	};
})();