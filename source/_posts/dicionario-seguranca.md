---
title: 'Dicionário da Segurança da Informação'
date: 2020-12-04 17:15:16
tags: ["security"]
---
No universo da segurança da informação, existem muitos termos e siglas que podem não ser de conhecimento de tod@s.
O desconhecimento gera estranheza e nos afastam, sempre há espaço para deixar claro o que pode parecer simples, aproximando assim as pessoas.
 
Pensando nisso, iniciei um mini dicionário de termos que eu utilizo no dia-a-dia. O objetivo é apenas dar uma breve visão sobre cada um.

# Termos e siglas 

#### Aplicações e leis
- [**OWASP**](https://owasp.org/): Projeto aberto e colaborativo onde se concentra as melhores práticas para o desenvolvimento seguro.
- **SAST**: Aplicações de teste de segurança estáticas. Por exemplo, um analisador de código fontes.
- **DAST**: Aplicações de teste de segurança dinâmicas. Por exemplo, [OWASP Zap](https://owasp.org/www-project-zap/).
- **LGPD**: Sigla para Lei Geral de Proteção de Dados. Lei brasileira que regulamenta a proteção de dados de pessoas naturais.
- **ANPD**: Sigla para Autoridade Nacional de Proteção de dados. Orgão do governo que fiscaliza o cumprimento da LGPD.
- **GDPR**: Lei de regulamentação geral da proteção de dados da Europa.
- **SIEM**: Sigla para Security Information and Event Management. São soluções que integram diversos eventos ou logs técnicos gerados por aplicações de segurança. Geralmente apresentado em dashboards e alertas para facilitar o gerenciamento da infraestrutura.
- **SOC**: Sigla para Security Operation Center. É um SIEM mais amplo, que também atende a processos e pessoas, além da questão tecnologia. Tem como objetivo monitorar, prevenir, detectar, investigar e responder a ameaças cibernéticas.
- **MSS / MSSP**: Sigla para Managed Security Services. Empresa terceira ou provedor que presta o serviço de monitoração, pode ser considerado uma extensão do SOC
- **HSM**: Sigla para Hardware Security Module. Trata-se de um equipamento, dispositivo físico, utilizado para guardar e gerenciar chaves ou certificados utilizados dentro de uma rede corporativa.
- **KMS**: Sigla para Key Management Service. Facilita a criação e o gerenciamento de chaves criptográficas e o controle do seu uso, geralmente integrado a um HSM.
- **WAF**: Sigla Web Application Firewall. Um firewall de aplicativos Web filtra, monitora e bloqueia o tráfego HTTP de e para um aplicativo ou site da Web. Exemplo Sucuri, Cloudflare ou Incapsula.
- **PCI**: Sigla para Security Standards Council. Define padrões de segurança a serem adotados para o ambiente de meios de pagamentos.
 
#### Termos gerais
- **CheatSheet**: Um compilado de payloads ou de tratamentos direcionados para algum assunto. Por exemplo [XSS CheatSheet](https://portswigger.net/web-security/cross-site-scripting/cheat-sheet).
- **Payload**: Conjunto de informações utilizadas para simular ou aplicar a exploração de uma falha.
- **Red Team**: Equipe interna de uma empresa responsável para testar ofensivamente os ambientes e aplicações da própria instituição.
- **Blue Team**: Trata as tentativas, monitora e efetua as prevenções de ataques externos ou descobertos pelo Red Team.
- **Purple Team**: Promove e organiza a comunicação entre o Red e Blue Team.
- **POC**: Sigla para Proof of Concept. Significa uma apresentação da prova de conceito do que está sendo demonstrado ou explicado.
- **2FA**: Sigla para Two Factor Authentication. Funcionalidade de duplo fator de autenticação que pode ser habilitado em muitos sistemas para aumentar a segurança do login.
- **ML**: Abreviação usada para Machine learning
- **CSIRT**: Sigla para Computer Security Incident Response Team. Equipe de resposta a incidentes de segurança.

#### Termos de segurança
- **Hash**: Assinatura ou representação de algum arquivo ou texto em forma reduzida. Não é possível reverter uma assinatura para o conteúdo original.
- **Criptografia**: Cifragem ou proteção do conteúdo através de chaves, que podem ser simétricas ou assimétricas (pública e privada).
- **Cookies**: Informações que o sistema armazena sobre você no navegador em utilização.
- **SSL/TLS**: Protocolos de criptografia utilizados para proteger o conteúdo de site que usam HTTPS em sua navegação.
- **HSTS**: Sigla para Strict Transport Security. Força o navegador a utilizar protocolo HTTPS para navegação.
- **Exploit**: Termo utilizado para se referenciar à exploração de uma falha.
- **CVE**: Falhas publicamente conhecidas são registradas em um banco de dados e ganham um número CVE. [Exemplo](https://www.cvedetails.com/cve/CVE-2019-1010298/).
- **Hacker**: Indivíduo com alto nível de conhecimento específico em determinado assunto.
- **Pentest**: Nome utilizado para realização de uma bateria de testes de penetração em um sistema alvo.
- **Brute Force**: Ação de forçar uma exploração através de força bruta, tentativa e erro, esgotando todas as possibilidades uma-a-uma.
- **RSA**: É um sistema de criptografia assimétrica baseada em chave pública e privada.
- **AES**: Sigla para Advanced Encryption Standard. Sistema de criptografia simétrica. A criptografia Rijndael é AES.
- **CISO / CSO**: Sigla para Chief information security officer. Diretor de segurança da informação, executivo de nível sênior dentro de uma organização responsável por estabelecer e manter a visão, estratégia e programa da empresa para garantir que os ativos e tecnologias da informação sejam adequadamente protegidos
 
#### Siglas de vulnerabildiades
- **XSS**: Sigla para Cross-Site Script. Vulnerabilidade onde ocorre injeção de javascript ou DOM, principalmente em ambientes Web.
- **XXE**: Sigla para XML External Entity. Associado à vulnerabilidades de exploração de coleta de informações no processamento de XML. Saiba mais aqui.
- **CORS**: Sigla para Cross-Origin Resource. Mecanismo limitador de recursos entre domínios para ambientes web.
- **CSRF** ou XSRF: Sigla para Cross-Site Request Forgery. Nome dado a requisições falsas montadas em um ambiente confiável da aplicação para induzir a ações maliciosas.
- **MitM**: Sigla para Man in the Middle. Ato de interceptar mensagens entre dois destinos, podendo ou não interferir nas mensagens trafegadas.
- **SQLi**: Abreviação para SQL Injection
- **RCE**: Remote Code Execution
- **RFI**: Remote File Inclusion
 
#### Tipos de ataques e vírus
- **Malware**: Programa de computador malicioso e nocivo. Intuito de causar danos, roubar ou espionar informações.
- **Ransomware**: Programa de computador malicioso que criptografa os arquivos da máquina impedindo o acesso pelo usuário, normalmente associado à uma cobrança de resgate em criptomoedas.
- **DDoS**: Sigla para Denial of Service. É um tipo de ataque de negação de serviço, realizado quando o objetivo é derrubar algum sistema, site ou serviço.

 
## Sentiu falta de algo? 
Mande para mim que atualizo no dicionário.