---
title: Symmetric encryption with .NET
date: 2022-06-04 13:52:35
tags: ["security", "dev", ".net"]
translation_key: criptografia-dot-net
translated_by: ai-reviewed
---

# Contents
- [Introduction](#Introduction)
- [Getting to the point](#Getting-to-the-point)
- [Background for the curious](#Background-for-the-curious)
- [Key differences](#Key-differences)
- [Conclusion](#Conclusion)

# Introduction
Writing or using an encryption routine can feel pretty murky. *Initialization vector, byte array, block size, key size, cipher mode, padding mode*: that's a lot to take in when all you want is something *plug-n-play* that is secure, without having to trust some outdated snippet copied from *Stack Overflow*.
 
The idea here is to give you, as directly as possible, a method you can use in your own projects or at your company when you need symmetric encryption (the same key encrypts and decrypts).
 
Important notes:
* The methods and knowledge described here come from the "Canal dotNET" YouTube channel (https://www.youtube.com/c/CanalDotNET), from a *livestream* on the subject with the expert **Bruno Brito**. His repository with the original source code is available at https://github.com/brunohbrito/criptografia-devs. The goal of this article is to provide a straightforward abstraction for using it.
* Native support is only available starting with **.NET 5**. The code shown here was developed using **Visual Studio 2022** + **.NET 6**.
 
# Getting to the point
Below are the encryption and decryption methods — **just copy and paste**.
The methods are also available in my repository https://github.com/Gadotti/CSharpUtils/blob/master/Utils/Security/Encryption.cs
 
Struct and helper methods:
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
        throw new ArgumentNullException(nameof(key));
    }

    if (string.IsNullOrEmpty(vector))
    {
        throw new ArgumentNullException(nameof(vector));
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

Encryption:
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

Decryption:
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
        throw new ArgumentNullException(nameof(authTag));
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

# Background for the curious

Not long ago, the recommended choice for symmetric encryption, and the one we all used, was **Rijndael** in **ECB** mode. It's the most common result when you search for an encryption routine, especially on forums like *Stack Overflow*.
 
The problem is that it's outdated and is now considered obsolete, with migration to AES in GCM mode being the recommendation. The reasons and details are covered very well at https://words.filippo.io/the-ecb-penguin/.

# Key differences

Compared to the old Rijndael, there are basically two differences in how you use it:
- The vector size is reduced to 12 bytes.
- An authentication tag is generated and used.

That means migrating legacy routines to this new approach may not be simple, since the old 16-byte vectors will no longer be accepted.

On top of that, the biggest impact may come from having to manage a third piece of information alongside the key (key + vector): the authentication tag, which is generated dynamically by the routine at encryption time and must be passed back in for decryption. 

That's one more piece of data for the application to manage. The vector and key can be fixed, but the tag will be different for each distinct piece of content you encrypt.

# Conclusion

Using Rijndael with ECB mode may not yet be a security problem for ordinary companies and projects, but it's important to set a secure baseline of encryption methods now, given how much bad practice we often run into out there.

Migrating legacy projects is slow and risky for critical routines, so planning the switch of methods can be a challenge. Still, that's no reason to put it off forever. And for new projects, start them the right way from day one.
