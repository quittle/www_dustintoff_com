///////////////////////////////////EDITABLE VALUES///////////////////////////////////
var blackoutColor = "#000000";
var blackoutOpacity = 0.8; //value between 0.0 and 1.0

var borderColor = "#222222"; 
var borderWidth = 8;

//This is the proportion of the screen filled with the enlargened image
var maxFill = 0.9;  //value between 0.0 and 1.0

//Description
var descriptionLeftColor = "#000000";
var descriptionLeftPadding = 15; //How much padding to put next to the description

var descriptionCenterColor = "#009900";
//No padding as it's centered

var descriptionRightColor = "#000000";
var descriptionRightPadding = 15; //How much padding to put next to the description

var closeButtonColor = "#000000";
var closeButtonImage = "images/exitForgroundWhite.png"; //rename the color to change
var closeButtonSize = 24;
var closeButtonHoverColor = "#111111";
var closeButtonHoverImage = "images/exitForgroundGrey.png";
var closeButtonBorderWidth = 3;
var allowCloseByOutsideClick = true; //set to false to disable clicking outside image "theatre" to close
var closeKeys = [27, 32]; //ascii values for characters that will close image
/////////////////////////////////END EDITABLE VALUES/////////////////////////////////

/* Attributes to add in image tags

Required:
	data-location

Optional:
	//Text, can use html formatting
	data-description-left
	data-description-center
	data-description-right
	
	//Color of each description
	data-description-left-color
	data-description-center-color
	data-description-right-color
	
	//Extra padding for side descriptions
	data-description-left-padding
	data-description-right-padding
*/
var allImages = [];
document.body.addEventListener("load", initGallery(), false);

var blackout = document.getElementById("blackout");
var imgBox = document.getElementById("imgBox");
var imgInBox = document.getElementById("imgInBox");
var descriptionBox = document.getElementById("descriptionBox");
var descriptionLeft = document.getElementById("descriptionLeft");
var descriptionCenter = document.getElementById("descriptionCenter");
var descriptionRight = document.getElementById("descriptionRight");
var close = document.getElementById("close");

function initGallery(){
	var bdy = document.body;

	var blackout = document.createElement("div");
	blackout.id = "blackout";
	if(allowCloseByOutsideClick)
		blackout.setAttribute("onclick", "closeImg()");
	blackout.style.opacity = blackoutOpacity;
	blackout.setAttribute("filter","alpha(opacity=" + blackoutOpacity * 100 + ")");
	blackout.style.background = blackoutColor;
	blackout.style.zIndex = "9998";
	blackout.style.visibility = "hidden";
	blackout.style.top = "0px";
	blackout.style.left = "0px";
	blackout.style.position = "fixed";
	blackout.style.width = "1px";
	blackout.style.height = "1px";
	blackout.setAttribute("text-align","center");
	bdy.appendChild(blackout);

	var close = document.createElement("div");
	close.id = "close";
	close.setAttribute("onclick","closeImg()");
	close.setAttribute("onmouseover","closeMouseOver()");
	close.setAttribute("onmouseout","closeMouseOut()");
	close.style.left = "0px";
	close.style.top = "0px";
	close.style.cursor = "pointer";
	close.setAttribute("text-align","center");
	close.style.backgroundImage = "url('" + closeButtonImage + "')";
	close.style.backgroundSize = "100%";
	close.style.backgroundColor = closeButtonColor;
	close.style.borderWidth = closeButtonBorderWidth + "px";
	close.style.borderColor = borderColor;
	close.style.borderLeftStyle = "solid";
	close.style.borderBottomStyle = "solid";
	close.style.zIndex = "10001";
	close.style.visibility = "hidden";
	close.style.position = "fixed";
	close.style.width = closeButtonSize + "px";
	close.style.height = closeButtonSize + "px";
	bdy.appendChild(close);

	var temp = document.createElement('img');
	temp.src=closeButtonHoverImage;

	var imgBox = document.createElement("div");
	imgBox.id = "imgBox";
	imgBox.style.left = "0px";
	imgBox.style.top = "0px";
	imgBox.style.align = "middle";
	imgBox.style.position = "fixed";
	imgBox.style.zIndex = "9999";
	imgBox.style.visibility = "hidden";
	imgBox.style.background = borderColor;
	bdy.appendChild(imgBox);

	var imgInBox = document.createElement("img");
	imgInBox.id = "imgInBox";
	imgInBox.setAttribute("onload","recenter(" + imgInBox.src + ")");
	imgInBox.style.borderWidth = borderWidth + "px";
	imgInBox.style.borderColor = borderColor;
	imgInBox.style.borderStyle = "solid";
	imgBox.appendChild(imgInBox);
	
	var descriptionBox = document.createElement("div");
	descriptionBox.id = "descriptionBox";
	descriptionBox.style.textAlign = "center";
	imgBox.appendChild(descriptionBox);
	
	var descriptionLeft = document.createElement("span");
	descriptionLeft.id="descriptionLeft";
	descriptionLeft.style.color = descriptionLeftColor;
	descriptionLeft.style.paddingBottom = borderWidth + "px";
	descriptionLeft.style.cssFloat = "left";
	descriptionLeft.style.textAlign = "left";
	descriptionLeft.style.marginLeft = parseInt(borderWidth) + parseInt(descriptionLeftPadding) + "px";
	
	var descriptionCenter = document.createElement("span");
	descriptionCenter.id="descriptionCenter";
	descriptionCenter.style.color = descriptionCenterColor;
	descriptionCenter.style.paddingBottom = borderWidth + "px";
	
	var descriptionRight = document.createElement("span");
	descriptionRight.id="descriptionRight";
	descriptionRight.style.color = descriptionRightColor;
	descriptionRight.style.paddingBottom = borderWidth + "px";
	descriptionRight.style.cssFloat = "right";
	descriptionRight.style.textAlign = "right";
	descriptionRight.style.marginRight = parseInt(borderWidth) + parseInt(descriptionRightPadding) + "px";
	descriptionBox.appendChild(descriptionLeft);
	descriptionBox.appendChild(descriptionCenter);
	descriptionBox.appendChild(descriptionRight);

	//Hit escape to exit image
	//document.body.addEventListener("keydown", escPressGallery(document.createEvent("keydown")), false);
	document.body.setAttribute("onkeydown","escPressGallery(event)");

	//Set up every image so it can be clicked
	var imgs = document.getElementsByTagName("img");
	for(var i=0, len=imgs.length;i<len;i++){
		if(imgs[i].dataset.location!=null){
			imgs[i].setAttribute("onclick","display(\'" + imgs[i].dataset.location + "\', \'" + imgs[i].dataset.descriptionLeft + "\', \'" + imgs[i].dataset.descriptionLeftColor + "\', \'" + imgs[i].dataset.descriptionLeftPadding + "\', \'" + imgs[i].dataset.descriptionCenter + "\', \'" + imgs[i].dataset.descriptionCenterColor + "\', \'" + imgs[i].dataset.descriptionRight + "\', \'" + imgs[i].dataset.descriptionRightColor + "\', \'" + imgs[i].dataset.descriptionRightPadding + "\')");
			allImages.push(imgs[i]);
		}
	}
}

function display(image, descriptionTextLeft, descriptionColorLeft, descriptionPaddingLeft, descriptionTextCenter, descriptionColorCenter, descriptionTextRight,  descriptionColorRight, descriptionPaddingRight){
	//set up background
	blackout.style.width = self.innerWidth + "px";
	blackout.style.height = self.innerHeight + "px";

	//put image in the box
	imgInBox.src=image;

	//in case the same image is clicked twice in a row
	recenter(image);
	
	//load description
	loadDescription(descriptionLeft, descriptionTextLeft, descriptionColorLeft, descriptionPaddingLeft);
	loadDescription(descriptionCenter, descriptionTextCenter, descriptionColorCenter);
	loadDescription(descriptionRight, descriptionTextRight, descriptionColorRight, descriptionPaddingRight);
}

function closeImg(){
	blackout.style.visibility="hidden";
	imgBox.style.visibility="hidden";
	descriptionLeft.style.visibility="hidden";
	descriptionCenter.style.visibility="hidden";
	descriptionRight.style.visibility="hidden";
	close.style.visibility="hidden";
}

function escPressGallery(e){
	var code;
	
	if (!e)
		var e = window.event;
		
	if (e.keyCode)
		code = e.keyCode;
	else if
		(e.which) code = e.which;

	for(var i=0,len=closeKeys.length;i<len;i++){
		if(code==closeKeys[i]){ //escape value
			closeImg();
			break;
		}
	}
}

function recenter(image){
	//fix the size of the image
	fixSize(image);
	
	//set up variables
	var imgBoxWidth = parseInt(window.getComputedStyle(imgInBox).getPropertyValue("width"));
	var imgBoxHeight = parseInt(window.getComputedStyle(imgInBox).getPropertyValue("height"));
	var maxWidth = self.innerWidth * maxFill;
	var maxHeight = self.innerHeight * maxFill;
	
	//Make sure the large image isn't too big
	if(imgBoxWidth>maxWidth){
		var ratio = maxWidth / imgBoxWidth;
		imgInBox.style.width = maxWidth + "px";
		imgInBox.style.height = imgBoxHeight * ratio + "px";
		//recalculate
		imgBoxHeight = parseInt(window.getComputedStyle(imgInBox).getPropertyValue("height"));
		imgBoxWidth = parseInt(window.getComputedStyle(imgInBox).getPropertyValue("width"));
	}
	if(imgBoxHeight>maxHeight){
		var ratio = maxHeight / imgBoxHeight;
		imgInBox.style.height = maxHeight + "px";
		imgInBox.style.width = imgBoxWidth * ratio + "px";
	}
	
	//recalculate
	imgBoxWidth = parseInt(window.getComputedStyle(imgBox).getPropertyValue("width"));
	imgBoxHeight = parseInt(window.getComputedStyle(imgBox).getPropertyValue("height"));
	
	//horizontal align
	var leftAlign = (self.innerWidth/2)-(imgBoxWidth/2);
	imgBox.style.marginLeft = leftAlign + "px";

	//vertical align
	var topAlign = (self.innerHeight/2)-(imgBoxHeight/2);
	imgBox.style.marginTop = topAlign + "px";
	
	//horizontal close box align
	var closeWidth = parseInt(window.getComputedStyle(close).getPropertyValue("width"));
	var closeLeft = parseInt(imgBox.style.marginLeft) + imgBoxWidth - closeWidth - closeButtonBorderWidth;
	if(navigator.userAgent.indexOf("Firefox")==-1)
		closeLeft--;
	close.style.marginLeft = closeLeft + "px";
	
	//vertical close box align
	var closeTop = parseInt(imgBox.style.marginTop);
	closeTop++;
	close.style.marginTop = closeTop + "px";
	makeVisible();
}

function makeVisible(){
	blackout.style.visibility="visible";
	imgBox.style.visibility="visible";
	close.style.visibility="visible";
}

function fixSize(imgSrc){
	//make a new image just so i can fix the size
	var temp = document.createElement('img');
	temp.src=imgSrc;
	imgInBox.style.width = window.getComputedStyle(temp).getPropertyValue("width");
	imgInBox.style.height = window.getComputedStyle(temp).getPropertyValue("height");
}

function closeMouseOver(){
	close.style.background = closeButtonHoverColor;
	close.style.backgroundImage = "url('" + closeButtonHoverImage + "')";
}

function loadDescription(description, descriptionText, descriptionColor, descriptionPadding){
	//account for undeclared properties
	description.innerHTML = (descriptionText == "undefined"? "":descriptionText);
	if(description.style.cssFloat=="left"){
		description.style.color = (descriptionColor == "undefined"? descriptionLeftColor : descriptionColor);
		description.style.marginLeft = (descriptionPadding == "undefined"? descriptionLeftPadding: descriptionPadding);
	}
	else if(description.style.cssFloat=="right"){
		description.style.color = (descriptionColor == "undefined"? descriptionRightColor : descriptionColor);
		description.style.marginRight = (descriptionPadding == "undefined"? descriptionRightPadding: descriptionPadding);
		}
	else{
		description.style.color = (descriptionColor == "undefined"? descriptionCenterColor : descriptionColor);
	}
	description.style.visibility="visible";
}

function closeMouseOut(){
	close.style.background = closeButtonColor;
	close.style.backgroundImage = "url('" + closeButtonImage + "')";
}