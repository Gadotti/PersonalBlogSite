---
title: Como implementar um BlockChain simples
date: 2020-10-12 13:10:55
tags: ["security", "dev"]
cover: /imgs/blockchain/cover.jpg
---

Você pesquisou sobre **Bockchain**, viu e leu algumas explicações teóricas mas não conseguiu imaginar como fica a implementação dos blocos? Como é a mineração do hash do bloco?
 
A seguir uma implementação bem conceitual, simples e reduzida do encadeamento em blocos, complementando o entendimento teórico.
 
Usarei *C#*, mas como o código é super simples, facilmente pode ser traduzido para a linguagem de sua preferência.
 
Antes de iniciar, o repositório com o código fonte completo está disponível em:
> <https://github.com/Gadotti/BlockchainStudy>

## Começando do final
Resumidamente, cada bloco do *blockchain* irá conter:
- Os dados de interesse a serem assinados
- Uma assinatura de data e hora
- O *hash* do bloco anterior
- Número sequencial de ajuste do hash

Então ao adicionar um bloco à corrente é necessário descobrir um novo *hash* válido para esse bloco, adicionar os dados de interesse e ligar com o hash anterior.

Podemos representar este o programa final então da seguinte forma:

```csharp
static void Main(string[] args)
{
    var rnd = new Random(DateTime.UtcNow.Millisecond);

    //Cria o primeiro bloco com informações em 'branco'
    IBlock genesis = new Block(new byte[] { 0x00, 0x00, 0x00, 0x00, 0x00, });

    //Define a dificuldade dos hashs dos blocos.
    // Aqui definido uma dificuldade de 2 bytes
    // Isto indica a assinatura inicial dos hashs a serem minerados
    // Quanto mais bytes forem definidos na dificuldade, maior será o tempo de mineração
    byte[] difficulty = new byte[] { 0x00, 0x00, };

    //Cria o primeiro bloco
    BlockChain chain = new BlockChain(difficulty, genesis);

    //Um laço para criar e encadear 200 blocos
    // Toda a cadeia fica na lista do objeto 'chain'
    for (int i = 0; i < 200; i++)
    {
    	//Cria uma informação aleatória para ser os dados de interesse a serem assinados
    	// Poderia ser qualquer outra informação de interesse.
        var data = Enumerable.Range(0, 2256).Select(p => (byte)rnd.Next());

        //Cria um novo bloco e o adiciona na corrente
        chain.Add(new Block(data.ToArray()));

        Console.WriteLine(chain.LastOrDefault()?.ToString());
        Console.WriteLine($"Chain válido: {chain.IsValid()}");
    }

    Console.ReadLine();
}
```

## Iniciando a corrente
O *blockchain* será iniciado através do objeto '**chain**', que será a instância da classe "**BlockChain**"
```csharp
BlockChain chain = new BlockChain(difficulty, genesis);
```

Esta classe recebe a dificuldade, que está neste exemplo definido em 2 bytes e o **genesis**, que é interface da estrutura do bloco
```csharp
//A variável genesis é do tipo 'IBlock'
public interface IBlock
{
    byte[] Data { get; }
    byte[] Hash { get; set; }
    int Nonce { get; set; }
    byte[] PrevHash { get; set; }
    DateTime TimeStamp { get; }
}
```

No construtor da classe BlockChain, um novo hash é minerado para ser atribuído ao bloco que está sendo criado.

Por enquanto não precisamos nos atentar a como esta mineração é realizada.
```csharp
public BlockChain(byte[] difficulty, IBlock genesis)
{
    Difficulty = difficulty;

    //Mineração através do método 'MineHash'
    genesis.Hash = genesis.MineHash(difficulty);

    //Adiciona à cadeia de blocos
    Items.Add(genesis);
}
```

Neste nosso exemplo, a classe '**BlockChain**' será instanciado somente uma única vez. Os próximos blocos e minerações serão realizados através do método '**Add**', que será mostrado com mais detalhes a seguir.

## Adicionado novos blocos à corrente
Depois de criado o bloco inicial, onde está definido a dificuldade de mineração e assinatura dos *hash's*, base adicionar os novos blocos na corrente criada. Esta ação é realizada a através do método '**Add**', que conterá as implementações necessárias.
```csharp
public void Add(IBlock item)
{
	//Faz a ligação do bloco anterior
    if (Items.LastOrDefault() != null)
    {
        item.PrevHash = Items.LastOrDefault()?.Hash;
    }

    //Faz a mineração do novo hash
    item.Hash = item.MineHash(Difficulty);

    //Adiciona o bloco na lista de blocos 'Items'
    Items.Add(item);
}
```

## Mineração dos hash's
A mineração de novos *hash's* é realizada pelo método '**MineHash**', que nada mais é do que um hash das informações concatenadas do bloco. Neste exemplo, estamos gerando o *hash* através do método **GenerateHash** da seguinte maneira:
```csharp
public static byte[] GenerateHash(this IBlock block)
{
    using (SHA512 sha = new SHA512Managed())
    using (MemoryStream st = new MemoryStream())
    using (BinaryWriter bw = new BinaryWriter(st))
    {
        bw.Write(block.Data);
        bw.Write(block.Nonce);
        bw.Write(block.TimeStamp.ToBinary());
        bw.Write(block.PrevHash);
        var starr = st.ToArray();
        return sha.ComputeHash(starr);
    }
}
```

Porém a diferença é que estamos procurando por assinatura de *hash* com prefixo específico. A dificuldade que definimos inicialmente está determinando o prefixo dos primeiros *bytes* que o *hash* deve possuir, e então aí entra a parte da '**mineração**'.

O *hash* é gerado e a sequência inicial é verificada. Enquanto não possuir o prefixo buscado, utilizamos a propriedade '**Nonce**' para incrementar um valor, mudando assim a assinatura do bloco por completo. 
Faremos o incremento na propriedade para mudar o *hash* até que este possua o prefixo desejado, por força bruta de tentativa e erro. 

Por isso que o aumento da dificuldade resulta em um tempo maior de mineração.
```csharp
public static byte[] MineHash(this IBlock block, byte[] difficulty)
{
    if (difficulty == null)
    {
        throw new ArgumentNullException(nameof(difficulty));
    }

    var hash = new byte[0];
    var d = difficulty.Length;
    while (!hash.Take(d).SequenceEqual(difficulty))
    {
        block.Nonce++;
        hash = block.GenerateHash();
    }

    return hash;
}
```

## Verificando a validade de um bloco
Agora ficou simples, cada bloco vai possuir o *hash* de assinatura do seu próprio bloco e também carregará a assinatura do hash do bloco anterior, fazendo com que toda a cadeia fique fechada para alterações.

Para validar isoladamente um bloco, basta geramos novamente o *hash* de suas informações e comparar com o hash que ele carrega. O mesmo vale para o hash do bloco anterior

```csharp
public static bool IsValid(this IBlock block)
{
    var bk = block.GenerateHash();
    return block.Hash.SequenceEqual(bk);
}

public static bool IsValidPrevBlock(this IBlock block, IBlock prevBlock)
{
    if (prevBlock == null)
    {
        throw new ArgumentNullException(nameof(prevBlock));
    }

    var prev = prevBlock.GenerateHash();
    return prevBlock.IsValid() && block.PrevHash.SequenceEqual(prev);
}
```

Podemos também validar toda a cadeia da seguinte forma:
```csharp
public static bool IsValid(this IEnumerable<IBlock> items)
{
    var enumarable = items.ToList();
    return enumarable.Zip(enumarable.Skip(1), Tuple.Create).All(block => block.Item2.IsValid() && block.Item2.IsValidPrevBlock(block.Item1));
}
```

## Conclusão
Pessoas diferentes aprendem de formas diferentes. Quando eu mesmo fiz a implementação deste exemplo, consegui enxergar com mais clareza como um *blockchain* deve funcionar além da teoria.

Existem muitos problemas que podem ser resolvidos com uma implementação própria de algoritmos deste tipo, como validação de transações financeiras, assinaturas de documentos digitais, entre outros onde este modelo inicial pode ser um ponto de partida.

## Referências
O código foi implementado utilizando como referência uma lista de vídeos que se inicia por este aqui:
- [Blockchain Implementation with C# Part 1](https://youtu.be/TAv8jcs8uEU)