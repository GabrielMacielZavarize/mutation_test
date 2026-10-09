/**
 * Streaming
 * ---------
 * Classe com domínio "plataforma de streaming":
 * 5 padrões criacionais + 6 estruturais + 9 comportamentais = 20 métodos testáveis.
 * Pensada para prática de testes unitários (Arrange/Act/Assert + mocks).
 */

class Streaming {
  constructor() {
    this._observadores = []; // usado pelo Observer
    this._progressoSalvo = []; // usado pelo Memento
    this._cacheIcones = new Map(); // usado pelo Flyweight
  }

  // ============================================================
  // CRIACIONAIS (5)
  // ============================================================

  /**
   * 1) SINGLETON
   * Garante que só exista uma sessão ativa da plataforma.
   * Teste sugerido: duas chamadas devem retornar a MESMA referência (toBe).
   */
  obterSessaoAtiva() {
    if (!Streaming._sessaoAtiva) {
      Streaming._sessaoAtiva = {
        plataforma: "StreamFlix",
        iniciadaEm: Date.now(),
      };
    }
    return Streaming._sessaoAtiva;
  }

  /**
   * 2) FACTORY METHOD
   * Cria um conteúdo (filme, série ou podcast) a partir do tipo informado.
   * Teste sugerido: tipos válidos + erro para tipo desconhecido.
   */
  criarConteudo(tipo, titulo) {
    switch (tipo) {
      case "filme":
        return { tipo: "filme", titulo, duracaoMinutos: 120 };
      case "serie":
        return { tipo: "serie", titulo, temporadas: 1 };
      case "podcast":
        return { tipo: "podcast", titulo, episodios: 1 };
      default:
        throw new Error(`Tipo de conteúdo desconhecido: ${tipo}`);
    }
  }

  /**
   * 3) ABSTRACT FACTORY
   * Cria a família de componentes visuais (player e menu) coerentes com um tema.
   * Teste sugerido: player e menu devem compartilhar o mesmo tema; erro para tema inválido.
   */
  criarFamiliaTema(tema) {
    const temasValidos = ["escuro", "claro", "contraste"];
    if (!temasValidos.includes(tema)) {
      throw new Error(`Tema inválido: ${tema}`);
    }
    return {
      player: { tema, icone: `${tema}-player` },
      menu: { tema, icone: `${tema}-menu` },
    };
  }

  /**
   * 4) BUILDER
   * Monta o resumo de uma sessão de reprodução passo a passo, a partir de uma configuração.
   * Teste sugerido: configuração parcial (usa defaults) e configuração completa com conteúdos/pausas.
   */
  construirResumoSessao({ perfil = "", conteudos = [], pausas = [] } = {}) {
    const partes = [`Sessão de ${perfil}`];
    conteudos.forEach((c) =>
      partes.push(`Assistiu: ${c.titulo} (${c.minutos}min)`),
    );
    pausas.forEach((p) =>
      partes.push(`Pausa em ${p.motivo} (${p.minuto}')`),
    );
    return partes.join("\n");
  }

  /**
   * 5) PROTOTYPE
   * Clona profundamente uma playlist, sem manter referência compartilhada com a original.
   * Teste sugerido: alterar o clone e garantir que a original não muda; erro para entrada inválida.
   */
  clonarPlaylist(playlist) {
    if (!playlist || !Array.isArray(playlist.itens)) {
      throw new Error("Playlist inválida: itens deve ser um array");
    }
    return JSON.parse(JSON.stringify(playlist));
  }

  // ============================================================
  // ESTRUTURAIS (6)
  // ============================================================

  /**
   * 6) ADAPTER
   * Converte um conteúdo no formato legado (usado no player antigo) para o novo formato.
   * Teste sugerido: mapeamento de campos e ausência de campos opcionais (legenda).
   */
  adaptarConteudoLegado(conteudoAntigo) {
    if (!conteudoAntigo || !conteudoAntigo.nome_do_arquivo) {
      throw new Error(
        "Conteúdo legado inválido: nome_do_arquivo é obrigatório",
      );
    }
    return {
      titulo: conteudoAntigo.nome_do_arquivo,
      duracaoMinutos: Math.round((conteudoAntigo.duracao_segundos ?? 0) / 60),
      legendaDisponivel: conteudoAntigo.tem_legenda ?? false,
      formato: "novo-player",
    };
  }

  /**
   * 7) COMPOSITE
   * Soma a duração total de uma playlist, incluindo sub-playlists aninhadas.
   * Teste sugerido: playlist simples com faixas, playlist composta com sub-playlists, playlist vazia.
   */
  calcularDuracaoTotal(playlist) {
    if (!playlist) return 0;
    if (Array.isArray(playlist.subPlaylists)) {
      return playlist.subPlaylists.reduce(
        (soma, sub) => soma + this.calcularDuracaoTotal(sub),
        0,
      );
    }
    if (Array.isArray(playlist.faixas)) {
      return playlist.faixas.reduce(
        (soma, faixa) => soma + faixa.duracaoMinutos,
        0,
      );
    }
    return 0;
  }

  /**
   * 8) DECORATOR
   * Aplica uma cadeia de decoradores a um título (ex.: selo de HD, legendado, novo).
   * Teste sugerido: sem decoradores (retorna o título original), um decorador, vários em ordem.
   */
  decorarTitulo(titulo, decoradores = []) {
    return decoradores.reduce((atual, decorador) => decorador(atual), titulo);
  }

  /**
   * 9) FACADE
   * Orquestra a reprodução completa: verifica assinatura, busca o conteúdo e registra o histórico.
   * Teste sugerido: fluxo completo com spyOn nos métodos internos; erro quando a assinatura está inativa.
   */
  reproduzirConteudo(usuario, conteudoId) {
    this.verificarAssinatura(usuario);
    const conteudo = this.buscarConteudoPorId(conteudoId);
    this.registrarHistorico(usuario, conteudo);
    return { reproduzindo: true, conteudo };
  }

  /**
   * 10) FLYWEIGHT
   * Reaproveita o mesmo ícone de categoria em vez de recriá-lo a cada chamada.
   * Teste sugerido: duas chamadas com a mesma categoria devem retornar a MESMA referência.
   */
  obterIconeCategoria(categoria) {
    if (!this._cacheIcones.has(categoria)) {
      this._cacheIcones.set(categoria, {
        categoria,
        icone: `icone-${categoria}`,
        criadoEm: Date.now(),
      });
    }
    return this._cacheIcones.get(categoria);
  }

  /**
   * 11) PROXY
   * Controla o acesso de um usuário a um conteúdo premium.
   * Teste sugerido: usuário autorizado, não autorizado, usuário inválido/nulo.
   */
  acessarConteudoPremium(usuario, conteudoId) {
    if (!usuario || !Array.isArray(usuario.planosLiberados)) {
      throw new Error("Usuário inválido");
    }
    if (!usuario.planosLiberados.includes("premium")) {
      throw new Error("Acesso negado: plano premium necessário");
    }
    return { id: conteudoId, acesso: "liberado" };
  }

  // ============================================================
  // COMPORTAMENTAIS (9)
  // ============================================================

  /**
   * 12) CHAIN OF RESPONSIBILITY
   * Passa um comentário por uma cadeia de moderadores até um decidir o resultado.
   * Teste sugerido: primeiro handler decide, nenhum decide (aprova por padrão), decisão no meio da cadeia.
   */
  moderarComentario(comentario, handlers = []) {
    for (const handler of handlers) {
      const resultado = handler(comentario);
      if (resultado !== undefined && resultado !== null) {
        return resultado;
      }
    }
    return "aprovado";
  }

  /**
   * 13) COMMAND
   * Executa um comando de player (play/pause/skip) encapsulado em um objeto.
   * Teste sugerido: mockar o comando e verificar o retorno de executar(); erro para comando inválido.
   */
  executarComando(comando) {
    if (!comando || typeof comando.executar !== "function") {
      throw new Error("Comando inválido: precisa ter um método executar()");
    }
    return comando.executar();
  }

  /**
   * 14) ITERATOR
   * Cria um iterador manual sobre o histórico de reprodução (temProximo/proximo).
   * Teste sugerido: percorrer todo o histórico, histórico vazio, chamar proximo() além do fim.
   */
  criarIteradorHistorico(historico = []) {
    let indice = 0;
    return {
      temProximo: () => indice < historico.length,
      proximo: () => {
        if (indice >= historico.length) {
          throw new Error("Não há mais itens no histórico");
        }
        return historico[indice++];
      },
    };
  }

  /**
   * 15) MEDIATOR
   * Centraliza o envio de uma notificação de um perfil para os demais perfis da conta.
   * Teste sugerido: mensagem chega a todos os participantes exceto o remetente; lista vazia.
   */
  mediarNotificacaoEntrePerfis(remetente, mensagem, perfis = []) {
    return perfis
      .filter((perfil) => perfil !== remetente)
      .map((perfil) => ({ para: perfil, de: remetente, mensagem }));
  }

  /**
   * 16) MEMENTO
   * Salva e restaura o progresso de reprodução, como uma pilha (útil para "continuar de onde parou").
   * Teste sugerido: salvar N progressos e restaurar na ordem inversa; restaurar sem histórico lança erro.
   */
  salvarProgresso(segundos) {
    this._progressoSalvo.push(segundos);
    return this._progressoSalvo.length;
  }

  restaurarUltimoProgresso() {
    if (this._progressoSalvo.length === 0) {
      throw new Error("Nenhum progresso salvo para restaurar");
    }
    return this._progressoSalvo.pop();
  }

  /**
   * 17) OBSERVER
   * Registra perfis (callbacks) e os notifica quando uma nova série/episódio é lançado.
   * Teste sugerido: mockar a função do perfil (jest.fn()) e verificar toHaveBeenCalledWith.
   */
  inscreverPerfil(callback) {
    this._observadores.push(callback);
  }

  notificarNovosEpisodios(serie) {
    this._observadores.forEach((observador) => observador(serie));
    return this._observadores.length;
  }

  /**
   * 18) STATE
   * Transiciona o estado do player a partir de um evento (parado -> reproduzindo -> ...).
   * Teste sugerido: cobrir todas as transições válidas e uma transição inválida (erro).
   */
  transicionarEstado(estadoAtual, evento) {
    const transicoes = {
      parado: { play: "reproduzindo" },
      reproduzindo: { pausar: "pausado", finalizar: "finalizado" },
      pausado: { play: "reproduzindo", finalizar: "finalizado" },
      finalizado: {},
    };
    const proximoEstado = transicoes[estadoAtual]?.[evento];
    if (!proximoEstado) {
      throw new Error(`Transição inválida: ${evento} a partir de ${estadoAtual}`);
    }
    return proximoEstado;
  }

  /**
   * 19) STRATEGY
   * Ordena o catálogo usando um critério de ordenação intercambiável.
   * Teste sugerido: testar com dois critérios diferentes (ex.: por popularidade vs. por título).
   */
  ordenarCatalogo(itens, estrategia) {
    if (typeof estrategia !== "function") {
      throw new Error("Estratégia deve ser uma função");
    }
    return [...itens].sort(estrategia);
  }

  /**
   * 20) TEMPLATE METHOD
   * Define o esqueleto fixo do fluxo de recomendação (coletar -> filtrar -> ordenar),
   * delegando cada etapa a um processador injetado.
   * Teste sugerido: mockar o processador e verificar que as etapas rodam nessa ordem.
   */
  executarFluxoRecomendacao(processador) {
    const dados = processador.coletarDados();
    const filtrados = processador.filtrar(dados);
    return processador.ordenar(filtrados);
  }

  // ------------------------------------------------------------
  // Métodos auxiliares (usados pelo Facade, também testáveis isoladamente)
  // ------------------------------------------------------------
  verificarAssinatura(usuario) {
    if (!usuario || !usuario.assinaturaAtiva) {
      throw new Error("Assinatura inativa");
    }
  }

  buscarConteudoPorId(conteudoId) {
    return { id: conteudoId, titulo: "Conteúdo genérico" };
  }

  registrarHistorico(usuario, conteudo) {
    usuario.historico = usuario.historico || [];
    usuario.historico.push(conteudo.id);
  }
}

module.exports = Streaming;
