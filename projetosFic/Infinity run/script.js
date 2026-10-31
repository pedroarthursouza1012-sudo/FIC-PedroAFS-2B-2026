"use strict";
const back = document.getElementById("back");
const tela = document.querySelector(".tela");
const personagem = document.getElementById("personagem");
const personagemPulo = document.getElementById("personagemPulo");
const player = document.getElementById("player");
const arvoreBase = document.querySelector(".tree img");
const contadorBox = document.getElementById("contadorBox");
const contadorP = document.createElement("p");
const estrelas = document.querySelector(".estrelas");
const grass = document.querySelector(".grass");
const nuvens = document.querySelectorAll(
    ".nuvem, .nuvem2, .nuvem3, .nuvem4, .nuvem5, .nuvem6"
);
const gameOverScreen = document.getElementById("gameOver");
const pontuacaoFinal = document.getElementById("pontuacaoFinal");
const jogarNovamente = document.getElementById("jogarNovamente");
const dicaInicio = document.getElementById("dicaInicio");

/* ---------- Constantes: movimento ---------- */
const FPS_REFERENCIA = 60;                                 
const GRAVIDADE = 0.7 * FPS_REFERENCIA ** 2;                
const VELOCIDADE_PULO = 14 * FPS_REFERENCIA;               
const VELOCIDADE_INICIAL = 5 * FPS_REFERENCIA;              
const VELOCIDADE_MAXIMA = 10 * FPS_REFERENCIA;
const ACELERACAO_POR_PONTO = 0.05 * FPS_REFERENCIA;        
const PONTOS_POR_SEGUNDO = 10;                              
const DT_MAXIMO = 1 / 30;                                   
const PASSO_FISICA = 1 / 120;                              

/* ---------- Constantes: ciclo dia/noite ---------- */
const PONTOS_POR_FASE = 150;                              
const PONTOS_POR_CICLO = PONTOS_POR_FASE * 4;              

/* ---------- Constantes: sprites e hitboxes ---------- */
const LIMIAR_ALFA = 32;                                    
const MARGEM_HITBOX_PERSONAGEM_X = 0.25;                    
const MARGEM_HITBOX_PERSONAGEM_TOPO = 0.15;
const MARGEM_HITBOX_ARVORE_X = 0.15;
const MARGEM_HITBOX_ARVORE_TOPO = 0.10;
const AREA_COMPLETA = { esq: 0, dir: 1, topo: 0, base: 1 }; 

/* ---------- Constantes: árvores e justiça dos intervalos ---------- */
const ALTURA_MINIMA_RELATIVA = 0.55;                        // árvore mais baixa = 55% da base; nunca passa de 100%
const ESPACO_INTERNO_MIN = 0.10;                            // espaço entre árvores do grupo, em larguras da árvore-base
const ESPACO_INTERNO_MAX = 0.60;
const PESOS_QUANTIDADE = [0.45, 0.35, 0.20];                // chance de grupos com 1, 2 e 3 árvores
const TEMPO_REACAO = 0.30;                                  // s para perceber o obstáculo e iniciar o pulo
const TEMPO_MARGEM = 0.15;                                  // s de folga extra após aterrissar
const JANELA_MINIMA_DE_PULO = 0.12;                         // s de tolerância ao cronometrar o pulo no grupo mais largo
const FATOR_LARGURA_PROXIMO = 0.5;                          // grupos largos pedem pulo mais preciso: ganham mais espaço antes
const VARIACAO_MAXIMA_LACUNA = 0.6;                         // lacuna real = mínima * (1 + [0, 0,6])
const MARGEM_SPAWN_ARVORES = 2;                             // em larguras da árvore-base, fora da tela à direita

const TEMPO_NO_AR = (2 * VELOCIDADE_PULO) / GRAVIDADE;      // duração total de um pulo

/* ---------- Estado ---------- */
// 'carregando' -> 'pronto' -> 'jogando' -> 'fim' -> 'pronto' ...
let estado = "carregando";
let rafId = null;
let ultimoQuadro = 0;
let tempoMs = 0;
let pontos = 0;

let y = 0;                  // altura acima do chão (u)
let velocidadeY = 0;        // u/s (positivo = subindo)
let noChao = true;

let grupos = [];            // grupos de árvores ativos: { el, x, layout }
let proximoGrupo = null;    // { layout, variacao } já sorteado, ainda fora da cena
let nuvensX = [];
let texturaX = 0;

/* ---------- Medidas (recalculadas ao redimensionar) ---------- */
let escala = 1;
let larguraTela = 0;        // u
let xPersonagem = 0;        // u (borda esquerda do sprite)
let tamanhoPersonagem = 150;
let tamanhoArvoreBase = 50;
let areaPersonagem = AREA_COMPLETA;
let areaArvore = AREA_COMPLETA;
let aspectoArvore = 1;
let hitboxPersonagem = { esq: 0, dir: 0, altura: 0 };

/* ============================================================
   UTILIDADES
   ============================================================ */
function validarPokemon() {
    const pokemons = JSON.parse(
        localStorage.getItem("pokemons")
    ) || [];

    const selecionado = JSON.parse(
        localStorage.getItem("pokemonSelecionado")
    );

    const parametros = new URLSearchParams(window.location.search);
    const idURL = parametros.get("pokemon");

    const pokemonExiste = pokemons.some(
        pokemon => String(pokemon.id) === String(idURL)
    );

    const selecaoValida = selecionado &&
        String(selecionado.id) === String(idURL);

    if (!pokemonExiste || !selecaoValida) {
        localStorage.removeItem("pokemonSelecionado");

        window.location.replace("./main/main.html");
        return false;
    }

    return true;
}

if (!validarPokemon()) {
    throw new Error("Pokémon inválido. Retornando ao menu.");
}


function lerVariavelCSS(nome) {
    return parseFloat(getComputedStyle(tela).getPropertyValue(nome));
}

function aguardarImagem(img) {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();

    return new Promise((resolve, reject) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener(
            "error",
            () => reject(new Error("Falha ao carregar imagem.")),
            { once: true }
        );
    });
}

/**
 * Descobre a caixa que os pixels realmente opacos ocupam dentro da imagem.
 * Retorna frações (0 a 1) da largura/altura naturais, ou null se o navegador
 * bloquear a leitura dos pixels (imagem sem CORS ou abertura via file://).
 */
function medirAreaOpaca(img) {
    try {
        const largura = img.naturalWidth;
        const altura = img.naturalHeight;
        const canvas = document.createElement("canvas");
        canvas.width = largura;
        canvas.height = altura;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        const dados = ctx.getImageData(0, 0, largura, altura).data;

        let minX = largura, minY = altura, maxX = -1, maxY = -1;

        for (let py = 0; py < altura; py++) {
            for (let px = 0; px < largura; px++) {
                if (dados[(py * largura + px) * 4 + 3] > LIMIAR_ALFA) {
                    if (px < minX) minX = px;
                    if (px > maxX) maxX = px;
                    if (py < minY) minY = py;
                    if (py > maxY) maxY = py;
                }
            }
        }

        if (maxX < 0) return null; // imagem totalmente transparente

        return {
            esq: minX / largura,
            dir: (maxX + 1) / largura,
            topo: minY / altura,
            base: (maxY + 1) / altura
        };
    } catch (erro) {
        console.warn("Não foi possível medir os pixels do sprite; usando a imagem inteira.", erro);
        return null;
    }
}

/* ============================================================
   MEDIDAS E HITBOXES
   ============================================================ */

function recalcularMedidas() {
    escala = lerVariavelCSS("--escala") || 1;
    tamanhoPersonagem = lerVariavelCSS("--tamanho-personagem-u") || 150;
    tamanhoArvoreBase = lerVariavelCSS("--tamanho-arvore-u") || 50;
    larguraTela = tela.clientWidth / escala;
    xPersonagem = personagem.offsetLeft / escala;

    calcularHitboxPersonagem();
    renderizarGrupos();
    renderizarPersonagem();
}

/** Sprites são exibidos espelhados (scaleX(-1)), então esquerda/direita se invertem. */
function calcularHitboxPersonagem() {
    const tamanho = tamanhoPersonagem;
    const esqVisual = 1 - areaPersonagem.dir;
    const dirVisual = 1 - areaPersonagem.esq;
    const larguraOpaca = (dirVisual - esqVisual) * tamanho;
    const margem = larguraOpaca * MARGEM_HITBOX_PERSONAGEM_X;

    hitboxPersonagem = {
        esq: xPersonagem + esqVisual * tamanho + margem,
        dir: xPersonagem + dirVisual * tamanho - margem,
        altura: (areaPersonagem.base - areaPersonagem.topo) * tamanho * (1 - MARGEM_HITBOX_PERSONAGEM_TOPO)
    };
}

/* ============================================================
   FÍSICA DO PERSONAGEM
   ============================================================ */

/** Tempo (s) em que um pulo permanece acima de `altura` (u). */
function tempoAcimaDaAltura(altura) {
    const discriminante = VELOCIDADE_PULO ** 2 - 2 * GRAVIDADE * altura;
    return discriminante <= 0 ? 0 : (2 * Math.sqrt(discriminante)) / GRAVIDADE;
}

function pular() {
    if (estado !== "jogando" || !noChao) return;

    velocidadeY = VELOCIDADE_PULO;
    noChao = false;
}

function atualizarFisica(dt) {
    let restante = dt;

    while (restante > 0) {
        const passo = Math.min(restante, PASSO_FISICA);
        restante -= passo;

        velocidadeY -= GRAVIDADE * passo;
        y += velocidadeY * passo;

        if (y <= 0) {
            // aterrissagem: volta exatamente à posição de referência
            y = 0;
            velocidadeY = 0;
            noChao = true;
        }
    }
}

/** Único ponto em que o JS mexe no personagem: o deslocamento vertical do pulo. */
function renderizarPersonagem() {
    personagemPulo.style.transform =
        y === 0 ? "" : `translate3d(0, ${-y * escala}px, 0)`;
}

/* ============================================================
   ÁRVORES: GERAÇÃO E ESPAÇAMENTO
   ============================================================ */

function velocidadeEm(pontuacao) {
    return Math.min(VELOCIDADE_MAXIMA, VELOCIDADE_INICIAL + pontuacao * ACELERACAO_POR_PONTO);
}

/**
 * Velocidade esperada quando um grupo recém-gerado (fora da tela) chegar ao
 * jogador. Sem isso, o intervalo seria calculado para a velocidade de agora
 * e ficaria curto demais depois que o cenário acelerasse.
 */
function velocidadeProjetada() {
    const atual = velocidadeEm(pontos);
    const distancia = larguraTela + MARGEM_SPAWN_ARVORES * tamanhoArvoreBase - xPersonagem;
    const segundosAteJogador = distancia / atual;
    return velocidadeEm(pontos + segundosAteJogador * PONTOS_POR_SEGUNDO);
}

/** Largura máxima (hitbox) de um grupo para que ele seja sempre superável, mesmo na velocidade máxima. */
function limiteLarguraGrupo() {
    const alturaMaxima =
        (areaArvore.base - areaArvore.topo) * tamanhoArvoreBase * (1 - MARGEM_HITBOX_ARVORE_TOPO);
    const tempoAcima = tempoAcimaDaAltura(alturaMaxima);
    const larguraJogador = hitboxPersonagem.dir - hitboxPersonagem.esq;

    // Distância percorrida acima da árvore, menos a folga de cronometragem, menos o corpo do jogador.
    return VELOCIDADE_MAXIMA * (tempoAcima - JANELA_MINIMA_DE_PULO) - larguraJogador;
}

function sortearQuantidade() {
    const sorteio = Math.random();
    let acumulado = 0;

    for (let i = 0; i < PESOS_QUANTIDADE.length; i++) {
        acumulado += PESOS_QUANTIDADE[i];
        if (sorteio < acumulado) return i + 1;
    }
    return PESOS_QUANTIDADE.length;
}

function montarGrupo(quantidade, espacosMinimos) {
    const esqVisual = 1 - areaArvore.dir; // árvores também são espelhadas
    const dirVisual = 1 - areaArvore.esq;
    const alturaOpacaRelativa = (areaArvore.base - areaArvore.topo) * (1 - MARGEM_HITBOX_ARVORE_TOPO);
    const arvores = [];
    let cursor = 0;

    for (let i = 0; i < quantidade; i++) {
        // nunca maior que a árvore-base
        const altura = tamanhoArvoreBase * (ALTURA_MINIMA_RELATIVA + (1 - ALTURA_MINIMA_RELATIVA) * Math.random());
        const largura = altura * aspectoArvore;
        const margem = (dirVisual - esqVisual) * largura * MARGEM_HITBOX_ARVORE_X;

        arvores.push({
            offset: cursor,
            altura,
            largura,
            hbEsq: cursor + esqVisual * largura + margem,
            hbDir: cursor + dirVisual * largura - margem,
            hbAltura: alturaOpacaRelativa * altura
        });

        const fracaoEspaco = espacosMinimos
            ? ESPACO_INTERNO_MIN
            : ESPACO_INTERNO_MIN + Math.random() * (ESPACO_INTERNO_MAX - ESPACO_INTERNO_MIN);

        // sem sobreposição: a próxima começa depois do fim desta + espaço
        cursor += largura + fracaoEspaco * tamanhoArvoreBase;
    }

    const primeira = arvores[0];
    const ultima = arvores[arvores.length - 1];

    return {
        arvores,
        largura: ultima.offset + ultima.largura,
        hbEsq: primeira.hbEsq,
        hbDir: ultima.hbDir,
        larguraHitbox: ultima.hbDir - primeira.hbEsq
    };
}

/** Sorteia um grupo de 1 a 3 árvores garantindo que ele caiba dentro de um pulo na velocidade máxima. */
function gerarLayoutGrupo() {
    const limite = limiteLarguraGrupo();
    let quantidade = sortearQuantidade();

    while (true) {
        let layout = montarGrupo(quantidade, false);
        if (layout.larguraHitbox > limite) layout = montarGrupo(quantidade, true);
        if (layout.larguraHitbox <= limite || quantidade === 1) return layout;
        quantidade--;
    }
}

/**
 * Distância mínima (u) entre a hitbox do fim do grupo anterior e a do início do próximo.
 *
 * Um jogador que pula no último instante útil sobre o grupo anterior pousa
 * TEMPO_NO_AR depois de decolar; ainda precisa de TEMPO_REACAO (+ margem) para
 * enxergar o próximo e decolar de novo. Como parte desse trajeto já é coberta
 * pelo próprio grupo anterior, subtraímos a largura dele. Grupos largos pedem
 * pulo mais preciso, então somamos uma fração da largura do próximo.
 */
function lacunaMinima(anterior, proximo) {
    const v = velocidadeProjetada();
    const bruta =
        v * (TEMPO_NO_AR + TEMPO_REACAO + TEMPO_MARGEM) -
        anterior.larguraHitbox +
        proximo.larguraHitbox * FATOR_LARGURA_PROXIMO;

    return Math.max(bruta, v * (TEMPO_REACAO + TEMPO_MARGEM));
}

function sortearProximoGrupo() {
    return { layout: gerarLayoutGrupo(), variacao: Math.random() * VARIACAO_MAXIMA_LACUNA };
}

function posicaoDoProximoGrupo() {
    const anterior = grupos[grupos.length - 1];
    const lacuna = lacunaMinima(anterior.layout, proximoGrupo.layout) * (1 + proximoGrupo.variacao);

    return anterior.x + anterior.layout.hbDir + lacuna - proximoGrupo.layout.hbEsq;
}

function criarElementoGrupo(layout) {
    const el = document.createElement("div");
    el.className = "grupo-arvores";
    el.style.setProperty("--largura", layout.largura);

    layout.arvores.forEach((arvore) => {
        const img = document.createElement("img");
        img.className = "arvore";
        img.src = arvoreBase.currentSrc || arvoreBase.src;
        img.alt = "";
        img.draggable = false;
        img.style.setProperty("--x", arvore.offset);
        img.style.setProperty("--altura", arvore.altura);
        el.appendChild(img);
    });

    tela.appendChild(el);
    return el;
}

function adicionarGrupo(layout, x) {
    const grupo = { el: criarElementoGrupo(layout), x, layout };
    grupos.push(grupo);
    posicionarGrupo(grupo);
}

function posicionarGrupo(grupo) {
    grupo.el.style.transform = `translate3d(${grupo.x * escala}px, 0, 0)`;
}

function renderizarGrupos() {
    grupos.forEach(posicionarGrupo);
}

function removerGrupo(grupo) {
    grupo.el.remove();
}

function limparGrupos() {
    grupos.forEach(removerGrupo);
    grupos = [];
    proximoGrupo = null;
}

/** Move os grupos, remove os que saíram da tela e cria o próximo quando a lacuna calculada permitir. */
function atualizarArvores(dt, velocidade) {
    const deslocamento = velocidade * dt;

    grupos.forEach((grupo) => {
        grupo.x -= deslocamento;
        posicionarGrupo(grupo);
    });

    // mantém sempre o último grupo: ele é a referência de espaçamento
    while (grupos.length > 1 && grupos[0].x + grupos[0].layout.largura < -tamanhoArvoreBase) {
        removerGrupo(grupos.shift());
    }

    const margemSpawn = MARGEM_SPAWN_ARVORES * tamanhoArvoreBase;
    const x = posicaoDoProximoGrupo();

    if (x <= larguraTela + margemSpawn) {
        adicionarGrupo(proximoGrupo.layout, x);
        proximoGrupo = sortearProximoGrupo();
    }
}

/* ============================================================
   COLISÃO (em u, sem ler o DOM)
   ============================================================ */

function verificarColisao() {
    for (const grupo of grupos) {
        for (const arvore of grupo.layout.arvores) {
            const esq = grupo.x + arvore.hbEsq;
            const dir = grupo.x + arvore.hbDir;

            const sobrepoeX = hitboxPersonagem.esq < dir && hitboxPersonagem.dir > esq;
            // o pé do personagem está em `y`; a árvore ocupa de 0 até hbAltura
            const sobrepoeY = y < arvore.hbAltura;

            if (sobrepoeX && sobrepoeY) return true;
        }
    }
    return false;
}

/* ============================================================
   CENÁRIO: ESTRELAS, NUVENS, CHÃO, DIA E NOITE
   ============================================================ */

function criarEstrelas() {
    for (let i = 0; i < 60; i++) {
        const estrela = document.createElement("div");
        estrela.classList.add("estrela");
        estrela.style.left = Math.random() * 100 + "%";
        estrela.style.top = Math.random() * 70 + "%";
        estrela.style.animationDelay = Math.random() * 2 + "s";
        estrelas.appendChild(estrela);
    }
}

function reiniciarNuvens() {
    nuvens.forEach((nuvem) => {
        nuvem.style.left = ""; // volta à posição definida no CSS
    });
    nuvensX = Array.from(nuvens, (nuvem) => parseFloat(getComputedStyle(nuvem).left));
}

function moverCenario(dt, velocidade) {
    const deslocamentoPx = velocidade * escala * dt;

    nuvens.forEach((nuvem, i) => {
        nuvensX[i] -= deslocamentoPx * 0.3;

        if (nuvensX[i] < -150) {
            nuvensX[i] = tela.offsetWidth + 100;
        }

        nuvem.style.left = `${nuvensX[i]}px`;
    });

    texturaX -= deslocamentoPx;
    grass.style.backgroundPosition = `${texturaX}px 0px`;
}

/**
 * Luminosidade do ambiente: 1 = dia, 0 = noite.
 * 0-150 dia | 150-300 pôr do sol | 300-450 noite | 450-600 amanhecer.
 * Dia ocupa os primeiros 300 pontos e noite os 300 seguintes, repetindo.
 */
function calcularLuz(pontuacao) {
    const posicao = pontuacao % PONTOS_POR_CICLO;

    if (posicao < PONTOS_POR_FASE) return 1;
    if (posicao < PONTOS_POR_FASE * 2) return 1 - (posicao - PONTOS_POR_FASE) / PONTOS_POR_FASE;
    if (posicao < PONTOS_POR_FASE * 3) return 0;
    return (posicao - PONTOS_POR_FASE * 3) / PONTOS_POR_FASE;
}

/** Só altera uma variável CSS visual: não interfere na física nem nas colisões. */
function atualizarCicloDiaNoite(pontuacao) {
    tela.style.setProperty("--luz", calcularLuz(pontuacao).toFixed(3));
}

function atualizarContador() {
    contadorP.textContent = pontos.toString().padStart(7, "0");
}

/* ============================================================
   LOOP PRINCIPAL (um único requestAnimationFrame)
   ============================================================ */

function quadro(agora) {
    rafId = null;
    if (estado !== "jogando") return;

    const dt = Math.min(Math.max((agora - ultimoQuadro) / 1000, 0), DT_MAXIMO);
    ultimoQuadro = agora;

    tempoMs += dt * 1000;
    const pontuacaoExata = (tempoMs / 1000) * PONTOS_POR_SEGUNDO;
    const pontuacaoInteira = Math.floor(pontuacaoExata);

    if (pontuacaoInteira !== pontos) {
        pontos = pontuacaoInteira;
        atualizarContador();
        atualizarCicloDiaNoite(pontos);
    }

    const velocidade = velocidadeEm(pontuacaoExata);

    atualizarFisica(dt);
    renderizarPersonagem();
    atualizarArvores(dt, velocidade);
    moverCenario(dt, velocidade);

    if (verificarColisao()) {
        fimDeJogo();
        return;
    }

    rafId = requestAnimationFrame(quadro);
}

function cancelarLoop() {
    if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
}

/* ============================================================
   CICLO DE VIDA DA PARTIDA
   ============================================================ */

function resetarJogo() {
    cancelarLoop();
    limparGrupos();

    y = 0;
    velocidadeY = 0;
    noChao = true;
    tempoMs = 0;
    pontos = 0;
    texturaX = 0;

    grass.style.backgroundPosition = "0px 0px";
    atualizarContador();
    atualizarCicloDiaNoite(0);
    reiniciarNuvens();
    recalcularMedidas();

    // Grupo inicial visível desde o começo, a uma distância justa do jogador.
    const distanciaMinima =
        xPersonagem + tamanhoPersonagem + VELOCIDADE_INICIAL * (TEMPO_REACAO + 1);
    const layoutInicial = gerarLayoutGrupo();
    adicionarGrupo(layoutInicial, Math.max(larguraTela * 0.7, distanciaMinima));
    proximoGrupo = sortearProximoGrupo();

    gameOverScreen.classList.remove("on");
    jogarNovamente.blur(); // o botão oculto não pode receber ESPAÇO/Enter
    dicaInicio.classList.remove("oculta");

    estado = "pronto";
}

function iniciarJogo() {
    if (estado !== "pronto") return; // impede início duplicado

    estado = "jogando";
    dicaInicio.classList.add("oculta");
    ultimoQuadro = performance.now();

    cancelarLoop();
    rafId = requestAnimationFrame(quadro);
}

function fimDeJogo() {
    if (estado !== "jogando") return;

    estado = "fim";
    cancelarLoop();

    pontuacaoFinal.textContent = pontos.toString().padStart(7, "0");
    gameOverScreen.classList.add("on");
}

/** Interação válida (clique, espaço ou seta para cima). */
function aoInteragir() {
    if (estado === "pronto") {
        iniciarJogo();
    } else if (estado === "jogando") {
        pular();
    }
    // 'carregando' e 'fim': ignorado (Game Over só reinicia pelo botão)
}

/* ============================================================
   CARREGAMENTO: POKÉMON (PokéAPI / localStorage) E ÁRVORE-BASE
   ============================================================ */

async function carregarArvoreBase() {
    try {
        await aguardarImagem(arvoreBase);

        aspectoArvore = arvoreBase.naturalWidth / arvoreBase.naturalHeight || 1;
        areaArvore = medirAreaOpaca(arvoreBase) || AREA_COMPLETA;

        tela.style.setProperty("--vazio-inferior-arvore", (1 - areaArvore.base).toFixed(4));
    } catch (erro) {
        console.error(erro);
    }
}

async function exibirSprite(url) {
    try {
        // CORS permite ler os pixels do sprite para medir a área opaca
        player.crossOrigin = "anonymous";
        player.src = url;
        await aguardarImagem(player);
    } catch (erro) {
        // servidor sem CORS: exibe o sprite normalmente, sem medição
        player.removeAttribute("crossorigin");
        player.src = url;
        await aguardarImagem(player);
    }

    areaPersonagem = medirAreaOpaca(player) || AREA_COMPLETA;
    tela.style.setProperty("--vazio-inferior-personagem", (1 - areaPersonagem.base).toFixed(4));
    player.classList.add("carregado");
}

async function carregarPokemonEscolhido() {
    const params = new URLSearchParams(window.location.search);
    const pokemonId = params.get("pokemon");
    let pokemonEscolhido = null;

    try {
        if (pokemonId !== null) {
            if (!/^\d+$/.test(pokemonId) || Number(pokemonId) < 1) {
                throw new Error("ID de Pokémon inválido.");
            }

            const resposta = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${pokemonId}`
            );

            if (!resposta.ok) {
                throw new Error("Pokémon não encontrado.");
            }

            const dados = await resposta.json();

            pokemonEscolhido = {
                id: dados.id,
                nome: dados.name,
                sprite: dados.sprites.front_default
            };
        } else {
            pokemonEscolhido = JSON.parse(
                localStorage.getItem("pokemonEscolhido")
            );
        }

        if (!pokemonEscolhido || !pokemonEscolhido.sprite) {
            throw new Error("Nenhum Pokémon selecionado.");
        }

        await exibirSprite(pokemonEscolhido.sprite);
        return true;
    } catch (erro) {
        console.error(erro);
        alert("Não foi possível carregar o Pokémon.");
        history.back();
        return false;
    }
}

/* ============================================================
   EVENTOS
   ============================================================ */

back.addEventListener("click", () => {
    history.back();
});

tela.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (gameOverScreen.contains(e.target)) return; // cliques no Game Over não pulam nem iniciam
    aoInteragir();
});

document.addEventListener("keydown", (e) => {
    if (e.code !== "Space" && e.code !== "ArrowUp") return;

    // não sequestra o teclado quando o foco está num botão, campo ou link
    if (e.target instanceof Element && e.target.closest("button, input, textarea, select, a")) return;

    e.preventDefault();
    if (e.repeat) return; // segurar a tecla não dispara pulos em sequência
    aoInteragir();
});

jogarNovamente.addEventListener("click", () => {
    if (estado === "fim") resetarJogo();
});

new ResizeObserver(() => {
    if (estado !== "carregando") recalcularMedidas();
}).observe(tela);

/* ============================================================
   INICIALIZAÇÃO
   O carregamento só prepara o jogo; quem inicia é a interação do jogador.
   ============================================================ */

async function inicializar() {
    contadorP.classList.add("contador");
    contadorBox.appendChild(contadorP);
    contadorP.textContent = "0000000";

    criarEstrelas();

    const [, pokemonOk] = await Promise.all([
        carregarArvoreBase(),
        carregarPokemonEscolhido()
    ]);

    if (!pokemonOk) return;

    resetarJogo(); // deixa o estado em 'pronto', aguardando clique/espaço/seta
}

inicializar();