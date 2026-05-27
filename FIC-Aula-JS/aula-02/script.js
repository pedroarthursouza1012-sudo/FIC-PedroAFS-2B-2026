function organizar(){

let pessoas = document.getElementById("pessoas").value
 if (!pessoas) return;

let pessoa = pessoas.split(",").map(item => {

const [nome, idade] = item.split("-");
return{

nome: nome.trim().toUpperCase(),
idade: Number(idade)}})

let lista = pessoa.sort((a, b) => a.idade - b.idade);

const ul = document.getElementById("listaFinal")


lista.forEach(pessoa =>{

let mensagem = ""

switch(true){

case pessoa.idade <=15:
mensagem = "Não pode votar";
break;

 case pessoa.idade >= 16 && pessoa.idade <= 18:
                mensagem = "Voto não é obrigatório";
                break;

case pessoa.idade >= 71:
mensagem = "Voto não é obrigatório";
break;

default: mensagem = "Voto é obrigatório";
break;
}


const li = document.createElement("li")
li.textContent = `${pessoa.nome} - ${pessoa.idade} anos - ${mensagem}`
ul.appendChild(li)

document.getElementById("pessoas").value = ""

})}
