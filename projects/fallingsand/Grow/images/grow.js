/******************************************************
TODO: Make droplets fill things faster (low priority)
TODO: Add game mechanics
TODO: Explosive burn down
TODO: Add ashes from burnt plant
TODO: Add wind?
******************************************************/

//   ///////  // Variables //  ///////   //
var particleSize = 4;
var gameSpeed = 30;
var inBackground = false;
var opacity = 1.0; // 0.0-1.0 are valid opacities //NOT IMPLEMENTED
var defaultPenSize = 2;
var penSize = 2;
//////////////////////////////////////////

var canvas;
var body = document.body;
body.addEventListener('onload', init(), false);
body.addEventListener('mousedown',function(){prevX=event.pageX;prevY=event.pageY;isDown=true;move(event);}, false);
body.addEventListener('mouseup', function(){isDown=false;}, false);
body.addEventListener('click', function(){if(isClear(event)){canvas.style.display="none";starter = document.elementFromPoint(event.clientX, event.clientY);canvas.style.display="";starter.click();}}, false);
body.addEventListener('mousemove', function(){if(isDown) move(event);}, false);
body.addEventListener('keydown', function(){key(event);}, false);
body.addEventListener('keyup', function(){gen = event.shiftKey;keyUp(event);}, false); //elemType='droplet'; add back to make it non-sticky
//body.setAttribute("onmousedown","prevX=event.pageX;prevY=event.pageY;isDown=true;move(event);");
//body.setAttribute("onmouseup","isDown=false;");
//body.setAttribute("onmousemove","if(isDown) move(event);");
//body.setAttribute("onkeydown", "key(event)");
//body.setAttribute("onkeyup", "elemType='droplet';gen = event.shiftKey;keyUp(event)");
var rect;
var prevX, prevY;
var gen;

var growthImage;
var dropletImage;
var steamImage;
var fireImage;
var wallImage;
var genImage;
var imageLocation;

var particles;
var emptyCols

var isDown;
var elemType;

var player;

//Checks if the sp ot is covered in blocks so you don't click on a hidden link
function isClear(e){
	var x = parseInt(e.pageX/particleSize);
	var y = parseInt(e.pageY/particleSize);
	return(particles[x][y].fresh=="empty");
}

//Called to initialize things
function init(){
	canvas = document.createElement("canvas");
	canvas.id = "growthCanvas";
	if(inBackground)
		canvas.style.zIndex=-1;
	else
		canvas.style.zIndex=9999;
	canvas.setAttribute("width", window.innerWidth + "px");
	canvas.setAttribute("height", window.innerHeight + "px");
	canvas.style.position = "fixed";
	canvas.style.left = "0px";
	canvas.style.top = "0px";
	body.appendChild(canvas);
	
	particles = [];
	emptyCols = [];
	for(var i=0;i<parseInt(window.innerWidth/particleSize + 1);i++){
		particles.push(new Array(parseInt(window.innerHeight/particleSize + 1)));
		emptyCols.push(0);
		emptyCols[i]++;
		for(var j=0;j<parseInt(window.innerHeight/particleSize + 1);j++){
			particles[i][j] = new Particulate;
		}
	}
	var client = new XMLHttpRequest();
	client.open('GET', './world1.grw');
	var done = false;
	client.onreadystatechange = function() {
		var txt = client.responseText;
		while(txt != ""){
			var x = parseInt(txt.substring(0, txt.indexOf(" ")));
			txt = txt.substring(txt.indexOf(" ")+1);

			var y = parseInt(txt.substring(0, txt.indexOf(" ")));
			txt = txt.substring(txt.indexOf(" ")+1);
			
			var width = parseInt(txt.substring(0, txt.indexOf(" ")));
			txt = txt.substring(txt.indexOf(" ")+1);
			
			var height = parseInt(txt.substring(0, txt.indexOf(" ")));
			txt = txt.substring(txt.indexOf(" ")+1);

			var type = txt.substring(0, txt.indexOf(" "));
			txt = txt.substring(txt.indexOf(" ")+1);
			
			if(txt.indexOf("\n")!=-1){
				var shape = txt.substring(0, txt.indexOf("\n"));
				txt = txt.substring(txt.indexOf("\n")+1);
			}
			else{
				var shape = txt;
				txt = "";
			}
			
			if(shape=="rect")
				for(var i=0;i<width;i++){
					for(var j=0;j<height;j++){
						forcePoint(x+i,y+j, type);
					}
				}
			else if(shape=="circ")
				circlePoint(x, y, width, type, true, ["null"]);
			else if(shape=="elip")
				elipsePoint(x, y, width, height, type, true, ["null"]);
			//alert("x:" + x + " y:" + y + " width:" + width + " height:" + height + " type:" + type + " shape:" + shape);
			done = true;
		}
	}
	client.send();
	imageLocation = "images/";
	growthImage = new Image();
	alert(imageLocation + " im");
	growthImage.src = imageLocation + "growth.png";
	dropletImage = new Image();
	dropletImage = imageLocation + "droplet.png";
	steamImage = new Image();
	steamImage = imageLocation + "steam.png";
	fireImage = new Image();
	fireImage = imageLocation + "fire.png";
	wallImage = new Image();
	wallImage = imageLocation + "wall.png";
	genImage = new Image();
	genImage = imageLocation + "gen.png";
	
	isDown = false;
	elemType = "droplet";
	
	player = new Player;

	setInterval("update()",gameSpeed);
}

//Called when a key is pressed
function key(e){
	var code;
	if(e)
		code = e.keyCode;
	else
		code = event.mouseevent.keyCode;
		
	if (code==37) //escape value
		player.move = -1;
	else if(code==39)
		player.move = 1;
	else if(code==38)
		if(player.jump==0 && !player.hasJumped){
			player.hasJumped = true;
			player.jump=5;
		}
	else
		player.move = 0;
	if(code==48)
		penSize = defaultPenSize;
	else if(code>=49 && code<=57)
		penSize = code-48;
	else if(code==65)
		elemType = "sand";
	else if(code==68)
		elemType = "droplet";
	else if(code==87)
		elemType = "wall";
	else if(code==70)
       elemType = "fire";
	else if(code==77)
		elemType = "smoke";
	else if(code==71)
		elemType = "growth";
	else if(code==83)
		elemType = "steam";
	else if(code==69)
		elemType = "eraser";
	else if(code==80)
		elemType = "plague";
	else if(code==88)
		elemType = "explosive";
	else if(code==90)
		elemType = "liquidExplosive";
	if(code==17)
		circlePoint(player.x, player.y, 5, elemType, true, []);
	gen = e.shiftKey;
}

function keyUp(e){
	var code;
	if (e.keyCode)
		code = e.keyCode;
	else if (e.which)
		code = e.which;

	if (code==37) //escape value
		player.move = 0;
	else if(code==39)
		player.move = 0;
	else if(code==38)
		player.hasJumped = false;
}

function Particulate(){
	this.old = "empty";
	this.fresh = "empty";
	this.modified = false;
}

function Player(){
	this.x = 50;
	this.y = 50;
	this.move = 0;
	this.jump = 0;
	this.hasJumped = false;
}

//Called when the mouse moves to allow you to draw stuff
function move(event){
	var x = parseInt(event.pageX);
	var y = parseInt(event.pageY);
	do{
		var type = elemType;
		switch(elemType){
			case "droplet":
			case "steam":
			case "fire":
			case "liquidExplosive":
			case "smoke":
			case "sand":
				if(gen){
					type = type + "Gen";
				}
				break;
			case "eraser":
				type = "empty";
		}
		circlePoint(parseInt(x/particleSize), parseInt(y/particleSize), penSize, type, true, []);
		if(Math.abs(x-prevX)>=particleSize)
			x += particleSize*(x-prevX<0?1:-1);
		if(Math.abs(y-prevY)>=particleSize)
			y += particleSize*(y-prevY<0?1:-1);
	} while(Math.abs(x-prevX)>=particleSize || Math.abs(y-prevY)>=particleSize)

	prevX = event.pageX;
	prevY = event.pageY;
}

//Called repeatedly, handles everything
function update(){
	for(var x = 0;x<particles.length;x++){
		if(emptyCols[x]>0){
			//alert(x + " " + emptyCols[x]);
			//particles[x][0].fresh = "wall";
			for(var y = 0;y<particles[x].length;y++){
				updateAction(x, y);
			}
		}
	}
	updatePlayer();
	
	draw();
}

//Causes things on the field to "act"
function updateAction(x, y){
	var particulate = particles[x][y];
	if(particulate.modified){
		particulate.modified = false;
	}
	else{
		switch(particulate.fresh){
			case "empty":
			case "wall":
			case "explosive":
				return;
			case "plague":
				var move = Math.floor(Math.random()*4);
				if(move==0)
					changePoint(x, y-1, "plague");
				else if(move==1)
					changePoint(x, y+1, "plague");
				else if(move==2)
					changePoint(x-1, y, "plague");
				else if(move==3)
					changePoint(x+1, y, "plague");
					
				move = Math.floor(Math.random()*4);
				if(move==0) changePoint(x, y, "empty");
				break;
			case "steam":
				var move = Math.floor(Math.random()*100);
				if(move>=60)
					changePoint(x, y-1, "steam");
				else if(move>=50)
					changePoint(x-1, y, "steam");
				else if(move>=40)
					changePoint(x+1, y, "steam");
				else if(move==1)
					changePoint(x, y, "droplet");
					
				if(move>=40){
					changePoint(x, y, "empty");
					return;
				}
				break;
			case "droplet":
			case "sand":
			case "liquidExplosive":
				var type = particulate.fresh;
				changePoint(x, y, "empty");
				changePoint(x, y+1, type);
				//return;
				break;
			case "dropletGen":
			case "sandGen":
			case "liquidExplosiveGen":
				if(particles[x][y+1] && particles[x][y+1].fresh!="droplet" && particles[x][y+1].fresh!="liquidExplosive"){
					changePoint(x, y+1, particulate.fresh.substring(0,particulate.fresh.indexOf("Gen")));
					updateAction(x, y+1);
				}
				break;
			case "fire":
				var move = Math.floor(Math.random()*9);
				if(move>=5)
					changePoint(x, y-1, "fire");
				if(move<1)
					changePoint(x, y-2, "smoke");
				if(move>6)
					changePoint(x+1, y, "fire");
				if(move<2)
					changePoint(x-1, y, "fire");
				if(move==0)
					changePoint(x, y-1, "fire");
				changePoint(x, y, "empty");

				break;
			case "smoke":
				var move = Math.floor(Math.random()*9);
				var amount = Math.floor(Math.random()*5)-2;
				if(move>7)
					changePoint(x, y-Math.abs(amount), "smoke");
				if(move<6)
					changePoint(x, y, "empty");
				if(move>6)
					changePoint(x+amount, y, "smoke");
				if(move<2)
					changePoint(x-amount, y, "smoke");
				break;
			case "steamGen":
			case "fireGen":
			case "smokeGen":
				forcePoint(x, y-1, particulate.fresh.substring(0,particulate.fresh.indexOf("Gen")));
				updateAction(x, y-1);
				break;
		}
	}
	if(!particulate.modified){
		particulate.old = particulate.fresh;
	}
	else
		particulate.modified = false;
}

function draw(){
	var point = canvas.getContext("2d");
	point.clearRect(0,0,window.innerWidth,window.innerHeight);
	for(var x = 0;x<particles.length;x++){
		emptyCols[x] = 0;
		for(var y = 0;y<particles[x].length;y++){
			var particulate = particles[x][y];
			var image = '';
			switch(particulate.fresh){
				case "empty":
					continue;
				case "plague":
					point.fillStyle = "#004400";
					emptyCols[x]++;
					break;
				case "steam":
					point.fillStyle = "#aaaaaa";
					emptyCols[x]++;
					image = steamImage;
					break;
				case "droplet":
					point.fillStyle = "#bbbbff";
					emptyCols[x]++;
					image = dropletImage;
					break;
				case "fire":
					point.fillStyle="#ff6600";
					emptyCols[x]++;
					image = fireImage;
					break;
				case "smoke":
					point.fillStyle="#777777";
					emptyCols[x]++;
					break;
				case "growth":
					point.fillStyle="#aaffaa";
					image = growthImage;
					break;
				case "wall":
					point.fillStyle="#cccccc";
					image = wallImage;
					break;
				case "explosive":
					point.fillStyle="#cccc00";
					break;
				case "liquidExplosive":
					point.fillStyle="#eeee00";
					emptyCols[x]++;
					break;
				case "sand":
					point.fillStyle="#efe4b0";
					emptyCols[x]++;
					break;
				case "dropletGen":
				case "steamGen":
				case "fireGen":
				case "smokeGen":
				case "liquidExplosiveGen":
					emptyCols[x]++;
					point.fillStyle = "#000000";
					break;
			}
			if(image == '')
				point.fillRect(x*particleSize,y*particleSize,particleSize,particleSize);
			else{
				//alert(image);
				point.drawImage(image, x*particleSize, y*particleSize, particleSize, particleSize);
			}
				//point.drawImage(image, x*particleSize, y*particleSize, particleSize, particleSize);
		}
	}

	point.fillStyle = "#ff0000";
	point.fillRect(player.x*particleSize, player.y*particleSize, particleSize, particleSize);
}

function updatePlayer(){
	//try{
		player.x += player.move;
		var particle = particles[player.x][player.y];
		if(particle && isSolid(particle.fresh)){
			player.x -= player.move;
		}
		player.y += 1;
		if(player.jump>0){
			player.y -= 2;
			player.jump -= 1;
		}
		if(particle && particle.fresh == "droplet"){
			var move = Math.floor(Math.random() * 5);
			player.y += move-2;
		}
		particle = particles[player.x][player.y];
		if(particle && isSolid(particle.fresh))
			player.y -= 1;
	//}catch(err){alert(err)}
}

function forcePoint(x, y, type){
	try{
		var particle = particles[x][y];
		particle.old = particle.fresh;
		particle.fresh = type;
		particle.modified = false;
		if(particle.fresh != "empty" && particle.old == "empty")
			emptyCols[x]++;
		else if(particle.fresh == "empty" && particle.old != "empty")
			emptyCols[x]--;
	} catch(err) {}
}

function changePoint(x, y, type){
	try{
		var particle = particles[x][y];
		particle.old = particle.fresh;
		particle.fresh = type;
		particle.modified = true;
		if((particle.old == "empty" || particle.old == "droplet") && type == "droplet"){
			for(var i=-1;i<2;i++)
				for(var j=-1;j<2;j++)
					if(particles[x+i][y+j].fresh == "growth")
						setTimeout(changePoint,gameSpeed*3, x, y, "growth");
		}
		if((particle.old == "fire" && type == "droplet") || (particle.old == "droplet" && type == "fire")){
			changePoint(x, y, "steam");
			return true;
		}
		if((particle.old == "smoke" && type == "droplet") || (particle.old == "droplet" && type == "smoke")){
			forcePoint(x, y, "droplet");
			return true;
		}
		if(particle.old == "growth" && type == "droplet"){
			changePoint(x, y, "growth");
			var grow = Math.floor(Math.random()*10);
			changePoint(x, y-1, "growth");
			if(grow==9)
				setTimeout(changePoint,gameSpeed, x-1, y-1, "growth");
			if(grow<7)
				setTimeout(changePoint,gameSpeed, x-1, y, "growth");
			if(grow>2)
				setTimeout(changePoint,gameSpeed, x+1, y, "growth");
			if(grow==0)
				setTimeout(changePoint,gameSpeed, x+1, y-1, "growth");
			return true;
		}
		if(particle.old == "growth" && type == "fire"){
			var burn = Math.floor(Math.random()*5);
			if(burn<4)
				setTimeout(changePoint, gameSpeed, x, y-1, "fire");
			if(burn<3)
				setTimeout(changePoint, gameSpeed, x-1, y, "fire");
			if(burn>1)
				setTimeout(changePoint, gameSpeed, x+1, y, "fire");
			if(burn<2)
				setTimeout(changePoint,gameSpeed*3, x, y+1, "fire");
			return true;
		}
		//Keep below growth and droplet
		if((particle.old == "wall" || particle.old == "explosive" || particle.old == "growth") && isLiquid(type)){
			forcePoint(x, y, particle.old);

			var flow;
			if(particles[x-1][y-1].fresh == "empty")
				if(particles[x+1][y-1].fresh == "empty")
					flow = Math.floor(Math.random()*3)-1;
				else
					flow = Math.floor(Math.random()*2)-1;
			else
				if(particles[x+1][y-1].fresh == "empty")
					flow = Math.floor(Math.random()*2);
				else
					flow = 0;
			changePoint(x+flow, y-1, type);
			return true;
		}
		if(isLiquid(particle.old) && isLiquid(type)){
			forcePoint(x, y, particle.old);
			var flow = Math.floor(Math.random()*4);
			if(flow <=1 && particles[x-1][y-1].fresh == "empty")
				changePoint(x-1, y-1, type);
			else if(flow >= 2 && particles[x+1][y-1].fresh == "empty")
				changePoint(x+1, y-1, type);
			else
				changePoint(x, y-1, type);
			return true;
		}
		if(particle.old == "wall" && type == "fire"){
			changePoint(x, y, "wall");
			return true;
		}
		if(isCombustible(particle.old) && type == "fire"){
			setTimeout(circlePoint,gameSpeed, x, y, 10, "fire", true, ["explosive", "liquidExplosive", "droplet"]);
			return true;
		}
		//Keep below explosive line
		if(isSolid(particle.old) && isGas(type)){
			changePoint(x, y, particle.old);
			
			var flow;
			if(particles[x-1][y+1].fresh == "empty")
				if(particles[x+1][y+1].fresh == "empty")
					flow = Math.floor(Math.random()*3)-1;
				else
					flow = Math.floor(Math.random()*2)-1;
			else
				if(particles[x+1][y+1].fresh == "empty")
					flow = Math.floor(Math.random()*2);
				else
					flow = 0;
			changePoint(x + flow, y+1, type);
			return true;
		}
		if(isGas(particle.old) && isGas(type)){
			var flow = Math.floor(Math.random()*4);
			if(flow <=1 && particles[x-1][y+1].fresh == "empty")
				changePoint(x-1, y+1, type);
			else if(flow >= 2 && particles[x+1][y+1].fresh == "empty")
				changePoint(x+1, y+1, type);
			return true;
		}
		if((wasParticleGen(particle) || particle.old == "wall" || particle.old == "explosive") && (type == "growth" || type == "droplet")){
			changePoint(x, y, particle.old);
			return true;
		}
		if(particle.fresh != "empty" && particle.old == "empty")
			emptyCols[x]++;
		else if(particle.fresh == "empty" && particle.old != "empty")
			emptyCols[x]--;
		return false;
	}
	catch(err){}
}

//If force, it forces the change, unless the type is in the exceptions array
//Same for not forcing
function circlePoint(x, y, r, type, force, exceptions){
	elipsePoint(x, y, r, r, type, force, exceptions);
}

function elipsePoint(x, y, xr, yr, type, force, exceptions){
	try{
		var particle = particles[x][y];
		for(var i=0;i<xr;i++)
			for(var j=0;j<yr;j++){
				var dist = Math.sqrt(Math.pow(i/xr,2)+Math.pow(j/yr,2));
				if(dist<=1){
					if(force)
						if(exceptions.indexOf(type)!=-1){
							try{changePoint(x+i, y+j, type);}catch(err){}
							try{changePoint(x-i, y+j, type);}catch(err){}
							try{changePoint(x+i, y-j, type);}catch(err){}
							try{changePoint(x-i, y-j, type);}catch(err){}
						}
						else{
							try{forcePoint(x+i, y+j, type);}catch(err){}
							try{forcePoint(x-i, y+j, type);}catch(err){}
							try{forcePoint(x+i, y-j, type);}catch(err){}
							try{forcePoint(x-i, y-j, type);}catch(err){}
						}
					else
						if(exceptions.indexOf(type)!=-1){
							try{forcePoint(x+i, y+j, type);}catch(err){}
							try{forcePoint(x-i, y+j, type);}catch(err){}
							try{forcePoint(x+i, y-j, type);}catch(err){}
							try{forcePoint(x-i, y-j, type);}catch(err){}
						}
						else{
							try{changePoint(x+i, y+j, type);}catch(err){}
							try{changePoint(x-i, y+j, type);}catch(err){}
							try{changePoint(x+i, y-j, type);}catch(err){}
							try{changePoint(x-i, y-j, type);}catch(err){}
						}
				}
			}
	}
	catch(err){}
}

//Basically, is is solid or does it move
function isSolid(type){
	return type=="wall" || type=="explosive" || type=="growth" || isGen(type);
}

function isLiquid(type){
	return type=="droplet" || type=="liquidExplosive" || type=="sand";
}

function isGas(type){
	return type=="steam" || type=="smoke" || type=="fire";
}
function isCombustible(type){
	return type=="explosive" || type=="liquidExplosive";
}

function isGen(type){
	return type.substring(type.length-3) == "Gen";
}
function wasParticleGen(particle){
	try{
		return particle.old.substring(particle.old.length-3) == "Gen";
	}catch(err){return false;}
}
function isParticleGen(particle){
	try{
		return particle.fresh.substring(particle.fresh.length-3) == "Gen";
	}catch(err){return false;}
}