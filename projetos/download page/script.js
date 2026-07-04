const btn = document.querySelector(".button");
const progresso = document.querySelector(".progresso");
const barra = document.querySelector(".barra");
const main = document.getElementById("main");

const installDiv = document.querySelector(".instalando");
const imgCheck = document.getElementById("img-check");
const spinner = document.querySelector(".spinner");
const h2Install = document.getElementById("h2-install");

const mine = document.getElementById("mine")

const pop_up = document.getElementById("pop_up")
const pop_up_p = document.getElementById("pop_up_p")

let timerId
const porcentagem = document.getElementById("porcentagem")
let porcentagem_num = 0
const limite = 100

const pause_btn = document.getElementById("pause")
const return_btn = document.getElementById("return")
const btnBox = document.querySelector(".btn-box")

const refresh = document.getElementById("refresh")

let pausado = false
let voltas = 0

// Esconde a tela de instalação no início
installDiv.style.opacity = "0";

pop_up.style.display = "none"


pop_up.addEventListener("animationend",()=>{

 pop_up.classList.remove("upDown");
    pop_up.style.display = "none";
    
})


function aparecerPopUp(mensagem){

    pop_up_p.textContent = mensagem
    
    pop_up.style.display = "block"
    pop_up.classList.add("upDown")
    
}

function prepararDownload(){

porcentagem_num = 0
porcentagem.textContent = "0%";
progresso.style.width = "0%";

}

function iniciarDownload() {
    btn.disabled = true;
    btn.classList.add("play");
    btn.addEventListener("animationend",(event)=>{

    if(event.animationName === "fallDown"){
        mostrarBarra()
        }

    })
}

function mostrarBarra() {
    
    pause_btn.style.display = "block"   
    contador()
    barra.classList.add("abrir");
    
}



function contador(){

    clearInterval(timerId)

    timerId = setInterval(() => {
    porcentagem_num++
    progresso.style.width = porcentagem_num + "%"
    porcentagem.textContent = porcentagem_num + "%"
        
    // Verifica se atingiu o limite
    if (porcentagem_num >= 100) {
        clearInterval(timerId); // Para o intervalo
        timerId = null
        finalizarDownload()
    }
},50);}


function pausarDownload(){

pausado = true
clearInterval(timerId)

}

function returnDownload(){

pausado = false

contador()

}

function finalizarDownload() {
    barra.classList.add("end");
    btnBox.classList.add("end")
    aparecerPopUp("Download concluído")
    
barra.addEventListener("animationend",()=>{

    mostrarInstalacao()
})
}



function esconderDownload() {
    barra.classList.remove("abrir");
    progresso.classList.remove("loading");
    main.style.display = "none";

}

function contarVoltas(){

voltas = 0
const handler = ()=>{

voltas++

if(voltas >= 5){
    spinner.removeEventListener("animationiteration",handler)
    concluirInstalacao()
}
}

spinner.addEventListener("animationiteration",handler)

}

function mostrarInstalacao() {
    esconderDownload()
    contarVoltas()
    installDiv.style.opacity = "1";
    
}

function concluirInstalacao() {
    spinner.classList.add("off");
    imgCheck.classList.add("on");
    h2Install.classList.add("turnOff");
     
    h2Install.addEventListener("transitionend",()=>{

        esconderInstalacao()

    })
}

function esconderInstalacao() {
    installDiv.classList.add("off");

    const handler = (e) => {
        if (e.target !== installDiv) return;

        installDiv.removeEventListener("transitionend", handler);
        aparecerPopUp("Abrindo programa...")
       pop_up.addEventListener("animationend",()=>{

            abrirPrograma();
        })  
        
    };

    installDiv.addEventListener("transitionend", handler);
}

function abrirPrograma(){

installDiv.style.display = "none"
mine.style.display = "block"
refresh.style.display = "flex"

}


pause_btn.addEventListener("click",()=>{

pause_btn.style.display = "none"
pausarDownload()
return_btn.style.display = "block"

})

return_btn.addEventListener("click",()=>{

pause_btn.style.display = "block"
returnDownload()
return_btn.style.display = "none"

})


function download(){

aparecerPopUp("Iniciando download")
prepararDownload()
iniciarDownload()


}


refresh.addEventListener("click", () => {
    document.body.style.opacity = "0";
    setTimeout(() => {
        location.reload();
    }, 300);
});
btn.addEventListener("click", download);