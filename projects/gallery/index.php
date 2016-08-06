<?php include('../../topHeader'); ?>
  <title>Gallery - Dustin Doloff</title>
<?php include('../../header'); ?>
<h4>This page includes several random images of projects I&apos;ve done.  The focus here, is on a gallery script I wrote.  Try clicking on one of the images below.  You can hit escape or click the &#39;X&#39; to exit the image or simply click outside the image to exit (optional).  All you need to do to use this script is to <a href="GalleryScript.zip">download</a> the script and images, and place the folder and .js in the same folder.  Just include the javascript file and include <span style="color:#ffffff;">&#39;data-location=&quot;location/of/full-image.jpg&quot;&#39;</span> in all your img tags.  You can also modify the text, color, and padding with data-description-left, -center, -right. (e.g. <span style="color:#ffffff;">data-description-center-color=&quot;#ff0000&quot;</span> or <span style="color:#ffffff;">data-description-left-padding=&quot;20&quot;</span> ).  Everything but the data-location are optional with defaults easily set at the top of the script.  The default colors and opacity are customizable in the script file.  Unfortunately, IE9 doesn't yet properly support data- attributes so it will not run in it.</h4>
<?php
	$addr = '../../images/artsy/';
	$dir = opendir($addr);
	$maxPerLine = 4;
	$counter = 0;

	echo '<div style="display:inline;">';
	while($file = readdir($dir)){
		if(is_file($addr . $file)){
			if($counter < $maxPerLine){
				echo '<img height="300" data-description-left="Description goes here" data-description-center="[Title of Image]" data-description-right="- By Dustin Doloff"  data-description-right-color="#ffffff" data-location="' . $addr . $file . '" src="' . $addr . $file . '" alt="' . $file . '"/>';
				$counter++;
			}
			else {
				echo '</div>';
				$counter = 0;
				echo '<br />';
				echo '<div>';
			}
		}
	}
	echo '</div>';
?>

<script type="text/javascript" src="imageViewer.js"> </script>
<?php include('../../footer'); ?>