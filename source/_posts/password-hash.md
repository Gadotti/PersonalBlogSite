---
title: A senha do seu usuário está segura? Tem certeza?
date: 2020-07-05 18:20:57
tags: ["security", "password"]
cover: /imgs/hash_password/banner.jfif
author: Eduardo Gadotti
---
# A senha do seu usuário está segura? Tem certeza?

Todo mundo já passou ou ainda trabalha com sistemas que utilizam o próprio meio de autenticação. Isto implica em armazenar senhas de usuários ou uma representação delas no banco de dados.

Você segue todas as boas práticas possíveis para manter o mais protegido possível este importante dado? Existem diversos fatores que devem ser considerados e vou tentar esclarecer quais são as preocupações a considerar, quais algoritmos e práticas utilizar.

Antes de mais nada vale a pena perguntar: ***Preciso realmente armazenar a senha?***

Muitas vezes é possível delegar essa responsabilidade para uma entidade mais segura, utilizando OpenId por exemplo. Se for possível, implemente uma autenticação via Google ou Facebook e durma com a consciência tranquila. Se não for o caso, precisamos considerar algumas questões.

## **Roteiro rápido:**
- [Armazene apenas um hash da senha](#1-De-que-maneira-guardar-a-senha)
- [Utilize um dos algoritmos de hash: scrypt, bcrypt ou argo2](#2-Qual-algoritmo-de-Hash-utilizar)
- [Adicione um salt à senha antes de gerar o hash](#3-Basta-fazer-o-hash-da-senha)
- [Gere o salt de forma randômica](#4-Como-gerar-o-salt)
- [Armazene o salt junto com o registro](#5-Como-armazenar-o-salt)
- [Cuidados extras](#6-Cuidados-extras-com-a-senha)
- [Referências](#Referencias-e-links)

É muito importante ressaltar que as boas práticas para o armazenamento e conferência das senhas não exclui a necessidade de outras práticas como: exigir conexão protegida, exigir senhas fortes e proteções contra demais ataques via sistema.

Se você ficou curioso...


## 1. De que maneira guardar a senha?
Existem basicamente 3 formas que são consideradas: *em texto plano, criptografado ou em hash*.

Se você está armazenando em texto plano, você e os usuários estão em sério risco. **Pare tudo agora** resolva este problema.

Ficamos então com as opções de criptografia ou *hash*.

As criptografias são utilizadas para possibilitar a reversão de um conteúdo confidencial, logo não é indicado para o armazenamento das senhas, já que estão sujeitas ao processamento de força bruta e de engenharia reversa, onde dependendo do esforço computacional empreendido, é possível que informações criptografadas sejam reveladas.

O *hash* é uma assinatura única que é gerada a partir de um texto, chamado tipo '*one-way*'. Não é possível reverter essa assinatura para seu conteúdo original, apenas comparamos assinaturas com assinaturas. A ideia é que ao fazer o login, a assinatura da senha digitada seja comparada com a armazenada e assim podemos determinar se a senha informada está correta ou não.


## 2. Qual algoritmo de Hash utilizar?

É importante deixar claro que desconsidere qualquer intenção de implementar sua própria rotina de *hash*. Os algoritmos são altamente complexos e desenvolvidos por pessoas com alta afinidade matemática. Esta prática não é recomendada como e é fortemente desencorajada.

Existem diversos algoritmos de *hash* disponíveis, para citar alguns comuns: MD5, SHA1, SHA256, SHA512, ...

Atualmente nem todos são considerados absolutamente seguros, por terem descoberto formas de gerar conteúdos diferentes com a mesma assinatura final propositalmente, como no caso do MD5.

Algoritmos como o SHA256 ou SHA512 ainda são considerados seguros e podem ser utilizados para várias finalidades, muitas vezes são utilizadas nas senhas. Apesar de ser considerado um algoritmo seguro, sua utilização não é indicada por possuir uma natureza de processamento rápida. Estes algoritmos também sempre resultarão o mesmo hash para o mesmo conteúdo inserido, permitindo uma quebra determinística.

***Ser rápido não é bom? Surpreendentemente neste caso não***. Lembre-se que nossa intenção é atrasar ou dificultar um ataque também por força bruta, entregar algo que possa ser rapidamente testado só facilita as pessoas ou instituições má intencionadas.

Nestes casos, existem os algoritmos de processamento mais "lento", como o scrypt, bcrypt ou argo2. Eles possuem especificidades diferentes e podem ser parametrizados para que uma determinada quantidade de iterações, custo de memória e custo de processamento, o que permite aumentar ainda mais a criticidade do seu *hash* dependendo do seu servidor e nível de criticidade do modelo de negócio. Os hashes também são diferentes sempre que gerados, mesmo para o mesmo conteúdo pois utiliza um salt interno.

Para se ter uma ideia em números, realizei testes com minha máquina caseira local, com baixo poder de processamento. Utilizei uma senha de apenas 8 caracteres, fiz hashes e os comparei utilizando algoritmos *scrypt* e *SHA256*.

Em 5 segundos com uma senha de 8 caracteres, obtive:

- *30 hashes com scrypt*
- *600.000 hashes com sha256*
- *O SHA foi **20.000x** mais rápido, que não é o que estamos desejando aqui.*

Na prática, uma senha que leva apenas números e caracteres do alfabeto possui 218.340.105.584.896 possibilidades de combinações. Se testarmos todas essas possibilidades usando a minha máquina como referência, utilizando cada um dos algoritmos teoricamente levaríamos.

- Usando SHA256: 3 anos e meio.
- Usando Scrypt: 69.235.193 anos.

Portanto, a necessidade de quem continua utilizando SHA como forma de assinatura da senha, é necessário solicitar que o usuário altere sua senha a cada 'x' intervalo de tempo, como camada extra de segurança.


## 3. Basta fazer o hash da senha?

Não. É preciso adicionar um *salt*.

Mesmo não sendo possível reverter uma informação em hash, isto não significa que não existem bancos de dados enormes onde são mantidos diversos textos e suas representações em diferentes tipos de hash. Estes bancos estão acessíveis livremente para consultas na internet. Então se seu usuário digitou uma senha conhecida ou fraca, é provável que através do hash ainda ser possível pesquisar a senha que a representa.

Faça um teste, esse é uma hash de uma assinatura que acabei de gerar: "*e38ad214943daad1d64c102faec29de4afe9da3d*". Utilize o [Google](https://www.google.com/search?q=e38ad214943daad1d64c102faec29de4afe9da3d) e veja em quanto tempo você consegue descobrir minha senha.

Por isso é importante a utilização de um '*Salt*', que nada mais é do que uma informação aleatória gerada e agregada à senha, para que a assinatura seja diferente da esperada.

Funciona assim, o usuário digita a senha "*123*" e seu hash não seria difícil de encontrar. Mas se adicionarmos um pedaço de texto qualquer antes ou depois da senha "*123*", por exemplo "**kg03n30df2n-**123" já resulta em uma assinatura provavelmente desconhecida.

É importante que este '*salt*' seja diferente para cada senha informada e que seja verdadeiramente randômico com um mínimo de caracteres (**32 pelo menos**). Pode ser concatenado antes ou após a senha.

A utilização de *salt* novo a cada senha também reduz a probabilidade de identificar usuários que possuam senhas iguais, que seria possível comparando os hash iguais indicando os que possuem as mesmas senhas. Não adicionar o *salt* reduz consideravelmente o nível de segurança da aplicação.

## 4. Como gerar o salt?

De forma randômica, verdadeiramente randômica.

É importante que o salt possua uma quantidade razoável de caracteres, que seja randômica e imprevisível. É recomendável um salt de **32 caracteres**, contendo letras maiúsculas, minúsculas e números.

Quero dizer quando destaco "***verdadeiramente randômico***", é que existem bibliotecas para geração número randômicos de algumas linguagens que não cumprem muito bem esse papel para o nosso objetivo. Um exemplo é a classe "*Random*" do .Net Framework, esta classe não é segura para ser utilizada para o que precisamos. Eis uma citação da própria Microsoft sobre essa classe:

> "Os números escolhidos não são completamente aleatórios porque um algoritmo matemático é usado para selecioná-los" [Referência](linkhttps//docs.microsoft.com/pt-br/dotnet/api/system.random?view=netcore-3.1).

Neste mesmo artigo é sugerida a solução para o nosso caso, a utilização da classe "**System.Security.Cryptography.RNGCryptoServiceProvider**" para este fim.

Deixo nesse repositório <https://github.com/Gadotti/CSharpUtils> exemplo de implemetação para gerar uma string de forma totalmente aleatória:
```
public static string GetRandomString(int size = 16)
{
    const string validCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    var result = new System.Text.StringBuilder();
    using (var rng = new System.Security.Cryptography.RNGCryptoServiceProvider())
    {
        var uintBuffer = new byte[sizeof(uint)];

        for (int length = 0; length < size; length++)
        {
            rng.GetBytes(uintBuffer);
            uint num = BitConverter.ToUInt32(uintBuffer, 0);
            result.Append(validCharacters[(int)(num % (uint)validCharacters.Length)]);
        }
    }

    return result.ToString();
}
```

Outro ponto de atenção é a tentativa de gerar o *salt* baseado em alguma outra informação do registro (nome do usuário, por exemplo) ou datas, o que tornará o seu valor de certa forma previsível. **Não reuse salts**.

## 5. Como armazenar o salt?

No banco de dados, junto com o *hash*.

Já que deve ser gerado um *hash* novo e aleatório para cada nova senha, é necessário armazenar isto de alguma forma para que seja possível posteriormente remontar o *hash* com este salt e fazer uma comparação de senha válida. O problema aqui é que vamos deixar "exposto" o salt, pensando em um cenário do vazamento do banco de dados.

Vale lembrar que ao criar uma coluna para armazenar o salt já será minimizado o risco, pois não é possível prever a forma que uma ou mais informações serão vazadas, quando ocorrer.  É possível também adicionar salts adicionais, que podem ser armazenados em um arquivo externo ou ainda um terceiro armazenado no código fonte. Dependendo do nível da criticidade que você deseja atingir, ainda é possível criptografar o salt randômico que é armazenado no banco de dados com uma criptografia simétrica. Esta lógica fará parte do segredo do seu negócio e aplicação.

## 6. Cuidados extras com a senha

Mesmo não sendo diretamente ligado com as explicações sobre o armazenamento da senha, seguem alguma dicas para os cuidados com o tratamento de senha na aplicação, que podem invalidar todo o cuidado que estamos tendo aqui:

- Somente aceite o tráfego via HTTPS.
- Faça toda rotina de hash, criptografia e tratamento da senha no lado do servidor - nunca no client side.
- Só envie o usuário e senha cadastrados ou informados através do método POST, no corpo da mensagem, nunca via GET ou na querystring da url.
- Continue fazendo com que a aplicação exija senhas fortes.
- Não aceite senhas comuns, que são testadas primeiramente em uma tentativa de quebra. Considere [esta lista de 10 mil piores senhas](https://github.com/OWASP/passfault/blob/master/wordlists/wordlists/) como forma de bloqueio.
- Não crie sua própria rotina de hash.
- Não crie sua própria rotina para obter uma string aleatória.

## Referências e links

- [Inspiração para o artigo](https://crackstation.net/hashing-security.htm)
- [Comparação entre scrypt, bcrypt e argo2](https://medium.com/analytics-vidhya/password-hashing-pbkdf2-scrypt-bcrypt-and-argon2-e25aaf41598e)
- [Discussão sobre fatores do scrypt](https://stackoverflow.com/questions/11126315/what-are-optimal-scrypt-work-factors)
- [Implementação da biblioteca Scrypt.Net](https://github.com/viniciuschiele/Scrypt/blob/master/src/Scrypt/ScryptEncoder.cs)
- [Teste da rotina de geração randômica de strings](https://repl.it/@EduardoGadotti/RandomStrings)