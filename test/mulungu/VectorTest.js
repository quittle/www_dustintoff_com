var v1 = new Vector([0,1]),
	v2 = new Vector([0,1]),
	v3 = new Vector([1,2]),
	v4 = new Vector([1,1]),
	v5 = new Vector([3,3]),
	v6 = new Vector([1,2,3]),
	v7 = new Vector([1 / Math.sqrt(2), 1 / Math.sqrt(2)]),
	v8 = new Vector([1 / Math.sqrt(5), 2 / Math.sqrt(5)]),
	v9 = new Vector([2,3]),
	v10 = new Vector([2/Math.sqrt(13), 3/Math.sqrt(13)]);

function assert(statement){
	if(this.count === undefined)
		this.count = 0;

	this.count++;
	if(statement)
		console.log("(" + this.count + ") Pass!");
	else{
		console.error("(" + this.count + ") Fail!");
		throw new Exception();
	}
}

assert(v1.equals(v2));						//1
assert(!v1.equals(v3));						//2
assert(!v3.equals(v6));						//3
assert(!v6.equals(v3));						//4
assert(v1.equals([0,1]));					//5

assert(v2.add(v4).equals(v3));				//6
assert(v3.subtract(v2).equals(v4));			//7

assert(v4.multiply(1).equals(v4));			//8
assert(v4.multiply(3).equals(v5));			//9
assert(v5.divide(3).equals(v4));			//10

assert(v4.dot(v3) == 3);					//11
assert(v5.dot(v3) == 9);					//12
assert(v2.dot(v5) == v5.dot(v2));			//13

assert(Vector.determinate2(v1,v2) == 0);	//14
assert(Vector.determinate2(v5,v3) == 3);	//15
assert(Vector.determinate2(v3,v5) == -3);	//16

assert(v3.clone().equals(v3));				//17

assert(v9.normalize().equals(v10));			//18
assert(v3.normalize().equals(v8));			//19

