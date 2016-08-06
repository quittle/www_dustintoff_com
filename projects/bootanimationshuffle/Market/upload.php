<?php
//Counter
$uploadCount = 0;

//Receive the files
$animation = $_FILES['animation'];
$thumbnail = $_FILES['thumbnail'];
$properties = $_FILES['properties'];

//Save files
if(move_uploaded_file($animation['tmp_name'], ucwords($animation['name'])))$uploadCount++;
if(move_uploaded_file($thumbnail['tmp_name'], "./thumbnails/" . ucwords($thumbnail['name'])))$uploadCount++;
if(move_uploaded_file($properties['tmp_name'], "./properties/" . ucwords($properties['name'])))$uploadCount++;

//return response to the server
echo json_encode(
	array('animation'=>$animation['name'],
		'thumbnail'=>$thumbnail['name'],
		'properties'=>$properties['name'],
		'upload count'=>$uploadCount)
);

//Run to fix potential problems with the file and add to index
exec("/usr/local/bin/php ./fix.php \"" . $animation['name'] . "\"&> /dev/null &");
?>