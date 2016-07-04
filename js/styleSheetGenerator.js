function StyleSheets() {
	this.options = {
		name: 'dynamic',
		existing: 0
	};
	this.getIndex = function() {
		this.options.index = this.options.existing ? this.options.existing.cssRules.length : 0;
		return this.options.index;
	};
	this.sheetExists = function() {
		this.options.existing = this.findStyleSheet(this.options.name);
		return this.options.existing;
	};
	this.findStyleSheet = function(name) {
		var ss = document.styleSheets,
			l = ss.length - 1,
			title = name ? name : this.options.name,
			test = null;
		do {
			test = ss[l].title === title;
			if (test) {
				return ss[l];
			}
			l--;
		} while (l);
		return undefined;
	};
	this.destroyStylesheet = function() {
		var head = document.querySelector('head'),
			style = head.querySelector('style[title="'+this.options.name+'"]');
		if(this.options.existing && style) {
			head.removeChild(style);
		}
	};
	this.createStylesheet = function() {
		var style = document.createElement('style');
		style.title = this.options.name;
		style.type = 'text/css';
		style.appendChild(document.createTextNode(''));
		document.querySelector('head').appendChild(style);
		this.options.existing = style.sheet;
		this.options.index = this.getIndex();
		return this.sheetExists();
	};
	this.addCSSRule = function(options) {
		var sheet = options.sheet ? options.sheet : this.options.existing;
		if (options.selector === null) {
			sheet.insertRule(options.rules, options.index);
		} else {
			sheet.insertRule(options.selector + options.rules, options.index);
		}
	};
	this.addCSSRules = function(options) {
		for (i=0; Boolean(rule = options[i]); i++) {

		}
	}
};
