---
title: USB Hacking. O poder do Arduino Digispark
date: 2019-11-20 17:50:14
tags: ["arduino", "hacking"]
cover: /imgs/digispark/banner.jfif
author: Eduardo Gadotti
---
# USB Hacking. O poder do Arduino Digispark

Imagine que simplesmente plugando um USB, em questão de segundos, poderia ser instalado um *backdoor*, roubar senhas dos navegadores, senhas do *wifi*, extrair ou excluir documentos, criar usuários administradores, instalar *malwares* ou *loggers* em uma máquina.

Agora imagine que o agente não precisaria necessariamente ser a pessoa a fazer o trabalho sujo, basta persuadir a pessoa certa para verificar um suposto pendrive, utilizar um inocente mouse ou apenas carregar um powerbank.

O que antes era acessível apenas por equipamentos relativamente caros, hoje em dia está acessível por apenas **R$ 15,00** e um pouco de imaginação.

O que é apresentado a seguir, são testes de conceito, utilizando o **Arduino Digispark**, que simula um dispositivo de teclado e executa qualquer coisa que for programada, com velocidade e precisão impossíveis de se obter manualmente.

O Arduino Digispark possui cerca de 2cm x 2cm e pode ser incorporado a diversos dispositivos, possuindo entradas digitais e analógicas.

![Arduino Digispark](/imgs/digispark/arduino_scheme.jfif)

A seguir alguns exemplos de implementações realizadas, adaptadas e testadas para demonstração, sendo necessário apenas plugar o dispositivo a uma porta USB de um computador.

## Execução de roubo de senhas wifi e envio por e-mail.

Esta tarefa coleta todas as conexões wifi já realizadas pelo computador, onde as senhas foram salvas para reconexão automática. Sendo assim, é possível coletar estas informações e exportar em um arquivo do tipo .csv. Poderia parar por aí, mas por que não já realizar a exportação desta lista para nosso e-mail? Sendo assim, o arquivo é enviado para um e-mail programado com o resultado e o arquivo original excluído, sem deixar rastros do que aconteceu.

[Demonstração em vídeo](https://www.youtube.com/watch?v=uzV_kIC-1_o)

## Criação de um usuário com privilégios de administrador.

Se o objetivo é abrir um acesso privilegiado para um futuro acesso, esta tarefa também é possível. O script cria um novo usuário e o inclui no grupo de administradores da máquina, que pode ser utilizado para vetor de outras futuras explorações.

![Privilégios de usuário](/imgs/digispark/user_privileges.png)

## Reverse shell

Se tudo isso ainda não for suficiente, por que não abrir um backdoor para uma máquina remota? A partir da execução deste script, a conexão com uma determinada máquina é realizada, onde será possível a execução de qualquer comando remoto. O script ainda executa a abertura de uma tela fake do windows update, para poder ‘ganhar’ mais tempo com o shell aberto.

Visão na máquina da vítima
![Privilégios de usuário](/imgs/digispark/windows_update.png)

Visão na máquina do atacante, com acesso à máquina da vítima:
![Privilégios de usuário](/imgs/digispark/reverse_shell_kali.png)
![Privilégios de usuário](/imgs/digispark/reverse_shell_kali2.png)

## Conclusão

O único limitador aqui é a criatividade, pois assim que o dispositivo estiver plugado, qualquer comando programado poderá ser executado. Outros exemplos de execuções seriam: roubo de senhas salvas em navegadores, instalação de malwares, instalação de vírus, keyloggers, destruição de informações da máquina ou exploração horizontal quando se está um rede corporativa.

Alguns desafios foram transpostos para provar o conceito, o principal deles foi o layout de teclado utilizado pelo Arduino. Originalmente o equipamento é mapeado utilizando o layout **en-US**, sendo necessário reescrever uma biblioteca intermediária, mapeando o endereços hexadecimais das teclas utilizadas para o layout **pt-Br**, visto que o objetivo do projeto era utilizá-lo no Brasil, gerando assim a biblioteca ‘**DigiKeyboardPtBr**’.

Outros detalhes como acentuações e linguagens de comandos do Windows em português também precisaram ser mapeados.


O projeto completo com os scripts citados e documentados estão disponíveis em <https://github.com/gadotti>