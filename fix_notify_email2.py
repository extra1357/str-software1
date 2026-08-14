path = r"C:\str_software\str-software\.env.local"
valor_desejado = "salvacao.cristo@gmail.com"

with open(path, "r", encoding="utf-8") as f:
    linhas = f.readlines()

novas_linhas = []
encontrado = False
for linha in linhas:
    if linha.strip().startswith("NOTIFY_EMAIL"):
        novas_linhas.append(f"NOTIFY_EMAIL={valor_desejado}\n")
        encontrado = True
    else:
        novas_linhas.append(linha)

if not encontrado:
    novas_linhas.append(f"NOTIFY_EMAIL={valor_desejado}\n")

with open(path, "w", encoding="utf-8") as f:
    f.writelines(novas_linhas)

if encontrado:
    print(f"NOTIFY_EMAIL atualizado para {valor_desejado}")
else:
    print(f"NOTIFY_EMAIL nao existia - foi adicionado com o valor {valor_desejado}")
