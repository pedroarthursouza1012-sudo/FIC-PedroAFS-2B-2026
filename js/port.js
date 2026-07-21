const intro = document.getElementById("intro");
const btn = document.getElementById("openSite");
const titulo = document.querySelector(".intro-text");
const pastaFic = document.getElementById("folderFic")

// Se já viu a intro
if (sessionStorage.getItem("introJaVisto")) {
    intro.style.display = "none";
}

// Ativa underline ao carregar
window.addEventListener("load", () => {
    setTimeout(() => {
        titulo.classList.add("ativo");
    }, 500);
});

// Clique no botão
if (btn) {
    btn.addEventListener("click", () => {
        intro.style.transform = "translateY(-100%)";

        sessionStorage.setItem("introJaVisto", "true");

        setTimeout(() => {
            intro.style.display = "none";
        }, 800);
    });
}

if (pastaFic) {
    pastaFic.addEventListener("click", () => {
        window.open("projetos-fic.html", "_blank");
        alert("Funcionou!");
    });
}



