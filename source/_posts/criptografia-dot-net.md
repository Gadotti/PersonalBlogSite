---
title: Criptografia simétrica com .Net
date: 2022-06-04 13:52:35
tags: ["security", "dev", ".net"]
---

# Sumário
- [Introdução](#Introducao)
- [Ao que interessa](#Ao-que-interessa)
- [Embasamento aos curiosos](#Embasamento-aos-curiosos)
- [Principais diferenças](#Principais-diferencas)
- [Conclusão](#Conclusao)

# Introdução
Fazer ou utilizar uma rotina de criptografia por vezes pode ser um pouco obscuro, *vetor de iniciação, array de bytes, tamanho de bloco, tamanho da chave, modo do cipher modo do padding*, é muito para entender quando só estamos à procura de algo *plug-n-play* para sair utilizando e que seja seguro sem ter que confiar em um código datado e copiado do *stackoverflow*.
 
A ideia aqui é fornecer da forma mais direta possível um método que você possa utilizar em seus projetos ou na empresa que trabalha, quando a necessidade é criptografar de forma simétrica (mesma chave criptografando e decriptografando).
 
Avisos importantes:
* Os métodos e conhecimento aqui descritos foram obtidos a partir do "Canal dotNET" (https://www.youtube.com/c/CanalDotNET) em uma *live* sobre o assunto com o especialista **Bruno Brito**, seu repositório com os fontes originais estão disponíveis em https://github.com/brunohbrito/criptografia-devs. A ideia com este artigo é fornecer uma abstração direta para o uso.
* Os recursos de forma nativa estarão disponíveis somente a partir do **.Net 5**. O código apresentado foi desenvolvido utilizando **Visual Studio 2022** + **.Net 6**
 
# Ao que interessa
Listo a seguir os métodos para encriptação e decriptação - **copie e cole**.
Os métodos também estão disponíveis em meu repositório https://github.com/Gadotti/CSharpUtils/blob/master/Utils/Security/Encryption.cs
 
Estrutura e métodos auxiliares:
```csharp
public struct EncryptData
{
    public string EncryptedData { get; set; }
    public string AuthTag { get; set; }
}

private static void KeyAndVectorValidation(string key, string vector)
{
    if (string.IsNullOrEmpty(key))
    {
        throw new ArgumentNullException(key);
    }

    if (string.IsNullOrEmpty(vector))
    {
        throw new ArgumentNullException(vector);
    }

    if (key.Length != 16 && key.Length != 24 && key.Length != 32)
    {
        throw new ArgumentOutOfRangeException(key, "Key must have 16, 24 or 32 bytes");
    }

    if (vector.Length != 12)
    {
        throw new ArgumentOutOfRangeException(vector, "Vector must have 12 bytes");
    }
}
```

Encriptação:
```csharp       
public static EncryptData Encrypt(string info, string key, string vector)
{
    KeyAndVectorValidation(key, vector);

    if (string.IsNullOrEmpty(info))
    {
        return new EncryptData();
    }

    var plainBytes = Encoding.UTF8.GetBytes(info);
    var keyBytes = Encoding.UTF8.GetBytes(key);
    var vectorBytes = Encoding.UTF8.GetBytes(vector);
    var authTag = new byte[16];

    var result = new byte[plainBytes.Length];

    using (var aesGcm = new AesGcm(keyBytes))
    {
        aesGcm.Encrypt(vectorBytes, plainBytes, result, authTag);
    }

    return new EncryptData()
    {
        EncryptedData = Convert.ToBase64String(result),
        AuthTag = Convert.ToBase64String(authTag)
    };
}
```

Decriptação:
```csharp
public static string Decrypt(string encryptedData, string key, string vector, string authTag)
{
    if (string.IsNullOrEmpty(encryptedData))
    {
        return encryptedData;
    }

    KeyAndVectorValidation(key, vector);

    if (string.IsNullOrEmpty(authTag))
    {
        throw new ArgumentNullException(authTag);
    }

    var padL = encryptedData.Length + (encryptedData.Length % 4);
    var info = encryptedData.PadRight(padL, '=');
    var cipherBytes = Convert.FromBase64String(info);


    padL = authTag.Length + (authTag.Length % 4);
    info = authTag.PadRight(padL, '=');
    var authTagBytes = Convert.FromBase64String(info);

    var keyBytes = Encoding.UTF8.GetBytes(key);
    var vectorBytes = Encoding.UTF8.GetBytes(vector);            

    byte[] decryptedBytes = new byte[cipherBytes.Length];
    using (var aesGcm = new AesGcm(keyBytes))
    {
        aesGcm.Decrypt(vectorBytes, cipherBytes, authTagBytes, decryptedBytes);
    }

    return Encoding.UTF8.GetString(decryptedBytes);
}
```

# Embasamento aos curiosos

Há pouco tempo atrás era recomendado e utilizávamos para criptografia simétrica o **Rijndael**, através do modo **ECB**. É o mais comum ao pesquisarmos por rotina de criptografia, principalmente através de fóruns como o *stackoverflow*.
 
O problema é que já está datado e passou a ser considerado obsoleto, sendo sugerido a migração para o AES modo GCM. Os motivos e detalhes podem ser consultados através do link https://words.filippo.io/the-ecb-penguin/, que aborda e apresenta o assunto muito bem.

# Principais diferenças

As principais diferenças na forma de uso, em relação ao antigo Rijndael, são basicamente duas:
- Tamanho do vetor reduzido para 12 bytes
- Geração e utilização de uma tag de autenticação.

Isto quer dizer que migrar rotinas legadas para esta nova forma pode não ser tão simples, considerando que os vetores antigos de 16 bytes não serão mais aceitos.

Além disso, o maior impacto pode ficar por conta de gerenciar uma terceira informação como chave (considerando chave + vetor), que é a geração dinâmica da tag de autenticação que é dada pela rotina no momento da encriptação e que deve ser passada para decriptação. 

Isto significa uma informação adicional a ser gerenciada pela aplicação, considerando que vetor e chave podem ser únicos, esta tag será diferente para cada conteúdo distinto gerado.

# Conclusão

A utilização de Rijndael com o modo ECB pode ainda não ser considerado um problema de segurança para empresas e projeto comuns, mas é importante já definirmos uma base segura de métodos de criptografia a serem utilizados, visto o grande desserviço que muitas vezes encontramos por aí.

A migração nos projetos legados é lenta e arriscada em rotinas críticas, portanto pode ser um desafio o planejamento a troca dos métodos mas que isto não seja motivo para um infinito postergamento. E para os projetos novos, que já os iniciem da forma correta.