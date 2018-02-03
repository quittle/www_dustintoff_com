var videoid, commentArea, commentBox, curTimeBox, progressBar, progress, progressCursor, playerWrapper, playerSection, commentCanvas, divider, rollingComments, rollingCommentsHolder, commentHolder, commentSent; //DOM
var player; //YT.Player
var commentCanvasContext; //Context2D
var playerMonitor; //PlayerMonitor
var drawingLines = new Array(), commentLines = new Array(), commentCanvases = new Array(); //Arrays

function getVideoPlayer(){
	//Get the video id from the input box
	videoid = extractYoutubeVideoId(document.getElementById("videoid").value);

	//Set the hash at the top of the page for easy sharing of page
	window.location.hash = videoid;

	//unhide page
	commentHolder.style.display = "";
	playerSection.style.display = "";

	if(player != null){ //Clear old things if already loaded
		var playerHolder = document.getElementById("playerHolder");
		playerHolder.innerHTML = "";
		playerHolder.appendChild(genEl("div", {"id":"player"}));
		while(progressBar.childNodes.length>1)
			progressBar.removeChild(progressBar.childNodes[progressBar.childNodes.length-1]);
	}
	player = new YT.Player('player', {
		height: '100%',
		width: '100%',
		videoId: videoid,
		playerVars: {
			autoplay: 1,
			controls: 0,
			enablejsapi: 1,
			html5: 1,
			iv_load_policy: 3,
			loop: 1,
			modestbranding: 1,
			rel: 0,
			showinfo: 0,
			theme: 'light',
		},
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});

	commentBox.innerHTML = "";
}

// Called automatically after the API code downloads.
function onYouTubeIframeAPIReady() {}

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
	event.target.playVideo();

	//Resize to fix issues
	resizeCommentCanvas();
	commentCanvas.style.display = "";

	playerMonitor = new PlayerMonitor(event.target);

	//Update progressbar
	playerMonitor.onTime(-1, 0, function(p){
		progress.style.width = (p.getCurrentTime() / p.getDuration())*100 + "%";
		progress.style.paddingRight = p.getVideoLoadedFraction() * 100 - parseFloat(progress.style.width) + "%";
	});

	//Update rolling comments position
	playerMonitor.onTime(-1, 0, function(p){
		if(rollingCommentsHolder.hasChildNodes()){
			for(var i=rollingCommentsHolder.childNodes.length-1;i>=0;i--){ // This must already be sorted
				var n = rollingCommentsHolder.childNodes[i];
				var nTime = parseFloat(n.getAttribute("time"));
				if(nTime < p.getCurrentTime()){ //Find the last comment before the current time
					var increment = 0;
					if(i<rollingCommentsHolder.childNodes.length-1){ // Increment for partial scrolling within block
						var nextNode = rollingCommentsHolder.childNodes[i+1];
						increment = ((p.getCurrentTime()-nTime) / (parseFloat(nextNode.getAttribute("time")) - nTime)) * getHeight(n); // Percentage of block
					}
					//Max ensures that you scroll only as little as possible and the last comment is at the bottom
					var holderHeight = parseInt(style(rollingCommentsHolder, "height"));
					var max = rollingCommentsHolder.childNodes.length * getHeight(n);
					rollingCommentsHolder.style.marginTop = -1 * restrict(i * getHeight(n) + increment, 0, max) + "px";
					break;
				}
			}
		}
	});

	//Update highlighting of rolling comments
	/*playerMonitor.onTime(-1, 0, function(p){
		if(rollingCommentsHolder.hasChildNodes()){
			for(var i in rollingCommentsHolder.childNodes){
				var n = rollingCommentsHolder.childNodes[i];
				if(parseFloat(n.time) > p.getCurrentTime()){
			}
		}
	});*/

	playerMonitor.start(10);
}

// The API calls this function when the player's state changes.
var loadedAlready;
function onPlayerStateChange(event) {
	if(event.data == YT.PlayerState.PLAYING && !loadedAlready){
		loadedAlready = true;
		getVideoData(videoid, function(data) {
			console.log(data);
			for (var i = 0; i < data.length; i++) {
				var comment = data[i];
				addComment(comment.timestamp, comment.date, comment.comment, comment.lines);
			}
		});
	}
}

/* My code */
function resizeCommentCanvas(){
	var width = parseInt(style(playerHolder, "width"), 10);
	var height = width * 0.5625; // Maintain 16:9 ration
	playerWrapper.style.width = width + "px";
	playerWrapper.style.height = height + "px";
	player.setSize(width, height);
	commentCanvas.setAttribute("width", width + 50 + "px");
	commentCanvas.setAttribute("height", height + 50 + "px");
	commentCanvasContext = commentCanvas.getContext("2d"); //Get context again so I can draw properly
	commentCanvasContext.lineWidth = 3;
	commentCanvasContext.strokeStyle = "#000";
}

function editComment(e){
	var key = e.keyCode;
	if(key == 13 && !e.shiftKey){ // Enter
		if(commentArea.value == "")
			return false;

		commentSent.style.visibility = "visible";
		commentSent.style.opacity = 1;

		var time = player.getCurrentTime();
		var comment = commentArea.value.replace(/ /g, '&nbsp;').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/\</g, "&lt;").replace(/\>/g, "&gt;").replace(/\n/g, '<br />').replace(/\//g, "//").replace(/\\/g, "\\");
		var date = new Date().getTime();
		addComment(time, date, comment, drawingLines);
		comment = comment.replace(/%/g, "%25").replace(/&/g, "%26");

		storeComment(videoid, time, date, comment, drawingLines, function() {
			commentSent.innerHTML = "Comment sent.";
			var timer = setInterval(function() {
				commentSent.style.opacity = parseFloat(commentSent.style.opacity) - 0.005;
				if(parseFloat(commentSent.style.opacity) < 0){
					commentSent.style.visibility = "hidden";
					commentSent.style.opacity = 1;
					clearInterval(timer);
				}
			}, 10);
		});

		// loadXMLDoc("video="+videoid+ "&time="+time+ "&comment="+c+ "&lines="+drawingLines, function (ret){
		// 	commentSent.innerHTML = "Comment sent.";
		// 	var c = setInterval(function(){
		// 		commentSent.style.opacity = parseFloat(commentSent.style.opacity) - 0.005;
		// 		if(parseFloat(commentSent.style.opacity) < 0){
		// 			commentSent.style.visibility = "hidden";
		// 			commentSent.style.opacity = 1;
		// 			cancelTimer(c);
		// 		}
		// 	}, 10);
		// });

		playVideo();

		commentArea.value = "";
		curTimeBox.innerHTML = "";
		clearCanvas();
		return false;
	}else{
		pauseVideo();
		setCurTimeBox();
	}
	return true;
}
function addComment(time, date, commentString, lines){
	if (!commentString) {
		return false;
	}

	var fTime = "Time: " + friendlyTime(time);

	var d = new Date(parseInt(date));
	date = d.toLocaleDateString();

	var comment = genEl("div", {"class":"comment", "lines":lines});

		var commentLeftBlock = genEl("span", {"class":"commentLeftBlock"});
		commentLeftBlock.appendChild(genEl("div", {"class":"commentTimeListItem"}, null, fTime));
		commentLeftBlock.appendChild(genEl("div", {"class": "commentDateListItem"}, null, date));
		commentLeftBlock.appendChild(genEl("div", {"class":"clearfix"}));

	comment.appendChild(commentLeftBlock);
	comment.appendChild(genEl("span", {"class": "commentListItem"}, null, commentString));

	var jumpTo = function(){
		player.seekTo(time, true);
		pauseVideo();
		clearCanvas();
		console.log("drawing lines: " + lines);
		drawLines(lines);
	};
	comment.appendChild(genEl("span", {"class":"commentJump","onclick":jumpTo}, null, "Jump To"));

	var rollingComment = genEl("div", {"class":"rollingComment", "time":time, "onclick":jumpTo});

	var newLine = commentString.indexOf("<br /");
	rollingComment.innerHTML = newLine==-1?commentString:commentString.substring(0, newLine) + "...";
	var inserted = false;
	if(rollingCommentsHolder.hasChildNodes()){
		for(var i=0;i<rollingCommentsHolder.childNodes.length;i++){
			var n = rollingCommentsHolder.childNodes[i];
			if(parseFloat(n.getAttribute("time"))>time){
				rollingCommentsHolder.insertBefore(rollingComment, n);
				inserted = true;
			}
		}
	}
	if(!inserted) // Default to adding to end
		rollingCommentsHolder.appendChild(rollingComment);

	var commentPip = genEl("span", {"class":"commentPip", "onclick":jumpTo}, {"left":(100*time / player.getDuration()) + "%"});
	commentPip.onmouseover = function(){
		var commentPipHover = genEl("span", {"class":"commentPipHover"}, null, commentString);
		commentPip.appendChild(commentPipHover);
		commentPipHover.style.left = getWidth(commentPipHover)/-2 + "px"; //Needs to be added before width can be calculated
	}
	commentPip.onmouseout = function(){
		commentPip.innerHTML = "";
		commentPip.style.zIndex = "";
	}
	progressBar.appendChild(commentPip);
	if(commentBox.childNodes.length>0)
		commentBox.insertBefore(comment, commentBox.firstChild);
	else
		commentBox.appendChild(comment);
}

function drawLine(x1, y1, x2, y2){
	commentCanvasContext.beginPath();
	commentCanvasContext.moveTo(x1, y1);
	commentCanvasContext.lineTo(x2, y2);
	commentCanvasContext.stroke();
}
function drawLines(lines, opacity, canvasContext){
	if(!opacity)
		opacity = 1;
	if(!canvasContext)
		canvasContext = commentCanvasContext;
	canvasContext.strokeStyle = "rgba(0,0,0," + opacity + ")";
	var cWidth = canvasContext.canvas.width;
	var cHeight = canvasContext.canvas.height;
	canvasContext.beginPath();
	for(var i=0;i<lines.length;i+=4){
		canvasContext.moveTo(lines[i]*cWidth, lines[i+1]*cHeight);
		canvasContext.lineTo(lines[i+2]*cWidth, lines[i+3]*cHeight);
	}
	canvasContext.stroke();
}
function clearCanvas(canvasContext){
	if(!canvasContext)
		canvasContext = commentCanvasContext;
	canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
	drawingLines.length = 0;
}

function init(){
	var v = document.getElementById("videoid");
	v.focus();
	var val = window.location.hash.substring(1);
	if(val != "")
		v.value = "http://youtu.be/" + val;
	selectAll(v);

	//Grab all elements I'll need
	playerWrapper = document.getElementById("playerWrapper");
	playerSection = document.getElementById("playerSection");
	commentArea = document.getElementById("commentArea");
	commentBox = document.getElementById("commentBox");
	curTimeBox = document.getElementById("commentTime");
	progressBar = document.getElementById("progressBar");
	progress = document.getElementById("progress");
	progressCursor = document.getElementById("progressCursor");
	rollingComments = document.getElementById("rollingComments");
	rollingCommentsHolder = document.getElementById("rollingComments-holder");
	divider = document.getElementById("divider");
	commentCanvas = document.getElementById("commentCanvas");
	commentHolder = document.getElementById("commentHolder");
	commentSent = document.getElementById("commentSent");

	//Stop the right-click context-menu
	var rFalse = function(){return false;};
	document.getElementById("wrapper").onselectstart = rFalse;
	commentCanvas.onselectstart = rFalse;
	progress.onselectstart = rFalse;
	progressIndicator.onselectstart = rFalse;
	progressCursor.onselectstart = rFalse;
	playerSection.onselectstart = rFalse;
	divider.onselectstart = rFalse;
	commentHolder.onselectstart = rFalse;

	progressBar.addEventListener("contextmenu", function(e){
		e.preventDefault();
	});
	progress.addEventListener("contextmenu", function(e){
		e.preventDefault();
	});
	progressIndicator.addEventListener("contextmenu", function(e){
		e.preventDefault();
	});
	progressCursor.addEventListener("contextmenu", function(e){
		e.preventDefault();
	});


	var isMouseDownCanvas; //boolean
	var prevX, prevY, startX, startY; //int
	commentCanvas.addEventListener("contextmenu", function(e){
		clearCanvas();
		e.preventDefault();
	});
	commentCanvas.addEventListener("click", function(e){
		if(startX == prevX && startY == prevY){
			togglePlayPause();
		}
	});
	commentCanvas.addEventListener("mousedown", function(e){
		isMouseDownCanvas = true;
		prevX = getRelativeX(e, commentCanvas);
		prevY = getRelativeY(e, commentCanvas);
		startX = prevX;
		startY = prevY;
	});
	commentCanvas.addEventListener("mouseup", function(e){
		commentArea.focus();
		isMouseDownCanvas = false;
	});
	commentCanvas.addEventListener("mousemove", function(e){
		if(isMouseDownCanvas){
			pauseVideo();
			setCurTimeBox();
			if(e.clientX!=0 || e.clientY!=0){
				var x = getRelativeX(e, commentCanvas);
				var y = getRelativeY(e, commentCanvas);

				var cWidth = getWidth(commentCanvas);
				var cHeight = getHeight(commentCanvas);
				//Record lines
				var arr = [prevX/cWidth, prevY/cHeight, x/cWidth, y/cHeight];
				for(var i in arr)
					arr[i] = arr[i].toFixed(4);
				drawingLines.push(arr);

				drawLine(prevX, prevY, x, y);
				prevX = x;
				prevY = y;
			}
		} else {
			var b = getBeneath(e);
			if(b == progressCursor){
				progressCursor.style.zIndex = 101;
			}else if(b.className == "commentPip"){
				b.style.zIndex = 100;
			}else if(b.id == "progressBar" || b.id == "progress" || b.id == "progressIndicator"){
				progressBar.style.zIndex = 100;
			}
		}
	});

	progressBar.addEventListener("mouseout", function(){
		progressBar.style.zIndex = "";
	});
	var isMouseDownProgressCursor;
	progressCursor.addEventListener("mousedown", function(e){
		isMouseDownProgressCursor = true;
		pauseVideo();
	});
	var moveCursor = function(e){
		if(isMouseDownProgressCursor){
			progressCursor.style.left = restrict(getRelativeX(e, progressBar) - getWidth(progressCursor)/2, 0, getWidth(progressBar) - getWidth(progressCursor)/2) + "px";
		}
	};
	var setCursor = function(e){
		if(isMouseDownProgressCursor){
			player.seekTo((parseFloat(progressCursor.style.left) + getWidth(progressCursor))/getWidth(progressBar)*player.getDuration(), true);
			playVideo();
			progressCursor.style.left = "";
			isMouseDownProgressCursor = false;
		}
	};
	progressCursor.addEventListener("mousemove", moveCursor);
	progressBar.addEventListener("mousemove", moveCursor);
	progressBar.addEventListener("click", function(){isMouseDownProgressCursor = true; moveCursor(event);setCursor(event);});
	commentCanvas.addEventListener("mousemove", moveCursor);

	progressCursor.addEventListener("mouseup", setCursor);
	progressBar.addEventListener("mouseup", setCursor);
	commentCanvas.addEventListener("mouseup", setCursor);

	progressCursor.addEventListener("mouseout", function(e){
		progressCursor.style.zIndex = 101;
	});

	var isMouseDownDivider; //boolean
	divider.addEventListener("mousedown", function(e){
		isMouseDownDivider = true;
		playerSection.style.cursor = "-webkit-grabbing";
		rollingComments.style.cursor = "-webkit-grabbing";
	});

	var moveDivider = function(e){
		if(isMouseDownDivider)
			divider.style.left = restrict(getRelativeX(e, playerSection) - getWidth(divider)/2, 660, 850) + "px";
	};
	var setDivider = function(e){
		if(isMouseDownDivider){
			isMouseDownDivider = false;
			playerSection.style.cursor = "default";
			rollingComments.style.cursor = "default";
			var rcPadding = parseInt(style(rollingComments, "padding-left")) + parseInt(style(rollingComments, "padding-right"));
			rollingComments.style.width = getWidth(playerSection) - getWidth(divider) - parseInt(divider.style.left) - rcPadding - 14 + "px";
			playerHolder.style.width = parseInt(divider.style.left) - 90 + "px";
			resizeCommentCanvas();
		}
	}
	commentCanvas.addEventListener("mousemove", moveDivider);
	rollingComments.addEventListener("mousemove", moveDivider);
	divider.addEventListener("mousemove", moveDivider);

	commentCanvas.addEventListener("mouseup", setDivider);
	rollingComments.addEventListener("mouseup", setDivider);
	divider.addEventListener("mouseup", setDivider);
}

function setCurTimeBox(){
	curTimeBox.innerHTML = Math.floor(player.getCurrentTime()) + " seconds";
}

//This object is for creating a listener that checks the time and runs a function if appropriate
function PlayerMonitor(ytPlayer){
	//Construction
	var player = ytPlayer;
	var timeFuncs = new Array();

	this.start = function(interval){
		if(!interval)
			interval = 100;
		setInterval(function(){
			var time = Math.floor(player.getCurrentTime());
			for(var i in timeFuncs){
				if(timeFuncs[i].time < 0 || Math.abs(timeFuncs[i].time - time)<=timeFuncs[i].acc){
					timeFuncs[i].func(player, timeFuncs[i].obj);
				}
			}
		}, interval);
	}

	this.onTime = function(time, acc, func, obj){
		timeFuncs.push(new TimeFunc(time, acc, func, obj));
	}
}
function TimeFunc(time, acc, func, obj){
	this.time = time;
	this.acc = acc;
	this.func = func;
	this.obj = obj;
}

function getVideoData(videoId, callback) {
	var dataString = window.localStorage.getItem(videoId);
	if (dataString) {
		callback(JSON.parse(dataString));
	} else {
		callback([]);
	}
}

function storeVideoData(videoId, data, onCompletionHandler) {
	window.localStorage.setItem(videoId, JSON.stringify(data));
	onCompletionHandler();
}

function storeComment(videoId, timestamp, date, comment, lines, onCompletionHandler) {
	getVideoData(videoId, function(data) {
		data.push({
			timestamp: timestamp,
			date: date,
			comment: comment,
			lines: lines,
		});
		storeVideoData(videoId, data, onCompletionHandler);
	});
	var comments = JSON.parse(window.localStorage.getItem(videoId, '[]'));
}

function loadXMLDoc(queryString, func){
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange=function(){
		if(xmlhttp.readyState==4 && xmlhttp.status==200){
			func(xmlhttp.responseText);
		}
	}
	//xmlhttp.open("GET","save.php?" + queryString, true);
	//xmlhttp.send();
	xmlhttp.open("POST","save.php", false);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.send(queryString);
}

function checkEnter(e){
	if(e.keyCode == 13)
		document.getElementById("submit").click();
}

function selectAll(input){
	input.select();
}

function getWidth(el){
	 return parseInt(style(el, "width"));
}

function getHeight(el){
	return parseInt(style(el,"height")) +
			parseInt(style(el,"border-top")) +
			parseInt(style(el,"border-bottom")) +
			parseInt(style(el,"margin-top")) +
			parseInt(style(el,"margin-bottom")) +
			parseInt(style(el,"padding-top")) +
			parseInt(style(el,"padding-bottom"));
}
function togglePlayPause(){
	var state = player.getPlayerState();
	if(state == 1)
		pauseVideo();
	else
		playVideo();
}
function pauseVideo(){
	player.pauseVideo();
}

function stopVideo() {
	player.stopVideo();
}
function playVideo(){
	player.playVideo();
	clearCanvas();
}

init();