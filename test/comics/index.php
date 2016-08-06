<?php include('../topHeader'); ?>
<title>Dustin Doloff - Comics </title>
<?php include('../header'); ?>
<?php
  $file = fopen("http://xkcd.com/index.html", "r");
  while(!feof($file)){
  	echo (fgets($file));
  }
  fclose($file);
?>
<?php include('../footer'); ?>
