(function($) {
	if (!$) {
		return;
	}

	$(function() {
		$(".dropdown").dropdown({
			multiple: false,
			fix: false
		}).on("checked", function(event, checked, valid) {
			var $dropdown = $(this);

			if ($.isArray(checked)) {
				valid = true;

				$.each(checked, function() {
					if (!this.valid) {
						valid = false;

						return false;
					}
				});
			}

			if (valid) {
				$dropdown.trigger("valid");
			} else {
				$dropdown.trigger("error");
			}
		});
	});
})(jQuery);