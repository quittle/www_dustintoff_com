<?php
	$divider = "__xfg!8YXk_!j23F_!USLe825__";
	if($_POST['load'] != NULL){
		$name = $_POST['load'] . ".txt";
		if(file_exists($name)){
			$file = fopen($name, 'r');
			echo fread($file, filesize($name));
			fclose($file);
		}
	} else {
		$file = fopen($_POST['video'] . ".txt", 'a');
		fwrite($file, $_POST['time'] . $divider . time() . $divider . stripslashes($_POST['comment']) . $divider . $_POST['lines'] . "\n");
		fclose($file);
		echo "Video: " . $_POST['video'] . "\n\n";
		echo "Time: " . $_POST['time'] . "\n\n";
		echo "Date: " . time() . "\n\n";
		echo "Comment: " . $_POST['comment'];
	}
	
	/*$divider = "__xfg!8YXk_!j23F_!USLe825__";
	if($_GET['load'] != NULL){
		$name = $_GET['load'] . ".txt";
		if(file_exists($name)){
			$file = fopen($name, 'r');
			echo fread($file, filesize($name));
			fclose($file);
		}
	} else {
		$file = fopen($_GET['video'] . ".txt", 'a');
		fwrite($file, $_GET['time'] . $divider . time() . $divider . stripslashes($_GET['comment']) . $divider . $_GET['lines'] . "\n");
		fclose($file);
		echo "Video: " . $_GET['video'] . "\n\n";
		echo "Time: " . $_GET['time'] . "\n\n";
		echo "Date: " . time() . "\n\n";
		echo "Comment: " . $_GET['comment'];
	}*/
?>