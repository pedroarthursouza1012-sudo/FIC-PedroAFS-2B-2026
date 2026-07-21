const btn_organizar = document.getElementById("btn_organizar")
const btn_limpar = document.getElementById("limpar")
const btn_analise = document.getElementById("analise")

btn_organizar.addEventListener("click",()=>{

let pessoas = document.getElementById("nomes").value
 if (!pessoas) return;

let pessoa = pessoas.split(",").map(item => {

const [nome, idade] = item.split("-")
return{

nome: nome.trim().toUpperCase(),
idade: Number(idade)}})

let lista = pessoa.sort((a, b) => a.idade - b.idade);

const ul = document.getElementById("listaFinal")
ul.innerHTML = ""

lista.forEach(pessoa =>{

const li = document.createElement("li")
li.textContent = `${pessoa.nome} - ${pessoa.idade} anos`
ul.appendChild(li)

})})


/*==========================================================*/
/*==========================================================*/
/*==========================================================*/


btn_organizar.addEventListener("click",()=>{

let pessoas = document.getElementById("nomes").value
 if (!pessoas) return;

let pessoa = pessoas.split(",").map(item => {

const [nome, idade] = item.split("-")
return{

nome: nome.trim().toUpperCase(),
idade: Number(idade)}})

let filtrados = pessoa.filter(pessoa => pessoa.nome.length >= 7)

let lista = filtrados.sort((a, b) => a.idade - b.idade);

const ul = document.getElementById("listaFinal2")
ul.innerHTML = ""

lista.forEach(pessoa =>{

const li = document.createElement("li")
li.textContent = `${pessoa.nome} - ${pessoa.idade} anos`
ul.appendChild(li)

})})
/*==========================================================*/
/*==========================================================*/
/*==========================================================*/

btn_organizar.addEventListener("click",()=>{

let pessoas = document.getElementById("nomes").value
 if (!pessoas) return;

let pessoa = pessoas.split(",").map(item => {

const [nome, idade] = item.split("-")
return{

nome: nome.trim().toUpperCase(),
idade: Number(idade)}})

let nomesAlfa = pessoa.sort((a,b)=>

a.nome.localeCompare(b.nome)
);
    
const ul = document.getElementById("listaFinal3")
ul.innerHTML = ""

nomesAlfa.forEach( pessoa=>{

const li = document.createElement("li")
li.textContent = `${pessoa.nome} - ${pessoa.idade} anos`
ul.appendChild(li)
})})

/*==========================================================*/
/*==========================================================*/
/*==========================================================*/


btn_limpar.addEventListener("click",()=>{

const ul = document.getElementById("listaFinal")
ul.innerHTML = ""
const ul2 = document.getElementById("listaFinal2")
ul2.innerHTML = ""
const ul3 = document.getElementById("listaFinal3");
    ul3.innerHTML = "";
})

/*==========================================================*/
/*==========================================================*/
/*==========================================================*/

btn_analise.addEventListener("click",()=>{

    let pessoas = document.getElementById("nomes").value
 if (!pessoas) return;

let pessoa = pessoas.split(",").map(item => {

const [nome, idade] = item.split("-")
return{
nome: nome.trim(),
idade: Number(idade)
};
});


let maiores = pessoa.filter(pessoa => pessoa.idade >= 18);
    let quantidade = pessoa.length;
    let nomes = maiores.map(pessoa => pessoa.nome);




    let maisVelho = pessoa.reduce((maior, atual)=>{
return atual.idade < maior.idade ? maior : atual;

})

    let maisNovo = pessoa.reduce((menor, atual)=>{

return atual.idade < menor.idade ? atual: menor


    })


alert(
        "Maiores de idade: " + nomes.join(", ") +
        "\nQuantidade de pessoas: " + quantidade +
        "\nMais velho: " + maisVelho.nome + " (" + maisVelho.idade + " anos)" +
        "\nMais novo: " + maisNovo.nome + " (" + maisNovo.idade + " anos)"
    )})

/*==========================================================*/
/*==========================================================*/
/*==========================================================*/

