---
title: Remote File Inclusion. O que é? Onde vivem? Do que se alimentam?
date: 2021-01-17 18:00:56
tags: ["hacking", "security", "tools"]
---
 
# Remote File Inclusion. O que é? Onde vivem? Do que se alimentam?
De forma resumida e direta, é uma vulnerabilidade que permite que o *upload* de um arquivo malicioso no servidor da própria aplicação, também conhecida pela abreviação ***RFI***.
 
As consequências são as mais diversas possíveis. Pode ser o roubo simples de informações, até o controle total do servidor. Além de controlar o próprio sistema e suas informações, ainda é possível escalar horizontalmente na da rede interna, dependendo das permissões da infraestrutura definidas.
 
No primeiro momento podemos imaginar que alguém possa enviar um vírus que bloqueie, criptografe ou destrua as informações do servidor em questão, mas uma simples página maliciosa pode oferecer um controle muito mais interessante para o atacante. Estas páginas são popularmente chamadas de **Web Shells**.
 
# Web Shell
Praticamente qualquer linguagem web possui recursos para executar comandos no servidor da aplicação. Normalmente estes comandos possuem natureza legítima, mas uma página que abre a possibilidade de informar qualquer comando para que seja processado no servidor, tem um potencial e risco enormes.
 
Páginas **Web Shell** primordialmente fazem isto, forçam a abertura de outra vulnerabilidade na aplicação chamada **Remote Command Execution**.
 
Uma falha do tipo **RFI**, que leva a uma execução de comandos remotos, também pode ser considerado um tipo de **backdoor** da aplicação.
 
# POC
Para praticar, testar e demonstrar criei o meu próprio super *Web Shell* voltado para aplicações *ASP.NET*. A primeira versão desta página está publicada em meu *GitHub* pessoal, conforme link abaixo:
 
> https://github.com/Gadotti/WebShells
 
Uma página deste tipo não precisa se restringir a executar apenas comandos remotos, então desenvolvi uma página que faz mais que isso:
- Obtém informações importantes do servidor
![Informações do servidor](/imgs/web-shells/1-server-info.PNG)
 
- Lê, escreve, exclui, renomeia e faz *download* de arquivos do servidor
![File Browser](/imgs/web-shells/2-file-browser.PNG)
 
- Efetua o *upload* de outros arquivos no servidor
![Upload de arquivos](/imgs/web-shells/3-file-upload.PNG)
 
- Executa comandos no sistema operacional
![Execução de comandos remotos](/imgs/web-shells/4-cmd.PNG)
 
- Conecta em uma base *MSSQL* e executa comandos SQL.
![SQL Queries](/imgs/web-shells/5-sql.PNG)
 
# Dificuldades
Nem sempre é simples validar os arquivos que os usuários efetuam *upload* nos sistemas. As formas de mitigação normalmente não são efetivas, pois não há o conhecimento que alguns tipos de arquivos maliciosos, podem ser inseridos no servidor. Sendo assim, alguns **Do** e **Don't** a serem considerados:
 
## Don't
- Não permita o *upload* de qualquer arquivo.
- Não grave os arquivos oriundos de *upload* fisicamente no servidor, se possível.
- Não restrinja um arquivo verificando apenas a sua extensão.
- Não restrinja os arquivo através do princípio "DenyList".
 
## Do
- Defina permissões mais restritas possíveis para sua aplicação interagir com o servidor.
- Grave os arquivos oriundos de *upload* somente em banco de dados ou em um servidor isolado específico.
- Não permita que sua aplicação acesse páginas que não são conhecidas por ela mesma, se possível.
- Se for necessário salvar arquivos fisicamente, trabalhe com o princípio "AllowList", ou seja, apenas arquivos em que os formatos dos conteúdos são conhecidos.
- Valide a assinatura binária do arquivo para verificar se é o tipo esperado, não confie apenas na sua extensão.
 
# Conclusão
É necessário somente um pouco de conhecimento e muita criatividade. 
Cuide para que a sua aplicação não seja a porta da frente aberta do condomínio.

# Aviso
Usar esta página ou scripts similares em um servidor que não lhe pertence ou não tenha permitessão é ilegal. Use apenas para fins educacionais e pesquisa.