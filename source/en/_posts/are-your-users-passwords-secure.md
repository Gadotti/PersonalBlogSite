---
title: Are your users' passwords really secure? Are you sure?
date: 2020-07-05 18:20:57
tags: ["security", "password"]
cover: /imgs/hash_password/banner.jfif
translation_key: password-hash
translated_by: ai-reviewed
---
# Are your users' passwords really secure? Are you sure?

Most of us have worked, or still work, on systems that handle their own authentication. That means storing user passwords, or some representation of them, in the database.

Are you following every best practice to keep this critical piece of data as protected as possible? There are quite a few factors to consider, and I'll try to clarify what you should worry about, and which algorithms and practices to use.

First, it's worth asking: ***Do I really need to store the password?***

Often you can hand that responsibility to a more secure third party, using OpenID for example. If you can, implement sign-in with Google or Facebook and sleep easy at night. If you can't, there are a few things we need to consider.

## **Quick checklist:**
- [Store only a hash of the password](#1-How-should-you-store-the-password)
- [Use one of the right hashing algorithms: scrypt, bcrypt or Argon2](#2-Which-hash-algorithm-should-you-use)
- [Add a salt to the password before hashing it](#3-Is-hashing-the-password-enough)
- [Generate the salt randomly](#4-How-do-you-generate-the-salt)
- [Store the salt alongside the record](#5-How-do-you-store-the-salt)
- [Extra precautions](#6-Extra-precautions-with-passwords)
- [References](#References-and-links)

It's important to stress that following best practices for storing and verifying passwords doesn't remove the need for other safeguards, such as requiring a secure connection, enforcing strong passwords and protecting against other attacks at the application level.

If you're curious, read on...


## 1. How should you store the password?
There are basically three options: *plain text, encrypted or hashed*.

If you're storing passwords in plain text, you and your users are at serious risk. **Stop everything now** and fix this problem.

That leaves us with encryption or *hashing*.

Encryption is designed to be reversible, so that confidential content can be recovered, which makes it a poor choice for passwords. Encrypted data is exposed to brute-force and reverse-engineering attacks, and given enough computing effort, it can be revealed.

A *hash* is a unique signature generated from a piece of text, what's known as a '*one-way*' function. You can't reverse that signature back into the original content; you can only compare signatures with signatures. The idea is that at login, the signature of the password the user typed is compared with the stored one, and that tells us whether the password is correct.


## 2. Which hash algorithm should you use?

Let me be clear: drop any idea of implementing your own *hash* routine. These algorithms are highly complex and are designed by people with deep mathematical expertise. Rolling your own is strongly discouraged.

Plenty of *hash* algorithms are available. A few common ones: MD5, SHA1, SHA256, SHA512, ...

Not all of them are considered fully secure today. For MD5, for example, researchers have found ways to deliberately produce different inputs that end up with the same signature.

Algorithms like SHA256 or SHA512 are still considered secure and can be used for many purposes, and they often end up being used for passwords. But even though they're secure algorithms, they're not recommended for passwords because they're fast. They also always return the same hash for the same input, which makes deterministic cracking possible.

***Isn't fast a good thing? Surprisingly, not here.*** Remember that our goal is to slow down or make brute-force attacks harder. Handing attackers something they can test quickly only makes life easier for malicious individuals or organizations.

For this case, there are deliberately "slower" algorithms such as scrypt, bcrypt or Argon2. Each has its own characteristics, and they can be tuned with a number of iterations, memory cost and processing cost. That lets you raise the strength of your *hash* according to your server and how critical your business model is. Their hashes also come out different every time, even for the same input, because they use an internal salt.

To give you an idea in numbers, I ran some tests on my low-powered home computer. I used a password of just 8 characters, generated hashes and compared them using the *scrypt* and *SHA256* algorithms.

In 5 seconds, with an 8-character password, I got:

- *30 hashes with scrypt*
- *600,000 hashes with SHA256*
- *SHA was **20,000x** faster, which is exactly what we don't want here.*

In practice, a password made up of only numbers and letters has 218,340,105,584,896 possible combinations. If we tried every one of them using my machine as the baseline, it would theoretically take:

- With SHA256: 3.5 years.
- With scrypt: 69,235,193 years.

So if you're still using SHA to hash passwords, you'll need to ask users to change their passwords at regular intervals, as an extra layer of security.


## 3. Is hashing the password enough?

No. You need to add a *salt*.

Even though a hash can't be reversed, there are huge databases that map countless strings to their hashes across different algorithms. They're freely searchable on the internet. So if your user picked a well-known or weak password, chances are you can look up its hash and find the password behind it.

Try it yourself. Here's a hash I just generated: "*e38ad214943daad1d64c102faec29de4afe9da3d*". Search for it on [Google](https://www.google.com/search?q=e38ad214943daad1d64c102faec29de4afe9da3d) and see how long it takes you to find my password.

That's why a '*salt*' matters. It's simply a piece of random data generated and added to the password so that the resulting signature differs from the expected one.

Here's how it works. The user types the password "*123*", and its hash wouldn't be hard to find. But if we add any piece of text before or after "*123*", for example "**kg03n30df2n-**123", the result is a signature that is most likely unknown.

The *salt* must be different for every password, and truly random, with a minimum length (**at least 32 characters**). You can concatenate it before or after the password.

Using a new *salt* for each password also makes it harder to spot users who share the same password. Without salts, anyone could compare identical hashes and see exactly who has the same password. Skipping the *salt* considerably weakens your application's security.

## 4. How do you generate the salt?

Randomly. Truly randomly.

The salt needs a reasonable length and must be random and unpredictable. I recommend a **32-character** salt containing uppercase letters, lowercase letters and numbers.

When I say "***truly random***", I mean that the random number libraries in some languages don't do this job well enough for our purposes. One example is the "*Random*" class in the .NET Framework, which isn't safe for what we need. Here's a quote from Microsoft itself about that class:

> "The numbers chosen are not completely random because a mathematical algorithm is used to select them." [Reference](https://docs.microsoft.com/en-us/dotnet/api/system.random?view=netcore-3.1).

The same article suggests the solution for our case: use the "**System.Security.Cryptography.RNGCryptoServiceProvider**" class.

In this repository, <https://github.com/Gadotti/CSharpUtils>, I've left an example implementation that generates a fully random string:
```c#
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

Another thing to watch out for is trying to build the *salt* from other data in the record (the username, for example) or from dates, which makes its value somewhat predictable. **Don't reuse salts.**

## 5. How do you store the salt?

In the database, right next to the *hash*.

Since a new, random salt has to be generated for every new password, you need to keep it somewhere so you can later rebuild the *hash* with that salt and run a valid password comparison. The catch is that we end up leaving the salt "exposed" in the event of a database leak.

Still, just creating a dedicated column for the salt already reduces the risk, since there's no way to predict which pieces of information will leak when a breach happens. You can also add extra salts, stored in an external file or even a third one embedded in the source code. Depending on how much protection you want, you can go further and encrypt the random salt stored in the database with symmetric encryption. That logic then becomes part of the secret sauce of your business and application.

## 6. Extra precautions with passwords

These tips aren't directly tied to how passwords are stored, but they cover how passwords are handled in the application, and getting them wrong can undo all the care we've taken here:

- Only accept traffic over HTTPS.
- Do all hashing, encryption and password handling on the server side, never on the client side.
- Only send the username and password through the POST method, in the request body, never via GET or in the URL query string.
- Keep requiring strong passwords in the application.
- Don't accept common passwords, since those are the first ones tried in a cracking attempt. Consider blocking [this list of the 10,000 worst passwords](https://github.com/OWASP/passfault/blob/master/wordlists/wordlists/).
- Don't write your own hash routine.
- Don't write your own routine for generating random strings.

## References and links

- [Inspiration for this article](https://crackstation.net/hashing-security.htm)
- [Comparison of scrypt, bcrypt and Argon2](https://medium.com/analytics-vidhya/password-hashing-pbkdf2-scrypt-bcrypt-and-argon2-e25aaf41598e)
- [Discussion on scrypt work factors](https://stackoverflow.com/questions/11126315/what-are-optimal-scrypt-work-factors)
- [Scrypt.Net library implementation](https://github.com/viniciuschiele/Scrypt/blob/master/src/Scrypt/ScryptEncoder.cs)
- [Test of the random string generation routine](https://repl.it/@EduardoGadotti/RandomStrings)
