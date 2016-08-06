<?php
	$anim = $_GET["a"];
	
	//Log the download
	$log = fopen("downloads.log", 'a');
	fwrite($log, "'$anim' " . date("d/m/y h:i:s a") . "\n");
	fclose($log);
	
	
	header("Content-Length: " . filesize($anim) );
	readfile($anim);
?>