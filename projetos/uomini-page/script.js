// Seleciona o botão
const backToTopBtn = document.getElementById("backToTop");

// Mostra/esconde o botão com base na rolagem
window.onscroll = function() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    backToTopBtn.style.opacity = 1;
  } else {
    backToTopBtn.style.opacity = 0;
  }
};

// Ação de clicar para voltar ao topo
backToTopBtn.addEventListener('click', function() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});   