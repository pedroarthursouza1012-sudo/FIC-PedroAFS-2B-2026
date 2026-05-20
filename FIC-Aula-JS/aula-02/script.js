function organizar() {

    let pessoas = document.getElementById("pessoas").value;

    if (pessoas === "") {
        alert("Preencha corretamente!");
        return;
    }

    let pessoa = pessoas.split(",").map(item => {

        const [nome, idade] = item.split("-");

        return {
nome: nome.trim().toUpperCase(),
idade: Number(idade)
        };

    });

    let lista = pessoa.sort((a, b) => a.idade - b.idade);


    const ul = document.getElementById("lista");
    ul.innerHTML = "";

    lista.forEach(pessoa => {

        const li = document.createElement("li");
        li.textContent = `${pessoa.nome} - ${pessoa.idade} anos`;

        ul.appendChild(li);

    });

    document.getElementById("pessoas").value = ""

}

function analisarLista() {

    const itens = document.querySelectorAll("#lista li");

    if (itens.length === 0) {
        alert("A lista está vazia!");
        return;
    }

    let pessoas = [];

    itens.forEach(item => {

        let texto = item.textContent;

        let partes = texto.split(" - ");

        let nome = partes[0];

        let idade = Number(partes[1].replace(" anos", ""));

        pessoas.push({
            nome,
            idade
        });

    });

    let maisNovo = pessoas.reduce((menor, atual) =>
        atual.idade < menor.idade ? atual : menor
    );

    let maisVelho = pessoas.reduce((maior, atual) =>
        atual.idade > maior.idade ? atual : maior
    );

    alert(
        `Mais novo: ${maisNovo.nome} - ${maisNovo.idade} anos\n` +
        `Mais velho: ${maisVelho.nome} - ${maisVelho.idade} anos`
    );

}
