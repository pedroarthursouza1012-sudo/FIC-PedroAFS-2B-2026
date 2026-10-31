    const addBtn = document.getElementById("pokAddBtn");
    const input = document.getElementById("name");
    let todosPokemons = [];
    const favoritoInput = document.getElementById("favorito");
    let pokemonsAdicionados = JSON.parse(localStorage.getItem("pokemons")) || [];
    const contador = document.querySelector(".contador p");
    const nota = document.getElementById("nota");
    let modoEdicao = null
    let pokemonEditando = null;
    let cardEditando = null
    let requisicaoPreview = 0;
    const intro = document.getElementById("intro");
    const introVideo = document.getElementById("introVideo");
    const site = document.querySelector(".site");
    
    const iniciarIntro = document.getElementById("iniciarIntro");
    const introAssistida = localStorage.getItem("introAssistida");

    if (introAssistida) {

        intro.remove();
        site.classList.add("visivel");

    } else {
    introVideo.addEventListener("ended", () => {
        localStorage.setItem("introAssistida", "true");

        intro.classList.add("finalizando");

        site.classList.add("visivel");

        setTimeout(() => {
            intro.remove();
        }, 1000);
    });

    }
    iniciarIntro.addEventListener("click", async () => {
        try {
            await introVideo.play();
            iniciarIntro.remove();
        } catch (erro) {
            console.error("Não foi possível iniciar:", erro);
        }
    });

    // CONTADOR
    function atualizarContador(){

        contador.textContent = `Total: ${pokemonsAdicionados.length}`;

    }

    window.addEventListener("pageshow", (event) => {
        if (event.persisted) {
            window.location.reload();
        }
    });


    function esconderPreview() {
        requisicaoPreview++;

        document.querySelector(".box").classList.remove("preview-ativo");
    }


    async function atualizarPreview() {

    const nome = input.value.trim().toLowerCase();
    const requisicaoAtual = ++requisicaoPreview;

    // Nome vazio ou incompleto
    if (!nome || !todosPokemons.includes(nome)) {
        esconderPreview();
        return;
    }

    try {

        const dados = await buscarPokemon(nome);

        // Evita mostrar uma resposta antiga
        if (
            requisicaoAtual !== requisicaoPreview ||
            input.value.trim().toLowerCase() !== nome
        ) {
            return;
        }

        const preview = document.querySelector(".previewPokemon");

        preview.querySelector("img").src =
            dados.sprites.other["official-artwork"].front_default;

        preview.querySelector("h3").textContent =
            dados.name;

        preview.querySelector("p").textContent =
            `#${String(dados.id).padStart(3, "0")}`;

        document.querySelector(".box").classList.add("preview-ativo");

    } catch (erro) {

        if (requisicaoAtual === requisicaoPreview) {
            esconderPreview();
        }

    }
}

    // CARREGAR SALVOS
    function carregarSalvos(){

        const listaPokemon = document.querySelector(".listaPokemon");

        pokemonsAdicionados.forEach((pokemon)=>{

            const card = criarCard(pokemon);

            listaPokemon.appendChild(card);

            adicionarEventoExcluir(card, pokemon.nome);
            adicionarEventoEditar(card, pokemon);
            adicionarEventoJogar(card, pokemon);

        });

    }

    // CARREGAR LISTA DE POKÉMONS PARA FILTRO
    async function carregarPokemons(){

        const resposta = await fetch(
            "https://pokeapi.co/api/v2/pokemon?limit=2000"
        );

        const dados = await resposta.json();

        todosPokemons = dados.results.map(
            pokemon => pokemon.name
        );
        input.addEventListener("input", atualizarPreview);

        input.addEventListener("input",()=>{

            const pesquisa = input.value.toLowerCase();

            const resultados = todosPokemons.filter(
                pokemon => pokemon.includes(pesquisa)
            );


        });

    }


    // CRIAR SUGESTÕES DO INPUT
    async function criarSugestoes(){

        const resposta = await fetch(
            "https://pokeapi.co/api/v2/pokemon?limit=1025"
        );

        const dados = await resposta.json();

        const lista = document.getElementById("pokemonList");


        dados.results.forEach(pokemon=>{

            const option = document.createElement("option");

            option.value = pokemon.name;

            lista.appendChild(option);

        });

    }


    // BUSCAR POKÉMON
    async function buscarPokemon(nome){

        const resposta = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${nome}`
        );


        if(!resposta.ok){
            throw new Error("Pokemon não encontrado");
        }


        return await resposta.json();

    }

    // BUSCAR DESCRIÇÃO
    async function buscarDescricao(nome) {
        const resposta = await fetch(
            `https://pokeapi.co/api/v2/pokemon-species/${nome}`
        );

        if (!resposta.ok) {
            throw new Error("Não foi possível buscar a descrição");
        }

        const species = await resposta.json();

        const descricao = species.flavor_text_entries.find(
            texto => texto.language.name === "en"
        );

        return descricao
            ? descricao.flavor_text.replace(/[\n\f]/g, " ")
            : "Descrição indisponível.";
    }

    // CRIAR CARD

    function criarCard(pokemon) {
        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
            <div class="cardInfo">
                <img src="${pokemon.imagem}" alt="${pokemon.nome}">

                
                <p class="nota">Nota: ${pokemon.nota}/10</p>
                <p class="favorito ${pokemon.favorito ? "ativo" : "inativo"}">
                    Favorito: ${pokemon.favorito ? "Sim" : "Não"}
                </p>        
            </div>

            <div class="cardConteudo">

                <h2 class="pokeName">◀ ${pokemon.nome.toUpperCase()}</h2>
                <p class="numero">#${String(pokemon.id).padStart(3, "0")}</p>
                <p class="tipo">${pokemon.tipo}</p>

                <div class="buttons">
                    <button class="jogar">Jogar</button>
                    <button class="editar">Editar</button>
                    <button class="excluir">Excluir</button>
                </div>
            </div>
        `;

        return card;
    }


    // EVENTO DE EXCLUIR
    function adicionarEventoExcluir(card, nome) {
        const btnExcluir = card.querySelector(".excluir");

        btnExcluir.addEventListener("click", () => {
            if (card.classList.contains("excluindo")) return;

            const altura = card.offsetHeight;
            const wrapper = document.createElement("div");

            wrapper.classList.add("card-wrapper");
            wrapper.style.height = `${altura}px`;

            card.before(wrapper);
            wrapper.appendChild(card);

            // Inicia a animação
            requestAnimationFrame(() => {
                card.classList.add("excluindo");
                wrapper.classList.add("excluindo");
            });

            setTimeout(() => {
                wrapper.remove();

                pokemonsAdicionados = pokemonsAdicionados.filter(
                    pokemon => pokemon.nome !== nome
                );

                localStorage.setItem(
                    "pokemons",
                    JSON.stringify(pokemonsAdicionados)
                );

                atualizarContador();
            }, 350);
        });
    }

    function adicionarEventoEditar(card,pokemon){

    const btnEditar = card.querySelector(".editar");

    btnEditar.addEventListener("click",()=>{

    modoEdicao = true;
    pokemonEditando = pokemon;
    cardEditando = card;


    input.value = pokemon.nome;
    atualizarPreview();
    nota.value = pokemon.nota;
    favoritoInput.checked = pokemon.favorito;
    addBtn.textContent = "Salvar alterções";

    window.scrollTo({
        top: 100,
        behavior: "smooth"
    });

    })

    }

    function adicionarEventoJogar(card, pokemon) {

        const btnJogar = card.querySelector(".jogar");

        btnJogar.addEventListener("click", () => {

            localStorage.setItem(
                "pokemonSelecionado",
                JSON.stringify(pokemon)
            );

            const caminho = `../Infinity%20run/main/main.html`;

            window.location.href = caminho;

        });
    }

    // ADICIONAR POKÉMON
    addBtn.addEventListener("click",async ()=>{

        if(modoEdicao){

            const valor = Number(nota.value);

            if (
                nota.value.trim() === "" ||
                isNaN(valor) ||
                valor < 0 ||
                valor > 10
            ) {
                alert("Adicione uma nota válida!");
                nota.value = "";
                return;
            }

            pokemonEditando.nota = Number(nota.value);
            pokemonEditando.favorito = favoritoInput.checked

            const novoCard = criarCard(pokemonEditando);
            cardEditando.replaceWith(novoCard);
            cardEditando = novoCard;

            adicionarEventoExcluir(novoCard, pokemonEditando.nome);
            adicionarEventoEditar(novoCard, pokemonEditando);
            adicionarEventoJogar(novoCard, pokemonEditando);


            localStorage.setItem("pokemons",JSON.stringify(pokemonsAdicionados));



            modoEdicao = false;
            pokemonEditando = null;
            cardEditando = null;

            addBtn.textContent = "Adicionar Pokemon";
            input.value ="";
            nota.value="";
            esconderPreview();
            favoritoInput.checked = false;

            novoCard.scrollIntoView({
            behavior: "smooth",
            block: "center"
            });

            return;

        }


        try{


            const nome = input.value.toLowerCase().trim();

            const valor = Number(nota.value);

            if (
                nota.value.trim() === "" ||
                isNaN(valor) ||
                valor < 0 ||
                valor > 10
            ) {
                alert("Adicione uma nota válida!");
                nota.value = "";
                return;
            }


            if(pokemonsAdicionados.some(pokemon => pokemon.nome === nome)){

                alert("Esse pokemon já foi adicionado");
                return;

            }


            const listaPokemon = document.querySelector(".listaPokemon");


            const dados = await buscarPokemon(nome);


            const descricao = await buscarDescricao(nome);


            const favorito = favoritoInput.checked;


            const pokemon = {

                nome: dados.name,
                id: dados.id,
                imagem: dados.sprites.other["official-artwork"].front_default,
                tipo: dados.types[0].type.name,
                nota: Number(nota.value),
                favorito: favorito

            };


            const card = criarCard(pokemon);


            listaPokemon.appendChild(card);

            esconderPreview();
            pokemonsAdicionados.push(pokemon);


            localStorage.setItem(
                "pokemons",
                JSON.stringify(pokemonsAdicionados)
            );


            atualizarContador();


            adicionarEventoExcluir(card, pokemon.nome);
            adicionarEventoEditar(card, pokemon);
            adicionarEventoJogar(card, pokemon);
            
            input.value = ""
            esconderPreview()
            nota.value = ""
            favoritoInput.checked = false;
            card.scrollIntoView({
            behavior: "smooth",
            block: "center"
            });

        }


            catch (erro) {
            console.error(erro);
            alert("Erro ao adicionar Pokémon: " + erro.message);
        }
    });





    // EXECUTAR FUNÇÕES INICIAIS
    carregarPokemons();
    carregarSalvos();
    atualizarContador();
    criarSugestoes();

