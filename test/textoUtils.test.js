const TextoUtils = require("../src/textoUtils");

describe("TextoUtils", () => {
  let utils;

  beforeEach(() => {
    utils = new TextoUtils();
  });

  test("inverter deve inverter a string", () => {
    expect(utils.inverter("abc")).toBe("cba");
  });

  test("ehPalindromo deve identificar palíndromos corretamente", () => {
    expect(utils.ehPalindromo("Arara")).toBe(true);
    expect(utils.ehPalindromo("A base do teto desaba")).toBe(true);
    expect(utils.ehPalindromo("JavaScript")).toBe(false);
  });

  test("capitalizar deve deixar a primeira letra de cada palavra maiúscula", () => {
    expect(utils.capitalizar("olá mundo")).toBe("Olá Mundo");
  });

  test("capitalizar deve manter espaços duplos sem quebrar", () => {
    expect(utils.capitalizar("olá  MUNDO")).toBe("Olá  Mundo");
  });

  test("contarOcorrencias deve contar substrings corretamente", () => {
    expect(utils.contarOcorrencias("banana", "an")).toBe(2);
    expect(utils.contarOcorrencias("banana", "x")).toBe(0);
  });

  test("contarOcorrencias deve retornar 0 quando a substring é vazia", () => {
    expect(utils.contarOcorrencias("banana", "")).toBe(0);
  });

  test("removerEspacosExtras deve limpar espaços extras", () => {
    expect(utils.removerEspacosExtras("  oi   mundo  ")).toBe("oi mundo");
  });

  test("paraSlug deve converter texto em slug", () => {
    expect(utils.paraSlug("Olá Mundo!")).toBe("ola-mundo");
  });

  test("paraSlug deve remover espaços das pontas e juntar espaços repetidos", () => {
    expect(utils.paraSlug("  Olá   Mundo  ")).toBe("ola-mundo");
  });

  test("truncar deve truncar textos longos", () => {
    expect(utils.truncar("Texto muito longo", 5)).toBe("Texto...");
    expect(utils.truncar("curto", 10)).toBe("curto");
  });

  test("truncar deve manter o texto quando o tamanho é exatamente igual", () => {
    expect(utils.truncar("abc", 3)).toBe("abc");
  });

  test("truncar deve aceitar tamanho zero", () => {
    expect(utils.truncar("abc", 0)).toBe("...");
  });

  test("truncar deve lançar erro para tamanho negativo", () => {
    expect(() => utils.truncar("abc", -1)).toThrow(
      "O tamanho não pode ser negativo"
    );
  });

  test("contarPalavras deve contar as palavras corretamente", () => {
    expect(utils.contarPalavras("  isso   é   um  teste ")).toBe(4);
  });

  test("contarPalavras deve retornar 0 para texto vazio ou só com espaços", () => {
    expect(utils.contarPalavras("")).toBe(0);
    expect(utils.contarPalavras("    ")).toBe(0);
  });

  test("somenteLetras deve validar strings só com letras", () => {
    expect(utils.somenteLetras("abcXYZ")).toBe(true);
    expect(utils.somenteLetras("abc123")).toBe(false);
  });

  test("somenteLetras deve recusar texto que começa com números", () => {
    expect(utils.somenteLetras("123abc")).toBe(false);
  });

  test("substituirTudo deve substituir todas as ocorrências", () => {
    expect(utils.substituirTudo("gato gato gato", "gato", "cão")).toBe(
      "cão cão cão"
    );
  });

  test("substituirTudo deve lançar erro se alvo for vazio", () => {
    expect(() => utils.substituirTudo("abc", "", "x")).toThrow(
      "O alvo não pode ser vazio"
    );
  });
});
