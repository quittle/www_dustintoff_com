(function(){
	var cookies = document.getElementById("cookies");
	var dustinCookie = document.getElementById("bigCookie");
	var dustinEvent = document.createEvent("MouseEvents");
	dustinEvent.initMouseEvent("click", true, true, window, 1, 1, 0, 0, 0, false, false, false, false, 0, null);

	if(confirm("Click?")){
		setInterval(function(){
			for(var i=0;i<1;i++)
				dustinCookie.dispatchEvent(dustinEvent);
		},2);
	}

	if(confirm("Upgrade?")){
		setInterval(function(){
			document.getElementById("upgrade0").dispatchEvent(dustinEvent);
		},1000);
	}
	
	setInterval(function(){
		gc = document.getElementById("goldenCookie");
		if(gc.style.display != "none"){
			gc.dispatchEvent(dustinEvent);
		}
	}, 1000);

	setInterval(function(){
		function getCount(arr){
			arr[0] = arr[0].replace(",","");
			if(arr.length == 1){
					return parseFloat(arr[0]);
			}
			units = ["one", "thousand", "million", "billion", "trillion"];
			for(var i=0, l=units.length; i<l; i++){
				if(arr[1] == units[i]){
					return parseFloat(arr[0]) * Math.pow(1000, i);
				}
			}
		}

		var products = document.querySelectorAll(".product.unlocked");
		var l = products.length;
		
		var cps = getCount(cookies.querySelector("div").innerHTML.substring(13).split(" "));
		var total = getCount((cookies.childNodes[0].textContent).split(" "));

		for(var i=l-1;i>=0;i--){
			var product = products[i];
			if(Math.random() * Math.pow(10, l-1) <= Math.pow(10,i)){
				product.dispatchEvent(dustinEvent);
			}

			var productCost = getCount(product.querySelector(".price").innerHTML.split(" "));
			if(productCost < cps * 10 || productCost < total / 50){
				product.dispatchEvent(dustinEvent);
			}
		}
	},1000);
})();

function heavenly(){
	var sucked = 0;
	for (var i = 0; i < Game.wrinklers.length; i++) {
		sucked += Game.wrinklers[i].sucked;
	}
	Game.Has('Wrinklerspawn') ? sucked *= 1.05*1.1 : sucked *= 1.1;
	Game.Notify('Wrinkler Cookies','Once Popped: '+(Beautify(sucked)),[19,7]);
	Game.Notify('Heavenly Chips','Additional HC: '+(Game.HowMuchPrestige(Game.cookiesReset+Game.cookiesEarned+sucked)-Game.prestige['Heavenly chips']),[19,7]);
	Game.Notify('Heavenly Chips','Total HC: '+Game.HowMuchPrestige(Game.cookiesReset+Game.cookiesEarned+sucked),[19,7]);
}

alert("Using cookie cheater version 1.3.0");

/*Use this next line to activate the cheat

d=document;d.body.appendChild(d.createElement("script")).src="http://dustindoloff.com/test/cookie/cheat.js?"+Date()
with(document)body.appendChild(createElement("script")).src="http://dustindoloff.com/test/cookie/cheat.js?"+Date()
*/