<div>

<?php /*
$target_path = "./";

$target_path = $target_path . basename( $_FILES['u']['name']); 
if(!empty($_FILES['u']['tmp_name']))
if(move_uploaded_file($_FILES['u']['tmp_name'], $target_path)) {
    echo "The file ".  basename( $_FILES['u']['name']). 
    " has been uploaded";
    echo '<br />Click <a href="' . $_FILES['u']['name'] . '">here</a> to check.';
} else{
    echo "There was an error uploading the file, please try again!";
}
*/
?>

</div>
<form enctype="multipart/form-data" method="POST">
<input  name="u" type="file"/> <input type="submit" />
</form>