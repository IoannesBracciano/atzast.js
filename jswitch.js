var jSwitch = function(node, callback) {

	var self = this;
		// To be used within closures

	this.node = node;
	this.callback = callback;

	this.on = function() {
		this.node.checked = true;
		if (self.callback) self.callback(self, self.node.checked);
	}

	this.off = function() {
		this.node.checked = false;
		if (self.callback) self.callback(self, self.node.checked);
	}

	this.node.addEventListener("change", function(e) {
		if (self.callback) self.callback(self, self.node.checked);
	});
}
