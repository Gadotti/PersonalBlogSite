---
title: How to implement a simple blockchain
date: 2020-10-12 13:10:55
tags: ["security", "dev"]
cover: /imgs/blockchain/cover.jpg
translation_key: blockchain
translated_by: ai-reviewed
---

Have you researched **blockchain**, read a few theoretical explanations, and still couldn't picture what the blocks look like in code? Or how a block's hash actually gets mined?

Below is a simple, stripped-down, conceptual implementation of a chain of blocks, meant to complement the theory.

I'll use *C#*, but the code is simple enough to port to your language of choice with little effort.

Before we start, the full source code is available in this repository:
> <https://github.com/Gadotti/BlockchainStudy>

## Starting from the end
In short, each block in the *blockchain* contains:
- The data of interest to be signed
- A timestamp
- The *hash* of the previous block
- A sequential adjustment number for the hash (the nonce)

So adding a block to the chain means finding a new valid *hash* for it, attaching the data, and linking it to the previous hash.

Here is what the finished program looks like:

```csharp
static void Main(string[] args)
{
    var rnd = new Random(DateTime.UtcNow.Millisecond);

    //Creates the first block with 'blank' information
    IBlock genesis = new Block(new byte[] { 0x00, 0x00, 0x00, 0x00, 0x00, });

    //Sets the difficulty of the block hashes.
    // Here the difficulty is 2 bytes
    // This is the prefix the mined hashes must start with
    // The more bytes in the difficulty, the longer mining takes
    byte[] difficulty = new byte[] { 0x00, 0x00, };

    //Creates the first block
    BlockChain chain = new BlockChain(difficulty, genesis);

    //A loop to create and chain 200 blocks
    // The whole chain lives in the list inside the 'chain' object
    for (int i = 0; i < 200; i++)
    {
    	//Creates random data to stand in for the data of interest to be signed
    	// It could be any other information
        var data = Enumerable.Range(0, 2256).Select(p => (byte)rnd.Next());

        //Creates a new block and adds it to the chain
        chain.Add(new Block(data.ToArray()));

        Console.WriteLine(chain.LastOrDefault()?.ToString());
        Console.WriteLine($"Chain valid: {chain.IsValid()}");
    }

    Console.ReadLine();
}
```

## Starting the chain
The *blockchain* starts from the '**chain**' object, an instance of the "**BlockChain**" class:
```csharp
BlockChain chain = new BlockChain(difficulty, genesis);
```

This class takes the difficulty, set to 2 bytes in this example, and the **genesis** block, which implements the block structure interface:
```csharp
//The genesis variable is of type 'IBlock'
public interface IBlock
{
    byte[] Data { get; }
    byte[] Hash { get; set; }
    int Nonce { get; set; }
    byte[] PrevHash { get; set; }
    DateTime TimeStamp { get; }
}
```

In the BlockChain constructor, a new hash is mined and assigned to the block being created.

Don't worry about how the mining works just yet.
```csharp
public BlockChain(byte[] difficulty, IBlock genesis)
{
    Difficulty = difficulty;

    //Mining through the 'MineHash' method
    genesis.Hash = genesis.MineHash(difficulty);

    //Adds it to the chain of blocks
    Items.Add(genesis);
}
```

In this example, the '**BlockChain**' class is instantiated only once. All subsequent blocks and mining go through the '**Add**' method, covered in more detail next.

## Adding new blocks to the chain
Once the initial block exists, with the mining difficulty and hash signature defined, all that's left is to add new blocks to the chain. The '**Add**' method handles this and holds the necessary logic.
```csharp
public void Add(IBlock item)
{
	//Links to the previous block
    if (Items.LastOrDefault() != null)
    {
        item.PrevHash = Items.LastOrDefault()?.Hash;
    }

    //Mines the new hash
    item.Hash = item.MineHash(Difficulty);

    //Adds the block to the 'Items' list of blocks
    Items.Add(item);
}
```

## Mining hashes
New *hashes* are mined by the '**MineHash**' method. At its core, it's just a hash of the block's concatenated information. In this example, we generate the *hash* with the **GenerateHash** method:
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

The catch is that we're looking for a *hash* with a specific prefix. The difficulty we set at the start determines which leading *bytes* the *hash* must have, and that's where the "**mining**" comes in.

We generate the *hash* and check its leading bytes. As long as it doesn't have the prefix we're after, we use the '**Nonce**' property as a counter: incrementing it changes the block's signature completely.
We keep incrementing it and regenerating the *hash* until it has the desired prefix, a brute-force, trial-and-error search.

That's why a higher difficulty means longer mining times.
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

## Checking whether a block is valid
From here on, it's simple. Each block holds the *hash* signature of its own contents and also carries the hash of the previous block, which locks the whole chain against tampering.

To validate a single block, just regenerate the *hash* from its information and compare it with the hash it carries. The same goes for the previous block's hash.

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

We can also validate the entire chain like this:
```csharp
public static bool IsValid(this IEnumerable<IBlock> items)
{
    var enumarable = items.ToList();
    return enumarable.Zip(enumarable.Skip(1), Tuple.Create).All(block => block.Item2.IsValid() && block.Item2.IsValidPrevBlock(block.Item1));
}
```

## Conclusion
Different people learn in different ways. When I built this example myself, I got a much clearer picture of how a *blockchain* works beyond the theory.

Plenty of problems can be solved with a homegrown implementation of this kind of algorithm, such as validating financial transactions, signing digital documents, and more. This basic model can serve as a starting point for any of them.

## References
I based the code on a video series that starts with this one:
- [Blockchain Implementation with C# Part 1](https://youtu.be/TAv8jcs8uEU)
