const intro = document.getElementById("intro");
const intro_title = document.querySelector(".intro-title")
const pastaFic = document.getElementById("folderFic")


window.history.scrollRestoration = "manual";
window.scrollTo(0, 0);

// Se já viu a intro
if (localStorage.getItem("introJaVisto")) {
    
    intro.style.display = "none";
}

intro_title.addEventListener("animationend",()=>{

intro.style.opacity=0;
 intro.style.pointerEvents = "none";
localStorage.setItem("introJaVisto","true");

})




