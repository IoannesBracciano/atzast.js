var jSlider = function(node, callback) {

	var self = this;
		// To be used within closures

	this.node = node;
	this.callback = callback;

	this.min = node.getAttribute("data-min-val");
	this.max = node.getAttribute("data-max-val");
	this.def = node.getAttribute("data-def-val");

	this.sliding = false;
		// true when user is moving the handle.


	/*
	 * Resets the slider to its default value
	 */
	this.reset = function() {
		this.node.getElementsByClassName("handle")[0].style.left =
				map(this.def, this.min, this.max,
					          -7,       this.node.offsetWidth - 7) + "px";
	}

	this.node.addEventListener("mousedown", function(e) {
		// 'this' refers to the DOM node in current context (same as self.node)
			if((e.buttons == 1 || e.buttons == 3) &&
					(e.pageX >= this.offsetLeft &&
				 	 e.pageX <= this.offsetWidth + this.offsetLeft)) {
				self.sliding = true;
			}
		});

	document.addEventListener("mousemove", function(e) {
		if (self.sliding) {
			var handle = self.node.getElementsByClassName("handle")[0];
			var x = max(min(
				e.pageX - self.node.offsetLeft,
				self.node.offsetWidth - 7), 0);
			handle.style.left = "" + (x - 7) + "px";

			if (self.callback) {
				var raw_val = int(handle.style.left) + 7;
				var mapped_val = float(map(raw_val,
					0,        self.node.offsetWidth - 7,
					self.min, self.max                  )) - 1;
				self.callback(self, mapped_val);
			}
		}
	});

	document.addEventListener("mouseup", function(e) {
		self.sliding = false;
	});

	this.reset();
}
