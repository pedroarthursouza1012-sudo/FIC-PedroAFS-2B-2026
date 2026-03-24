#=====================LIMPAR A TELA=====================

import os
os.system('cls')

def limpa():
    import os
    os.system('cls' if os.name == 'nt' else 'clear')

#=====================================================

print("=============================")
print("==== CALCULADORA DE ÁGUA ====")
print("=============================\n")

nome = input("Digite seu nome: ")

limpa()

print("Bem Vindo",nome,"!\n")

print("Vamos calcular quantos copos de água você deve beber!")
print("Vamos considerar que você beba num copo, de 250ml, ok?\n")

peso = float(input("Digite seu peso em Kg (Ex: 75.5): \n"))


limpa()

if peso <= 0 or peso >= 636:
    print("Peso inválido!")
    exit()

else:
    agua_dia = peso * 35
    copo = int( agua_dia / 250)


    print("Você deve beber",agua_dia,"ml de água por dia")
    print("Ou seja,",copo,"copos por dia")

