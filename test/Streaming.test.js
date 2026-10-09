const Streaming = require("../src/Streaming");

describe("Streaming", () => {
  let streaming;

  beforeEach(() => {
    streaming = new Streaming();
  });

  // ============================================================
  // CRIACIONAIS
  // ============================================================

  describe("obterSessaoAtiva (Singleton)", () => {
    test("deve retornar sempre a mesma referencia de sessao", () => {
      // Arrange
      const outraInstancia = new Streaming();

      // Act
      const sessao1 = streaming.obterSessaoAtiva();
      const sessao2 = outraInstancia.obterSessaoAtiva();

      // Assert
      expect(sessao1).toBe(sessao2);
      expect(sessao1.plataforma).toBe("StreamFlix");
    });
  });

  describe("criarConteudo (Factory Method)", () => {
    test("deve criar um filme corretamente", () => {
      // Arrange
      const tipo = "filme";
      const titulo = "Matrix";

      // Act
      const conteudo = streaming.criarConteudo(tipo, titulo);

      // Assert
      expect(conteudo).toEqual({
        tipo: "filme",
        titulo: "Matrix",
        duracaoMinutos: 120,
      });
    });

    test("deve criar uma serie corretamente", () => {
      // Arrange
      const tipo = "serie";
      const titulo = "Dark";

      // Act
      const conteudo = streaming.criarConteudo(tipo, titulo);

      // Assert
      expect(conteudo).toEqual({ tipo: "serie", titulo: "Dark", temporadas: 1 });
    });

    test("deve criar um podcast corretamente", () => {
      // Arrange
      const tipo = "podcast";
      const titulo = "Café com IA";

      // Act
      const conteudo = streaming.criarConteudo(tipo, titulo);

      // Assert
      expect(conteudo).toEqual({
        tipo: "podcast",
        titulo: "Café com IA",
        episodios: 1,
      });
    });

    test("deve lancar erro para tipo desconhecido", () => {
      // Arrange
      const tipo = "documentario";

      // Act & Assert
      expect(() => streaming.criarConteudo(tipo, "Qualquer")).toThrow(
        "Tipo de conteúdo desconhecido: documentario",
      );
    });
  });

  describe("criarFamiliaTema (Abstract Factory)", () => {
    test("deve criar player e menu com o mesmo tema", () => {
      // Arrange
      const tema = "escuro";

      // Act
      const familia = streaming.criarFamiliaTema(tema);

      // Assert
      expect(familia.player.tema).toBe("escuro");
      expect(familia.menu.tema).toBe("escuro");
      expect(familia.player.icone).toBe("escuro-player");
      expect(familia.menu.icone).toBe("escuro-menu");
    });

    test("deve aceitar os temas claro e contraste", () => {
      // Arrange
      const temas = ["claro", "contraste"];

      // Act
      const familias = temas.map((tema) => streaming.criarFamiliaTema(tema));

      // Assert
      expect(familias[0].player.icone).toBe("claro-player");
      expect(familias[0].menu.icone).toBe("claro-menu");
      expect(familias[1].player.icone).toBe("contraste-player");
      expect(familias[1].menu.icone).toBe("contraste-menu");
    });

    test("deve lancar erro para tema invalido", () => {
      // Arrange
      const tema = "neon";

      // Act & Assert
      expect(() => streaming.criarFamiliaTema(tema)).toThrow(
        "Tema inválido: neon",
      );
    });
  });

  describe("construirResumoSessao (Builder)", () => {
    test("deve construir resumo com valores padrao quando config e vazia", () => {
      // Arrange & Act
      const resumo = streaming.construirResumoSessao();

      // Assert
      expect(resumo).toBe("Sessão de ");
    });

    test("deve construir resumo completo com conteudos e pausas", () => {
      // Arrange
      const config = {
        perfil: "Joao",
        conteudos: [{ titulo: "Matrix", minutos: 120 }],
        pausas: [{ motivo: "lanche", minuto: 45 }],
      };

      // Act
      const resumo = streaming.construirResumoSessao(config);

      // Assert
      expect(resumo).toBe(
        "Sessão de Joao\nAssistiu: Matrix (120min)\nPausa em lanche (45')",
      );
    });
  });

  describe("clonarPlaylist (Prototype)", () => {
    test("deve clonar profundamente sem manter referencia com a original", () => {
      // Arrange
      const playlist = { nome: "Favoritos", itens: [{ titulo: "Matrix" }] };

      // Act
      const clone = streaming.clonarPlaylist(playlist);
      clone.itens[0].titulo = "Alterado";

      // Assert
      expect(clone).not.toBe(playlist);
      expect(clone.itens).not.toBe(playlist.itens);
      expect(playlist.itens[0].titulo).toBe("Matrix");
    });

    test("deve lancar erro quando playlist e invalida", () => {
      // Arrange
      const playlistInvalida = { nome: "Sem itens" };

      // Act & Assert
      expect(() => streaming.clonarPlaylist(playlistInvalida)).toThrow(
        "Playlist inválida: itens deve ser um array",
      );
    });
  });

  // ============================================================
  // ESTRUTURAIS
  // ============================================================

  describe("adaptarConteudoLegado (Adapter)", () => {
    test("deve mapear todos os campos do conteudo legado", () => {
      // Arrange
      const conteudoAntigo = {
        nome_do_arquivo: "filme_antigo.mp4",
        duracao_segundos: 7200,
        tem_legenda: true,
      };

      // Act
      const conteudoNovo = streaming.adaptarConteudoLegado(conteudoAntigo);

      // Assert
      expect(conteudoNovo).toEqual({
        titulo: "filme_antigo.mp4",
        duracaoMinutos: 120,
        legendaDisponivel: true,
        formato: "novo-player",
      });
    });

    test("deve usar defaults quando campos opcionais estao ausentes", () => {
      // Arrange
      const conteudoAntigo = { nome_do_arquivo: "sem_extra.mp4" };

      // Act
      const conteudoNovo = streaming.adaptarConteudoLegado(conteudoAntigo);

      // Assert
      expect(conteudoNovo.duracaoMinutos).toBe(0);
      expect(conteudoNovo.legendaDisponivel).toBe(false);
    });

    test("deve lancar erro quando nome_do_arquivo esta ausente", () => {
      // Arrange
      const conteudoAntigo = { duracao_segundos: 60 };

      // Act & Assert
      expect(() => streaming.adaptarConteudoLegado(conteudoAntigo)).toThrow(
        "Conteúdo legado inválido: nome_do_arquivo é obrigatório",
      );
    });
  });

  describe("calcularDuracaoTotal (Composite)", () => {
    test("deve somar duracao de uma playlist simples com faixas", () => {
      // Arrange
      const playlist = {
        faixas: [{ duracaoMinutos: 10 }, { duracaoMinutos: 20 }],
      };

      // Act
      const total = streaming.calcularDuracaoTotal(playlist);

      // Assert
      expect(total).toBe(30);
    });

    test("deve somar duracao de playlist composta com sub-playlists aninhadas", () => {
      // Arrange
      const playlist = {
        subPlaylists: [
          { faixas: [{ duracaoMinutos: 10 }] },
          { subPlaylists: [{ faixas: [{ duracaoMinutos: 5 }] }] },
        ],
      };

      // Act
      const total = streaming.calcularDuracaoTotal(playlist);

      // Assert
      expect(total).toBe(15);
    });

    test("deve retornar 0 para playlist vazia ou nula", () => {
      // Arrange & Act
      const totalNula = streaming.calcularDuracaoTotal(null);
      const totalVazia = streaming.calcularDuracaoTotal({});

      // Assert
      expect(totalNula).toBe(0);
      expect(totalVazia).toBe(0);
    });
  });

  describe("decorarTitulo (Decorator)", () => {
    test("deve retornar o titulo original quando nao ha decoradores", () => {
      // Arrange
      const titulo = "Matrix";

      // Act
      const resultado = streaming.decorarTitulo(titulo);

      // Assert
      expect(resultado).toBe("Matrix");
    });

    test("deve aplicar um unico decorador", () => {
      // Arrange
      const titulo = "Matrix";
      const decoradorHD = (t) => `${t} [HD]`;

      // Act
      const resultado = streaming.decorarTitulo(titulo, [decoradorHD]);

      // Assert
      expect(resultado).toBe("Matrix [HD]");
    });

    test("deve aplicar varios decoradores em ordem", () => {
      // Arrange
      const titulo = "Matrix";
      const decoradorHD = (t) => `${t} [HD]`;
      const decoradorLegendado = (t) => `${t} [Legendado]`;

      // Act
      const resultado = streaming.decorarTitulo(titulo, [
        decoradorHD,
        decoradorLegendado,
      ]);

      // Assert
      expect(resultado).toBe("Matrix [HD] [Legendado]");
    });
  });

  describe("reproduzirConteudo (Facade)", () => {
    test("deve reproduzir conteudo quando assinatura esta ativa", () => {
      // Arrange
      const usuario = { assinaturaAtiva: true, historico: [] };
      jest.spyOn(streaming, "verificarAssinatura");
      jest.spyOn(streaming, "buscarConteudoPorId");
      jest.spyOn(streaming, "registrarHistorico");

      // Act
      const resultado = streaming.reproduzirConteudo(usuario, "123");

      // Assert
      expect(streaming.verificarAssinatura).toHaveBeenCalledWith(usuario);
      expect(streaming.buscarConteudoPorId).toHaveBeenCalledWith("123");
      expect(streaming.registrarHistorico).toHaveBeenCalled();
      expect(resultado.reproduzindo).toBe(true);
      expect(resultado.conteudo.id).toBe("123");
      expect(usuario.historico).toContain("123");
    });

    test("deve lancar erro quando assinatura esta inativa", () => {
      // Arrange
      const usuario = { assinaturaAtiva: false };

      // Act & Assert
      expect(() => streaming.reproduzirConteudo(usuario, "123")).toThrow(
        "Assinatura inativa",
      );
    });
  });

  describe("obterIconeCategoria (Flyweight)", () => {
    test("deve retornar a mesma referencia para a mesma categoria", () => {
      // Arrange
      const categoria = "acao";

      // Act
      const icone1 = streaming.obterIconeCategoria(categoria);
      const icone2 = streaming.obterIconeCategoria(categoria);

      // Assert
      expect(icone1).toBe(icone2);
    });

    test("deve criar icones diferentes para categorias diferentes", () => {
      // Arrange & Act
      const iconeAcao = streaming.obterIconeCategoria("acao");
      const iconeComedia = streaming.obterIconeCategoria("comedia");

      // Assert
      expect(iconeAcao).not.toBe(iconeComedia);
      expect(iconeAcao.icone).toBe("icone-acao");
      expect(iconeComedia.icone).toBe("icone-comedia");
    });
  });

  describe("acessarConteudoPremium (Proxy)", () => {
    test("deve liberar acesso para usuario com plano premium", () => {
      // Arrange
      const usuario = { planosLiberados: ["basico", "premium"] };

      // Act
      const resultado = streaming.acessarConteudoPremium(usuario, "abc");

      // Assert
      expect(resultado).toEqual({ id: "abc", acesso: "liberado" });
    });

    test("deve negar acesso para usuario sem plano premium", () => {
      // Arrange
      const usuario = { planosLiberados: ["basico"] };

      // Act & Assert
      expect(() => streaming.acessarConteudoPremium(usuario, "abc")).toThrow(
        "Acesso negado: plano premium necessário",
      );
    });

    test("deve lancar erro para usuario invalido ou nulo", () => {
      // Arrange & Act & Assert
      expect(() => streaming.acessarConteudoPremium(null, "abc")).toThrow(
        "Usuário inválido",
      );
      expect(() =>
        streaming.acessarConteudoPremium({ planosLiberados: null }, "abc"),
      ).toThrow("Usuário inválido");
    });
  });

  // ============================================================
  // COMPORTAMENTAIS
  // ============================================================

  describe("moderarComentario (Chain of Responsibility)", () => {
    test("deve retornar a decisao do primeiro handler que decidir", () => {
      // Arrange
      const handlerAprova = () => "aprovado-pelo-primeiro";
      const handlerNaoChamado = jest.fn();

      // Act
      const resultado = streaming.moderarComentario("oi", [
        handlerAprova,
        handlerNaoChamado,
      ]);

      // Assert
      expect(resultado).toBe("aprovado-pelo-primeiro");
      expect(handlerNaoChamado).not.toHaveBeenCalled();
    });

    test("deve aprovar por padrao quando nenhum handler decide", () => {
      // Arrange
      const handlerIndeciso = () => undefined;

      // Act
      const resultado = streaming.moderarComentario("oi", [handlerIndeciso]);

      // Assert
      expect(resultado).toBe("aprovado");
    });

    test("deve aprovar quando a lista de handlers nao e informada", () => {
      // Arrange & Act
      const resultado = streaming.moderarComentario("oi");

      // Assert
      expect(resultado).toBe("aprovado");
    });

    test("deve retornar decisao tomada no meio da cadeia", () => {
      // Arrange
      const handler1 = () => null;
      const handler2 = () => "reprovado";
      const handler3 = jest.fn();

      // Act
      const resultado = streaming.moderarComentario("oi", [
        handler1,
        handler2,
        handler3,
      ]);

      // Assert
      expect(resultado).toBe("reprovado");
      expect(handler3).not.toHaveBeenCalled();
    });
  });

  describe("executarComando (Command)", () => {
    test("deve executar o comando e retornar seu resultado", () => {
      // Arrange
      const comando = { executar: jest.fn().mockReturnValue("play-ok") };

      // Act
      const resultado = streaming.executarComando(comando);

      // Assert
      expect(comando.executar).toHaveBeenCalled();
      expect(resultado).toBe("play-ok");
    });

    test("deve lancar erro para comando invalido", () => {
      // Arrange
      const comandoInvalido = { executar: "nao-e-funcao" };

      // Act & Assert
      expect(() => streaming.executarComando(comandoInvalido)).toThrow(
        "Comando inválido: precisa ter um método executar()",
      );
      expect(() => streaming.executarComando(null)).toThrow(
        "Comando inválido: precisa ter um método executar()",
      );
    });
  });

  describe("criarIteradorHistorico (Iterator)", () => {
    test("deve percorrer todo o historico", () => {
      // Arrange
      const historico = ["ep1", "ep2", "ep3"];
      const iterador = streaming.criarIteradorHistorico(historico);
      const resultado = [];

      // Act
      while (iterador.temProximo()) {
        resultado.push(iterador.proximo());
      }

      // Assert
      expect(resultado).toEqual(["ep1", "ep2", "ep3"]);
    });

    test("deve indicar que nao ha proximo item em historico vazio", () => {
      // Arrange
      const iterador = streaming.criarIteradorHistorico([]);

      // Act & Assert
      expect(iterador.temProximo()).toBe(false);
    });

    test("deve usar historico vazio quando nenhum historico e informado", () => {
      // Arrange
      const iterador = streaming.criarIteradorHistorico();

      // Act & Assert
      expect(iterador.temProximo()).toBe(false);
      expect(() => iterador.proximo()).toThrow(
        "Não há mais itens no histórico",
      );
    });

    test("deve lancar erro ao chamar proximo alem do fim", () => {
      // Arrange
      const iterador = streaming.criarIteradorHistorico(["ep1"]);
      iterador.proximo();

      // Act & Assert
      expect(() => iterador.proximo()).toThrow(
        "Não há mais itens no histórico",
      );
    });
  });

  describe("mediarNotificacaoEntrePerfis (Mediator)", () => {
    test("deve enviar mensagem para todos os perfis exceto o remetente", () => {
      // Arrange
      const perfis = ["Joao", "Maria", "Pedro"];

      // Act
      const notificacoes = streaming.mediarNotificacaoEntrePerfis(
        "Joao",
        "Novo episodio!",
        perfis,
      );

      // Assert
      expect(notificacoes).toEqual([
        { para: "Maria", de: "Joao", mensagem: "Novo episodio!" },
        { para: "Pedro", de: "Joao", mensagem: "Novo episodio!" },
      ]);
    });

    test("deve retornar lista vazia quando nao ha perfis", () => {
      // Arrange & Act
      const notificacoes = streaming.mediarNotificacaoEntrePerfis(
        "Joao",
        "Oi",
        [],
      );

      // Assert
      expect(notificacoes).toEqual([]);
    });

    test("deve retornar lista vazia quando a lista de perfis nao e informada", () => {
      // Arrange & Act
      const notificacoes = streaming.mediarNotificacaoEntrePerfis("Joao", "Oi");

      // Assert
      expect(notificacoes).toEqual([]);
    });
  });

  describe("salvarProgresso / restaurarUltimoProgresso (Memento)", () => {
    test("deve salvar progressos e restaurar na ordem inversa", () => {
      // Arrange
      streaming.salvarProgresso(100);
      streaming.salvarProgresso(200);
      const total = streaming.salvarProgresso(300);

      // Act
      const primeiro = streaming.restaurarUltimoProgresso();
      const segundo = streaming.restaurarUltimoProgresso();
      const terceiro = streaming.restaurarUltimoProgresso();

      // Assert
      expect(total).toBe(3);
      expect(primeiro).toBe(300);
      expect(segundo).toBe(200);
      expect(terceiro).toBe(100);
    });

    test("deve lancar erro ao restaurar sem progresso salvo", () => {
      // Arrange & Act & Assert
      expect(() => streaming.restaurarUltimoProgresso()).toThrow(
        "Nenhum progresso salvo para restaurar",
      );
    });
  });

  describe("inscreverPerfil / notificarNovosEpisodios (Observer)", () => {
    test("deve notificar todos os perfis inscritos com a serie lancada", () => {
      // Arrange
      const perfil1 = jest.fn();
      const perfil2 = jest.fn();
      streaming.inscreverPerfil(perfil1);
      streaming.inscreverPerfil(perfil2);
      const serie = { titulo: "Dark" };

      // Act
      const totalNotificados = streaming.notificarNovosEpisodios(serie);

      // Assert
      expect(perfil1).toHaveBeenCalledWith(serie);
      expect(perfil2).toHaveBeenCalledWith(serie);
      expect(totalNotificados).toBe(2);
    });

    test("deve retornar 0 quando nao ha perfis inscritos", () => {
      // Arrange & Act
      const totalNotificados = streaming.notificarNovosEpisodios({
        titulo: "Dark",
      });

      // Assert
      expect(totalNotificados).toBe(0);
    });
  });

  describe("transicionarEstado (State)", () => {
    test("deve transicionar corretamente entre estados validos", () => {
      // Arrange & Act & Assert
      expect(streaming.transicionarEstado("parado", "play")).toBe(
        "reproduzindo",
      );
      expect(streaming.transicionarEstado("reproduzindo", "pausar")).toBe(
        "pausado",
      );
      expect(streaming.transicionarEstado("pausado", "play")).toBe(
        "reproduzindo",
      );
      expect(streaming.transicionarEstado("reproduzindo", "finalizar")).toBe(
        "finalizado",
      );
      expect(streaming.transicionarEstado("pausado", "finalizar")).toBe(
        "finalizado",
      );
    });

    test("deve lancar erro para transicao invalida", () => {
      // Arrange & Act & Assert
      expect(() =>
        streaming.transicionarEstado("finalizado", "play"),
      ).toThrow("Transição inválida: play a partir de finalizado");
    });

    test("deve lancar erro de transicao quando o estado atual nao existe", () => {
      // Arrange & Act & Assert
      expect(() =>
        streaming.transicionarEstado("desconhecido", "play"),
      ).toThrow("Transição inválida: play a partir de desconhecido");
    });
  });

  describe("ordenarCatalogo (Strategy)", () => {
    const catalogo = [
      { titulo: "Matrix", popularidade: 5 },
      { titulo: "Dark", popularidade: 9 },
      { titulo: "Amor", popularidade: 2 },
    ];

    test("deve ordenar por popularidade quando essa estrategia e usada", () => {
      // Arrange
      const porPopularidade = (a, b) => b.popularidade - a.popularidade;

      // Act
      const resultado = streaming.ordenarCatalogo(catalogo, porPopularidade);

      // Assert
      expect(resultado.map((c) => c.titulo)).toEqual([
        "Dark",
        "Matrix",
        "Amor",
      ]);
    });

    test("deve ordenar por titulo quando essa estrategia e usada", () => {
      // Arrange
      const porTitulo = (a, b) => a.titulo.localeCompare(b.titulo);

      // Act
      const resultado = streaming.ordenarCatalogo(catalogo, porTitulo);

      // Assert
      expect(resultado.map((c) => c.titulo)).toEqual([
        "Amor",
        "Dark",
        "Matrix",
      ]);
    });

    test("deve lancar erro quando estrategia nao e uma funcao", () => {
      // Arrange & Act & Assert
      expect(() => streaming.ordenarCatalogo(catalogo, null)).toThrow(
        "Estratégia deve ser uma função",
      );
    });

    test("nao deve alterar o array original (imutabilidade)", () => {
      // Arrange
      const original = [...catalogo];
      const porTitulo = (a, b) => a.titulo.localeCompare(b.titulo);

      // Act
      streaming.ordenarCatalogo(catalogo, porTitulo);

      // Assert
      expect(catalogo).toEqual(original);
    });
  });

  describe("executarFluxoRecomendacao (Template Method)", () => {
    test("deve executar as etapas coletar, filtrar e ordenar nessa ordem", () => {
      // Arrange
      const chamadas = [];
      const processador = {
        coletarDados: jest.fn(() => {
          chamadas.push("coletar");
          return ["a", "b", "c"];
        }),
        filtrar: jest.fn((dados) => {
          chamadas.push("filtrar");
          return dados.filter((item) => item !== "b");
        }),
        ordenar: jest.fn((dados) => {
          chamadas.push("ordenar");
          return [...dados].reverse();
        }),
      };

      // Act
      const resultado = streaming.executarFluxoRecomendacao(processador);

      // Assert
      expect(chamadas).toEqual(["coletar", "filtrar", "ordenar"]);
      expect(processador.filtrar).toHaveBeenCalledWith(["a", "b", "c"]);
      expect(processador.ordenar).toHaveBeenCalledWith(["a", "c"]);
      expect(resultado).toEqual(["c", "a"]);
    });
  });

  // ============================================================
  // METODOS AUXILIARES (usados pelo Facade)
  // ============================================================

  describe("métodos auxiliares", () => {
    test("verificarAssinatura deve lancar erro quando usuario e nulo ou sem assinatura", () => {
      // Arrange & Act & Assert
      expect(() => streaming.verificarAssinatura(null)).toThrow(
        "Assinatura inativa",
      );
      expect(() =>
        streaming.verificarAssinatura({ assinaturaAtiva: false }),
      ).toThrow("Assinatura inativa");
    });

    test("buscarConteudoPorId deve retornar conteudo generico com o id informado", () => {
      // Arrange & Act
      const conteudo = streaming.buscarConteudoPorId("42");

      // Assert
      expect(conteudo).toEqual({ id: "42", titulo: "Conteúdo genérico" });
    });

    test("registrarHistorico deve adicionar o id do conteudo ao historico do usuario", () => {
      // Arrange
      const usuario = {};
      const conteudo = { id: "42" };

      // Act
      streaming.registrarHistorico(usuario, conteudo);
      streaming.registrarHistorico(usuario, { id: "43" });

      // Assert
      expect(usuario.historico).toEqual(["42", "43"]);
    });
  });
});
