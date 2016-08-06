function extractYoutubeVideoId(url){
	if(url.indexOf("&")!=-1)
		url = url.substring(0, url.indexOf("&"));
	if(url.indexOf("youtu.be/")!=-1)
		return url.substring(url.indexOf(".be/")+4);
	else
		return url.substring(url.indexOf("v=")+2);
}

//Ensure correct setting of class/className
var HELPER_CLASSNAME = (function(){
	var el = document.createElement("div");
	el.className = "t";
	return el.getAttribute("class") === "t" ? "class" : "className";
})();
function genEl(type, attrs, styles, innerHTML){
	var el = document.createElement(type);

	for(var attr in attrs)
		if(attr == "class" || attr == "className")
			el.setAttribute(HELPER_CLASSNAME, attrs[attr]);
		else if(attr.indexOf("on") == 0){
			//var f = attrs[attr].toString();
			
			//Dumps the contents of the function into the attribute
			//f = f.substring(f.indexOf("{")+1);
			//f = f.substring(0, f.lastIndexOf("}"));
			//el.setAttribute(attr, f);
			
			el.addEventListener(attr.substring(2), attrs[attr]); //NOT IDEAL SOLUTION but appears to conform to chrome
		}else
			el.setAttribute(attr, attrs[attr]);

	var cssText = "";
	for(var style in styles)
		cssText += style + ":" + styles[style] + ";";
	el.style.cssText = cssText;

	el.innerHTML = innerHTML?innerHTML:"";

	return el;
}