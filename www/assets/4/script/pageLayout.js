spriteCow.pageLayout = (function() {
	var $container = $('.container'),
		$header = $('.container > header'),
		$headerH1 = $('.container > header h1'),
		$canvasCell = $('.canvas-cell'),
		$canvasInner = $('.canvas-inner'),
		$introCopy = $('.intro-copy'),
		$cssOutput,
		$startButtons,
		$spriteCanvasContainer,
		$window = $(window),
		$toolbar,
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
				duration: 500,
				easing: 'linear',
				targets: [
					[$startButtons, { opacity: 0 }],
					[$introCopy, { opacity: 0 }]
				],
				before: function() {
					$container.width(containerWidth);
					// stops browser reverting to previous scroll position
					$canvasInner.scrollTop(0);
				}
			},
			{
				duration: 1000,
				easing: 'swing',
				targets: [
					[$container, { width: '100%' }],
					[$header, { height: $header.height() }],
					[$headerH1, $.support.transition ? {
						transform: $headerH1.vendorCss('transform'),
						opacity: $headerH1.css('opacity'),
						top: $headerH1.css('top')
					} : {}],
					[$cssOutput, {
						height: $cssOutput.height(),
						'padding-top': $cssOutput.css('padding-top'),
						'padding-bottom': $cssOutput.css('padding-bottom')
					}],
					[$canvasCell, {
						height: $canvasCell.height()
					}],
					[$toolbar, {
						height: $toolbar.height(),
						'padding-top': $toolbar.css('padding-top'),
						'padding-bottom': $toolbar.css('padding-bottom'),
						'border-top-width': $toolbar.css('border-top-width'),
						'border-bottom-width': $toolbar.css('border-bottom-width')
					}]
				],
				before: function() {
					$introCopy.css('display', 'none');
				}
			},
			{
				duration: 500,
				easing: 'swing',
				targets: [
					[$spriteCanvasContainer , {opacity: 1}]
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
		
		step.before && step.before();
		
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
			$toolbar = $('.toolbar');
			$startButtons = $('.start-buttons');
			$cssOutput = $('.css-output');
			$spriteCanvasContainer = $('.sprite-canvas-container');
		},
		toAppView: function() {
			if (currentView === 'app') { return; }
			
			var steps = getAppViewTransitions(),
				i = 0;
				
			currentView = 'app';
			doAnimStep(steps, 0, function() {
				var targets = [];
				
				$container.removeClass('intro');
				
				steps.forEach(function(step) {
					targets = targets.concat( step.targets );
				})
				
				targets.forEach(function(target) {
					for ( var propName in target[1] ) {
						target[0].css(propName, '');
					}
				});
			});
		}
	}
})();