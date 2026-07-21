const div_media = document.getElementById("media");
const btn_salvar = document.querySelector(".btn-modal")
const btn_mostrar = document.getElementById("mostrar_media")

let materiaSelecionada = "Português"; // valor inicial

let nomeAluno = "";
let idadeAluno = "";

btn_mostrar.addEventListener("click",()=>{

    let n1 = Number(document.getElementById("nota1").value);
    let n2 = Number(document.getElementById("nota2").value);
    let n3 = Number(document.getElementById("nota3").value);
    let n4 = Number(document.getElementById("nota4").value);

    if (
        isNaN(n1) || n1 < 0 || n1 > 10 ||
        isNaN(n2) || n2 < 0 || n2 > 10 ||
        isNaN(n3) || n3 < 0 || n3 > 10 ||
        isNaN(n4) || n4 < 0 || n4 > 10
    ) {
        alert("Preencha os campos corretamente");
        return;
    }

    let media = (n1 + n2 + n3 + n4) / 4;

    if (media >=6){

    div_media.innerHTML = `
        <p>
        Aluno: ${nomeAluno} (${idadeAluno} anos)<br>    
        Média em <strong>${materiaSelecionada}</strong>:
            ${media.toFixed(2)} - Aprovado
        </p>
    `;
}
    else if (media >=1){

        div_media.innerHTML = `
        <p>
        Aluno: ${nomeAluno} (${idadeAluno} anos)<br>  
            Média em <strong>${materiaSelecionada}</strong>:
            ${media.toFixed(2)} - Recuperação
        </p>
    `;
    }
    else{

    div_media.innerHTML = `
        <p>
        Aluno: ${nomeAluno} (${idadeAluno} anos)<br>  
            Média em <strong>${materiaSelecionada}</strong>:
            ${media.toFixed(2)} - Reprovado
        </p>
    `;
    }})


const opcoes = document.querySelectorAll(".opcao");

opcoes.forEach(opcao => {
    opcao.addEventListener("click", () => {

        document.querySelector(".opcao.ativa")
            ?.classList.remove("ativa");

        opcao.classList.add("ativa");

        materiaSelecionada = opcao.textContent.trim();
    });
});

btn_salvar.addEventListener("click",()=>{

    const nome = document.getElementById("nomeAluno").value.trim();
    const idade = Number(document.getElementById("idadeAluno").value);

    if(nome === "" || isNaN(idade)){
        alert("Preencha nome e idade.");
        return;
    }

    nomeAluno = nome;
    idadeAluno = idade;

    document.getElementById("modal")
    .classList.add("modal-fechado");
})