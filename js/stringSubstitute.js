'use strict';
function strsubstitute(temp, data, byindx, ceiling) {
	var keys = typeof data === 'object' ? Object.keys(data) : undefined,
		key, valstr, i, datalookup, overunder, ante, post;

	function antepost(i) {
		if (i === ceiling ) {
			ante = i-1;
			post = 0;
		} else if (i === 0){
			ante = ceiling;
			post = i + 1;
		} else {
			ante = i - 1;
			post = i + 1;
		}
		return {
			ante: ante,
			post: post
		};
	}

	for (i = 0; Boolean(key = keys[i]); i++) {
		valstr = new RegExp('{{' + key + '}}','g');
		datalookup = data[key];
		temp = temp.replace(valstr, datalookup);
	}
	overunder =  antepost(byindx);
	return  temp.replace(/({{i}})/g, byindx).replace(/({{i-1}})/g,overunder.ante).replace(/({{i\+1}})/g,overunder.post).replace(/{{n}}/g, byindx + 1);
}
