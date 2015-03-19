(function($) {
	if (!$) {
		return;
	}

	/**
	 * Simple inline Dropdown component
	 *
	 *
	 * jQuery Event: "open"                             	Opens dropdown
	 * jQuery Event: "close"                            	Closes dropdown
	 * jQuery Event: "valid"                           		Sets dropdown's valid style
	 * jQuery Event: "error"                            	Sets dropdown's error style
	 * jQuery Event: "ok"                               	Clear all styles
	 *
	 * jQuery Fires: [{(* | Object[])} checked, {Boolean} isValid]		"checked"   Fires when element was checked
	 *
	 * jQuery Data: {Object}    	"dropdown-options"      Initialized options
	 * jQuery Data: {(*|Object[])}	"checked"               Checked element's `value`
	 * jQuery Data: {Boolean}   	"status"                `true` if dropdown is now open, `false` — if it closed
	 *
	 * @param {Object=}         options
	 * @param {Boolean=}        options.multiple        !CURRENTLY NOT WORKING PROPERLY! Multiple choice support. `checked` event returns Array instead of plain value
	 * @param {string=}         options.multipleText    Added text into `dropdown-selected` when checked more than 1 element
	 * @param {Boolean=}        options.showTitle       Converts text from elements into title
	 * @param {string=}         options.dataValue       Name of element's `data`-attribute, where checked `value` can be found
	 * @param {string=}         options.dataValid       Name of element's `data`-attribute, where checked `valid` can be found
	 * @param {string=}         options.fix     		Fix width to initialized
	 *
	 * @returns {jQuery}
	 */
	$.fn.dropdown = function(options) {
		var ACTIVE_CLASS = "dropdown_active";
		var CHECKED_CLASS = "dropdown-list-element_checked";
		var HOVER_CLASS = "dropdown-list-element_hover";
		var VALID_CLASS = "dropdown_valid";
		var ERROR_CLASS = "dropdown_error";

		options = $.extend({
			multiple: false,
			multipleText: "...",
			showTitle: true,
			dataValue: "value",
			dataValid: "valid",
			fix: false
		}, options);


		return this.each(function() {
			var $dropdown = $(this);

			if ($dropdown.data("dropdown-options")) {
				return false;
			}

			var $elements = $dropdown.find(".dropdown-list-element");
			var $selected = $dropdown.find(".dropdown-selected");

			// If nothing to show
			if (!$elements.length) {
				return false;
			}

			$dropdown.data("dropdown-options", options);
			var _status = false;


			/**
			 * Checks element and triggers `checked` event
			 *
			 * @param {jQuery} $element
			 */
			function checkElement($element) {
				if (!options.multiple) {
					$element.siblings().removeClass(CHECKED_CLASS);
				}


				if (options.multiple) {
					// Multiple choice
					$element.toggleClass(CHECKED_CLASS);

					var $checked = $element.parent().find("." + CHECKED_CLASS);
					$selected.html($checked.eq(0).html());

					if ($checked.length > 1) {
						$selected.html($selected.html() + options.multipleText);
					}

					// Returns array of values
					$dropdown.data("checked", $checked.map(function() {
						var $this = $(this);
						return {
							value: $this.data(options.dataValue),
							valid: $this.data(options.dataValid)
						};
					}).get());
				} else {
					// Single choice
					$element.addClass(CHECKED_CLASS);
					$selected.html($element.html());

					$dropdown.data("checked", $element.data(options.dataValue));
				}


				$dropdown.trigger("checked", [$dropdown.data("checked"), $element.data(options.dataValid)]);
			}

			/**
			 *    Update status of dropdown: is it open (true) or is it hidden (false)
			 */
			function updateStatus() {
				_status = $dropdown.hasClass(ACTIVE_CLASS);
				$dropdown.data("status", _status);
			}

			updateStatus();


			// Handlers

			$elements.on("click", function() {
				checkElement($(this));
			});


			$selected.on("click", function() {
				if (_status) {
					$dropdown.trigger("close");
				} else {
					$dropdown.trigger("open");
				}
			});

			// Keyboard control
			var $document = $(document);
			$document.on("keydown", function(event) {
				var key = event.keyCode;

				if (!$dropdown.is(":focus")) {
					return;
				}

				if (_status) {
					// When it is open
					switch (key) {
						case 38: { // Up
							var $current = $elements.filter("." + HOVER_CLASS);
							if (!$current.length) {
								$current = $elements.eq(0).addClass(HOVER_CLASS);
							}

							if ($current.index() > 0) {
								$current.removeClass(HOVER_CLASS).prev().addClass(HOVER_CLASS);
							}
							event.preventDefault();

							break;
						}
						case 40: { // Down
							var $current = $elements.filter("." + HOVER_CLASS);
							if (!$current.length) {
								$current = $elements.eq(0).addClass(HOVER_CLASS);
							}

							if ($current.index() < $elements.length - 1) {
								$current.removeClass(HOVER_CLASS).next().addClass(HOVER_CLASS);
							}
							event.preventDefault();

							break;
						}
						case 13: { // Enter
							var $current = $elements.filter("." + HOVER_CLASS);
							if ($current.length) {
								$current.click();
							}
							event.preventDefault();

							break;
						}
						case 27: { // Esc
							$dropdown.trigger("close");

							break;
						}
					}
				} else {
					// When it is closed
					switch (key) {
						case 13:
						case 40:
						case 32: { // Enter | Down | Space
							$dropdown.trigger("open");
							$elements.eq(0).addClass(HOVER_CLASS);

							break;
						}
					}
				}
			});

			$dropdown.blur(function() {
				$dropdown.trigger("close");
			});

			$dropdown.mouseenter(function() {
				$elements.removeClass(HOVER_CLASS);
			});

			if (options.showTitle) {
				$elements.each(function() {
					var $this = $(this);

					$this.attr("title", $this.text());
				});
			}
			if (options.fix) {
				// Fix width to initialized
				$selected.width($selected.width());
			}


			// Public event
			$dropdown.on("open", function() {
				$dropdown.addClass(ACTIVE_CLASS);
				updateStatus();
			});

			// Public event
			$dropdown.on("close", function() {
				$dropdown.removeClass(ACTIVE_CLASS);
				$elements.removeClass(HOVER_CLASS);
				updateStatus();
			});

			// Public event
			$dropdown.on("valid", function() {
				$dropdown.trigger("ok").addClass(VALID_CLASS);
			});

			// Public event
			$dropdown.on("error", function() {
				$dropdown.trigger("ok").addClass(ERROR_CLASS);
			});

			// Public event
			$dropdown.on("ok", function() {
				$dropdown.removeClass(VALID_CLASS).removeClass(ERROR_CLASS);
			});
		});
	};
})(jQuery);