function adicionarTarefa() {
  


  //Cria variável chamada mensagem, com valor atribuido "Tarefa adicionada com sucesso!"
  let mensagem = "Tarefa adicionada com sucesso!";

  //Cria variável chamada inputTarefa
  //Pega no html, um elemento com id= inputTarefa
  let inputTarefa = document.getElementById("inputTarefa");

  //Cria variável chamada Tarefa, que recebe o inputTarefa
  // E daí, pega o valor atribuido ao inputTarefa
  let Tarefa = inputTarefa.value.trim();

  if (!Tarefa){
    return
  }

  //Adiciona o texto atribuido à variavel mensagem
  // na caixa de texto do elemento com id= mensagem
  document.getElementById("mensagem").textContent = mensagem;

  //Cria variável chamada listaTarefas
  //Que recebe o elemento com id = listaTarefas (ul)
  let listaTarefas = document.getElementById("listaTarefas");

  //Cria variável chamada novaTarefa
  //que recebe um novo elemento li
  let novaTarefa = document.createElement("li");

  //Atribui à essa nova variável(novaTarefa),
  // a variável Tarefa(valor do inputTarefa, ex: Estudar)
  novaTarefa.textContent = Tarefa;


  //Adiciona um elemento filho(li/novaTarefa)
  //  à lista de tarefas(ul)
  listaTarefas.appendChild(novaTarefa);

  //Ao final da função, ele atrbui o valor
  // vazio ao inpuTarefa
  inputTarefa.value = "";

  
}

function limparLista() {
    document.getElementById("listaTarefas").innerHTML = "";
}
