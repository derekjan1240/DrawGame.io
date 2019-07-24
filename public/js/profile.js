function showModifySection(){
    document.getElementById('formSection').classList.remove("nonDisplay");
    document.getElementById('formSection').classList.add("d-flex");
    document.getElementById('infoSection').classList.add("nonDisplay");
}

function cancelModify(){
    document.getElementById('formSection').classList.remove("d-flex");
    document.getElementById('formSection').classList.add("nonDisplay");
    document.getElementById('infoSection').classList.remove("nonDisplay");
}