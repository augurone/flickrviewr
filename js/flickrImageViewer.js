window.flickrImageViewer = (function (controller) {
	'use strict';
	//Pagination Object
	var Pagination = {
			page: 1
		},
	//Keep data we already asked for
		cardstore = [],
	//Access String Templates internally
		Templates = {
			input: function () {
				return '<input id="input-card{{i}}" name="cards" type="radio">';
			},
			nocardinput: function () {
				return '<input id="close" name="cards" type="radio">';
			},
			antelabel: function () {
				return '<label for="input-card{{i-1}}">&#x2794; </label>';
			},
			postlabel: function () {
				return '<label for="input-card{{i+1}}">&#x2794; </label>';
			},
			imgselector: function () {
				return 'input:nth-child({{n}}):checked ~ figure:nth-of-type({{n}}) > img';
			},
			imgsrc: function () {
				return 'https://farm{{farm}}.staticflickr.com/{{server}}/{{id}}_{{secret}}.jpg';
			},
			imgsrclg: function () {
				return 'https://farm{{farm}}.staticflickr.com/{{server}}/{{id}}_{{secret}}_b.jpg';
			},
			img: function () {
				return '<img src="' + this.imgsrc() + '" srcset="' + this.imgsrclg() + ' 760w" style="background-image:url(' + this.imgsrc() + ');"/>';
			},
			close: function () {
				return '<label for="close">x</label>';
			},
			figure: function () {
				return '<figure id="card{{i}}" data-src-id="{{id}}">' + this.antelabel() + this.img() + this.postlabel() + this.close() + '</figure>';
			},
			csschecked: function () {
				return 'input:nth-child({{n}}):checked ~ figure:nth-of-type({{n}})';
			},
			csslabelchecked: function () {
				return 'input:nth-child({{n}}):checked ~ figure:nth-of-type({{n}}) > label';
			}
		};
	//Super Light AJAX handler
	//No Error handling to speak of
	//Not thenable or promise like
	function jax(url, callback) {
		var httpr = new XMLHttpRequest(),
			suceeded = [200, 201, 202, 203, 204, 205, 206, 302, 304],
			response;
		httpr.open('GET', url, true);
		httpr.onreadystatechange = function () {
			if (httpr.readyState === 4 && suceeded.indexOf(httpr.status) >= 0) {
				response = JSON.parse(httpr.responseText);
				callback(response);
			} else {
				return;
			}
		};
		httpr.setRequestHeader('Content-type', 'text/plain; charset=utf-8');
		httpr.send();
	}

	//Utility method to find specified parentnodeName value
	function getParents(el, parentNodeName, ev) {
		var parent = el.parentNode,
			parNodeName = parent.nodeName,
			parNodeCk = parNodeName === parentNodeName,
			elNodeName = el.nodeName,
			elNodeCk = elNodeName === parentNodeName;
		if (parNodeCk || elNodeCk) {
			if (ev) {
				ev.cancelBubble = true;
			}
			return elNodeCk ? el : parent;
		} else if (parNodeName === 'BODY') {
			return undefined;
		} else {
			getParents(parent, parentNodeName, ev);
		}
	}

	//Once DOM is built these operations are done. Grouped here for conveinence more than anything.
	function setDomEvents(target) {
		var figures = target.querySelectorAll('figure'),
			closed = document.querySelector('#close'),
			fig,
			i;
		//This is a contrivance, FireFox loses event scope if event is not expicilty passed to callback.
		function click1() {
			return function (ev) {
				var targ = ev.target,
					fig = getParents(targ, 'FIGURE', ev),
					figid = fig ? fig.id : undefined,
					controlid = figid ? 'input-' + figid : undefined,
					control = controlid ? document.querySelector('#' + controlid) : undefined;
				if (control) {
					control.checked = true;
					document.body.classList.add('noscroll');
				}
			};
		}

		//Click event for the "figures"
		for (i = 0; Boolean(fig = figures[i]); i++) {
			fig.addEventListener('click', click1(), false);
		}
		//Listens for change event on the close input in order to allow scroll.
		closed.addEventListener('change', function () {
			document.body.classList.remove('noscroll');
		}, false);
	}

	function builder(data) {
		var target = document.querySelector('main'),
			sheet = controller.sheet,
			cards = data.photos.photo,
			dom1 = [],
			dom2 = [],
			groupcardselector = [],
			grouplabelselector = [],
			groupimageselector = [],
			len,
			card,
			i;
		cardstore = cardstore.concat(cards);
		len = cardstore.length ? cardstore.length - 1 : cards.length - 1;
		for (i = 0; Boolean(card = cardstore[i]); i++) {
			dom1.push(strsubstitute(Templates.input(), data, i, len));
			dom2.push(strsubstitute(Templates.figure(), card, i, len));
			groupcardselector.push(strsubstitute(Templates.csschecked(), card, i, len));
			grouplabelselector.push(strsubstitute(Templates.csslabelchecked(), card, i, len));
			groupimageselector.push(strsubstitute(Templates.imgselector(), card, i, len));
		}
		controller.stylesheet.addCSSRule({
			sheet: sheet,
			selector: groupcardselector.join(','),
			rules: '{background-color: rgba(0,0,0,.81); bottom: 0; left: 0; margin: -2ex -1em; position: fixed; right: 0; top: 0; height: 100%; max-width: 100%; z-index: 2;}',
			index: controller.stylesheet.getIndex()
		});
		controller.stylesheet.addCSSRule({
			sheet: sheet,
			selector: grouplabelselector.join(','),
			rules: '{display:block;}',
			index: controller.stylesheet.getIndex()
		});
		controller.stylesheet.addCSSRule({
			sheet: sheet,
			selector: groupimageselector.join(','),
			rules: '{ background-image: none !important; background-color: transparent; content: normal; cursor: default; height: auto; max-height: calc(100% - 16ex); max-width: 100%; object-fit: fit; object-position: 50% 50%; padding-left: 0; position: relative; width: 100%;}',
			index: controller.stylesheet.getIndex()
		});
		dom1.push(Templates.nocardinput());
		target.innerHTML = dom1.concat(dom2).join('');
		setDomEvents(target);
		Pagination.page += 1;
		Pagination.totalpages = data.photos.pages;
	}

	controller.init = function () {
		controller.stylesheet = new StyleSheets();
		controller.sheet = controller.stylesheet.createStylesheet();
		Pagination.pagesize = 10;
		//Load More button
		controller.loadmore = document.querySelector('button[name="loadmore"]'),
			//Search Button
			controller.search = document.querySelector('button[name="search"]'),
			jax('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=6267e4a56d468eef717dd6b196e67791&tags=eastbay&text=graffiti&per_page=' + Pagination.pagesize + '&format=json&nojsoncallback=1', builder);
		controller.loadmore.addEventListener('click', function (event) {
			var value = !controller.theme ? 'graffiti' : controller.theme;
			if (Pagination.page < Pagination.totalpages) {
				jax('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=6267e4a56d468eef717dd6b196e67791&tags=eastbay&text=' + value + '&per_page=' + Pagination.pagesize + '&format=json&nojsoncallback=1&page=' + Pagination.page, builder);
			} else {
				controller.loadmore.classList.add('hide');
			}
		});
		controller.search.addEventListener('click', function (event) {
			var targ = event.target,
				input, parent, value;
			event.preventDefault();
			parent = getParents(targ, 'FORM', event);
			input = parent.querySelector('input[name="searchinput"]'),
				value = input.value;
			jax('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=6267e4a56d468eef717dd6b196e67791&tags=eastbay&text=' + value + '&per_page=' + Pagination.pagesize + '&format=json&nojsoncallback=1', builder);
			controller.loadmore.classList.remove('hide');
			controller.theme = value;
			Pagination.page = 1;
			Pagination.totalpages = 0;
			cardstore = [];
		});
	};
	return controller;
}(window.flickrImageViewer || {}));

(function () {
	flickrImageViewer.init();
})();
