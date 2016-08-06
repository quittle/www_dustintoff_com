var hiddenVariables = [
	"hiddenVariables",
	"Game", "Script", "Drawable", "Movable", "Robot", "RobotController", "Module",
	"initGame", "initPanelCode", "getHolderFileElement", "loadFile",
	"gameLoop", "resize", "loadPanel", "updateGame", "drawGame",
	"initScript", "runScript", "load", "newFile",
	"Scanner", "Laser",
	"cloneObject", "intersect",
	"getLocalString", "setLocalString", "getLocalArray", "setLocalArray"
];

//Create game object
var Game = {
	gameCanvas : document.getElementById("game_canvas"),
	gameCanvasContext : document.getElementById("game_canvas").getContext("2d"),
	gameCanvasSize :
		{
			width : null,
			height : null,
			squareSize : null
		},
	drawables : [],
	timers : [],
	mainCharacter: null,
	tick : updateGame,
	tock : drawGame,
	frameRate : 20, //frames per second
	resize : resize,
	running : true,
	time: 0, //Time in milliseconds since starting Game
	
	debug: false
};

/* RobotController Accessible variables */
var Console = {
	init : function(){
			if(!this.initialized){
				this.initialized = true;
				this.consoleContents = document.getElementById("console-contents");
				this.consoleElement = document.getElementById("console");
			}
		},
	raw : function(type, msg){
			//Check before adding new contents that we are actually at the bottom
			var atBottom = (this.consoleElement.scrollTop == this.consoleElement.scrollHeight - this.consoleElement.clientHeight);
				
			this.consoleContents.appendChild(genEl(type,{},{},escapeHTML(msg)));
			this.consoleContents.appendChild(genEl("br"));

			//If we were at the bottom, continue scrolling down with contents
			if(atBottom)
				Console.scrollToBottom();
		},
	scrollToBottom : function(){
			this.consoleElement.scrollTop = this.consoleElement.scrollHeight;
		},
	error : function(msg){
			Console.raw("error", msg);
			console.error(msg);
		},
	log : function(msg){
			Console.raw("log", msg);
		},
	info : function(msg){
			Console.raw("info", msg);
		}
};

System = {
	frameRate : Game.frameRate,
	getTime : function(){
			return Game.time;
		}
}

/* END RCA */

var Script = {
	mainHolder : "__MAIN_HOLDER_OBJECT__"
};

//The game canvas should be able to draw 100 by 100 
function Drawable(x,y){
	x = x || 0;
	y = y || 0;

	//Origin is the center so values can be negative
	this.location = {
		"x" : x,
		"y" : y
	};

	//The scaling factor of the object (1 is like 100%)
	this.size = 1;
	
	//Get the radius of a bounding circle that would contain the Drawable
	//Use this to get size you should draw within
	this.getCanvasRadius = function(){
		return this.size * Game.gameCanvasSize.squareSize / 50;
	};
	
	this.getCanvasLocation = function(){
		var size = Game.gameCanvasSize.squareSize,
			middle = size / 2,
			delta = size / 100;

		return {
			x : middle + this.location.x * delta,
			y : middle - this.location.y * delta
		}
	};
	
	//The drawing and updating functions of the Drawable. To be overridden by subclasses
	this.draw = null;
	this.update = null
}

//angle in radians, color as per my Color object
function Movable(x, y, speed, angle, color){
	this.speed = 0;

	this.angle = 0;
	
	this.color = new Color(color);
	
	this.rotate = function(angle){
		angle = angle || 0;
		this.angle += angle;
		var twoPI = 2*Math.PI;
		while(this.angle > twoPI)
			this.angle -= twoPI;
		while(this.angle < 0)
			this.angle += twoPI;

		return this.angle;
	}
	this.accelerate = function(speed){
		speed = speed || 0;
		this.speed += speed;
		
		return this.speed;
	}
	
	this.update = function(){
		this.location.x += (this.speed * Math.cos(this.angle)) / Game.frameRate;
		this.location.y += (this.speed * Math.sin(this.angle)) / Game.frameRate;
	};
	
	this.draw = function(){
		var gcc = Game.gameCanvasContext,
			loc = this.getCanvasLocation(),
			rad = this.getCanvasRadius();

		gcc.fillStyle = this.color.hex();
		gcc.strokeStyle = this.color.hex();
		gcc.beginPath();
		gcc.arc(loc.x, loc.y, rad, 0, 2 * Math.PI);
		gcc.moveTo(loc.x, loc.y);
		gcc.lineTo(loc.x + Math.cos(this.angle)*rad, loc.y - Math.sin(this.angle)*rad);
		gcc.stroke();
	};
	
	this.accelerate(speed);
	this.rotate(angle);
}
Movable = Movable.extend(Drawable);

function Robot(x, y, speed, angle, color, battery, options){
	this.battery = battery != null ? battery : 100; // [0-100]
	this.health = 100;
	
	this.modules = [];

	var defaultOptions = {
		"minSpeed" : 0,
		"maxSpeed" : 50,
		"minSpeedAcceleration" : -3,
		"maxSpeedAcceleration" : 3,
		"minRotateSpeed" : Math.PI/-2,
		"maxRotateSpeed" : Math.PI/2
	};
	this.options = options || {};
	for(var o in defaultOptions)
		if(this.options[o] == null)
			this.options[o] = defaultOptions[o];
	
	this.robotController = new RobotController(this, this.options);
	this.script = null;
	this.scriptFunctionObject = null;
	
	this.setRobotController = function(robotController){
		this.robotController = robotController;
	};
	this.setScript = function(script){
		Console.log("Setting new script: " + script);
		initScript(this, script);
	};
	
	this.update = (function(update, self){
		return function(){
			//Call parent update
			update.apply(self);
			
			/* Ignore main script, use timers */
			//Run the main script
			/*
			try{
				runScript(self);
			}catch(e){
				//If something is broken, report the error for the user
				Console.error(e);
			}
			*/
			
			//Figure out the commands to be issued
			var rc = self.robotController;
			var state = rc.getStateAndReset();
			
			//And modify according to the state
			if(state.accelerating){
				self.speed = Math.restrict(self.speed + state.accelerating, self.options.minSpeed / Game.frameRate, self.options.maxSpeed / Game.frameRate);
			}
			if(state.rotating){
				self.rotate(state.rotating);
			}

			//Start all modules that aren't active yet
			//state.modules are active modules (not all the ones on the robot)
			var modules = state.modules;
			modules.forEach(function(obj){
				var m = obj.module; //state.modules has both a module and an options object)
				if(m && !m.isActive()){
					m.startExec(modules[m]);
				}
			});
			
			//Exec (update) all modules on the robot
			self.modules.forEach(function(m){
				m.exec();
			});
		};
	})(this.update, this);
	
	this.draw = (function(draw, self){
		return function(){
			draw.apply(self);
			
			self.modules.forEach(function(m){
				if(m.draw)
					m.draw();
			});
		};
	})(this.draw, this);
}
Robot = Robot.extend(Movable);

function RobotController(arg_robot, arg_options){
	var robot = arg_robot;
	var options = arg_options;

	var defaultState = {
		"accelerating" : false,
		"rotating" : false,
		"modules" : []
	};
	var state = cloneObject(defaultState);
	
	/* User accessible methods */
	this.accelerate = function(speed){
		speed = Math.restrict(speed, options.minSpeedAcceleration / Game.frameRate, options.maxSpeedAcceleration / Game.frameRate);
		return state.accelerating = speed;
	}
	this.rotate = function(speed){
		speed = Math.restrict(speed, options.minRotateSpeed / Game.frameRate, options.maxRotateSpeed / Game.frameRate);
		return state.rotating = speed;
	}
	function getModule(type){
		return robot.modules.find(function(m){
			return m.getName() == type;
		});
	}
	this.queryModule = function(type, opts){
		var m = getModule(type);
		if(!m){
			Console.error("Module '" + type + "' not found");
		}else{
			return m.query(opts);
		}
	}
	this.execModule = function(type, opts){
		var m = getModule(type);
		if(!m){
			Console.error("Module '" + type + "' not found");
		}else{
			var obj = state.modules.find(function(mod){ return mod.module == m; });
			if(!obj)
				state.modules.push(obj = {"module":m, "options":opts});
		}
	}
	this.getState = function(){
		var ret = {};
		for(var s in state)
			ret[s] = state[s];

		ret.speed = this.speed;
		ret.direction = this.angle;
		
		return ret;
	}
	this.getStateAndReset = function(){
		var ret = this.getState();
		state = cloneObject(defaultState, ret);
		return ret;
	}
}

function Module(robot, moduleOptions){
	var robot = robot,
		active = false,
		name = arguments.callee.name,
		callbacks = [],
		
		state = -1;
	
	function triggerCallbacks(o){
		callbacks.forEach(function (c){
			c(o);
		});
	}
	
	function getDefaultOptions(){
		return {
			"auto" : false
		};
	}

	this.getName = function(){
		return name;
	};
	this.isActive = function(){
		return active;
	};
	
	this.addListener = function(f){
		callbacks.push(f);
	}
	this.removeListener = function(f){
		var i = callbacks.indexOf(f);
		if(i > -1){
			callbacks.splice(i, 1);
		}
	}
	
	//Override in extending classes
	this.getEnergy = null; //Energy required for execing
	this.query = null; //This is for getting status updates (many per iteration)
	this.startExec = function(opts){  //This is the action called to initialize the execing for each iteration
		active = true;
		options = opts;
		state = 0;
	};
	this.exec = null; //This is the action to be applied each iteration (once per iteration)
	this.draw = null; //This is called to draw the modules and their actions
}

function initGame(){
	window.addEventListener("resize", Game.resize);
	window.addEventListener("load", Game.resize);
	
	window.addEventListener("hashchange", function(){
		var l = window.location,
			h = l.hash;
		
		if(h == "#newFile"){
			newFile();
		}
		
		l.hash = "";
	});
	
	Console.init();

	window.addEventListener("load", function(){
		initPanelCode();

		var drawables = Game.drawables;
		//drawables.push(new Movable(0,0,0,0,"#f00"));
		//drawables.push(new Movable(50,50,3,Math.PI/-.15,"#0f0"));
		
		var mainCharacter = new Robot(-10,-10);
		mainCharacter.modules.push(new Scanner(mainCharacter));
		mainCharacter.modules.push(new Laser(mainCharacter));
		var jsScript = "\
		var counter = 0;\
		Robot.rotate(.01);\
		function main(){\
			/*Robot.accelerate(3);*/\
			if(Robot.queryModule('Scanner').status == 'Hit'){\
				Console.info(\"HIT!\");\
				Robot.rotate(-.01);\
				Robot.accelerate(10);\
			}else{\
				Robot.rotate(.01);\
				Robot.accelerate(-10);\
			}\
			Robot.execModule('Scanner');\
		}\
		";

		//mainCharacter.setScript(jsScript);
		mainCharacter.setScript(getLocalString("orange"));
		Game.mainCharacter = mainCharacter;
		drawables.push(mainCharacter);
		
		var enemy = new Robot(10,10,0,Math.PI/-2,"#500");
		jsScript = "\
		var counter=0;\
		\
		function main(){\
			Robot.accelerate(100);\
			counter++;\
			if(counter>30)\
				Robot.rotate(.1);\
			else\
				Robot.rotate(-.1);\
			if(counter > 60)\
				counter = 0;\
		}\
		";
		enemy.setScript(jsScript);
		drawables.push(enemy);
		
		resize();

		gameLoop();
	});
	
	//Load modules
	load("Scanner");
	load("Laser");
}

function initPanelCode(){
	var d = document,
		editor = d.getElementById("editor"),
		ct = d.getElementById("panel_code-left-text"),
		ch = d.getElementById("panel_code-right-holder");
	
	var save = function(){
		setLocalString(editor.file, window.editor.getText());
		
		remClass(getHolderFileElement(), "dirty");
	};
	
	window.addEventListener("keydown", function(e){
		if(e.keyCode == 83 && e.ctrlKey){
			save();
		}else{ // If not captured, allow the event to bubble
			return true;
		}
		// Only get here if one of the if statements made it
		// Sort of like a !else statement
		e.preventDefault();
		return false;
	});
	
	editor.addEventListener("keyup", function(e){
		var file = window.editor.getText(),
			old = getLocalString(editor.file);

		if(file != old){
			console.log(file, old);
			putClass(getHolderFileElement(), "dirty");
		}else{
			remClass(getHolderFileElement(), "dirty");
		}
	});
	
	ct.addEventListener("change", save);
	ct.addEventListener("keyup", save);
	
	var files = getLocalArray("files");

	map(files, function(file){
		var link = genEl("a", {"class":"panel_code-right-holder-file", "file":file}, {}, file);
		link.addEventListener("click", function(){
			loadFile(link.file);
		});
		ch.appendChild(link);
	});
}
function getHolderFileElement(){
	var d = document,
		editor = d.getElementById("editor"),
		ret;
	map(Array.toArray(d.getElementsByClassName("panel_code-right-holder-file")), function(e){
		if(e.innerHTML == editor.file){
			ret = e;
		}
	});
	return ret;
}
function loadFile(file){
	var d = document,
		editor = d.getElementById("editor"),
		contents = getLocalString(file);
	
	editor.file = file;
	window.editor.setText(contents);
}

function gameLoop(){
	var i = 0;
	setInterval(function(){
		if(i++ < 1000)
			Game.tick();
		Game.tock();
	}, 1000 / Game.frameRate);
}

function resize(){
	var gc = Game.gameCanvas;
	var gcs = Game.gameCanvasSize;

	//Clear sizing to stretch best
	gc.width = gc.height = gc.style.width = gc.style.height = "100%";

	//Get the width and height of the containing area
	gcs.width = parseInt(style(Game.gameCanvas, "width", true));
	gcs.height = parseInt(style(Game.gameCanvas, "height", true));

	//Get the actual width/height of the square canvas
	gcs.squareSize = Math.min(gcs.width, gcs.height);

	//Set the new width/height to be square and zoomed to 100%
	gc.style.width = gc.style.height = gcs.squareSize + "px";
	gc.setAttribute("width", gc.style.width);
	gc.setAttribute("height", gc.style.width);
}

function loadPanel(name){
	var d = document,
		ph = d.getElementById("panel_hidden"),
		pm = d.getElementById("panel_middle"),
		current = pm.children[0],
		replacement = d.getElementById("panel_" + name);
	
	ph.appendChild(current);
	pm.appendChild(replacement);
	
	//Screen loads the wrong size if the window is resized
	// when another panel is loaded
	resize();
}

function Timer(isInterval, interval, callback){
	var startTime = Game.time,
		cancelled = false;
	
	Game.timers.push(this);
	
	this.CONSTANTLY = -1;

	this.update = function(){
		var t = Game.time;
		if((t > startTime + interval || interval == this.CONSTANTLY) && !cancelled){
			callback();
			if(isInterval){
				startTime = t;
			}else{
				this.cancel();
			}
		}
	}
	
	this.cancel = function(){
		var t = Game.timers,
			i = t.indexOf(this);
		if(i > -1){
			t.splice(i, 1);
		}
	}
	this.isCancelled = function(){
		return cancelled;
	}
}
Timer.CONSTANTLY = new Timer().CONSTANTLY;

//Game updates
function updateGame(){
	//Update the game time
	Game.time += 1000 / Game.frameRate;

	//Update the timers
	map(Game.timers, function(t){
		t.update();
	});
	
	//Call all drawable's update function
	map(Game.drawables, function(d){
		if(d.update)
			d.update();
	});
}
function drawGame(){
	var gcc = Game.gameCanvasContext,
		gcs = Game.gameCanvasSize;

	//Clear canvas
	gcc.clearRect(0,0, gcs.squareSize,gcs.squareSize);
	
	map(Game.drawables, function(d){
		if(d.draw)
			d.draw();
	});
}

function initScript(robot, script){
	//Set robot script
	robot.script = script;

	var scriptOpen = "var a = (function(arg_Robot, arg_Console){\
		/*Null out variables and functions*/\
		var window,document, open,close,moveTo,resizeTo, screen,location,history,navigator, alert,prompt,confirm, setTimeout,setInterval,clearInterval,\
		Document,ProcessingInstruction,Comment,DocumentType,DocumentFragment,Text,CDATASection,EntityReference,DocumentType,EntityReference,Attr,Notation,NodeList,NamedNodeMap,CharacterData,DOMImplementation,DOMString,DOMTimeStamp,StringExtend,\
		Node,Element,HTMLAnchorElement,HTMLAppletElement,HTMLAreaElement,HTMLBaseElement,HTMLBaseFontElement,HTMLBodyElement,HTMLBRElement,HTMLButtonElement,HTMLDirectoryElement,HTMLDivElement,HTMLDListElement,HTMLElement,HTMLFieldSetElement,HTMLFontElement,HTMLFormElement,HTMLFrameElement,HTMLFrameSetElement,HTMLHeadElement,HTMLHeadingElement,HTMLHRElement,HTMLHtmlElement,HTMLIFrameElement,HTMLImageElement,HTMLInputElement,HTMLIsIndexElement,HTMLLabelElement,HTMLLegendElement,HTMLLIElement,HTMLLinkElement,HTMLMapElement,HTMLMenuElement,HTMLMetaElement,HTMLModElement,HTMLObjectElement,HTMLOListElement,HTMLOptGroupElement,HTMLOptionElement,HTMLParagraphElement,HTMLParamElement,HTMLPreElement,HTMLQuoteElement,HTMLScriptElement,HTMLSelectElement,HTMLStyleElement,HTMLTableCaptionElement,HTMLTableCellElement,HTMLTableColElement,HTMLTableElement,HTMLTableRowElement,HTMLTableSectionElement,HTMLTextAreaElement,HTMLTitleElement,HTMLUListElement;"
	
	map(hiddenVariables, function(hv){
		scriptOpen += "var " + hv + ";";
	});
		
	scriptOpen +=
		"var console = {\
			\"error\" : Console.error,\
			\"log\" : Console.log,\
			\"info\" : Console.info\
		};\
		var Robot = arg_Robot;\
		\
		try{\n\
			return function(){\
	";
	var scriptClose = "\n\
			this."+Script.mainHolder+" = function(){};\
			if(typeof main !== 'undefined'){\
				this."+Script.mainHolder+" = main;\
			}\
			};\
		}catch(e){\
			console.error(e);\
		}\
	}(robotController, console));\
	return a;\
	";
	
	var rc = robot.robotController;
	var fullScript = scriptOpen + script + scriptClose;
	
	var scriptFunction, scriptFunctionObject;
	try{
		scriptFunction = new Function("robotController", "console", fullScript);
		scriptFunctionObject = new (scriptFunction(rc, Console))();
	}catch(e){
		Console.error(e);
	}
	
	robot.scriptFunctionObject = scriptFunctionObject;
}

function runScript(robot){
	robot.scriptFunctionObject[Script.mainHolder]();
}

function load(module){
	var h = document.body;
	h.insertBefore(genEl("script", {"src":"modules/" + module + ".js"}), h.firstChild);
}

function newFile(){
	var file = prompt("File Name?");
	if(file !== null){
		console.log("Creating new file: " + file);
		var files = getLocalArray("files");
		if(files.indexOf(file) == -1){
			files.push(file);
		}else{
			console.err("File '" + file + "' exists already");
		}
		setLocalArray("files", files);
		console.log(files);
	}
}

initGame();