(function() {
	function InlineEdit( $toWatch ) {
		var $input = $('<input type="text"/>').appendTo( $toWatch );
		var inlineEdit = this;

		inlineEdit._$input = $input;
		inlineEdit._$editing = null;
		inlineEdit._inputBoxOffset = {
			top:  -parseInt( $input.css('padding-top'),  10 ) - parseInt( $input.css('border-top-width'),  10 ),
			left: -parseInt( $input.css('padding-left'), 10 ) - parseInt( $input.css('border-left-width'), 10 )
		};

		$input.hide();
		$toWatch.on('click', '[data-inline-edit]', function(event) {
			var $target = $(event.target);
			var $editing = inlineEdit._$editing;

			if ($editing && $target[0] === $editing[0]) {
				return;
			}
			inlineEdit.edit( $target );
			event.preventDefault();
		});

		$input.blur(function() {
			inlineEdit.finishEdit();
		}).keyup(function(event) {
			if (event.keyCode === 13) {
				$input[0].blur();
				event.preventDefault();
			}
		});
	}

	var InlineEditProto = InlineEdit.prototype = new spriteCow.MicroEvent();

	InlineEditProto.edit = function( $elm ) {
		$elm = $($elm);

		var position = $elm.position();

		if (this._$editing) {
			this.finishEdit();
		}

		this._$editing = $elm;
		this._$input.show().css({
			top: position.top + this._inputBoxOffset.top,
			left: position.left + this._inputBoxOffset.left,
			width: Math.max( $elm.width(), 50 )
		}).val( $elm.text() ).focus();
	};

	InlineEditProto.finishEdit = function() {
		if (!this._$editing) { return; }

		var newVal = this._$input.hide().val();
		var event = new $.Event( this._$editing.data('inlineEdit') );
		
		event.val = newVal;
		this.trigger( event );
		this._$editing = null;
	};

	spriteCow.InlineEdit = InlineEdit;
})();