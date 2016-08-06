<!DOCTYPE html>
<html>
	<head>
		<title>Pick A Size!</title>
	</head>
	<body>
		<h1>Download a file of any size you want!</h1>
		
		<form method="get" action="download.php">
			<div>
				<label for="filename">Filename: </label><input name="filename" type="text" />
			</div>
			<div>
				<label for="size">File Size: </label><input name="size" type="number" min="0" />
				<select name="unit">
					<option value="0">Bytes</option>
					<option selected="selected" value="1">Kilobytes</option>
					<option value="2">Megabytes</option>
					<option value="3">Gigabytes</option>
				</select>
			</div>
			<div>
				<label for="power">Powers of Units</label><select name="power">
					<option value="0">2^10</option>
					<option value="1">10^3</option>
				</select>
			</div>
			<input type="submit" />
		</form>
	</body>
</html>