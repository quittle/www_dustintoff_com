/* Helper functions */
function cloneObject(obj, base){
	var ret;
	if(base)
		ret = cloneObject(base);
	else if(base = typeof obj, base === "string" || base === "number" || base === "boolean") //this repurposes base to avoid creating an extra variable
		return obj;
	else
		ret = {};

	if(Array.isArray(obj)){
		var len = obj.length;
		ret = new Array(len);
		for(var i=0;i<len;i++)
			ret[i] = cloneObject(obj[i]);

	}else if(obj.__proto__ !== "Object {}"){
		ret = obj;
	}else if(typeof obj === "object"){
		for(var o in obj){
			var objo = obj[o];
			if(Array.isArray(objo)){
				var len = Math.max(Array.isArray(ret[o])?ret[o].length:0, objo.length);
				var newArr = new Array(len);
				for(var i=0;i<len;i++)
					if(i<objo.length)
						newArr[i] = cloneObject(objo[i]);
					else
						newArr[i] = ret[o][i];
				ret[o] = newArr;
			}else if(typeof objo === "object")
				ret[o] = cloneObject(objo);
			else
				ret[o] = objo;
		}
	}
	return ret;
}
function intersect(point, theta, drawable){
	var cl = drawable.getCanvasLocation(),
		c = new Vector([cl.x, cl.y]),
		r = drawable.getCanvasRadius(),
		dist = c.subtract(point).magnitude(),
		l = new Vector([point.x() + dist * Math.cos(theta), point.y() - dist * Math.sin(theta)]),
		d = l.subtract(point),
		f = point.subtract(c),
		
		a = d.dot(d),
		b = 2 * f.dot(d),
		c = f.dot(f) - Math.pow(r, 2),
		discriminant = Math.pow(b, 2) - 4 * a * c;
		
		if(Game.debug){
		var ctx = Game.gameCanvasContext;
			ctx.fillStyle="#000";
			ctx.strokeStyle="#000";
			ctx.beginPath();
			var offset = 0;
			ctx.moveTo(point.x() + offset, point.y() + offset);
			ctx.arc(point.x() + offset, point.y() + offset, 3, 0, 2 * Math.PI);
			ctx.lineTo(l.x() + offset, l.y() + offset);
			ctx.stroke();
		}
		
		return discriminant >= 0;
}

function getLocalString(key, def){
	if(def == null){
		def = "";
	}
		
	var ret = localStorage[key];
	if(ret == null){
		return def;
	}else{
		return ret;
	}
}
function setLocalString(key, value){
	localStorage[key] = value;
}
function getLocalArray(key, def){
	if(def == null){
		def = [];
	}
		
	var ret = localStorage[key];
	if(ret == null){
		return def;
	}else{
		return JSON.parse(ret);
	}
}
function setLocalArray(key, value){
	localStorage[key] = JSON.stringify(value);
}