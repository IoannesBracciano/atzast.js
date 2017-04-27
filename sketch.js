var img = null;
var hsv = null;
var hsv_alt = null;

var g_hue = 0;
var g_sat = 0;
var g_bright = 0;

var slider_hue = null;
var slider_sat = null;
var slider_bright = null;

var g_colorize = false;
var g_tonify = false;

var switch_colorize = null;
var switch_tonify = null;

var dirty = false;


function setup() {
	createCanvas(512, 0).parent('sketch-holder');
	pixelDensity(1);
}

function imgSetup() {
	if (img.width > 512) {
		img.resize(512, 0);
	}
	resizeCanvas(512, img.height);

	img.loadPixels();

	hsv = Array();
	hsv_alt = Array();

	for(var i = 0; i < img.width*img.height*4; i += 4) {
		hsv.push(rgbToHsv(
			img.pixels[i],
			img.pixels[i+1],
			img.pixels[i+2]));

		hsv_alt.push(rgbToHsv(
			img.pixels[i],
			img.pixels[i+1],
			img.pixels[i+2]));
	}
}

function draw() {
	if (dirty) {
		background(255);

		if (img && img.width === 512) {
			image(img, 0, 0);
		} else if (img) {
			image(img, (512 - img.width) / 2, 0);
		}

		dirty = false;
	}
}

function setHue(slider, value) {
	g_hue = value;

	for(var i = 0; i < img.width*img.height*4; i += 4) {
		if (!g_colorize) {
			hsv_alt[i/4][0] = hsv[i/4][0] + value + 1;
		} else {
  			hsv_alt[i/4][0] = value + 1;
		}

  		rgb = hsvToRgb(hsv_alt[i/4][0], hsv_alt[i/4][1], hsv_alt[i/4][2]);

	  	img.pixels[i] = rgb[0];
	  	img.pixels[i+1] = rgb[1];
	  	img.pixels[i+2] = rgb[2];
  	}

  	img.updatePixels();
  	dirty = true;
}

function setSaturation(slider, value) {
	g_sat = value;

	for(var i = 0; i < img.width*img.height*4; i += 4) {
		if (!g_tonify) {
  			if (value >= 0) {
  				hsv_alt[i/4][1] = hsv[i/4][1] * (1 + value * (1 - hsv[i/4][1]));
  			} else {
  				hsv_alt[i/4][1] = hsv[i/4][1] * (1 + value);
  			}
  		} else {
  			hsv_alt[i/4][1] = min(max(hsv[i/4][1] + value, 0), 1);
  		}

  		rgb = hsvToRgb(hsv_alt[i/4][0], hsv_alt[i/4][1], hsv_alt[i/4][2]);

	  	img.pixels[i] = rgb[0];
	  	img.pixels[i+1] = rgb[1];
	  	img.pixels[i+2] = rgb[2];
  	}

  	img.updatePixels();
  	dirty = true;
}

function setBrightness(slider, value) {
	g_bright = value;

    for(var i = 0; i < img.width*img.height*4; i += 4) {
		hsv_alt[i/4][2] = hsv[i/4][2] + value;

  		rgb = hsvToRgb(hsv_alt[i/4][0], hsv_alt[i/4][1], hsv_alt[i/4][2]);

	  	img.pixels[i] = rgb[0];
	  	img.pixels[i+1] = rgb[1];
	  	img.pixels[i+2] = rgb[2];
  	}

  	img.updatePixels();
  	dirty = true;
}

function resetAll() {
	g_hue = g_sat = g_bright = 0;
	g_colorize = g_tonify = false;

	slider_hue.reset();
	slider_sat.reset();
	slider_bright.reset();

	switch_colorize.off();
	switch_tonify.off();

	dirty = true;
}

function showViewHolder() {
	var viewholderCtnr = document.getElementById("viewholder");
	var slidersCtnr = document.getElementById("sliders");
	var openBtn = document.getElementById("open-button");
	var saveBtn = document.getElementById("save-button");
	viewholderCtnr.style.display = "block";
	slidersCtnr.style.display = "none";
	openBtn.class = "primary";
	saveBtn.style.display = "none";
}

function showContent() {
	var viewholderCtnr = document.getElementById("viewholder");
	var slidersCtnr = document.getElementById("sliders");
	var openBtn = document.getElementById("open-button");
	var saveBtn = document.getElementById("save-button");
	viewholderCtnr.style.display = "none";
	slidersCtnr.style.display = "block";
	openBtn.className = "secondary";
	saveBtn.style.display = "inline-block";
	saveBtn.className = "primary";
}

window.addEventListener('load', function() {
	showViewHolder();

	// Init sliders
	slider_hue = new jSlider(
			document.getElementById("slider-hue"), setHue);
	slider_sat = new jSlider(
			document.getElementById("slider-saturation"), setSaturation);
	slider_bright = new jSlider(
			document.getElementById("slider-brightness"), setBrightness);

	// Init switches
	switch_colorize = new jSwitch(
		document.getElementById("switch-colorize"), function(jswitch, state) {
			g_colorize = state;
			setHue(null, g_hue);
		});
	switch_tonify = new jSwitch(
		document.getElementById("switch-tonify"), function(jswitch, state) {
			g_tonify = state;
			setSaturation(null, g_sat);
		});


	document.getElementById("file-input")
			.addEventListener("change", function(e) {
		if (this.files && this.files[0]) {
			var reader = new FileReader();
			reader.onload = function(e) {
				clear();
				img = loadImage(e.target.result, function(e) {
					showContent();
					imgSetup();
					resetAll();
				});
			}

			reader.readAsDataURL(this.files[0]);
		}
	});
});


/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r, g, b){
    r = r/255, g = g/255, b = b/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if(max == min){
        h = 0; // achromatic
    }else{
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, v];
}

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r * 255, g * 255, b * 255];
}