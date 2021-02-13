---
title: "SameSite: Entenda de uma vez por todas"
date: 2021-02-13 17:26:24
tags: ["cookies", "security", "configuration"]
---

Talvez você já tenha reparado que os *cookies* possuem algumas propriedades (*HttpOnly, Secure e SameSite*) ou talvez você já tenha reparado em alertas no consoles informando o mal uso do atributo *SameSite* pela aplicação. 

Quando busquei explicações sobre a definição do atributo, fiquei sem ter certeza se havia entendido como realmente funcionava. Depois de alguns POCs para validar o conceito, passei a ter mais clareza sobre seu funcionamento.

Então minha proposta é: explicar o que é de uma forma clara, demonstrar com exemplos e esclarecer para que realmente serve.

# Super resumo

O atributo possui 3 possíveis valores: **None, Lax e Strict**. Cada atributo controla se o *cookie* é enviado ou não em contextos diferentes de requisição.

Entenda como "contexto" aqui se a requisição é realizada ou não dentro da mesma aplicação. Isto quer dizer na prática, a aplicação acessando o link de um outro sistema, por exemplo.

**None**: O *cookie* será enviado sem restrição em diferentes contextos.

**Lax**: O *cookie* somente será enviado em um contexto diferente se for usado o verbo *HTTP GET*.

**Strict**: O *cookie* somente será enviado no mesmo contexto, independentemente do verbo *HTTP* utilizado.

# Fluxograma

![Fluxoframa funcionamento SameSite](/imgs/samesite/fluxograma.jpg)

# Contextualizando

Entendo melhor o que isto afeta na prática, a maioria das aplicações *web* que exigem autenticação, controlam quem é você através de cookies de sessão, que possuem um valor de identificador único. Esta informação é muito valiosa, é ela que diz que você é você a cada ação que é realizada dentro da aplicação.

Se uma pessoa obtém esta informação de você, é possível então utilizar a aplicação normalmente como se estivesse autenticado com a sua conta. 

Portanto, é importante que existam estratégias que mitigam o sequestro de *cookies* que levam ao sequestro de sessões e o atributo **SameSite** é uma delas.

# Exemplificando

Vamos imaginar que uma aplicação possui um método para realizar pagamento a partir da conta do usuário logado. Este método naturalmente só funciona com o usuário devidamente autenticado, já que é da sua conta que o pagamento deve ser debitado.

Toda vez que a ação de pagamento é realizada dentro da aplicação, o *cookie* de sessão da aplicação é enviada juntamente na requisição, que identifica o usuário que está realizando a ação. Neste caso como o contexto é o mesmo, os *cookies* serão enviados "sem restrições".

Quando esta ação é realizada em outro contexto (que pode ser originada dentro de outro sistema, página ou link de acesso), se o *cookie* que identifica o usuário será enviado ou não dependerá do atributo *SameSite* e do tipo de ação que está sendo realizada.

Por exemplo, aqui o método de pagamento sendo realizado dentro do contexto do sistema:
![Método pagamento](/imgs/samesite/makepayment-method.PNG)

A partir do conhecimento do método e como ele é executado, podemos forjar e tentar fazer com que o usuário execute este método por nós, com a conta dele. Isto pode ocorrer através de sites forjados, links maliciosos, injetados em arquivos, *phishing* ou pela nevegação por ambientes inseguros e vulneráveis.

Nosso formulário malicioso será assim:
```html
<html>
<!DOCTYPE html>

<head>
	<title>CSRF</title>
	<meta content="text/html;charset=utf-8" http-equiv="Content-Type">
	<meta content="utf-8" http-equiv="encoding">
	<script>		
		window.onload = function(){
		  document.forms[0].submit();		  
		}
	</script>
</head>
<body>
	<form  method="POST" action="http://localhost/Demonstration/UsuarioLogado.ashx">
		<input name="method" type="text" value="makepayment" hidden="true"/>
		<input name="to" type="text" value="Joao" hidden="true"/>
		<input name="amount" type="text" value="10.000" hidden="true" />
	</form>
</body>
</html>
```

## SameSite = None

Atribuindo o valor igual **'None'** nos deparamos com o cenário mais inseguro possível, pois não haverá restrições aplicadas ao *cookie* e ele será enviado em qualquer tipo de ação, independente do contexto. O *cookie* será apresentado assim:
![Cookie SameSite None](/imgs/samesite/2-samesite-none.PNG)

Então se obtivermos sucesso em induzir o usuário que execute ou acesse o formulário forjado e estiver logado no sistema alvo, a ação automaticamente irá incluir o *cookie* de sessão dele, pois os *cookies* do mesmo domínio do alvo que estão salvos no navegador serão incluídos automaticamente na requisição.
![POST com SameSite None](/imgs/samesite/3-post-samesite-none.PNG)

Este resultado se repetirá para qualquer verbo *HTTP* que utilizarmos neste caso: **GET, POST, DELETE, PUT**, etc.

## SameSite = Lax

Com o valor igual a **'Lax'** o cenário fica um pouco mais restrito, a inclusão automática dos *cookies* para requisições geradas a partir de um domínio ou contexto diferente somente acontecerá para os métodos GET.
![Cookie SameSite Lax](/imgs/samesite/4-samesite-lax.PNG)

Repetindo a mesma ação anterior, é possível verificar que os *cookies* não são enviados, logo o usuário não é identificado no sistema e a ação não é executada:
![POST com SameSite Lax](/imgs/samesite/4-post-samesite-lax.PNG)

**Porém se for alterado o método para GET, como a diz a definição do Lax, os *cookies* serão enviados. Se a aplicação assim permitir, será possível executar a mesma ação com sucesso.**

Método alterado no formulário de exemplo:
```html
<form  method="GET" action="http://localhost/Demonstration/UsuarioLogado.ashx">
```
![GET com SameSite Lax](/imgs/samesite/4-get-samesite-lax.PNG)

## SameSite = Strict
Com o valor igual a **'Strict'** chegamos no cenário mais seguro possível, porém mais restritivo também. Neste cenário mesmo utilizando os métodos GET em um diferente contexto, os *cookies* de mesmo domínio não serão enviados.
![Cookie SameSite Strict](/imgs/samesite/5-get-samesite-strict.PNG)

Esta restrição pode ser incompatível em determinados cenários dependendo da aplicação, por exemplo nos casos onde é compartilhado algum link de acesso a alguma área de acesso do usuário que é enviado por e-mail ou vinculados em outros contextos.

Exemplo da mesma ação sendo executada via GET e nenhum envio do cookie de sessão enviado:
![GET com SameSite Strict](/imgs/samesite/6-get-samesite-strict.PNG)


# Conclusão

Em muitas aplicações os verbos **HTTP** não são validados, são usados de modo displicentes ou não são restringidos. Como no exemplo do *Lax*, se a aplicação simplesmente aceita que o mesmo método **POST** seja acionado também com **GET**, podemos inutilizar o propósito do *SameSite*. Sendo assim, esse é um dos motivos da importancia de implementação correta dos verbos **HTTP** dos métodos expostos.

O propósito principal do atributo *SameSite* é mitigar os ataques por *Cross-Site Request Forgery* (**CSRF**), reduzindo a possibilidade de *phishing* utilizando sua aplicação, roubo de sessões ou acionamento de métodos de forma arbitrária.

# Referências

https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Headers/Set-Cookie/SameSite