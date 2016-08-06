/*
 * I.E 8 and below doesn't support it or other random browsers
 * tagName - optional
*/
if(!document.getElementsByClassName)
	document.getElementsByClassName = function(className, tagName){
		if(!tagName)
			tagName = "*";
		var elements = document.getElementsByTagName(tagName);
		var ret = [];
		for(var e in elements)
			if(e.className == "className")
				ret.push(e);
		return ret;
	};

/* I.E doesn't have addEventListener so try and support it */
try{if(!Element.prototype.addEventListener){
	var doc;
	try{doc = Document.prototype}catch(e){doc = document}
	XMLHttpRequest.prototype.addEventListener = Window.prototype.addEventListener = doc.addEventListener = Element.prototype.addEventListener = function(type, listener, useCapture){
		if(this.attachEvent)
			return this.attachEvent('on' + type, listener, !!useCapture);
		else
			throw "Unsupported Browser";
		
	};
	XMLHttpRequest.prototype.removeEventListener = Window.prototype.removeEventListener = doc.removeEventListener = Element.prototype.removeEventListener = function(type, listener, useCapture){
		if(this.detachEvent)
			return this.detachEvent('on' + type, listener);
		else
			throw "Unsupported Browser";
		
	};
}}catch(e){} //IE7 and below doen't have Element object and likes to throw errors

/*
 * Make browsers (such as IE9 and below) show placeholder text
 * This will work without anything extra, both already existing and future
 */
var makePlaceholder = function(elem){
	elem.addEventListener("keyup", function(){
		if(elem.hasAttribute("placeholder")){
			var color = toRGBA(style(elem, "color"));
			if(elem.value == ""){
				elem.setAttribute("usingPlaceholder", color);
				elem.value = elem.getAttribute("placeholder");
				try{
					elem.style.color = "rgba(" + color[0] + "," + color[1] + "," + color[2] + ",0.4)";
				}catch(e){ //Most likely IE8 and below not liking rgba
					var bc = toRGBA(style(elem, "background-color"));
					elem.style.color = "rgb(" + (.5*bc[0] + .5*color[0]) + "," + (.5*bc[1] + .5*color[1]) + "," + (.5*bc[2] + .5*color[2]) + ")";
				}
				resetCursor(elem);
			}else if(elem.value != elem.getAttribute("placeholder") || elem.getAttribute("usingPlaceholder") == "0"){
				elem.style.color = "rgb(" + color[0] + "," + color[1] + "," + color[2]+")";
				elem.setAttribute("usingPlaceholder", "0");
			}
		}
	});
	elem.addEventListener("keydown", function(){
		if(elem.hasAttribute("placeholder")){
			if(elem.value == elem.getAttribute("placeholder") && elem.getAttribute("usingPlaceholder") != "0"){
				elem.value = "";
				var color = elem.getAttribute("usingPlaceholder").split(",");
				elem.style.color = "rgb(" + color[0] + "," + color[1] + "," + color[2]+")";
				elem.setAttribute("usingPlaceholder", "0");
			}
		}
	});
	elem.addEventListener("focus", function(){
		if(elem.hasAttribute("placeholder") &&
			elem.value == elem.getAttribute("placeholder") &&
				elem.getAttribute("usingPlaceholder") != "0")
					resetCursor(elem);
	});
	elem.addEventListener("click", function(){
		if(elem.hasAttribute("placeholder") &&
			elem.value == elem.getAttribute("placeholder") &&
				elem.getAttribute("usingPlaceholder") != "0")
					resetCursor(elem);
	});
	elem.addEventListener("mousedown", function(){
		if(elem.hasAttribute("placeholder")){
			if(elem.value == elem.getAttribute("placeholder") && elem.getAttribute("usingPlaceholder") != "0"){
				resetCursor(elem);
			}
		}
	});
};
var initPlaceholder = function(elem){
	if(elem.hasAttribute("placeholder") && elem.value == ""){
		var color = toRGBA(style(elem, "color"));
		elem.setAttribute("usingPlaceholder", color);
		elem.value = elem.getAttribute("placeholder");
		try{
			elem.style.color = "rgba(" + color[0] + "," + color[1] + "," + color[2] + ",0.4)";
		}catch(e){ //Most likely IE8 and below not liking rgba
			var bc = toRGBA(style(elem, "background-color"));
			elem.style.color = "rgb(" + (.5*bc[0] + .5*color[0]) + "," + (.5*bc[1] + .5*color[1]) + "," + (.5*bc[2] + .5*color[2]) + ")";
		}
		resetCursor(elem);
	}
};
var resetCursor = function(elem){
	if(elem.createTextRange){
		var part = elem.createTextRange();
		part.move("character", 0);
		part.select();
	}else if(elem.setSelectionRange)
		elem.setSelectionRange(0, 0);
}
//Convert current
window.addEventListener("load", function(){
	//Set existing
	var inputs = document.getElementsByTagName("input");
	for(var i=0;i<inputs.length;i++){
		makePlaceholder(inputs[i]);
		initPlaceholder(inputs[i]);
	}
});
//Force future
HTMLInputElement.prototype.appendChild = (function(orig){
	return function(){
		orig.apply(this, arguments);

		var elem = arguments[0];
		makePlaceholder(elem);
		initPlaceholder(elem);
	};
})(HTMLInputElement.prototype.appendChild);
HTMLInputElement.prototype.setAttribute = (function(orig){
	return function(){
		orig.apply(this, arguments);

		if(arguments[0].toLowerCase() == "placeholder")
			initPlaceholder(this);
	};
})(HTMLInputElement.prototype.setAttribute);
	
/*
 * Blocking Queue
 * queue	 - DON'T touch
 * add(func) - Adds a function to the queue
 * unblock() - Call once the function added is complete (e.g. conditionally at the end of timeouts)
 * block()	 - Call to make the queue wait for additional unblocks (e.g. use multiple timeouts as "threads"
 * 			   and wait until all are complete)
 *
 * Example call:
 * 		var queue = new BlockingQueue();
 * 		queue.add(function(){
 *			alert("Begin");
 *			setTimeout(function(){
 *				alert("Done");
 *				queue.unblock();
 *			}, 5000);
 *		});
 *		queue.unblock();
 *
*/
function BlockingQueue(){
	this.queue = [];

	this.add = function(func){
		this.queue.push(func);
	}
	
	this.block = function(){
		this.add(function(){});
	}
	
	this.unblock = function(){
		var func = this.queue.shift();
		if(func)
			func();
	}
}

/* Get computed style so style includes non-inline styling and regular html sizing */
function style(dom, prop){
	prop = prop.toLowerCase();
	if(document.defaultView && document.defaultView.getComputedStyle){
		return document.defaultView.getComputedStyle(dom, null).getPropertyValue(prop);
	}else if (dom.currentStyle){
		var s = dom.currentStyle[prop];
		if(s == "auto")
			if(prop == "width")
				return dom.offsetWidth;
			else if(prop == "height")
				return dom.offsetHeight;
			else if(prop == "top")
				return dom.offsetTop;
			else if(prop == "left")
				return dom.offsetLeft;
		return s;
	} else {
		return dom.style[prop];
	}
}

/* Returns the DOM object just beneath the passed in element */
function getBeneath(event){
	if(!event)
		event = window.event;
	var above = document.elementFromPoint(event.pageX-window.scrollX, event.pageY-window.scrollY);
	var oldVisibility = above.style.visibility;
	above.style.visibility = "hidden";
	var beneath = document.elementFromPoint(event.pageX-window.scrollX, event.pageY-window.scrollY);
	above.style.visibility = oldVisibility;
	return beneath;
}

/* Returns the absolute top of the element */
function absoluteTop(elem){
	if(elem.offsetParent)
		return elem.offsetTop + absoluteTop(elem.offsetParent);
	return elem.offsetTop;
}
/* Returns the absolute left of the element */
function absoluteLeft(elem){
	if(elem.offsetParent)
		return elem.offsetLeft + absoluteLeft(elem.offsetParent);
	return elem.offsetLeft;
}

/* Returns the x position of mouseevent in an element */
function getRelativeX(event, elem){
	return parseInt(event.clientX) + parseInt(window.pageXOffset?window.pageXOffset:document.body.scrollLeft) - absoluteLeft(elem);
}
/* Returns the y position of mouseevent in an element */
function getRelativeY(event, elem){
	return parseInt(event.clientY) + parseInt(window.pageYOffset?window.pageYOffset:document.body.scrollTop) - absoluteTop(elem);
}

/* Returns a value as close to val as possible above the min and below the max.
 * Note that the order doesn't matter of the restrictions */
function restrict(val, resriction1, resriction2){
	var min = Math.min(resriction1, resriction2);
	var max = Math.max(resriction1, resriction2);
	return Math.min(Math.max(min, val), max);
}

/* Adds zeros to the front of a number to make at least the length given.
 * Undefined return value for non-number */
function leadZero(val, len){
	val = val.toString();
	while(val.length<len)
		val = "0" + val;
	return val;
}

/* Takes time in seconds and returns the time in hh:mm:ss notation
 * forceHour is optional to force 00:mm:ss when there are no hours */
function friendlyTime(time, forceHour){
	time = parseInt(time);
	var sec = leadZero(parseInt(time%60), 2);
	var min = leadZero(parseInt(time/60)%60, 2);
	var hr = leadZero(parseInt(time/3600), 2);
	return (hr!="00" || forceHour ? hr+":" : "") + min + ":" + sec;
}

/* Helper function for adding listener for Page Visibility API
 * Function passed in will be called when hidden or visible
 * Use document[hidden] from the hasVisibility funciton to check if hidden */
function addOnVisibililtyChange(func){
	var visibilityChange; 
	if (typeof document.hidden !== "undefined")
		visibilityChange = "visibilitychange";
	else if (typeof document.mozHidden !== "undefined")
		visibilityChange = "mozvisibilitychange";
	else if (typeof document.msHidden !== "undefined")
		visibilityChange = "msvisibilitychange";
	else if (typeof document.webkitHidden !== "undefined")
		visibilityChange = "webkitvisibilitychange";
		
	if(document.addEventListener)
		document.addEventListener(visibilityChange, func);
	else
		document.attachEvent(visibilityChange, func);
}
 
 /* Returns a string (hidden) that can be used in document[hidden] to determine page visibility
  * Returns undefined if not supported */
function getVisibilityHidden(){
	var hidden; 
	if (typeof document.hidden !== "undefined")
		hidden = "hidden";
	else if (typeof document.mozHidden !== "undefined")
		hidden = "mozHidden";
	else if (typeof document.msHidden !== "undefined")
		hidden = "msHidden";
	else if (typeof document.webkitHidden !== "undefined")
		hidden = "webkitHidden";
	return hidden;
}

/* Stores cookie 
 * Days is optional, defaults to 10 years
 * Path is optional, defaults to root ("/") */
function putCookie(key, val, days, path){
	if(!days) days = 365*10;
	if(!path) path = "/";
	var date = new Date();
	date.setTime(date.getTime() + Math.round(days*24*60*60*1000));
	document.cookie = key+"="+val+"; expires="+date.toUTCString()+"; path="+path;
}

/* Retrieves cookie */
function getCookie(key){
	var cookies = document.cookie.split(";");
	for(var i=0;i<cookies.length;i++){
		var c = cookies[i];
		while(c.indexOf(' ')==0) c = c.substring(1);
		if(c.substring(0,key.length+1) == key+"=")
			return c.substring(key.length+1);
	}
	return null;
}

/* Destroys cookie */
function remCookie(key){
	putCookie(key,"",-1);
}

/* Switches two elements locations in the DOM */
function swapElements(e1, e2){
    var parent1 = e1.parentNode;
    var next1   = e1.nextSibling;
    
	var parent2 = e2.parentNode;
    var next2   = e2.nextSibling;

    parent1.insertBefore(e2, next1);
    parent2.insertBefore(e1, next2);
}

/* Add class functions */
function putClass(el, className){
	if(!hasClass(el, className))
		el.className += " " + className;
}
function remClass(el, className){
	var classes = el.className.split(" ");
	var i;
	while((i = classes.indexOf(className)) >= 0)
		classes.splice(i, 1);
	el.className = classes.join(" ");
}
function hasClass(el, className){
	return el.className.split(" ").indexOf(className) != -1;
}

/*
 * Converts colors in the form "rgb", "#rgb", "rrggbb", "#rrggbb", "rgb(r,g,b)", and "rgba(r,g,b,a)"
 * Returns array - [r, g, b, a] where r,g,b = [0-255] and a = [0-1] (but really is all real numbers)
 */
function toRGBA(col){
	//Standardize
	col = col.toLowerCase(); //Lower case
	
	if(col.substr(0,1) == "#") //Remove #
		col = col.substr(1);

	while(col.indexOf(" ") >= 0){ //Remove spaces
		var i = col.indexOf(" ");
		col = col.substr(0, i) + col.substr(i+1);
	}
	
	//Return appropriately
	if(col.match(/^[0-9a-f]{3}$/))
		return [
			parseInt(col.substr(0,1) + col.substr(0,1), 16),
			parseInt(col.substr(1,1) + col.substr(1,1), 16),
			parseInt(col.substr(2,1) + col.substr(2,1), 16),
			1
		];
	else if(col.match(/^[0-9a-f]{6}$/))
		return [
			parseInt(col.substr(0,2), 16),
			parseInt(col.substr(2,2), 16),
			parseInt(col.substr(4,2), 16),
			1
		];
	else if(col.match(/^rgb\([0-9]{1,3},[0-9]{1,3},[0-9]{1,3}\)$/)){
		return [
			col.substring(4, col.indexOf(",")),
			col.substring(col.indexOf(",")+1, col.lastIndexOf(",")),
			col.substring(col.lastIndexOf(",")+1, col.lastIndexOf(")")),
			1
		];
	}else if(col.match(/^rgba\([0-9]{1,3},[0-9]{1,3},[0-9]{1,3},([0-9]{0,9}).?[0-9]{0,9}\)$/)){
		var r = col.substring(5, col.indexOf(","));
		col = col.substr(col.indexOf(",")+1);
		return [
			r,
			col.substring(0, col.indexOf(",")),
			col.substring(col.indexOf(",")+1, col.lastIndexOf(",")),
			col.substring(col.lastIndexOf(",")+1, col.lastIndexOf(")"))
		];
	}
	return col;
}

/* AjaxRequest is designed to send and receive data from a server easily
 * Constructor:
 *    url (Required) - address to request from
 *    method (Required) - "post" or "get"
 *    contentType (Optional) - sets requeset header "Content-type" e.g. "application/x-www-form-urlencoded", defaults = "text/plain"
 *    defaultAsync (Optional) - sent requests default to asynchronous or not, defaults to false
 *	  preventCache (Optional) - adds a random string to the end to prevent browsers from caching get requests
 *    defaultRetry (Optional) - sets default # of retries on send, defaults to 3
 * send:
 *    query (Optional) - either string or object, defaults to "", DO NOT include "?"
 *       String - sends just the plain string
 *       Object - converts orderd pairs of objects into key/value pair for query data.  e.g. {"user":"frank","pass":"secret"} -> "?user=frank&pass=secret"
 *    func (Optional) - function to call on returned value, e.g. function(ret){ alert("The server returned: '" + ret + "'"); }
 *    async (Optional) - sets if the request should be asynchronous or not, defaults to object's defaultAsync
 *    retry (Optional) - sets # of retries for request, defaults to object's defaultRetry
 *
 * Example call:
 *      var ar = new AjaxRequest("./serverScripts/script.php", "post");
 *      ar.send({"login":"pete","password":"pa55woRd","action":"update"}, function(ret){
 *            if(parseInt(ret) == 1)
 *                  alert("Update successful");
 *            else
 *                  alert("Whoops!");
 *      }, true, 10);
 *      alert("This might alert before the request returns");
 */
function AjaxRequest(url, method, contentType, defaultAsync, preventCache, defaultRetry){
	var u = url;
	var m = method.toLowerCase();
	var contentType = contentType || "text/plain";
	var defaultAsync = !!defaultAsync;
	var preventCache = !!preventCache;
	var defaultRetry = defaultRetry || 3;
	
	this.send = function(query, func, async, retry){
		if((typeof query) === "undefined")
			query = "";
		else if((typeof query) === "object"){
			var temp = "";
			for(var i in query){
				temp += i + "=" + query[i] + "&";
			}
			query = temp;
		}
		
		if(async == null)
			async = defaultAsync;
		if(retry == null)
			retry = defaultRetry;

		while(retry>0){
			try{
				var xmlhttp = new XMLHttpRequest();
				xmlhttp.onreadystatechange=function(){
					if(xmlhttp.readyState==4 && xmlhttp.status==200){
						if(func)
							func(xmlhttp.responseText);
						return;
					}
				}
				if(m == "get"){
					xmlhttp.open("GET", url + "?" + query + (preventCache?"&"+new Date().getTime()+""+Math.random():""), async);
					xmlhttp.send();
				} else if(method == "post"){
					xmlhttp.open("POST", url, async);
					xmlhttp.setRequestHeader("Content-type", contentType);
					xmlhttp.send(query);
				}

				retry = 0;
			}catch(e){
				retry--;
				if(retry==0)
					alert(e);
			}
		}
	};
}