
const div = document.getElementById("resultado")



function mostrar(result){

let resultado_p = document.createElement("p")
resultado_p.textContent = result
div.appendChild(resultado_p)

}

function somar(n1,n2){
mostrar(n1 + n2)

}

function subtrair(n1,n2){
mostrar(n1 - n2)

}

function multiplicar(n1,n2){
mostrar(n1 * n2)
}

function dividir(n1,n2){

if(n2 == 0){

alert("Número 2 não pode ser igual a 0")
return;
}

else{

mostrar(n1 / n2)
}

}

function calcular(){
let n1 = Number(document.getElementById("numero1").value)
let n2 = Number(document.getElementById("numero2").value)
let operador = document.getElementById("op").value
if(operador == "+"){somar(n1,n2)}
else if(operador =="-"){subtrair(n1,n2)}
else if(operador == "*"){multiplicar(n1,n2)}
else if(operador =="/"){dividir(n1,n2)}

}