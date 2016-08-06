function Laser(robot, moduleOptions){
	moduleOptions = moduleOptions ? moduleOptions : {};
	var options = cloneObject(moduleOptions, getDefaultOptions());
	var chargeTime = .2;
	var power = 10;

	this.getEnergy = function(){ return 5; };
	this.query = function(opts){
		if(state < 0){
			return {
				"status":"Inactive"
			};
		}else if(state >= chargeTime * Game.frameRate){
			var closest, closestDist = Infinity;
			Game.drawables.forEach(function(drawable){
				if(drawable != robot){
					var pl = robot.getCanvasLocation(),
						p = new Vector([pl.x, pl.y]),
						dl = drawable.getCanvasLocation(),
						d = new Vector([dl.x, dl.y]),
						delta = d.subtract(p),
						theta = Math.atan(delta.y() / delta.x()),
						dist = delta.magnitude();

					if(intersect(p, robot.angle, drawable) && dist < closestDist){
						closest = drawable;
						closestDist = dist;
					}
				}
			});
			if(closest != null){
				if(closest instanceof Robot){
					closest.health -= power;
				}
			}
			return {
				"status" : "Fire"
			};
		}else{
			return {
				"status": "Charging"
			};
		}
	};
	this.startExec = function(opts){
		active = true;
		options = opts
		state = 0;
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
Laser = Laser.extend(Module);