function Scanner(robot, moduleOptions){
	moduleOptions = moduleOptions ? moduleOptions : {};
	var options = cloneObject(moduleOptions, getDefaultOptions());
	var chargeTime = .5;

	this.getEnergy = function(){ return 5; };
	this.query = function(opts){
		if(state < 0){
			return {
				"status":"Inactive"
			};
		}else if(state >= chargeTime * Game.frameRate){
			var result = false;
			Game.drawables.forEach(function(drawable){
				if(drawable != robot){
					var pl = robot.getCanvasLocation(),
						p = new Vector([pl.x, pl.y]),
						dl = drawable.getCanvasLocation(),
						d = new Vector([dl.x, dl.y]),
						delta = d.subtract(p),
						theta = Math.atan(delta.y() / delta.x());

					if(intersect(p, robot.angle, drawable)){
						result = true;
					}
				}
			});
			return {
				"status" : result ? "Hit" : "Miss"
			};
		}else{
			return {
				"status": "Scanning"
			};
		}
	};
	this.exec = function(){
		if(state > -1){
			state++;
			
			if(state > chargeTime * Game.frameRate){
				active = false;
				state = -1;
			}
		}
		
	};
}
Scanner = Scanner.extend(Module);