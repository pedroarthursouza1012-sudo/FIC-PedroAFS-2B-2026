const returnBtn = document.getElementById("return")

window.history.scrollRestoration = "manual";
window.scrollTo(0, 0);

returnBtn.addEventListener("click",()=>{

    history.back()

})
