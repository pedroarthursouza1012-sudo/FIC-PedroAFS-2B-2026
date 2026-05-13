
let pessoas = [];


function enviar(){

    let nome = document.getElementById("nome").value
    let idade = Number(document.getElementById("idade").value)

    if (nome ==="" || idade <=0){

alert("Preencha corretamente")
return

}

pessoas.push({nome: nome, idade: idade});

let item = document.createElement("li")
item.innerText = nome + " - " + idade + " anos";
document.getElementById("lista").appendChild(item);

document.getElementById("nome").value = "";
document.getElementById("idade").value = "";

}
