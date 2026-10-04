---
title: "XXE attack: Not all XML is innocent!"
date: 2020-11-23 16:17:08
tags: ["security", "hacking", "dev"]
translation_key: xxe-attack
translated_by: ai-reviewed
---

## Contents
- [XXE attack: Not all XML is innocent!](#XXE-attack-Not-all-XML-is-innocent)
- [Oh no! Yet another form of injection?!](#Oh-no-Yet-another-form-of-injection)
- [Demonstration](#Demonstration)
- [Types of XXE](#Types-of-XXE)
- [Mitigation](#Mitigation)
- [Conclusion](#Conclusion)
- [References](#References)

## XXE attack: Not all XML is innocent!

**XXE** stands for **"XML External Entity"** processing, and it has become shorthand for a vulnerability that can be exploited in systems that still use XML for messaging.

You may have never used it, but XML has a very interesting feature: it can process external entities, with variable content, at the moment the program loads the document.

The problem starts when that feature can be used to pull information from the application server, or to inject malicious content, especially when an attacker can manipulate the XML that gets sent to the application.


## Oh no! Yet another form of injection?!

Yes, but this kind of exploit isn't new. It was listed as item 4 in the [OWASP Top 10](https://owasp.org/www-project-top-ten/) and has been around for quite a while.

Depending on the programming language or framework version you use, this may not be a problem you need to worry about. Even so, it's important to know about it and to write preventive code regardless of the environment, always aiming to *reduce the attack surface*.

## Demonstration

Take this simple XML as an example:
```xml
<?xml  version="1.0" encoding="ISO-8859-1"?>
<usuario>Eduardo Gadotti</usuario>
```

The tag holds a fixed value, "*Eduardo Gadotti*", and when the program loads this file, it reads that value without any trouble through the tag's *InnerText*.

You can make that content variable by telling the parser to replace it with data from an external entity, changing the XML as in the example below:
```xml
<?xml  version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE usuario [
   <!ELEMENT usuario ANY >
   <!ENTITY xxe SYSTEM  "file:///C:/Users/gadot/Desktop/XXE/my_webserver_config.txt" >]>
<usuario>&xxe;</usuario>
```

What I'm doing here is declaring that the variable "**&xxe;**" should be replaced with the contents of the file "**my_webserver_config.txt**". Notice that a web application's code runs on your server, so this file is read from the server where the application is running, not from the client's machine. That makes the system even more exposed to attack.

Assuming the file exists, the program will process the "**usuario**" tag using the contents of that file. If this value is later shown to the user, it can be a way to harvest information from the application server.

Example of the processing:
![Program execution](/imgs/xxe_attack/xxe_attack_1.gif)

## Types of XXE

The example demonstrated the **File Disclosure** type of **XXE**, but there are several types, depending on how the sources are configured and how the entity is processed. A few of them:
- Entity
- Denial-of-Service
- Local File Inclusion
- Access Control Bypass
- SSRF
- Remote Attack
- UTF-7
- Base64 Encoded
- XXE inside SVG

## Mitigation

If you're programming with the **.NET Framework** and loading the XML with the **System.Xml.XmlDocument** class, the mitigation is very simple: set the **XmlResolver** property to ***null*** after creating the object and before loading the XML.

It looks like this:
```csharp
var myXml = new XmlDocument();
myXml.XmlResolver = null;
myXml.Load(@"C:\Users\gadot\Desktop\XXE\xxe_attack_file_system.xml");
```

**Important**: By default, framework versions earlier than **4.5.2** are considered insecure, and you must set the **XmlResolver** property to ***null*** to keep external entities from being processed. Starting with that version, external entities are no longer processed unless you explicitly define a **resolver** object for that purpose.

If you aren't using the **XmlDocument** class, or you're working in another language, I recommend checking the prevention guidance in the [OWASP XXE Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html).

Even if your XML isn't loaded from an external source, follow best practices and harden your code anyway. *You can't be 100% sure the file's source will always be trustworthy, now or in the future*.

One more tip: if you can migrate your message structure to something like **JSON**, do it.

## Conclusion
This article doesn't aim to list and detail every type of **XXE**. Its goal is to raise awareness that this kind of vulnerability exists, give an introduction to the topic, and show how to apply the necessary mitigations.

Just like *SQL, DOM and JavaScript* injection, there are other types that aren't on developers' radar. **XXE** is one of them, and it enables many kinds of attacks, such as harvesting sensitive information or injecting arbitrary code into systems, with even worse consequences.

The mitigation shown here is simple and effective, but we also need to spread a culture of secure development so that measures like this become routine.

Check out the video I made specifically to demonstrate what's covered here: [XXE simulation attack with C# - How to prevent](https://youtu.be/twGXAtuX9VI)

# References

- https://medium.com/@ismailtasdelen/xml-external-entity-xxe-injection-payload-list-937d33e5e116
- https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing
- https://docs.microsoft.com/en-us/dotnet/api/system.xml.xmldocument.xmlresolver?view=net-5.0
- https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html
