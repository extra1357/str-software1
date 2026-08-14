path = r"C:\str_software\str-software\.env.local"

with open(path, "r", encoding="utf-8") as f:
    linhas = f.readlines()

novas_linhas = []
alterado = False
for linha in linhas:
    if linha.strip().startswith("NOTIFY_EMAIL"):
        novas_linhas.append("NOTIFY_EMAIL=salvacao.cristo@gmail.com\n")
        alterado = True
    else:
        novas_linhas.append(linha)

with open(path, "w", encoding="utf-8") as f:
    f.writelines(novas_linhas)

if alterado:
    print("NOTIFY_EMAIL atualizado para salvacao.cristo@gmail.com")
else:
    print("NOTIFY_EMAIL nao encontrado - nada foi alterado")
