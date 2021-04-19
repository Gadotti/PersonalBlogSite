---
title: 'Proof-of-work com hashcash. Evitando bloqueios de acesso.'
date: 2021-04-19 11:18:44
tags: ["security","hacking"]
---

A notícia correu: ["Falha" do WhatsApp permite que qualquer um bloqueie sua conta](https://macmagazine.com.br/post/2021/04/12/falha-no-whatsapp-permite-que-qualquer-um-bloqueie-sua-conta/). Isto ocorre porque como parte da estratégia de vários sistemas (e não somente o WhatsApp) para mitigar o ataque de força bruta para quebra de credenciais, é bloquear o acesso à conta após "N" tentativas erradas de login por "X" tempo.

A estratégia mitiga este problema com certa eficácia, mas trás um efeito colateral: deixa o sistema vulnerável a ataques de DoS. Ataque de negação de serviço? Sim! A conta que normalmente é e-mail ou telefone conhecido, é utilizado como acesso à algum sistema que efetua o bloqueio após 'X' tentativas erradas agora está à disposição para ser bloqueada por qualquer um que tentar realizar logins inválidos com ela. Não é muito difícil manter um script a ser executado a cada minuto para garantir que o bloqueio sempre se mantenha ativo, negando assim o serviço ao usuário.

Este ataque pode ser mais sofisticado, ampliando o foco para diversos outros usuários ou até mesmo para todos, isto negaria completamente o serviço do sistema como um todo. Se bloquear os acessos por IP, o ataque pode ser descentralizado transpondo este tratamento ou ainda, se os acessos são realizados por diferentes usuários em uma mesma rede corporativa, o bloqueio por IP pode nem ser uma opção.

Umas das estratégias para a mitigação de ataques de força bruta é passar a exigir uma "prova de trabalho" (proof-of-work) de quem está realizando a tentativa. Isto exigirá que um processamento seja realizado pelo cliente e comprovado pelo servidor. A validação pelo servidor é rápida, porém reduzirá consideravelmente o tempo de processamento e tentativas em massa pelo lado de quem está realizando as tentativas.

O fluxo funciona assim:

![PoW Fluxo 1](/imgs/pow/1-pow.jpg)

Outra variação possível é quando o *client* já conhece a dificuldade e o token do servidor. Neste caso o fluxo já se inicia no passo "3" do fluxo acima, ficando assim:

![PoW Fluxo 2](/imgs/pow/2-pow.jpg)

A ideia é utilizar o conceito de "hashcash", algo já utilizado na mineração de hashes para criptomoedas. Consiste basicamente em encontrar um hash com um prefixo desejado, que pode ser encontrar um hash que inicie com "0000" para o conteúdo a ser submetido. Isto exigirá certo processamento e consumo de tempo, dependendo da dificuldade do prefixo exigida.

A dificuldade implica na quantidade "0" (zeros) com que o hash deve iniciar, por exemplo.

Segue **exemplo** de implementação baseado em um ambiente Web com o back-end em C#. O modelo é simples e não significa que deve ser implementado exatamente da maneira apresentada, o propósito é servir com ponto de partida e os conceitos para que está procurando a implementação ou entendimento mais detalhado.

Ao submeter usuário e senha para uma tentativa de login, também será submetido o número agregado à informação que foi buscado para resultar o hash com prefixo buscado. O hash não precisa ser enviado, já que o servidor poderá refazer o hash rapidamente com as informações enviadas.

A estrutura sugerida de conteúdo a ser buscado o hash é:

**Token fornecido pelo servidor + credenciais de acesso + nonce minerado**

- Token fornecido pelo servidor: Pode ser um string aleatória, GUID fixo ou renovado a cada 'X' tempo.
- Credenciais de acesso: Normalmente login + senha, mas pode incluir outras informações de acordo com a lógica de cada sistema
- Nonce minerado: É o numero que a função buscou e processou para descobrir a combinação final que resultará no hash com o prefixo esperado.

Opcionalmente existem implementações que adicionam a data e hora da geração, assim é possível ser aplicado um controle de expiração e hashes há utilizados pela lado do servidor. Caso essa seja a necessidade, basta incrementar as informações ao fluxo sugerido.

Basicamente deve ser implementado uma rotina simples de mineração do hash (mining hash). O conteúdo é submetido à assinatura de um hash (SHA256, por exemplo) e verificado o resultado. Enquanto o hash não possuir o prefixo buscado, o número armazenado no 'Nonce' será incrementado e um novo hash é testado, até que se encontre o resultado buscado.

```jsx
function getProofOfWorkNonce(login, password) {

	/* 
	* Dificuldade fixo em 4.
	* Isto significa que deve ser buscado um hash com prefixo
	* com 4 zeros (0000).
	* Esta dificuldade pode ser variável, aumentando de acordo com 
	* quantidade de tentativas já realizadas.
	*/
	const difficulty = 4;
	const hashPrefix = "0".repeat(difficulty);

	/*
	* Busca o token gerado pelo servidor. Esta informação pode ser
	* buscada dinânimcamente neste momento ou apenas coletada de
	* um campo hidden já preenchido na requisição anterior.
	*/
	const serverNonce = getServerNonce();

	/*
	* Monta o bloco fixo dos conteúdo das informações a serem testadas
	*/
	const constantInfo = login + password + serverNonce;
	
	/*
	* Inicia o Nonce com 0 e executa a primeira verificação
	* O método 'Sha256.hash' deve ser a implemetação SHA256
	* Caso seja necessária a implementação, pode ser obtida em:
	* https://www.movable-type.co.uk/scripts/sha256.html
	*/
	let clientNonce = 0;
	let hash = Sha256.hash(constantInfo + clientNonce);
	
	/*
	* O processo fica em loop, incrementando o Nonce
	* até que a condição seja satisfeita
	*/
	while (!hash.startsWith(hashPrefix)) {
	    clientNonce++;
	    hash = Sha256.hash(constantInfo + clientNonce);
	}
	
	return clientNonce;
};
```

Ao enviar as informações de login e senha ao servidor para verificação, também deverá ser enviado o Nonce obtido, dessa forma poderá ser possível validar a mineração realizada. Utilizando as credenciais, Nonce e o token gerado previamente é possível refazer o hash e verificar se o prefixo satisfaz a condição esperada. Sendo assim, apenas uma ação de hash será necessária para validação, o que torna o processo de verificação muito rápido.

```csharp
private bool VerifyProofOfWork(string login, string password, long proofOfWorkNonce)
{
	/*
	* Deve ser o mesmo token enviado ao client
	*/
	var serverNonce = "09c4f6b8-3806-410b-a0f1-593edc98f794";
	
	/*
	* Dificuldade fixa em 4 para este exemplo
	*/
	var difficulty = 4;
	
	/*
	* Será gerado novamente o hash com as informações enviadas, 
	* incluindo o Nonce encontrado por quem processou a mineração.
	* O prefixo deve satisfazer a condição esperada, caso contrário o proof of work está inválido.
	* A chamada do método 'Helper.Sha256Hash' representa a implementação do hash de informações em SHA256.
	*/
	var proofOfWorkHash = Helper.Sha256Hash(login + password + serverNonce + proofOfWorkNonce);
	var hashPrefix = new string('0', difficulty);
	
	return proofOfWorkHash.StartsWith(hashPrefix);
}
```

### Sofisticação da solução

O fluxo pode ser incrementado e isso vai depender da necessidade e natureza de cada aplicação. Podem ser adicionadas às verificações, por exemplo:

- Aleatoriedade do token do servidor. Sendo um novo token a cada requisição ou a cada 'X' tempo com a implementação de um controle em cache.
- Incluir data e hora nas informações do bloco fixo.
- Aumentar o nível de dificuldade dinamicamente.
- Segregar o fluxo de login, informando primeiramente o usuário, obtendo assim um token próprio para o usuário para então fazer o PoW com posterior envia da tentativa da senha. *Esta estratégia trará outro problema denominado User Enumeration, portando deve ser estudado a viabilidade.*

### Conclusão

Simulando um ataque de força bruta, utilizando um computador doméstico em um determinado sistema, obtive a taxa de **100 tentativas de login a cada 5 segundos**. Após a exigência do proof-of-work a realizado a cada nova tentativa, o tempo para as mesmas **100 tentativas aumentou para 50 segundos**, ou seja 10x mais lento.

A principal vantagem do PoW é que não exige ou sobrecarrega o servidor, é um processamento que onera somente a quem realiza as requisições, ao contrário de controles contra Throttling/DDoS onde exige processamento e armazenamento de informações pelo servidor.

É importante salientar que o usuário legítimo que está tentando acessar sua conta, uma única mineração de hashcash para sua senha não acarretará em lentidão perceptível, exceto quando a dificuldade exigida for exagerada.

Esta é uma estratégia que isoladamente não deve ser a solução para todos os problemas de gerenciamento de acesso. Outras estratégias devem ser somadas para que haja uma mitigação adequada, isto implica em:

- Exigir somente senhas fortes, com um número mínimo adequado de caracteres
- Manter e validar lista de senhas proibidas, consideradas populares.
- Utilizar hash adequado para armazenamento das senhas. Sobre isso já fiz uma postagem específica em [https://eduardogadotti.com/2020/07/05/password-hash/](https://eduardogadotti.com/2020/07/05/password-hash/)
- Adotar estratégias anti-throttling por IP dependendo da natureza da aplicação.
- Exigência de captcha após 'X' tentativas.
- Exigência de outro fator de autenticação após 'X' tentativas ou sempre que de uma origem ainda desconhecida para o usuário em específico, podendo ser uma confirmação por e-mail por exemplo.

### Referências

- [https://www.codeproject.com/Articles/1172340/Hashcash-or-Proof-of-Work](https://www.codeproject.com/Articles/1172340/Hashcash-or-Proof-of-Work)
- [https://codewithevgeny.com/proof-work-c-example/](https://codewithevgeny.com/proof-work-c-example/)
- [https://en.wikipedia.org/wiki/Proof_of_work](https://en.wikipedia.org/wiki/Proof_of_work)
- [https://www.fastly.com/blog/defend-against-credential-stuffing-attacks-proof-of-work](https://www.fastly.com/blog/defend-against-credential-stuffing-attacks-proof-of-work)
- [https://en.wikipedia.org/wiki/Hashcash](https://en.wikipedia.org/wiki/Hashcash)