/* Incomplete and untested */
function Vector(elements){
	var ERR_SIZE = "Vectors of different size";
	
	if(elements instanceof Vector)
		this.elements = elements.elements;
	else if(Array.isArray(elements))
		this.elements = getVectorElements(elements);
	else
		this.elements = getVectorElements(arguments);
		
	function getVectorElements(args){
		var numbers = [];
		for(var i = 0, l = args.length; i < l ;i++){
			var arg = args[i];
			if(Array.isArray(arg)){
				return arg;
			}else if(typeof arg === "Number"){
				numbers.push(arg);
			}else if(arg instanceof Vector){
				return vector.elements;
			}
		}
		return numbers;
	}

	function getVector(args){
		var numbers = [];
		for(var i = 0, l = args.length; i < l ;i++){
			var arg = args[i];
			if(Array.isArray(arg)){
				return new Vector(arg);
			}else if(typeof arg === "Number"){
				numbers.push(arg);
			}else if(arg instanceof Vector){
				return arg;
			}
		}
		return new Vector(numbers);
	}
	
	this.size = function(){
		return elements.length;
	}
	
	this.magnitude = function(){
		var sum = 0;
		for(var i=0,l=this.size(); i<l; i++)
			sum += Math.pow(this.get(i),2);
		return Math.sqrt(sum);
	}
	
	this.add = function(){
		var v1 = this, v2 = getVector(arguments);
		if(v1.size() != v2.size())
			throw ERR_SIZE;
		var numbers = new Array(v1.size());
		for(var i=0,l=v1.size();i<l;i++)
			numbers[i] = v1.get(i) + v2.get(i);
		return new Vector(numbers);
	}
	
	this.subtract = function(){
		var v1 = this, v2 = getVector(arguments);
		return v1.add(v2.multiply(-1));
	}
	
	this.multiply = function(x){
		var ret = new Array(elements.length);
		for(var i=0, l=this.size(); i<l; i++)
			ret[i] = this.get(i) * x;
		return new Vector(ret);
	}

	this.dot = function(){
		var v1 = this, v2 = getVector(arguments);
		
		if(v1.size() != v2.size())
			throw ERR_SIZE;
		
		var sum=0;
		for(var i=0, l=v1.size(); i<l; i++)
			sum += v1.get(i)*v2.get(i);
		
		return sum;
	}
	
	this.divide = function(x){
		return this.multiply(1/x);
	}
	
	this.determinate2 = function(v1,v2){
		if(v1.size() != v2.size() || v1.size() != 2){
			throw ERR_SIZE;
		}
		
		return v1.x() * v2.y() - v1.y() * v2.x();
	}
	
	this.normalize = function(){
		var ret = this.clone(), m = ret.magnitude();

		for(var i = 0, l = ret.size(); i<l; i++){
			ret.set(i, ret.get(i) / m);
		}
		
		return ret;
	}
	
	this.clone = function(){
		return new Vector(elements);
	}
	
	this.x = function(x){
		if(this.size() < 1)
			throw ERR_SIZE;
			
		if(x != null){
			elements[0] = x;
		}else
			return this.get(0);
	}
	this.y = function(y){
		if(this.size() < 2)
			throw ERR_SIZE;
			
		if(y != null)
			elements[1] = y;
		else
			return this.get(1);
	}
	this.z = function(z){
		if(this.size() < 3)
			throw ERR_SIZE;
			
		if(z != null)
			elements[2] = z;
		else
			return this.get(2);
	
	}
	
	this.set = function(i, v){
		if(i < 0 || i >= this.size()){
			throw ERR_SIZE;
		}

		elements[i] = v;
	}
	this.get = function(i){
		return elements[i];
	}
	
	this.equals = function(){
		var v1 = this, v2 = getVector(arguments);

		if(v1.size() != v2.size())
			return false;

		for(var i=0, l=v1.size(); i<l; i++)
			if(v1.get(i) != v2.get(i))
				return false;
		
		return true;
	}
	
	this.toString = function(){
		var str = "<";
		for(var i=0, l=this.size(); i<l; i++){
			str += this.get(i);
			if(i < l-1){
				str += ", ";
			}
		}
		str += ">";
		
		return str;
	}
}
Vector.determinate2 = new Vector().determinate2;