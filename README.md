# Mutation Tests com Stryker

[![Build and Tests](https://github.com/GabrielMacielZavarize/mutation_test/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/GabrielMacielZavarize/mutation_test/actions/workflows/node.js.yml)

Atividade da aula remota de 03/10/2026 sobre testes de mutação.

O projeto foi montado a partir do primeiro trabalho de testes unitários com Jest
([prova01-unit-test-GabrielMaciel](https://github.com/GabrielMacielZavarize/prova01-unit-test-GabrielMaciel)),
que tem a classe `Streaming` com os 20 métodos baseados em padrões de projeto e as demais classes do repositório base.
Em cima desses testes foi aplicada a técnica de mutation testing usando o [Stryker Mutator](https://stryker-mutator.io/).

## Como funciona o teste de mutação

O Stryker faz pequenas alterações no código fonte (os mutantes), por exemplo trocar `>` por `>=`,
trocar `&&` por `||`, apagar um bloco ou trocar uma string por `""`. Para cada mutante ele roda os testes de novo:

- se algum teste falhar, o mutante foi **morto** (killed), ou seja, os testes perceberam a mudança;
- se todos os testes passarem, o mutante **sobreviveu** (survived) e isso mostra um ponto onde os testes não estão verificando o comportamento direito;
- **no coverage** é quando nenhum teste passa por aquela linha;
- **timeout** é quando o mutante gera um loop infinito, o que também conta como detectado.

O mutation score é a porcentagem de mutantes detectados. Ele mostra a qualidade dos testes melhor do que a cobertura de código,
porque uma linha pode estar coberta e mesmo assim não ter nenhum `expect` validando o resultado dela.

## Como executar

Precisa do [Node JS](https://nodejs.org/) versão 22 ou maior.

```bash
npm install
npm test            # roda os testes unitarios com Jest
npm run coverage    # roda os testes com cobertura
npm run mutation    # roda os testes de mutacao com o Stryker
```

Depois de rodar `npm run mutation` o relatório fica em `reports/mutation/mutation.html` (é só abrir no navegador).

## Configuração do Stryker

Pacotes instalados como dependência de desenvolvimento:

- `@stryker-mutator/core`
- `@stryker-mutator/jest-runner`

Arquivo `stryker.config.json`:

- `testRunner: "jest"` usa o próprio Jest do projeto para rodar os testes em cada mutante;
- `coverageAnalysis: "perTest"` faz o Stryker rodar só os testes que passam pelo código mutado, deixando a execução bem mais rápida;
- `mutate: ["src/**/*.js"]` todos os arquivos da pasta `src` são mutados;
- `reporters` gera o relatório em HTML, JSON e a tabela no terminal;
- `thresholds` define as faixas do score. Com `break: 90` o comando falha se o score cair abaixo de 90%, então a pipeline acusa se alguém piorar os testes.

A pipeline do GitHub Actions (`.github/workflows/node.js.yml`) roda os testes unitários e depois os testes de mutação,
e guarda o relatório HTML como artefato da execução.

## Resultados

Foram gerados **629 mutantes** nos 12 arquivos da pasta `src`.

| Arquivo          | Score antes | Score depois |
|------------------|-------------|--------------|
| anagram.js       | 84,62%      | 84,62%       |
| banco.js         | 96,08%      | 100,00%      |
| calculator.js    | 100,00%     | 100,00%      |
| carro.js         | 90,00%      | 90,00%       |
| cnh.js           | 100,00%     | 100,00%      |
| contaBancaria.js | 85,51%      | 100,00%      |
| lista.js         | 100,00%     | 100,00%      |
| pessoa.js        | 100,00%     | 100,00%      |
| Streaming.js     | 96,82%      | 100,00%      |
| textoUtils.js    | 78,95%      | 97,37%       |
| userService.js   | 100,00%     | 100,00%      |
| utilitarios.js   | 90,24%      | 100,00%      |
| **Total**        | **91,10%**  | **99,21%**   |

|                  | Antes | Depois |
|------------------|-------|--------|
| Testes           | 108   | 135    |
| Mortos (killed)  | 571   | 622    |
| Timeout          | 2     | 2      |
| Sobreviventes    | 44    | 5      |
| Sem cobertura    | 12    | 0      |

Um ponto interessante é que antes dos testes novos a cobertura de linhas do Jest já era de 99,25% (97,6% de statements),
mas o mutation score era de 91,10%. Ou seja, quase todo o código era executado pelos testes, mas muitas mudanças no código
não eram percebidas por nenhum `expect`. Depois dos testes novos a cobertura ficou em 100% e o mutation score em 99,21%.

Os relatórios completos estão salvos no repositório:

- antes: [`reports/antes/mutation.html`](reports/antes/mutation.html) e [`reports/antes/saida-terminal.txt`](reports/antes/saida-terminal.txt)
- depois: [`reports/depois/mutation.html`](reports/depois/mutation.html) e [`reports/depois/saida-terminal.txt`](reports/depois/saida-terminal.txt)

## O que foi feito para matar os mutantes

O código da pasta `src` não foi alterado, só foram adicionados testes novos.

**Streaming.js** (trabalho da prova 1)

- `criarFamiliaTema`: os testes só usavam o tema `escuro`, então trocar `"claro"` ou `"contraste"` por `""` passava. Foi criado um teste com os outros dois temas.
- `moderarComentario`, `criarIteradorHistorico` e `mediarNotificacaoEntrePerfis`: o valor padrão `= []` dos parâmetros não era testado (estava sem cobertura). Foram criados testes chamando os métodos sem passar a lista.
- `transicionarEstado`: faltava a transição `pausado -> finalizar` e um teste com um estado que não existe. Esse último mata o mutante que remove o `?.`, porque sem ele o código lança `TypeError` em vez da mensagem de transição inválida.

**contaBancaria.js**

- testes de valor limite: sacar exatamente o saldo disponível, `podeSacar(0)`, `podeSacar(-10)`, `podeSacar(150)`, `ajustarLimite(0)` e `saldoNegativo()` com saldo zero e positivo. Esses testes matam as trocas de `>` por `>=` e de `<` por `<=`;
- `estaAtiva()` com conta bloqueada;
- `transferir` usando `jest.spyOn` para simular `podeSacar` retornando `false` e `sacar` retornando `false`, para garantir que as duas verificações realmente impedem a transferência;
- `validarConta` cobrindo cada regra separadamente (sem titular, saldo que não é número, limite negativo, limite zero e os status `bloqueada` e `encerrada`).

**textoUtils.js**

- o teste de `contarOcorrencias` estava vazio, por isso todos os mutantes desse método estavam sem cobertura;
- `capitalizar` com espaço duplo (cobre o caso `palavra.length === 0`);
- `paraSlug` com espaços nas pontas e espaços repetidos;
- `truncar` com tamanho igual ao texto, tamanho zero e validação da mensagem do erro;
- `contarPalavras` com texto vazio;
- `somenteLetras` com texto começando por número (mata o mutante que remove o `^` da regex);
- validação da mensagem de erro de `substituirTudo`.

**banco.js**

- histórico vazio ao criar a conta e saque do valor exato do saldo.

**utilitarios.js**

- `gerarNumeroAleatorio` com `Math.random` mockado, porque o teste antigo (resultado entre 0 e 10) também passava com `Math.random() / max`;
- `ehNumero("10")` e `ehNumero(null)`;
- `ehPalindromo` com palavras que não são palíndromos e com o caractere `ß`, que é ignorado pela regex mas viraria `SS` se o código usasse `toUpperCase`.

## Mutantes que sobreviveram

Os 5 mutantes que sobraram são **mutantes equivalentes**, ou seja, a alteração não muda o comportamento do código e não tem como escrever um teste que mate eles:

| Arquivo | Mutante | Por que é equivalente |
|---|---|---|
| `anagram.js:6` | `toLowerCase()` trocado por `toUpperCase()` | as duas palavras passam pela mesma função, então tanto faz deixar tudo minúsculo ou maiúsculo |
| `anagram.js:6` | `join("")` trocado por `join("Stryker was here!")` | o separador é o mesmo nos dois lados da comparação, então o resultado da comparação não muda |
| `carro.js:10` | `distancia > 0` trocado por `distancia >= 0` | quando a distância é 0 o código soma 0 na quilometragem, que dá no mesmo que não somar nada (considerando que a distância sempre é um número) |
| `textoUtils.js:58` | remove o `trim()` | o `filter(Boolean)` já tira as strings vazias que sobrariam nas pontas |
| `textoUtils.js:58` | regex `/\s+/` trocada por `/\s/` | também é coberto pelo `filter(Boolean)`, que remove as strings vazias geradas entre espaços seguidos |

Os 2 timeouts aparecem no iterador da classe `Streaming` (`criarIteradorHistorico`). Quando o Stryker apaga o corpo do `proximo()` ou troca `indice++` por `indice--`,
o `while (iterador.temProximo())` do teste nunca termina, então o mutante é detectado por timeout.

## Estrutura do projeto

- `src`: código fonte
- `test`: testes unitários com Jest
- `reports/antes`: relatório do Stryker antes dos testes novos
- `reports/depois`: relatório do Stryker depois dos testes novos
- `stryker.config.json`: configuração do Stryker

## Autor

Gabriel Maciel Zavarize
