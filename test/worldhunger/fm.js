var padding = 30;
var maxWidth = 80;
var maxHeight = maxWidth;
var startingY = 70; //Black bar
var startingHeight = 10; //Black bar

var bottomHeight = 150;

var buttonY = 40;
var buttonPadding = 10;
var buttonWidth = 30;
var buttonHeight = buttonWidth;
var buttonsList = [	["up.jpg", function(){cwd = getAbsolutePath(cwd + '/..');refresh();}, "Up"],
					["copy.jpg", function(){sendCopy()}, "Copy"],
					["paste.jpg", function(){sendPaste()}, "Paste"] ];

var customPromptWidth = 300, customPromptHeight = 100;
var textPadding = 2;
var menuItemHeight = 20;
var menuItemPadding = 5;
var menuItems = ["Delete", "Copy", "Cut", "Rename", "Properties"];
var extraMenuItems = ["Create Directory", "Create File", "Paste"];


var font = menuItemHeight/1.5 + "px Arial Bold";
var regularFont = menuItemHeight/1.5 + "px Arial";

var tempCanvas = document.createElement("canvas");
tempContext = tempCanvas.getContext("2d");
tempContext.font = font;
var menuItemWidth = 0, extraMenuItemWidth = 0;
for(var i=0;i<menuItems.length;i++)
	menuItemWidth = Math.max(tempContext.measureText(menuItems[i]).width, menuItemWidth);
menuItemWidth += 2*menuItemPadding;
for(var i=0;i<menuItems.length;i++)
	extraMenuItemWidth = Math.max(tempContext.measureText(extraMenuItems[i]).width, extraMenuItemWidth);
extraMenuItemWidth += 2*menuItemPadding;

var username;
var password;
var secret;

var cwd = "/home/quittle/public_html/testDelete";
var cwdText;

var ctrl, isCut, isPrompting;

var icons;
var numItems;
var imageData, isMouseDown, mouseDownStart;
var menuItemDivs, extraMenuItemDivs;
var selections = [];
var copied = [];
var maxIconsX, maxIconsY;
var body = document.body;
var canvas, overCanvas, selectcanvas;
var context, overContext, selectContext;

body.onselectstart=function(){return false};
body.style.MozUserSelect="none";

body.addEventListener('onload', init(), false);

function init(){
	var width = window.innerWidth;
	var height = window.innerHeight;
	
    body.onselectstart=function(){if(!isPrompting) return false};
	body.style.MozUserSelect="none";
	body.onmousedown=function(){if(!isPrompting) return false};
	
	body.onkeydown = function(e) {
		if(!e)
			e = window.event;
		e.stopPropagation();
		e.cancelBubble = true;
		if(!isPrompting){
			ctrl = e.ctrlKey;
			if(e.keyCode == 8){
				cwd = getAbsolutePath(cwd + "/..");
				refresh();
			} else if(e.keyCode == 46){
				if(selections.length>0)
					sendDelete();
			} else if(e.keyCode == 65 && ctrl){
				var everything = document.getElementsByClassName("item");
				for(var i=0;i<everything.length;i++)
					select(everything[i]);
			} else if(e.keyCode == 67 && ctrl){
				sendCopy();
			} else if(e.keyCode == 86 && ctrl){
				sendPaste();
			} else if(e.keyCode == 82 && ctrl){
				refresh();
			} else if(e.keyCode == 88 && ctrl){
				sendCut();
			} else if(e.keyCode == 116){
				location.reload(true);
			}
			return false;
		}
	}
	body.onkeyup = function(e) {ctrl = false;}
	
	body.onmousedown = function(e){
		var node = document.elementFromPoint(event.pageX, event.pageY-window.scrollY);
		if(node!=null && node.className=="item"){
			imageData = context.getImageData(parseInt(node.style.left), parseInt(node.style.top), maxWidth, maxHeight);
			imageData = setImageDataOpacity(imageData, 60);
			isMouseDown = [parseInt(node.style.left) - e.pageX, parseInt(node.style.top) - event.pageY, node];
			mouseDownStart = [e.pageX, e.pageY];
		} else {
			isMouseDown = true;
			mouseDownStart = [e.pageX, e.pageY];
		}
	}
	body.onmouseup = function(e){
		if(isMouseDown){
			selectContext.clearRect(0, 0, selectCanvas.width, selectCanvas.height);
			var node = document.elementFromPoint(event.pageX, event.pageY-window.scrollY);
			if(node!=null && node.className=="item" && node!=isMouseDown[2] && node.rel.split("|")[1]=="dir"){
				clearSelections();
				select(isMouseDown[2]);
				sendCut();
				var prevCWD = cwd;
				cwd = getAbsolutePath(node.rel.split("|")[0]);
				sendPaste();
				cwd = prevCWD;
				refresh();
			}
			isMouseDown = null;
		}
	}
	body.onmousemove = function(e){
		if(isMouseDown)
			if(isMouseDown.length==3 && Math.sqrt(Math.pow(e.pageX-mouseDownStart[0],2) + Math.pow(e.pageY-mouseDownStart[1],2))>5){
				selectContext.globalAlpha = .3;
				selectContext.clearRect(0, 0, selectCanvas.width, selectCanvas.height);
				selectContext.putImageData(imageData, e.pageX + isMouseDown[0], e.pageY + isMouseDown[1]);
			}
			else{
				//if(!ctrl)
				//	clearSelections();
				selectContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
				selectContext.globalAlpha = .5;
				selectContext.fillStyle = "#0054d1";
				selectContext.fillRect(mouseDownStart[0], mouseDownStart[1], e.pageX-mouseDownStart[0], e.pageY-mouseDownStart[1]);
				for(var i= Math.min(mouseDownStart[0],e.pageX);i<Math.max(mouseDownStart[0],e.pageX);i+=20)
					for(var j= Math.min(mouseDownStart[1],e.pageY);j<Math.max(mouseDownStart[1],e.pageY);j+=20){
						var node = document.elementFromPoint(i, j);
						if(node!=null && node.className=="item")
							select(node);
					}
			}
	}
	
	
	body.oncontextmenu = function(e){
		if(!isPrompting){
			e.stopPropagation();
			e.cancelBubble = true;
			hideMenu();
			if(event.pageY>startingY+startingHeight){
				var node = document.elementFromPoint(event.pageX, event.pageY-window.scrollY);
				if(node!=null && node.nodeName=="DIV"){
					if(!ctrl && node.rel.split("|").length==2) //Not holding control and not on a selected one
						clearSelections();
					select(node, parseInt(node.style.left), parseInt(node.style.top));
					showMenu(e.clientX, e.clientY, false);
				}
				else{
					showMenu(e.clientX, e.clientY, true);
				}
			}
			return false;
		}
	};
	body.onclick = function(event){
		if(!isPrompting){
			var node = document.elementFromPoint(event.pageX, event.pageY-window.scrollY);
			if(node!=null && node.nodeName=="DIV" && node.rel!=null){
				var info = node.rel.split("|");
				if(node.className=="menuItem"){
					info[1] = getAbsolutePath(info[1]);
					if(info[0] == "Rename"){
						customPrompt("New name:", false, function(newName){
							if(act(info[0] + "|" + info[1] + "|" + newName) == "-1")
								alert("Error renaming.");
							else
								refresh();
						});
					} else if(info[0] == "Delete"){
						sendDelete();
					} else if(info[0] == "Copy"){
						sendCopy();
					} else if(info[0] == "Cut"){
						sendCut();
					}
				} else if(node.className=="extraMenuItem"){
					if(info[0] == "Create Directory"){
						customPrompt("Directory Name:", false, function(name){
							act("Create Directory|" + getAbsolutePath(cwd + "/" + name));
							refresh();
						});
					} else if(info[0] == "Create File"){
						customPrompt("File Name:", false, function(name){
							act("Create File|" + getAbsolutePath(cwd + "/" + name));
							refresh();
						});
					} else if(info[0] == "Paste"){
						sendPaste();
						refresh();
					}
				} else {
					if(!ctrl){
						clearSelections();
					}
					var index = icons.indexOf(node);
					var rel = node.rel.split("|");
					if(rel.length==2){
						select(node);
					} else {
						deselect(node);
					}
				}
			} else {
				clearSelections();
			}
			hideMenu();
		}
	};
	body.ondblclick = function(e){
		if(!isPrompting){
			var node = document.elementFromPoint(event.pageX, event.pageY);
			if(node!=null && node.nodeName=="DIV"){
				var info = node.rel.split("|");
				if(info[1] == "dir"){
					cwd = info[0];
					refresh();
				} else {
					alert("File viewing available soon");
				}
			}
		}
	};
	
	maxIconsX = Math.floor(width/(maxWidth+padding));
	maxIconsY = Math.floor((height-startingHeight-startingY)/(maxHeight+padding));
	numItems = 0;
	icons = new Array(maxIconsX*maxIconsY);
	
	canvas = document.createElement("canvas");
	canvas.setAttribute("width", width + "px");
	canvas.setAttribute("height", height + "px");
	canvas.style.display = "inline";
	canvas.style.position = "absolute";
	canvas.style.left = "0px";
	canvas.style.top = "0px";
	canvas.style.zIndex = "-9996";
	body.appendChild(canvas);

	selectCanvas = document.createElement("canvas");
	selectCanvas.setAttribute("width", width + "px");
	selectCanvas.setAttribute("height", height + "px");
	selectCanvas.style.display = "inline";
	selectCanvas.style.position = "absolute";
	selectCanvas.style.left = "0px";
	selectCanvas.style.top = "0px";
	selectCanvas.style.zIndex = "-9995";
	body.appendChild(selectCanvas);
	
	overCanvas = document.createElement("canvas");
	overCanvas.setAttribute("width", width + "px");
	overCanvas.setAttribute("height", height + "px");
	overCanvas.style.display = "inline";
	overCanvas.style.position = "absolute";
	overCanvas.style.left = "0px";
	overCanvas.style.top = "0px";
	overCanvas.style.zIndex = "-9994";
	body.appendChild(overCanvas);
	
	context = canvas.getContext("2d");
	context.font = font;
	
	overContext = overCanvas.getContext("2d");
	overContext.font = font;
	overContext.shadowColor = "#000000";
	
	selectContext = selectCanvas.getContext("2d");
	selectContext.font = font;
	
	//Create menu items (on something)
	menuItemDivs = new Array(menuItems.length);
	for(var i=0;i<menuItems.length;i++){
		menuItemDivs[i] = document.createElement("div");
		menuItemDivs[i].style.zIndex = 998;
		menuItemDivs[i].style.curosr = "hand";
		menuItemDivs[i].style.cursor = "pointer";
		menuItemDivs[i].className = "menuItem";
		menuItemDivs[i].rel = menuItems[i];
		menuItemDivs[i].style.width = menuItemWidth;
		menuItemDivs[i].style.height = menuItemHeight+2*menuItemPadding;
		menuItemDivs[i].style.position = "absolute";
		menuItemDivs[i].style.left = -1000;
		menuItemDivs[i].style.top = -1000;
		body.appendChild(menuItemDivs[i]);
	}	
	//Create extra menu items (in space)
	extraMenuItemDivs = new Array(extraMenuItems.length);
	for(var i=0;i<extraMenuItems.length;i++){
		extraMenuItemDivs[i] = document.createElement("div");
		extraMenuItemDivs[i].style.zIndex = 998;
		extraMenuItemDivs[i].style.curosr = "hand";
		extraMenuItemDivs[i].style.cursor = "pointer";
		extraMenuItemDivs[i].className = "extraMenuItem";
		extraMenuItemDivs[i].rel = menuItems[i];
		extraMenuItemDivs[i].style.width = extraMenuItemWidth;
		extraMenuItemDivs[i].style.height = menuItemHeight+2*menuItemPadding;
		extraMenuItemDivs[i].style.position = "absolute";
		extraMenuItemDivs[i].style.left = -1000;
		extraMenuItemDivs[i].style.top = -1000;
		body.appendChild(extraMenuItemDivs[i]);
	}

	var topBar = document.createElement("div");
	topBar.id = "topBar";
	topBar.style.position = "fixed";
	topBar.style.top = 0;
	topBar.style.left = 0;
	topBar.style.width = window.innerWidth;
	topBar.style.height = startingY;
	topBar.style.backgroundColor = "#fff";
	topBar.style.borderBottom = "#222 3px solid";
	topBar.style.zIndex = "999";
	body.appendChild(topBar);
	
	cwdText = document.createElement("div");
	cwdText.style.position = "absolute";
	cwdText.style.top = 0;
	cwdText.style.left = 0;
	cwdText.innerHTML = "Current Directory: ";
	topBar.appendChild(cwdText);
	
	var settings = document.createElement("a");
	settings.id = "settings";
	settings.style.position = "absolute";
	settings.style.top = 0;
	settings.style.right = 5;
	settings.style.backgroundImage = "url('images/settings.jpg')";
	settings.style.width = 30;
	settings.style.height = 30;
	settings.style.cursor = "pointer";
	settings.title = "Settings";
	settings.onclick = function(){showSettings()};
	topBar.appendChild(settings);
	
	var buttons = document.createElement("div");
	buttons.id = "buttons";
	buttons.style.position = "absolute";
	buttons.style.top = startingY-buttonY;
	buttons.style.left = 0;
	buttons.style.height = 30;
	topBar.appendChild(buttons);
	
	for(var i=0;i<buttonsList.length;i++){
		var button = document.createElement("a");
		button.style.width = buttonWidth;
		button.style.height = buttonHeight;
		button.style.backgroundImage = "url('images/" + buttonsList[i][0] + "')";
		button.style.backgroundRepeat = "no-repeat";
		button.style.backgroundPosition = "center";
		button.style.position = "absolute";
		button.style.left = buttonPadding+(buttonWidth+buttonPadding)*i;
		button.onclick = buttonsList[i][1];
		button.title = buttonsList[i][2];
		button.style.cursor = "pointer";
		buttons.appendChild(button);
	}
	
	var bottomBar = document.createElement("div");
	bottomBar.style.position = "fixed";
	bottomBar.style.height = bottomHeight;
	bottomBar.style.width = "100%";
	bottomBar.style.bottom = "0px";
	bottomBar.style.left = "0px";
	bottomBar.style.background = "#aaa";
	bottomBar.style.textAlign = "center";
	bottomBar.style.zIndex = "999";
	body.appendChild(bottomBar);
	
	var output = document.createElement("div");
	output.style.textAlign = "left";
	output.style.width = "95%";
	output.style.height = bottomHeight-30;
	output.style.backgroundColor = "#000";
	output.style.color = "#fff";
	output.style.margin = "0px auto";
	output.style.overflowY = "auto";
	output.innerHTML = "Type commands to be executed from this directory<br />";
	bottomBar.appendChild(output);
	
	var inputBox = document.createElement("input");
	inputBox.id = "inputBox";
	inputBox.name = "inputBox";
	inputBox.type = "text";
	inputBox.style.textAlign = "left";
	inputBox.style.width = "95%";
	inputBox.style.height = 30;
	inputBox.style.margin = "0px auto";
	inputBox.onfocus = function(){isPrompting = true;};
	inputBox.onkeydown = function(e){
		if(!e)
			e = window.event;
		if(e.keyCode == 13){
			output.innerHTML = output.innerHTML + "<div style='color:#0f0;'>" + cwd + " > " + inputBox.value + "</div>";
			output.scrollTop = output.scrollHeight;
			var command = inputBox.value;
			inputBox.value = "Sending...";
			inputBox.readonly = "readonly";
			output.innerHTML = output.innerHTML + act("shell|" + getAbsolutePath(cwd) + "|" + command) + "<br />";
			output.scrollTop = output.scrollHeight;
			refresh();
			inputBox.value = "";
			inputBox.readonly = "";
		}
	}
	inputBox.onblur = function(){isPrompting = false;};
	bottomBar.appendChild(inputBox);
	
	output.onclick = function(){inputBox.focus();};
}

function select(node){
	var x = parseInt(node.style.left);
	var y = parseInt(node.style.top);
	deselect(node);
	var loc = node.rel.split("|")[0].replace(cwd, ""); //take the address and remove everything but the file name
	if(loc!="/.."){
		selectContext.globalAlpha = .5;
		selectContext.fillStyle = "#0054d1";
		selectContext.fillRect(x, y, maxWidth, maxHeight);
		node.rel = node.rel + "|selected";
		selections.push(node);
	}
}

function deselect(node){
	var x = parseInt(node.style.left);
	var y = parseInt(node.style.top);
	var rel = node.rel.split("|");
	node.rel = rel[0] + "|" + rel[1];
	selectContext.clearRect(x, y, maxWidth, maxHeight);
	if(selections.indexOf(node)>-1)
		selections.splice(selections.indexOf(node), 1);
}

function clearSelections(){
	for(var i=0;i<selections.length;i++){
		var rel = selections[i].rel.split("|");
		selections[i].rel = rel[0] + "|" + rel[1];
	}
	selections = [];
	selectContext.clearRect(0, 0, selectCanvas.width, selectCanvas.height);
}

function cut(node){
	var x = parseInt(node.style.left);
	var y = parseInt(node.style.top);
	selectContext.clearRect(x, y, maxWidth, maxHeight);
	selectContext.globalAlpha = .5;
	selectContext.fillStyle = "#ffffff";
	selectContext.fillRect(x, y, maxWidth, maxHeight);
}

//Just use 'action & file [& options...]' format
function loadXMLDoc(queryString, func){
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange=function(){
		if(xmlhttp.readyState==4 && xmlhttp.status==200){
			func(xmlhttp.responseText);
		}
	}
	//xmlhttp.open("GET","test.pl?" + username + "|" + secret + "|" + queryString, false);
	//xmlhttp.send();
	xmlhttp.open("POST","test.pl", false);
	xmlhttp.setRequestHeader("Content-type","text/plain");
	xmlhttp.send(username + "|" + secret + "|" + queryString);
}

function act(action){
	overContext.globalAlpha = .6;
	overContext.fillStyle="#000";
	overContext.fillRect(0, 0, window.innerWidth, window.innerHeight);
	var res;
	var retry = 0;
	while(retry<5)
		try{
			loadXMLDoc(action, function(r){res = r});
			if(res == "VALIDATION_ERROR(-1)"){
				login();
				throw "-1";
			}
			retry = 5;
		} catch(e){
			retry++;
			if(retry==5)
				throw e;
		}
	overContext.clearRect(0, 0, overCanvas.width, overCanvas.height);
	return res;
}

function login(){
	var ret = act("Login|" + username);
	if(ret != "" && ret!= "-1"){
		secret = MD5(MD5(password) + "" + ret);
	}
}

function refresh(){
	cwd = getAbsolutePath(cwd);
	$('div').remove('.item');
	context.clearRect(0,0,canvas.width,canvas.height);

	clearSelections();
	
	$(cwdText).empty();
	cwdText.innerHTML = "Current Directory: ";
	var cwdList = cwd.split("/");
	var href = "";
	for(var i=0;i<cwdList.length;i++){
		var d = document.createElement("span");
		d.innerHTML = cwdList[i] + "/";
		href = href + cwdList[i] + "/";
		d.setAttribute("rel", href);
		d.onclick = function(e){
			cwd = this.getAttribute("rel");
			refresh();
		}
		d.style.cursor = "pointer";
		cwdText.appendChild(d);
	}

	context.fillRect(0, startingY, window.innerWidth, startingHeight);

	numItems=0;
	
	var dirs = getDirs();;
	if(dirs != ""){
		dirs = dirs.split("|");
		for(var i=0;i<dirs.length;i++)
			addItem(dirs[i], cwd + "/" + dirs[i], false);
	}
	
	var files = getFiles();
	if(files != ""){
		files = files.split("|");
		for(var i=0;i<files.length;i++)
			addItem(files[i], cwd + "/" + files[i], true);
	}
}

//String - text to display
//Boolean - whether or not it is multiline
//Function - to do something with the text
function customPrompt(text, multiline, func, password){
	isPrompting = true;
	var background = document.createElement("div");
	background.style.position = "fixed";
	background.style.left = 0;
	background.style.top = 0;
	background.style.width = window.innerWidth;
	background.style.height = window.innerHeight;
	background.style.backgroundColor = "rgba(0, 0, 0, .9)";
	background.style.zIndex = 1000;
	document.body.appendChild(background);
	var box = document.createElement("div");
	box.style.position = "fixed";
	box.style.left = (window.innerWidth-customPromptWidth)/2;
	box.style.top = (window.innerHeight-customPromptHeight)/2;
	box.style.width = customPromptWidth;
	box.style.height = customPromptHeight;
	box.style.border = "1px";
	box.style.background = "#bbb";
	box.style.textAlign = "center";
	background.appendChild(box);
	var label = document.createElement("label");
	label.setAttribute("for", "input");
	label.style.display = "block";
	label.style.padding = "5px";
	label.innerHTML = text;
	box.appendChild(label);

	var input;
	if(multiline){
		input = document.createElement("textarea");
		input.style.height = "60%";
	} else {
		input = document.createElement("input");
		if(password)
			input.type = "password";
		else
			input.type = "text";
		box.style.height = 67;
	}
	input.style.padding = 5;
	input.style.width = customPromptWidth-10;
	input.id = "input";
	
	input.onkeydown = function(e){
		if(e.keyCode == 13) { //Enter
			document.body.removeChild(background);
			isPrompting = false;
			func(input.value);
		} else if (e.keyCode==27){
			document.body.removeChild(background);
			isPrompting = false;
		}
	}
	box.appendChild(input);
	input.focus();
}

function getFiles(){
	return act("getFiles|" + cwd);
}

function getDirs(){
	return act("getDirs|" + cwd);
}

function sendCopy(){
	isCut = false;
	copied = [];
	for(var i=0;i<selections.length;i++){
		var rel = selections[i].rel.split("|");
		copied.push(getAbsolutePath(rel[0]));
	}
}
function sendCut(){
	isCut = true;
	copied = [];
	for(var i=0;i<selections.length;i++){
		var rel = selections[i].rel.split("|");
		copied.push(getAbsolutePath(rel[0]));
		cut(selections[i]);
	}
}
function sendPaste(){
	var ret;
	if(isCut)
		ret = act("Move|" + copied.join(":") + "|" + cwd);
	else
		ret = act("Paste|" + copied.join(":") + "|" + cwd);
	refresh();
	return ret;
}

function sendDelete(){
	var temp = new Array(selections.length);
	for(var i=0;i<selections.length;i++){
		temp[i] = selections[i].rel.split("|")[0];
	}
	var ret = act("Delete|" + temp.join(":") + "|" + cwd);
	refresh();
	return ret;
}

function addItem(str, url, isFile){
	var x = padding + (padding + maxWidth)*parseInt(numItems%maxIconsX);
	var y = startingY + startingHeight + padding + (padding + maxHeight)*parseInt(numItems/maxIconsX);
	drawItem(x, y, str, url, isFile);
	numItems++;
}

function drawItem(x, y, str, url, isFile){
	context.font = font;
	context.clearRect(x, y, maxWidth, maxHeight);
	var div = document.createElement("div");
	div.setAttribute("class", "item");
	div.style.cursor = "hand";
	div.style.cursor = "pointer";
	div.style.left = x;
	div.style.width = maxWidth;
	div.style.top = y;
	div.style.height = maxHeight;
	div.style.position = "absolute";
	div.rel = url + "|" + (isFile?"file":"dir");
	div.innerHTML = "&nbsp;"
	icons[numItems] = div;
	body.appendChild(div);

	var backup = context.getImageData(0, 0, canvas.width, canvas.height);
	//reset so you can get a good estimation
	canvas.setAttribute("height", 0 + "px");
	overCanvas.setAttribute("height", 0 + "px");
	selectCanvas.setAttribute("height", 0  + "px");
	canvas.setAttribute("width", 0 + "px");
	overCanvas.setAttribute("width", 0 + "px");
	selectCanvas.setAttribute("width", 0 + "px");
	
	canvas.setAttribute("height", document.height + padding + "px");
	overCanvas.setAttribute("height", document.height + padding + "px");
	selectCanvas.setAttribute("height", document.height + padding + "px");
	topBar.style.width = getWindowWidth();
	canvas.setAttribute("width", getWindowWidth() + "px");
	overCanvas.setAttribute("width", getWindowWidth() + "px");
	selectCanvas.setAttribute("width", getWindowWidth() + "px");
	context.putImageData(backup, 0, 0);
	
	context.fillStyle = isFile?"#cccccc": "#cccc00";
	context.fillRect(x+maxWidth*.2, y+maxHeight*.2, maxWidth*.6, maxHeight*.6);
	context.fillStyle = "#000000";
	context.strokeRect(x, y, maxWidth, maxHeight);
	div.title = str;
	while(context.measureText(str).width > maxWidth-2*textPadding){
		str = str.substring(0, str.length-4) + "..."
	}
	context.fillText(str, x+maxWidth-context.measureText(str).width-textPadding, y+maxHeight-textPadding, maxWidth-textPadding);
}

function showSettings(){
	isPrompting = true;
	var background = document.createElement("div");
	background.style.position = "fixed";
	background.style.left = 0;
	background.style.top = 0;
	background.style.width = window.innerWidth;
	background.style.height = window.innerHeight;
	background.style.background = "rgba(0, 0, 0, .9)";
	document.body.appendChild(background);
	var box = document.createElement("div");
	box.style.position = "fixed";
	box.style.left = (window.innerWidth-customPromptWidth)/2;
	box.style.top = (window.innerHeight-customPromptHeight)/2;
	box.style.width = customPromptWidth;
	box.style.height = customPromptHeight;
	box.style.border = "1px";
	box.style.background = "#bbb";
	box.style.textAlign = "center";
	background.appendChild(box);
	var label = document.createElement("label");
	label.setAttribute("for", "input");
	label.style.display = "block";
	label.style.padding = "5px";
	label.innerHTML = "Add user";
	box.appendChild(label);

	var userLabel = document.createElement("label");
	userLabel.setAttribute("for", "user");
	userLabel.style["float"] = "left";
	userLabel.style.padding = "5px";
	userLabel.innerHTML = "Username: ";
	box.appendChild(userLabel);
	var user = document.createElement("input");
	user.type = "text";
	user.style.padding = 5;
	user.style.width = 200;
	user.id = "username";
	box.appendChild(user);
	
	var passLabel = document.createElement("label");
	passLabel.setAttribute("for", "pass");
	passLabel.style["float"] = "left";
	passLabel.style.padding = "5px";
	passLabel.innerHTML = "Password: ";
	box.appendChild(passLabel);
	
	var pass = document.createElement("input");
	pass.type = "password";
	pass.style.padding = 5;
	pass.style.width = 200;
	pass.id = "password";
	
	
	user.onkeydown = function(e){
		if(e.keyCode == 13) { //Enter
			pass.focus();
		} else if (e.keyCode==27){ //Esc
			document.body.removeChild(background);
			isPrompting = false;
		}
	}
	pass.onkeydown = function(e){
		if(e.keyCode == 13) { //Enter
			alert(act("createUser|" + user.value + "|" + MD5(pass.value)));
			document.body.removeChild(background);
			isPrompting = false;
		} else if (e.keyCode==27){ //Esc
			document.body.removeChild(background);
			isPrompting = false;
		}
	}
	box.appendChild(pass);

	user.focus();
}

function showMenu(x, y, extra){
	overContext.globalAlpha = 1;
	overContext.fillStyle = "#888888";
	overContext.shadowBlur = 7;
	overContext.fillRect(x, y, extra?extraMenuItemWidth:menuItemWidth, (2*menuItemPadding + menuItemHeight)*(extra?extraMenuItems.length:menuItems.length));
	overContext.shadowBlur = 0;
	overContext.fillStyle = "#000000";
	overContext.strokeStyle = "#000000";
	if(extra){
		for(var i=0;i<extraMenuItems.length;i++){
			overContext.fillText(extraMenuItems[i], x+menuItemPadding, menuItemHeight+y+(2*menuItemPadding+menuItemHeight)*(i));
			overContext.strokeRect(x, y+(2*menuItemPadding+menuItemHeight)*i, extraMenuItemWidth, menuItemHeight+menuItemPadding*2);
			extraMenuItemDivs[i].rel = extraMenuItems[i];
			extraMenuItemDivs[i].style.left = x;
			extraMenuItemDivs[i].style.top = y+(2*menuItemPadding+menuItemHeight)*i;
		}
	}
	else{
		var fileInfo = "";
		for(var i=0;i<menuItems.length;i++){
			overContext.fillText(menuItems[i], x+menuItemPadding, menuItemHeight+y+(2*menuItemPadding+menuItemHeight)*(i));
			overContext.strokeRect(x, y+(2*menuItemPadding+menuItemHeight)*i, menuItemWidth, menuItemHeight+menuItemPadding*2);
			if(!fileInfo) fileInfo=document.elementFromPoint(x,y).rel;
			menuItemDivs[i].rel = menuItems[i] + "|" + fileInfo;
			menuItemDivs[i].style.left = x;
			menuItemDivs[i].style.top = y+(2*menuItemPadding+menuItemHeight)*i;
		}
	}
}

function hideMenu(){
	overContext.clearRect(0, 0, overCanvas.width, overCanvas.height);
	for(var i=0;i<menuItems.length;i++){
		menuItemDivs[i].style.left = -1000;
		menuItemDivs[i].style.top = -1000;
	}
	for(var i=0;i<extraMenuItems.length;i++){
		extraMenuItemDivs[i].style.left = -1000;
		extraMenuItemDivs[i].style.top = -1000;
	}
}

function getAbsolutePath(relPath){
	if(relPath.indexOf("/")!=0){
		relPath = window.location.pathname + relPath;
	}
	while(relPath.indexOf("//")!=-1)
		relPath = relPath.replace("//", "/");
	relPath = relPath.split("/");
	while(relPath.indexOf("")>-1){
		relPath.splice(relPath.indexOf(""),1);
	}
	while(relPath.indexOf("..")>-1){
		var i = relPath.indexOf("..");
		if(i==0)
			throw new Exception("Uh oh, cannot traverse to parent before root");
		relPath.splice(i-1, 2);
	}
	var ret = "";
	return "/" + relPath.join("/");
}

function getWindowWidth(){
	var w = 999999999;
	if(window.innerWidth)
		w = window.innerWidth;
	if(document.documentElement.clientWidth)
		w = Math.min(w, document.documentElement.clientWidth);
	if(document.body.clientWidth)
		w = Math.min(w, document.body.clientWidth);

	return w;
}
//returns the imageData with a given opacity
//if lower than the opacity, the pixel is unchanged
//opacity is 0-255
function setImageDataOpacity(imageData, opacity){
	var data = imageData.data;
	for(var i=3;i<data.length;i+=4){
		data[i] = Math.min(data[i], opacity);
	}
	imageData.data = data;
	return imageData;
}