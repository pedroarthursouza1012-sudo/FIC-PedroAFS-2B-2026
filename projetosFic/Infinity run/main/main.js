
const abrirPokemons = document.getElementById("abrirPokemons");
const selecao = document.getElementById("selecao");
const listaPokemons = document.getElementById("listaPokemons");
const jogar = document.getElementById("jogar");
const main = document.getElementById("main");

let pokemons = [];
let pokemonSelecionado = null;

function atualizarDados() {
    pokemons = JSON.parse(localStorage.getItem("pokemons")) || [];

    const salvo = JSON.parse(
        localStorage.getItem("pokemonSelecionado")
    );

    pokemonSelecionado = pokemons.find(
        pokemon => String(pokemon.id) === String(salvo?.id)
    ) || null;

    if (!pokemonSelecionado) {
        localStorage.removeItem("pokemonSelecionado");
    }
}

// Atualiza os dados ao entrar ou voltar para a página
window.addEventListener("pageshow", () => {
    atualizarDados();
});

// Abre a seleção
abrirPokemons.addEventListener("click", () => {
    atualizarDados();
    selecao.classList.add("ativa");
    carregarPokemons();
});

// Fecha somente quando clicar no fundo
selecao.addEventListener("click", (event) => {
    if (event.target === selecao) {
        selecao.classList.remove("ativa");
    }
});

// Cria os cards
function carregarPokemons() {
    listaPokemons.innerHTML = "";

    if (pokemons.length === 0) {
        listaPokemons.textContent = "Nenhum Pokémon cadastrado.";
        return;
    }

    pokemons.forEach(pokemon => {
        const card = document.createElement("div");
        card.classList.add("pokemonCard");

        const imagem = document.createElement("img");
        imagem.src = pokemon.imagem;
        imagem.alt = pokemon.nome;

        const nome = document.createElement("h3");
        nome.textContent = pokemon.nome.toUpperCase();

        const selecionar = document.createElement("button");
        selecionar.textContent = "SELECIONAR";

        selecionar.addEventListener("click", () => {
            pokemonSelecionado = pokemon;

            localStorage.setItem(
                "pokemonSelecionado",
                JSON.stringify(pokemon)
            );

            document.querySelectorAll(".pokemonCard")
                .forEach(card => card.classList.remove("selecionado"));

            card.classList.add("selecionado");
        });

        card.append(imagem, nome, selecionar);
        listaPokemons.appendChild(card);

        if (
            pokemonSelecionado &&
            String(pokemonSelecionado.id) === String(pokemon.id)
        ) {
            card.classList.add("selecionado");
        }
    });
}

// Inicia o jogo
jogar.addEventListener("click", () => {
    atualizarDados();

    if (!pokemonSelecionado) {
        alert("Selecione um Pokémon primeiro!");
        return;
    }

    const id = pokemonSelecionado.id;

    window.location.href = `../index.html?pokemon=${id}`;
});
