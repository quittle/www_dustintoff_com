<?php
function e(&$s){
	echo $s;
	return "";
}

$compressedCSS = $_POST["css"];
$uncompressedCSS = $compressedCSS;

//Add extra spaces to make them more easily removeable
$compressedCSS = preg_replace('/,/', " , ", $compressedCSS);

//Remove comments
$compressedCSS = preg_replace('/\/\*.*?\*\//', "", $compressedCSS); //multi-line
$compressedCSS = preg_replace('/\/\/.*[\r\n|\n]/', "", $compressedCSS); //inline

//Remove extra spaces
$compressedCSS = preg_replace('/}[\s]*(.*)[\s]*{/', '}${1}{', $compressedCSS); //spaces before selector
$compressedCSS = preg_replace('/[\s]*{/', '{', $compressedCSS); //spaces at end of selector
$compressedCSS = trim($compressedCSS); //spaces at begining and end of file

//Compress inside curly brackets
$index = 0;
while($index<strlen($compressedCSS)){
	//Go to next character
	$curChar = substr($compressedCSS, $index, 1);
	
	if($curChar == "\""){ //Skip quoted text
		$index++;
		$curChar = substr($compressedCSS, $index, 1);
		while($curChar != "\""){
			$index++;
			$curChar = substr($compressedCSS, $index, 1);
		}
	}else if($curChar == "{"){ //Strip in quotes
		$index++;
		$curChar = substr($compressedCSS, $index, 1);
		while($curChar != "}"){
			if(preg_match('/\s/', $curChar)){ //Strip whitespace
				$compressedCSS = substr($compressedCSS, 0, $index) . substr($compressedCSS, $index+1);
			}else
				$index++;
			$curChar = substr($compressedCSS, $index, 1);
		}
	}
	$index++;
}
//Remove last semi-colon
$compressedCSS = preg_replace('/;}/', '}', $compressedCSS); //spaces at end of selector

//Compress values
$compressedCSS = preg_replace('/\s0((px)|(em)|(in)|(cm)|(mm)|(em)|(ex)|(pt)|(pc)|(px))\s/', "0", $compressedCSS);

//Compress color
$index = 0;
while($index<strlen($compressedCSS)-7){
	$color = substr($compressedCSS, $index, 7);
	//echo $index . " - " . $color . "<br />";
	if(preg_match('/#[a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9][a-fA-F0-9]/', $color) && substr($color, 1, 1) == substr($color, 2, 1) && substr($color, 3, 1) == substr($color, 4, 1) && substr($color, 5, 1) == substr($color, 6, 1)){
		$compressedCSS = substr($compressedCSS, 0, $index) . "#" . substr($color, 1, 1) . substr($color, 3, 1) . substr($color, 5, 1) . substr($compressedCSS, $index+7);
	}
	$index++;
}

class Object{
	public $attributes;
	private $values;
	private $size;
	
	public function __construct(){
		$this->attributes = array();
		$this->values = array();
		$this->size = 0;
	}
	
	public function setAttr($attr = "", $val = ""){
		if(!in_array($attr, $this->attributes)){
			array_push($this->attributes, $attr);
			array_push($this->values, $val);
		}else{
			$this->values[] = $val;
		}
	}
	
	public function remAttr($attr){
		$index = array_search($attr, $this->attributes);
		unset($this->attributes[$index]);
		unset($this->values[$index]);
	}
	
	public function getVal($attr){
		return $this->values[array_search($attr, $this->attributes)];
	}
}

$objects = array();
$index = 0;
while($index<$compressedCSS){
	$objs = substr($compressedCSS, $index, 1);
	$index++;
}

?>

Hey, copy your css in and I'll compress it. <?php if($uncompressedCSS != "") echo "Compression amount: " . (1-(strlen($compressedCSS)/strlen($uncompressedCSS)));?>
<form action="." method="post">
<textarea name="css" style="width:50%;height:50%"><?php echo $compressedCSS ?></textarea>
<input type="submit" />
</form>