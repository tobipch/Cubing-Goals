<?php
//Get transmitted jsonObj
if(isset($_POST["jsonData"])){
    $jsonObj = $_POST["jsonData"];
}

//Copy file to have a backup / save
copy("../../data.json", "../../data_old.json");

//Replace data.json File with new json-data.
$dataFile = fopen("../../data.json", "w");
$res = fwrite($dataFile, $jsonObj);
fclose($dataFile);
?>