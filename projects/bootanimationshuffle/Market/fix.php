<?php
	$verified = true;
	$anim = $argv[1];
	
	//Check image
	if(ImageCreateFromPng("./thumbnails/" . str_replace(".zip", ".png", $anim))===false)
		$verified = false;
	
	//Check animation
	$zip = new ZipArchive;
	$res = $zip->open($anim);
	if($res){
		$zip->extractTo('fix/' . str_replace(".zip", "", $anim));
		if(!verifyAnimation('fix/' . str_replace(".zip", "", $anim)))
			$verified = false;
		$zip->close();
	}else
		$verified = false;
	
	//Delete unzipped folder
	delDir("fix");
	
	//Check that the animation doesn't already exist
	if(strpos(file_get_contents("index"), $anim))
		$verified = false;
	else if(!$verified){
		unlink($anim);
		unlink("thumbnails/" . str_replace(".zip", ".png", $anim));
		unlink("properties/" . str_replace(".zip", ".txt", $anim));
	}
	
	//Add animation to index
	if($verified){
		$index = fopen("index", 'a') or die;
		fwrite($index, "\n" . $anim);
		fclose($index);
	}
	
	function verifyAnimation($dir){
		if(is_dir($dir)){
			$fh = opendir($dir);
			while (($entry = readdir($fh))!==false){
				if($entry != "." && $entry != "..")
					if(!verifyAnimation($dir . "/" . $entry))
						return false;
			}
			closedir($fh);
			return true;
		}else{
			return endsWith($dir, ".txt") || endsWith($dir, ".png") || endsWith($dir, ".jpg");
		}
	}
	
	function delDir($dir){
	$d = dir($dir); 
	while($entry = $d->read()) {
	 if ($entry!= "." && $entry!= "..") { 
		if(is_dir($dir . "/" . $entry))
			delDir($dir . "/" . $entry);
		else
			unlink($dir . "/" . $entry);
	 } 
	} 
	$d->close(); 
	rmdir($dir); 
	}
	
	function endsWith($string, $test) {
		$strlen = strlen($string);
		$testlen = strlen($test);
		if ($testlen > $strlen) return false;
		return substr_compare($string, $test, -$testlen) === 0;
	}
?>