print("Calculadora")

num1 = int(input("Digite um número: "))
op = input("Digite um operador [+,-,x,/]: ")
num2 = int(input("Digite outro número: "))

if op == "+":
    print("Resultado:", num1 + num2)
elif op == "-":
    print("Resultado:", num1 - num2)
elif op == "x":
    print("Resultado:", num1 * num2)
elif op == "/":
    if num2 != 0:
        print("Resultado:", num1 / num2)
    else:
        print("Erro: divisão por zero não é permitida.")
else:
    print("Erro: operador inválido.")
