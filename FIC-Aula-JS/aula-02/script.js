function organizar(){

let pessoas = document.getElementById("pessoas").value;

if (!pessoas) return;

let pessoa = pessoas.split(",").map(item => {

    const [nome, idade] = item.split("-");

    if(Number(idade) <= 0){

        alert("Insira uma idade válida");
        throw new Error("Idade inválida");

    }

    return{

        nome: nome.trim(),
        idade: Number(idade)

    }

})

let lista = pessoa.sort((a, b) => a.idade - b.idade);

const ul = document.getElementById("listaFinal");

ul.innerHTML = "";

ul.classList.remove("hidden");
ul.classList.add("show");

lista.forEach(pessoa =>{

    let mensagem = "";

    switch(true){

        case pessoa.idade <= 15:
            mensagem = "(Não pode votar)";
            break;

        case pessoa.idade >= 16 && pessoa.idade <= 17:
            mensagem = "(Voto não é obrigatório)";
            break;

        case pessoa.idade >= 71:
            mensagem = "(Voto não é obrigatório)";
            break;

        default:
            mensagem = "(Voto é obrigatório)";
            break;

    }

    const textoAno = pessoa.idade === 1 ? "ano" : "anos";

    const li = document.createElement("li");

    li.textContent =
    `${pessoa.nome} - ${pessoa.idade} ${textoAno} ${mensagem}`;

    ul.appendChild(li);

})

document.getElementById("pessoas").value = "";

}
