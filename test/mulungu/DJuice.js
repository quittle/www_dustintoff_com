if(!document.head)
	document.head = document.getElementsByTagName('head')[0];
/*
 * I.E 8 and below doesn't support it or other random browsers
 * tagName - optional
*/
if(!document.getElementsByClassName){
	document.getElementsByClassName = function(className, tagName){
		if(!tagName)
			tagName = "*";
		var elements = document.getElementsByTagName(tagName);
		var ret = [];
		for(var i=0;i<elements.length;i++)
			if(hasClass(elements[i], className))
				ret.push(elements[i]);
		return ret;
	};
}

/* I.E doesn't have addEventListener so try and support it */
if(!Element.prototype.addEventListener){
	var doc;
	try{doc = Document.prototype}catch(e){doc = document}
	XMLHttpRequest.prototype.addEventListener = window.addEventListener = Window.prototype.addEventListener = doc.addEventListener = Element.prototype.addEventListener = function(type, listener, useCapture){
		if(this.attachEvent){
			type = 'on' + type; //Correct type
			useCapture = !!useCapture;
			
			if(!this.DJUICE_EVENT_FUNCTIONS) //Create if non-existant
				this.DJUICE_EVENT_FUNCTIONS = {};
				
			var f = this.DJUICE_EVENT_FUNCTIONS; //Minimize
				
			var index = type + "," + useCapture; //unique type/capture index
			if(!f[index]) //Create if non-existant.  Index 0 is the single function attached
				f[index] = [function(){}];

			//Push listeners onto array in index
			f[index].push(listener);
			
			//Remove attached listener (singular)
			this.detachEvent(type, f[index][0]);
			
			f[index][0] = function(event){
				for(var i=1;i<f[index].length;i++)
					f[index][i](event);
			}
			return this.attachEvent(type, f[index][0], useCapture);
		}else
			throw "Unsupported Browser";
		
	};
	XMLHttpRequest.prototype.removeEventListener = window.removeEventListener = Window.prototype.removeEventListener = doc.removeEventListener = Element.prototype.removeEventListener = function(type, listener, useCapture){
		if(this.detachEvent){
			type = 'on' + type;
			if(!this.DJUICE_EVENT_FUNCTIONS) //Create if non-existant
				return this.detachEvent(type, listener);
			else{
				var f = this.DJUICE_EVENT_FUNCTIONS; //Minimize
				for(var i in f)
					if(i.indexOf(type) > -1)
						for(var j=0;j<f[i].length;j++)
							if(f[i][j] == listener){
								f[i].splice(j,1);
								return this.detachEvent(type, listener);
							}
				return this.detachEvent(type, listener);
			}
		}else
			throw "Unsupported Browser";
		
	};
}

/* I.E 8 and below do not support trim so try and support it */
if(!String.prototype.trim){
	String.prototype.trim = function(){
		return this.replace(/^\s+|\s+$/g,'');
	}
}

/* I.E 8 and below do not support indexOf so try and support it */
if(!Array.prototype.indexOf){
	Array.prototype.indexOf = function(el, from){
		var len = this.length >>> 0;
		if(from == null)
			from = 0;
		from = (from < 0) ? Math.ceil(from) : Math.floor(from);
		if(from < 0)
			from += len;
		while(from<len){
			if (from in this && this[from] === el)
				return from;
			from++;
		}
	return -1;
	};
}

/* I.E does not support preventDefault so try and support it */
if(!Event.prototype.preventDefault){
	Event.prototype.preventDefault = function(){
		this.returnValue = false;
		this.cancelBubble = true
	}
}

/* I.E 8 and below do not support isArray so try and support it */
if(!Array.isArray){
	Array.isArray = function(arr){
		return Object.prototype.toString.call(arr) === "[object Array]";
	}
}

/* I.E 8 and below doesn't support Array.map so try and support it */
if(!Array.prototype.map){
	Array.prototype.map = function(callback, thisArg){
		if(this == null)
			throw new TypeError(" this is null or not defined");
		if(typeof callback !== "function")
			throw new TypeError(callback + " is not a function");
	 
		var O = Object(this);
		var len = O.length >>> 0;
		
		var T=thisArg?thisArg:undefined, k=0, A = new Array(len);

		while(k < len){
			if(k in O)
				A[k] = callback.call(T, O[k], k, O);
			k++;
		}
		return A;
	};      
}
/* Add new/experimental functions */
if(!Array.prototype.find){
	//Unsure what thisObject should default to
	Array.prototype.find = function(callback, thisObject){
		if(thisObject == null)
			thisObject = callback;

		for(var i=0,l=this.length;i<l;i++){
			if(callback.apply(thisObject, [this[i], i, this]))
				return this[i];
		}
		return;
	}
}

//Try to allow fast conversion from array like objects to arrays
Array.toArray = function(obj){
	for(var arr = [], i = obj.length; i--; arr[i] = obj[i]);
	return arr;
}

/*
 *	Allows for simple inheritance of function classes.  Will call "parent" constructor.
 *	NOTE: There is no idea of private variables in functions, only protected ones.  Make sure to not
 *		: override previously declared vars. Redeclaring (var foo = 3;) may lead to negative
 *		: consequences or side effects in the parent class.
 *	For example:
 *	
 *	function ParentClass(){
 *		this.word = "ParentClass";
 *		this.foo = function(){ alert(word) };
 *	}
 *	
 *	function ChildClass(){
 *		this.word = "ChildClass";
 *	}
 *	ChildClass.extend(ParentClass);
 *	
 *	var example = new ChildClass();
 *	example.foo(); //Alerts "ChildClass"
*/
Function.prototype.extend = function(ParentClass){
	var selfString = this.toString();
	var parentClassString = ParentClass.toString();
	
	var selfBeginning = selfString.indexOf("{"),
		parentBeginning = parentClassString.indexOf("{");
	var start = selfString.substring(0, selfBeginning+1), //Include open bracket
		rest = selfString.substring(selfBeginning+1), //Ignore open bracket
		body = parentClassString.substring(parentBeginning+1,parentClassString.length-1); //Ignore open and close bracket

	var ret;
	eval("ret = " + (start + body + rest));
	return ret;
	//this.prototype = ParentClass.prototype; return this;
};

/*
 * Make browsers (such as IE9 and below) show placeholder text
 * This will work without anything extra, both already existing and future
 */
if(!('placeholder' in document.createElement("input"))){
	var makePlaceholder = function(elem){
		elem.addEventListener("keyup", function(){
			if(elem.hasAttribute("placeholder")){
				var color = Color.toRGBA(style(elem, "color"));
				if(elem.value == ""){
					elem.setAttribute("usingPlaceholder", color);
					elem.value = elem.getAttribute("placeholder");
					try{
						elem.style.color = "rgba(" + color[0] + "," + color[1] + "," + color[2] + ",0.4)";
					}catch(e){ //Most likely IE8 and below not liking rgba
						var bc = Color.toRGBA(style(elem, "background-color"));
						elem.style.color = "rgb(" + (.54*bc[0] + .54*color[0]) + "," + (.54*bc[1] + .54*color[1]) + "," + (.54*bc[2] + .54*color[2]) + ")";
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
			var color = Color.toRGBA(style(elem, "color"));
			elem.setAttribute("usingPlaceholder", color);
			elem.value = elem.getAttribute("placeholder");
			try{
				elem.style.color = "rgba(" + color[0] + "," + color[1] + "," + color[2] + ",0.4)";
			}catch(e){ //Most likely IE8 and below not liking rgba
				var bc = Color.toRGBA(style(elem, "background-color"));
				elem.style.color = "rgb(" + (.54*bc[0] + .54*color[0]) + "," + (.54*bc[1] + .54*color[1]) + "," + (.54*bc[2] + .54*color[2]) + ")";
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
		var inputs = Array.toArray(document.getElementsByTagName("input"));
		for(var i=0;i<inputs.length;i++){
			makePlaceholder(inputs[i]);
			initPlaceholder(inputs[i]);
		}
		setTimeout(function(){ //So IE8 doesn't do shit with textareas at first. give it a sec and it'll actually be attached and learn what a prototype is
			inputs = Array.toArray(document.getElementsByTagName("textarea"));
			for(var i=0;i<inputs.length;i++){
				makePlaceholder(inputs[i]);
				initPlaceholder(inputs[i]);
			}
		}, 1000);
	});
	//Force future
	/*HTMLElement.prototype.prependChild = (function(orig){
		return function(){
			orig.apply(this, arguments);

			var elem = arguments[0];
			makePlaceholder(elem);
			initPlaceholder(elem);
		};
	})(HTMLInputElement.prototype.appendChild);*/
	HTMLTextAreaElement.prototype.setAttribute = HTMLInputElement.prototype.setAttribute = (function(orig){
		return function(){
			orig.apply(this, arguments);

			if(arguments[0].toLowerCase() == "placeholder")
				initPlaceholder(this);
		};
	})(HTMLInputElement.prototype.setAttribute);
}

/* These methods attempt to follow the spec for appendChild and insertBefore */
try{
	if(Node);
}catch(e){
	Node = Element;
}
Node.prototype.prependChild = function(node){
	return this.insertBefore(node, this.firstChild);
};
Node.prototype.insertAfter = function(node, child){
	return this.insertBefore(node, child.nextSibling);
};
	
/*
 * Blocking Queue
 * size		 - Returns the size of the queue, not including any current running actions.
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
 *
*/
function BlockingQueue(){
	var queue = [];
	var ongoing = false;
	
	this.size = function(){
		return queue.length;
	};

	this.add = function(func){
		queue.push(func);
		if(queue.length == 1 && !ongoing)
			this.unblock();
	};
	
	this.block = function(){
		this.add(function(){});
	};
	
	this.unblock = function(){
		ongoing = true;
		var func = queue.shift();
		if(func)
			func();
		else
			ongoing = false;
	};
}

/* Smart Alert calls printObject on whatever argument you passed in */
function smartAlert(smart){
	if(!smartAlert.oldAlert)
		smartAlert.oldAlert = window.alert;
	if(smart)
		window.alert = (function(orig){
			return function(){
				arguments[0] = printObject(arguments[0]);
				return orig.apply(this, arguments);
			};
		})(window.alert);
	else
		window.alert = smartAlert.oldAlert;
}

/* Get computed style so style includes non-inline styling and regular html sizing
 * forceNumeric is necessary for certain odd values like border-width being medium (default in ie8
 */
function style(dom, prop, forceNumeric){
	prop = prop.toLowerCase();
	if(document.defaultView && document.defaultView.getComputedStyle){
		var val = document.defaultView.getComputedStyle(dom).getPropertyValue(prop);

		if(val == "0px" || (val == "auto" && forceNumeric)){
			if(prop == "width"){
				return dom.offsetWidth;
			}else if(prop == "height")
				return dom.offsetHeight;
			else if(prop == "top")
				return dom.offsetTop;
			else if(prop == "left")
				return dom.offsetLeft;
		}
		return val;
	}else if (dom.currentStyle){
		var s = dom.currentStyle[prop];
		if(s == "auto" && forceNumeric)
			if(prop == "width"){
				return dom.offsetWidth;
			}else if(prop == "height")
				return dom.offsetHeight;
			else if(prop == "top")
				return dom.offsetTop;
			else if(prop == "left")
				return dom.offsetLeft;
		if(prop.indexOf("border") > -1 && prop.indexOf("width") > -1 && forceNumeric){
			prop = prop.split("-");
			var s2;
			if(prop.length == 2)
				s2 = prop[0] + "-" + prop[1] + "-style";
			else if(prop.length == 3)
				s2 = prop[0] + "-style";
			var bStyle = dom.currentStyle[s2];
			while(bStyle == "inherit"){
				if(dom.parentNode){
					dom = dom.parentNode;
					bStyle = dom.currentStyle[s2];
				}else
					bStyle = "none";
			}
			if(bStyle != "none" && bStyle != "hidden"){
				if(s == "medium")
					return "3px";
				else if(s == "thin")
					return "1px";
				else if(s == "thick")
					return "5px";
			}else
				s = "0px";
		}
		return s;
	} else {
		return dom.style[prop];
	}
}

/*
 * Add a special function that escapes html (window.escape just escapes to unicode
 * Use this for stuff like &lt;div&gt;Hello World!&lt;/div&gt;
 */
function escapeHTML(str){
	return genEl("pre",{},{},str).innerHTML;
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

/* If rootBorder is true, then the root border is considered part of the element and is not part of the offset
 * Returns the absolute top of the element */
function absoluteTop(elem, rootBorder){
	if(elem.offsetParent)
		return elem.offsetTop + parseInt(style( rootBorder? elem.offsetParent : elem ,
											"border-top-width", true)) + absoluteTop(elem.offsetParent);
	return elem.offsetTop + rootBorder? 0 : parseInt(style(elem, "border-top-width", true));
}
/* If rootBorder is true, then the root border is considered part of the element and is not part of the offset
 * Returns the absolute left of the element */
function absoluteLeft(elem, rootBorder){
	if(elem.offsetParent)
		return elem.offsetLeft + parseInt(style( rootBorder? elem.offsetParent : elem ,
											"border-left-width", true)) + absoluteLeft(elem.offsetParent);
	return elem.offsetLeft + rootBorder? 0 : parseInt(style(elem, "border-left-width", true));
}

/* If rootBorder is true, then the origin is considered to be in the top-left corner, otherwise, it is just inside the border.
 * This further means that if rootBorder is false, this function may return negative number
 * Returns the x position of mouseevent in an element */
function getRelativeX(event, elem, rootBorder){
	if(event.changedTouches && event.changedTouches.length > 0)
		event = event.changedTouches[0];
	
	return parseInt(event.clientX) + parseInt(window.pageXOffset?window.pageXOffset:document.body.scrollLeft) - absoluteLeft(elem, rootBorder);
}
/* If rootBorder is true, then the origin is considered to be in the top-left corner, otherwise, it is just inside the border.
 * This further means that if rootBorder is false, this function may return negative number 
 * Returns the y position of mouseevent in an element */
function getRelativeY(event, elem, rootBorder){
	if(event.changedTouches && event.changedTouches.length > 0)
		event = event.changedTouches[0];
		
	return parseInt(event.clientY) + parseInt(window.pageYOffset?window.pageYOffset:document.body.scrollTop) - absoluteTop(elem, rootBorder);
}

/* Add method to arrays to swap elements at given indices */
Array.prototype.swap = function(i1, i2){
	var self=this, temp = self[i1];
	self[i1] = self[i2];
	self[i2] = temp;
	return this;
}

/* Add math constant value to Math object */
Math.PHI = 1.6180339887498948;

/* Returns a value as close to val as possible above the min and below the max.
 * Note that the order doesn't matter of the restrictions */
Math.restrict = function(val, resriction1, resriction2){
	var min = Math.min(resriction1, resriction2);
	var max = Math.max(resriction1, resriction2);
	return Math.min(Math.max(min, val), max);
};

/* Allows passing of arrays to min and max functions */
Math.max = (function(orig){
	return function(){
		var a = arguments;
		a = (a.length>0 && (Array.isArray(a[0]) || (a[0].toString() == "[object Arguments]")))?a[0]:a;
		return orig.apply(this, a);
	}
})(Math.max);
Math.min = (function(orig){
	return function(){
		var a = arguments;
		a = (a.length>0 && (Array.isArray(a[0]) || (a[0].toString() == "[object Arguments]")))?a[0]:a;
		return orig.apply(this, a);
	}
})(Math.min);
Math.random = (function(orig){
	return function(){
		var a = arguments, l = a.length;
		if(l == 1)
			return orig.apply(this)*a[0];
		else if(l == 2){
			if(typeof a[1] == "boolean"){
				var r = orig.apply(this)*a[0];
				if(a[1])
					r = Math.floor(r);
				return r;
			}
			var min = Math.min(a);
			return orig.apply(this)*(Math.max(a)-min) + min;
		}
		else if(l == 3){
			var min = Math.min(a), r = orig.apply(this)*(Math.max(a)-min) + min;
			if(a[2])
				r = Math.floor(r);
			return r;
		}
		else
			return orig.apply(this);
	}
})(Math.random);

/* Returns the average value */
Math.avg = function(){
	var s=0,i=0,a=arguments,l=a.length;
	if(l>0 && Array.isArray(a[0]))
		a = a[0];
	while(i<l)
		s+= a[i++];
	return s/l;
};

/* Returns the median value using Hoare's Selection Algorithm */
/* Source: http://blog.teamleadnet.com/2012/07/quick-select-algorithm-find-kth-element.html */
Math.med = function(){
	function selectKth(arr, k){
		var from = 0, to = arr.length - 1;
		while(from < to){
			var r = from, w = to, mid = arr[Math.floor((r + w) / 2)];
			while(r < w){
				if(arr[r] >= mid)
					Array.prototype.swap.call(arr,r,w--);
				else
					r++;
			}
			if(arr[r] > mid)
				r--;
			if(k <= r)
				to = r;
			else
				from = r + 1;
		}
		return arr[k];
	}
	
	var args=arguments,l=args.length;
	if(l>0 && Array.isArray(args[0]))
		args = args[0];
	
	if(l%2>0)
		return selectKth(args, Math.floor(l/2));
	else
		return (selectKth(args, l/2) + selectKth(args, l/2-1))/2;
}

function Node(val){
	this.value = val;
	this.childNodes = [];
	this.parentNode = null;
	
	this.attach = function(node){
		this.childNodes.push(node);
		node.parentNode = this;
	};
	this.detach = function(node){
		var index = this.childNodes.indexOf(node);
		if(index >= 0)
			this.childNodes.splice(index, 1);
	};
	
	this.toString = function(){
		var ret;
		/*console.log(typeof this.value);
		if((typeof this.value) == "object"){
			for(var i in this.value)
				ret += i + ": " + this.value[i] + " ";
		}else{
			ret = this.value;
		}
		ret += " (";*/
		ret = this.value + " (";
		for(var i=0;i<this.childNodes.length;i++){
			ret += this.childNodes[i].toString();
			if(i != this.childNodes.length-1)
				ret += ", ";
		}
		ret += ")";
		return ret;
	};
}

Tree = {
	Node : function(val){
		this.value = val;

		this.lNode = null;
		this.rNode = null;
		this.pNode = null;
		
		this.attach = function(node, comparator){
			var c = comparator(this.value, node.value);
			if(c>0)
				if(this.rNode == null){
					this.rNode = node;
					node.pNode = this;
				}else
					this.rNode.attach(node, comparator);
			else if(c<0)
				if(this.lNode == null){
					this.lNode = node;
					node.pNode = this;
				}else
					this.lNode.attach(node, comparator);
		}
	},
	
	Binary : function(vals, comparator){
		var c = comparator || function(a,b){
			var t = typeof a;

			if(t != typeof b)
				return;

			if(t == "string")
				return b.localeCompare(a);
			else if(t== "number")
				return b-a;
		}, root, i=1, l=vals.length;
		
		this.min = function(){
			var n = root;
			while(n.lNode != null)
				n = n.lNode;
			return n.value;
		};
		this.max = function(){
			var n = root;
			while(n.rNode != null)
				n = n.rNode;
			return n.value;
		};
		this.add = function(vals){
			if(!Array.isArray(vals))
				vals = [vals];

			var i=0;
			if(!root)
				root = new Tree.Node(vals[i++]);
			while(i<vals.length)
				root.attach(new Tree.Node(vals[i++]), c);

			return this;
		}

		this.add(vals);
	}
}

/* Adds zeros to the front of a number to make at least the length given.
 * Undefined return value for non-number */
function addPadding(val, pad, len, front){
	val = val.toString();
	pad = pad.toString();
	while(val.length<len)
		if(front)
			val = pad + val;
		else
			val += pad;

	if(val.length>len)
		if(front)
			val = val.substring(val.length-len);
		else
			val = val.substring(0, val.length);
	
	return val;
}

/* Takes time in seconds and returns the time in hh:mm:ss notation
 * forceHour is optional to force 00:mm:ss when there are no hours */
function friendlyTime(time, forceHour){
	time = parseInt(time);
	var sec = addPadding(Math.round(time%60), 0, 2, true);
	var min = addPadding(Math.round(time/60)%60, 0, 2, true);
	var hr = addPadding(Math.round(time/3600), 0, 2, true);
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

/* Removes all child nodes from element */
function empty(el){
	while(el.firstChild && el.removeChild(el.firstChild));
	return el;
}

/* Calls the function on the element and all children of the element
 * textNodes (Boolean) - optional. If resolves to true, include textNodes, otherwise, just child Elements
 */
function childApply(el, func, textNodes){
	func(el);
	for(var i=0,c=textNodes?el.childNodes:el.children;i<c.length;i++)
		childApply(c[i], func);
}

/* Resets all input/form stuff */
function clearForm(el){
	if(el instanceof HTMLFormElement)
		el.reset();
	else{
		var f = genEl("form");
		var p = el.parentNode;
		p.insertBefore(f,el) //returns f, so then append el to it
			.appendChild(el);
		f.reset();
		p.insertBefore(el,f);
		p.removeChild(f);
	}
}

/* Class modification functions */
// el may be an element or an array of elements
// className may be a string or an array of strings
function putClass(el, className){
	if(!Array.isArray(el))
		el = [el];

	if((typeof className) === "string")
		className = [className];

	for(var i=0;i<el.length;i++)
		for(var j=0;j<className.length;j++)
			if(!hasClass(el[i], className[j]))
				el[i].className += " " + className[j];
}
// el may be an element or an array of elements
// className may be a string or an array of strings
function remClass(el, className){
	if(!Array.isArray(el))
		el = [el];

	if((typeof className) === "string")
		className = [className];

	this.index; //needs to be defined somewhere
	for(var i=0;i<el.length;i++){
		var classes = el[i].className.split(" ");
		for(var j=0;j<className.length;j++){
			if((index = (classes.indexOf(className[j]))) > -1)
				classes.splice(index, 1);
		}
		el[i].className = classes.join(" ");
	}
}
// className may be a string or an array of strings, if array, it checks if all are found
function hasClass(el, className){
	if(className == null)
		return false;
	if((typeof className) === "string")
		className = [className];
	
	var counter = 0;
	for(var i=0;i<className.length;i++)
		if(el.className.match(new RegExp('[\\s]*' + className[i] + '[\\s]*')))
			counter++;
	return counter == className.length;
}
function toggleClass(el, className){
	if(!Array.isArray(el))
		el = [el];

	if((typeof className) === "string")
		className = [className];
		
	for(var i=0;i<el.length;i++){
		if(hasClass(el[i], className))
			remClass(el[i], className);
		else
			putClass(el[i], className);
	}
}

// dumps the object and it's parts into a string with spacing and newlines 
function printObject(obj){
	var ret = obj;
	if(typeof obj !== "string" && typeof obj !== "number")
		ret += "\n\n";
		for(var i in obj){
			var o = obj[i];
			ret += i + ": " + o + "\n";
			if(o != null && typeof o === "object"){
				var p = printObject(o).split("\n");
				p.pop();
				for(var j in p)
					p[j] = "-  " + p[j];
				ret += p.join("\n") + "\n";
			}
		}
	return ret;
}

/* Color Library */
/* Includes many static functions */
function Color(r,g,b,a){
	this.reset = function(c){
		c = c || this;
		c.r = c.g = c.b = 0;
		c.a = 1;
	}
	this.rgb = function(c, g, b){
		c = (g != null && b != null)? new Color(c,g,b) : new Color(c || this);
		c = this.toRGBA(c);
		return "rgb("+c[0]+","+c[1]+","+c[2]+")";
	}
	this.rgba = function(c, g, b, a){
		c = (g != null && b != null)? new Color(c,g,b,a) : new Color(c || this);
		c = this.toRGBA(c);
		return "rgba("+c[0]+","+c[1]+","+c[2]+","+c[3]+")";
	}
	this.hex = function(c, g, b, forceLong){
		if(typeof c === "boolean"){
			forceLong = c;
			c = new Color(this);
		}else if(typeof g == "boolean"){
			forceLong = g;
			c = new Color(c || this);
		}else if(g != null && b != null)
			c = new Color(c,g,b);

		c = this.toRGBA(c);
		c[0] = addPadding(c[0].toString(16), 0, 2, true);
		c[1] = addPadding(c[1].toString(16), 0, 2, true);
		c[2] = addPadding(c[2].toString(16), 0, 2, true);
		if(!forceLong &&
				c[0].charAt(0) == c[0].charAt(1) &&
				c[1].charAt(0) == c[1].charAt(1) &&
				c[2].charAt(0) == c[2].charAt(1)){
			c[0] = c[0].charAt(0);
			c[1] = c[1].charAt(0);
			c[2] = c[2].charAt(0);
		}
		return "#"+c[0]+""+c[1]+""+c[2];
	}
	//Returns HSLA
	// H - 0 - 359
	// S - 0.0 - 1.0
	// L - 0.0 - 1.0
	// A - 0.0 - 1.0
	this.toHSLA = function(c, g, b){
		if(g != null & b != null)
			c = new Color(c,g,b);
		else if(c != null)
			c = new Color(c);
		else
			c = this;
		
		var r = c.r/255;
			g = c.g/255;
			b = c.b/255;
		var max = Math.max(r,g,b), min = Math.min(r,g,b);
		var delta = max-min;
		
		var l = Math.avg(max,min);
		var s = delta/(1-Math.abs(2*l-1));
		var h;
		if(delta==0)
			h = 0;
		else if(r == max)
			h = ((g-b)/delta)%6;
		else if(g == max)
			h = (b-r)/delta+2;
		else
			h = (r-g)/delta+4;
		
		h = h || 0;
		s = s || 0;
			
		return [((60*h+360)%360), s, l, a];
	}
	//Returns HSVA
	// H - 0 - 359
	// S - 0.0 - 1.0
	// V - 0.0 - 1.0
	// A - 0.0 - 1.0
	this.toHSVA = function(c, g, b){
		if(g != null & b != null)
			c = new Color(c,g,b);
		else if(c != null)
			c = new Color(c);
		else
			c = this;
		
		var r = c.r/255;
			g = c.g/255;
			b = c.b/255;
		var max = Math.max(r,g,b), min = Math.min(r,g,b);
		var delta = max-min;
		
		var v = max;
		var s = delta/max;
		var h;
		if(r == max)
			h = (((g-b)/delta)%6);
		else if(g == max)
			h = ((b-r)/delta+2);
		else
			h = ((r-g)/delta+4);

		h = h || 0;
		s = s || 0;
		
		return [(h*60+360)%360, s, v, a];
	}

	//c1 is on bottom or if c2 is not defined, *this* is below c1
	this.combine = function(c1, c2, b, a){
		if(b != null){
			c1 = new Color(c1, c2, b, a)
			c2 = null;
		}else
			c1 = new Color(c1);
		if(c2){
			c2 = new Color(c2);
			var alpha = c1.a*(1-c2.a);
			c1.r = Math.round(Math.restrict(c1.r*alpha + c2.r*c2.a, 0, 255));
			c1.g = Math.round(Math.restrict(c1.g*alpha + c2.g*c2.a, 0, 255));
			c1.b = Math.round(Math.restrict(c1.b*alpha + c2.b*c2.a, 0, 255));
			c1.a = Math.restrict(alpha + c2.a, 0, 1);
			return c1;
		}else{
			c2 = c1;
			c1 = this;
			var alpha = c1.a*(1-c2.a);
			this.r = Math.round(Math.restrict(c1.r*alpha + c2.r*c2.a, 0, 255));
			this.g = Math.round(Math.restrict(c1.g*alpha + c2.g*c2.a, 0, 255));
			this.b = Math.round(Math.restrict(c1.b*alpha + c2.b*c2.a, 0, 255));
			this.a = Math.restrict(alpha + c2.a, 0, 1);
			return this;
		}
	}
	
	
	/*
	 * Converts colors in the form "rgb", "#rgb", "rrggbb", "#rrggbb", "rgb(r,g,b)", and "rgba(r,g,b,a)"
	 * Returns array - [r, g, b, a] where r,g,b = [0-255] and a = [0-1] (but really is all real numbers)
	 */
	this.toRGBA = function(col){
		if(col == null)
			return [this.r, this.g, this.b, this.a];
		else if(Array.isArray(col))
			return [Math.round(Math.restrict(col[0] || 0, 0, 255)),
					Math.round(Math.restrict(col[1] || 0, 0, 255)),
					Math.round(Math.restrict(col[2] || 0, 0, 255)),
					Math.restrict(col[3] || 1, 0, 1)]
		else if(col instanceof Color)
			return [col.r, col.g, col.b, col.a];

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
				Math.restrict(col.substring(col.lastIndexOf(",")+1, col.lastIndexOf(")"), 0, 1))
			];
		}
		return col;
	}
	
	/* Handle code after function definition */
	if(Array.isArray(r)){
		a = r[3];
		b = r[2];
		g = r[1];
		r = r[0];
	}else if(typeof r === "string"){
		r = this.toRGBA(r);
		a = r[3];
		b = r[2];
		g = r[1];
		r = r[0];
	}else if(r instanceof Color){
		a = r.a;
		b = r.b;
		g = r.g;
		r = r.r;
	}
	this.r = Math.round(Math.restrict(r||0, 0, 255));
	this.g = Math.round(Math.restrict(g||0, 0, 255));
	this.b = Math.round(Math.restrict(b||0, 0, 255));
	this.a = Math.restrict(a==null?1:a, 0, 1);
}
//Set up static functions on Color object/class
(function(c){
	Color.reset = c.reset;
	Color.rgb = c.rgb;
	Color.rgba = c.rgba;
	Color.hex = c.hex;
	Color.combine = c.combine;
	Color.toRGBA = c.toRGBA;
	Color.toHSLA = c.toHSLA;
	Color.toHSVA = c.toHSVA;
})(new Color());

/* Smart map function
 * Maps array elements, HTMLElements and their children
 * Top down mapping (self, children, grandchildren, etc.)
 * Options - self (apply function to self), deep (apply function to grand children, etc.)
 */
function map(o, f, opts){
	opts = opts || {};
	if(opts.self)
		o = f(o);
	opts.self = false;

	if(Array.isArray(o)){
		o = o.map(f);
		if(opts.deep)
			for(var i in o)
				if(Array.isArray(o[i]))
					o[i] = map(o[i], f, opts);
					
		return o;
	}
	if(o instanceof HTMLElement){
		var c = o.children;
		for(var i=0;i<c.length;i++){
			f(c[i]);
			if(opts.deep)
				map(c[i], f, opts);
		}
		return o;
	}
	switch(typeof o){
		case "string":
			return o.split('').map(f).join('');
		case "object":
		case "function":
			for(var i in o){
				o[i] = f(o[i]);
				if(opts.deep)
					if(typeof o === typeof O)
						o[i] = map(o[i], f, opts);
			}
			return o;
	}
}

function putImportant(el, prop, val){
	try{
		el.style.setProperty(prop, val, "important");
	}catch(e){
		//This is a very messy way of ensuring !important works.
		//Creates a css file at the bottom of the footer and try to select it with a very specific property selector
		if(!this.css){
			this.css = genEl("style");
			document.body.appendChild(css);
		}
		var r = Math.random();
		el.setAttribute("djuice-special-property", r);
		var inner = el.tagName+"[djuice-special-property=\"" + r + "\"]{" + prop + ":" + val + " !important;}";
		try{
			css.appendChild(document.createTextNode(inner));
		}catch(e){ //IE will only fill style elements using .text
			css.text += inner;
		}
	}
}

//Date to Month/Day/year HH:MM Period (AM/PM)
function dateToMDYHMP(date){
	if(typeof date === "string" || typeof date === "number")
		date = new Date(date);

	//Pad the minutes (8:9 -> 8:09)
	var minutes = addPadding(date.getMinutes(), 0, 2, true);

	return date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear() + " " + ((date.getHours()%12)+1) + ":" + minutes + " " + (date.getHours()>11?"A":"P") + "M";
}

/*
 * selectOption takes a HTMLSelectElement and a string
 * It selects the options in the SelectElement whose value matches the opt
 */
function selectOption(el, opt){
	var opts = el.options;
	for(var i=0;i<opts.length;i++)
		if(opts[i].value === opt)
			opts[i].selected = true;
		else
			opts[i].selected = false;
}

/*
 * Creates a DOMElement
 * type (string) - type of element e.g. "div", "input"
 * attrs (object) - any attribute, including onevent.  Calls setAttribute for any natural attribute or sets as expando attribute for non-standard properties (to avoid stringifying values).  Call in the form of {id:"myId", bgcolor:"red", onclick:myfunc}. Keep in mind that "name" is a reserved word in js so you need to put it in quotes.
 * styles (object) - inline styles in the form of {border: "1px solid blue", width: 300}
 * inner (string or Element) - string puts a textnode inside the new element, Element appends inner to the newly created element
 * Returns the element created
 */
function genEl(type, attrs, styles, inner){
   "el:nomunge";
	//Create element
	var el = document.createElement(type);

	//Set attributes
	for(var attr in attrs){
		var value = attrs[attr];
		if(attr in el || attr.toLowerCase() in el){
			if(typeof value == "function")
				value = "(" + value + ")()"; //Just execute the function because stripping wrapper makes quote issues
			el.setAttribute(attr, value);
		}else{
			if(attr == "class") //Fix for "class" not recognized as in Element
				attr += "Name";
			eval("el." + attr + "=value");
		}
	}
	
	//Set styles
	var r; //may or may not be needed
	for(var s in styles){
		if(styles[s].indexOf("!important") == -1)
			el.style[s] = styles[s];
		else{
			var value = styles[s].split("!important")[0];
			try{
				el.style.setProperty(s, value, "important");
			}catch(e){
				//This is a very messy way of ensuring !important works.
				//Creates a css file at the bottom of the footer and try to select it with a very specific property selector
				if(!this.css){
					this.css = genEl("style");
					document.head.appendChild(css);
				}
				if(!r){
					r = Math.random();
					el.setAttribute("djuice-special-property", r);
				}
				el.style[s] = value;
				var cssInner = type+"[djuice-special-property=\"" + r + "\"]{" + s + ":" + value + " !important;}";
				try{
					css.appendChild(document.createTextNode(cssInner));
				}catch(e){ //IE will only fill style elements using .text
					css.text += cssInner;
				}
			}
		}
	}

	//Set inner values, string or Node (e.g. element, text node)
	if(inner instanceof Node){
		el.appendChild(inner);
	}else if(typeof inner != "undefined"){
		if(type.toLowerCase() === "style" && el.styleSheet){
			el.styleSheet.cssText = inner;
		}else{
			try{
				el.appendChild(document.createTextNode(inner));
			}catch(e){ //IE will only fill style elements using .text
				el.text = inner;
			}
		}
	}
	return el;
}

/* AjaxRequest is designed to send and receive data from a server easily
 * Constructor:
 * 	url (Required) - address to request from
 * 	method (Required) - "post" or "get" or "delete"
 * 	contentType (Optional) - sets requeset header "Content-type" e.g. "application/x-www-form-urlencoded", defaults = "text/plain"
 * 	options (Optional) - Object containing the following attributes
 * 		defaultAsync (Optional) - sent requests default to asynchronous or not, defaults to false
 * 		preventCache (Optional) - adds a random string to the end to prevent browsers from caching get requests, defaults to true if other get arguments are sent (For IE mostly)
 * 		defaultRetry (Optional) - sets default # of retries on send, defaults to 3
 * send:
 * 	query (Optional) - either string or object, defaults to "", DO NOT include "?"
 * 	String - sends just the plain string
 * 	Object - converts orderd pairs of objects into key/value pair for query data.  e.g. {"user":"frank","pass":"secret"} -> "?user=frank&pass=secret"
 * 	func (Optional) - Object or Function to call on returned value, e.g. function(ret){ alert("The server returned: '" + ret + "'"); }
 * 		if func is an Object, then it contains key-value pairs of response codes and functions, e.g. {200:func1, 404:func2}
		if func is a function, then it is called only when the response code is 200
 * 	options (Optional) - Object containing the following attributes
 *		async (Optional) - sets if the request should be asynchronous or not, defaults to object's defaultAsync
 *		retry (Optional) - sets # of retries for request, defaults to object's defaultRetry
 *
 * Example call:
 * 	var ar = new AjaxRequest("./serverScripts/script.php", "post");
 * 	ar.send({"login":"pete","password":"pa55woRd","action":"update"}, function(ret){
 * 		if(parseInt(ret) == 1)
 * 			alert("Update successful");
 * 		else
 * 			alert("Whoops!");
 * 	}, true, 10);
 * 	alert("This might alert before the request returns");
 */
function AjaxRequest(url, method, contentType, options){
	var u = url;
	var m = method.toLowerCase();
	var contentType = contentType || "text/plain";
	if(options == null)
		options = {async:false, preventCache:true};
	var defaultAsync = !!options.async;
	if(options.preventCache == undefined)
		options.preventCache = true;
	var preventCache = !!options.preventCache;
	var defaultRetry = options.retry || 3;
	
	this.send = function(query, func, options){
		if((typeof query) === "undefined")
			query = "";
		else if(!(window.FormData && query instanceof FormData) && //FD not exists or not FD &
				(typeof query) === "object"){ //is object
			var temp = "";
			for(var i in query){
				temp += i + "=" + query[i] + "&";
			}
			query = temp;
		}
		if(options == null)
			options = {};
		var async = options.async ? options.async : defaultAsync;
		var retry = options.retry ? options.retry : defaultRetry;

		if(typeof func === "function")
			func = {200:func};

		while(retry>0){
			try{
				var xmlhttp = new XMLHttpRequest();
				xmlhttp.onreadystatechange=function(){
					if(xmlhttp.readyState==4){
						if(func && func[xmlhttp.status])
							func[xmlhttp.status](xmlhttp.responseText);
						return;
					}
				}
				if(m == "get"){
					xmlhttp.open("GET", url + (query?"?" + query + (preventCache?"&"+new Date().getTime()+""+Math.random():""):""), async);
					xmlhttp.send();
				}else if(method == "delete"){
					xmlhttp.open("DELETE", url + (query?"?" + query + (preventCache?"&"+new Date().getTime()+""+Math.random():""):""), async);
					xmlhttp.send();
				}else if(method == "post"){
					xmlhttp.open("POST", url, async);
					if(!(window.FormData && query instanceof FormData))
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