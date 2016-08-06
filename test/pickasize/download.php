<?
	$DEBUG = false;
	
	function badRequest(){
		header("HTTP/1.0 400 Bad Request");
	}

	if(isset($_GET["filename"]) and $_GET["filename"] != ""){
		$filename = $_GET["filename"];
	} else {
		$filename = "default";
	}
	$filename .= ".txt";
	
	if(isset($_GET["size"]) and filter_var($_GET["size"], FILTER_VALIDATE_FLOAT) !== false){
		$size = $_GET["size"];
	} else {
		$size = 1;
	}
	
	if(isset($_GET["unit"])){
		$unit = $_GET["unit"];
	} else {
		$unit = 2;
	}
	
	//0 = false, 1 = true. if true, use standard powers units 1KB = 1024 Bytes, vs 1000 Bytes
	if(isset($_GET["power"])){
		$power = $_GET["power"] == "0";
	} else {
		$power = true;
	}
	
	$totalSize = $size * pow(($power ? pow(2, 10) : pow(10, 3)), $unit);
	
	if($totalSize > 16 * pow(pow(2,10), 3)){
		badRequest();
		die("<h1>ERROR! Filesize too large!</h1><h2>File size: $totalSize bytes</h2>");
	} else if($totalSize < 0){
		badRequest();
		die("<h1>ERROR! Invalid file size<h1><h2>File size: $totalSize bytes</h2>");
	}
	
	if($DEBUG){
		$break = "\t\t\t\t\t\t\t\t\t<br>\n";
		echo	"filname: " . $filename . $break .
				"size: " . $size . $break .
				"unit: " . $unit . $break .
				"power: " . ($power ? "true" : "false") . $break . $break .
				"File size in bytes: " . $totalSize;
	} else {
		header("Content-Type: application/octet-stream");
		header("Content-Transfer-Encoding: Binary");
		header("Content-Description: File Transfer");
		header("Content-Disposition: attachment; filename='$filename'");
		header("Expires: 0");
		header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
		header("Pragma: public");
		header("Content-Length: $totalSize");
		
		for($i = 0; $i < $totalSize; $i++){
			print "a";
			if($i % 1024 == 0){
				flush();
			}
		}
	}
	
	ob_clean();
	flush();
?>