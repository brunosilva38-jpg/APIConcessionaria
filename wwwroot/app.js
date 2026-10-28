/**
 * AutoConce - Lógica Front-End Integrada à API ASP.NET Core
 * 
 * Endpoints consumidos (validados via collection Bruno):
 * - GET    /api/carros        -> Lista todos os veículos
 * - GET    /api/carros/{id}   -> Obtém detalhes de um veículo
 * - POST   /api/carros        -> Cria um novo veículo
 * - PUT    /api/carros/{id}   -> Atualiza os dados de um veículo
 * - DELETE /api/carros/{id}   -> Remove um veículo
 */

(function () {
  'use strict';

  // Definição da URL da API (compatível com a porta 5240 da collection Bruno ou caminho relativo)
  const API_URL = (window.location.protocol === 'file:' || !window.location.origin.includes('5240'))
    ? 'http://localhost:5240/api/carros'
    : '/api/carros';

  // Ano máximo dinâmico para validação
  const anoMaximoPermitido = new Date().getFullYear() + 1;

  // Estado interno da aplicação
  let idEmEdicao = null;
  let timeoutAlerta = null;
  let elementoDisparadorModal = null;

  // Elementos do DOM
  const form = document.getElementById('veiculo-form');
  const inputId = document.getElementById('veiculo-id');
  const inputMarca = document.getElementById('veiculo-marca');
  const inputNome = document.getElementById('veiculo-nome');
  const inputAno = document.getElementById('veiculo-ano');
  const inputValor = document.getElementById('veiculo-valor');
  const formTitulo = document.getElementById('form-titulo');
  const formSubtitulo = document.getElementById('form-subtitulo');
  const btnSalvar = document.getElementById('btn-salvar');
  const btnCancelar = document.getElementById('btn-cancelar');
  const btnLimpar = document.getElementById('btn-limpar');

  const tabelaCorpo = document.getElementById('tabela-veiculos-corpo');
  const tabelaContainer = document.getElementById('tabela-container');
  const tabelaLoading = document.getElementById('tabela-loading');
  const contadorVeiculos = document.getElementById('contador-veiculos');
  const estadoVazio = document.getElementById('tabela-vazia');
  const alertaBox = document.getElementById('mensagem-alerta');

  // Modal de Detalhes
  const modalDetalhes = document.getElementById('modal-detalhes');
  const modalCorpo = document.getElementById('modal-corpo-detalhes');
  const btnFecharModal = document.getElementById('btn-fechar-modal');
  const btnModalFecharRodape = document.getElementById('btn-modal-fechar-rodape');

  /**
   * Formata número decimal para moeda BRL (R$ 0.000,00)
   */
  function formatarMoeda(valor) {
    const numero = typeof valor === 'number' ? valor : parseFloat(valor);
    if (isNaN(numero)) return 'R$ 0,00';

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numero);
  }

  /**
   * Normaliza o valor monetário inserido, aceitando tanto vírgula quanto ponto
   */
  function normalizarValorMonetario(valor) {
    if (typeof valor === 'number') return valor;
    if (!valor) return NaN;
    const sanitizado = String(valor).trim().replace(',', '.');
    return parseFloat(sanitizado);
  }

  /**
   * Exibe mensagens de feedback visual e acessível no DOM
   */
  function exibirMensagem(texto, tipo = 'alert-info') {
    if (timeoutAlerta) {
      clearTimeout(timeoutAlerta);
    }

    alertaBox.className = `alert-box ${tipo}`;
    alertaBox.textContent = texto;
    alertaBox.classList.remove('alert-hidden');

    timeoutAlerta = setTimeout(() => {
      alertaBox.classList.add('alert-hidden');
    }, 4500);
  }

  /**
   * Controla a visibilidade do indicador de carregamento
   */
  function alternarCarregamento(carregando) {
    if (carregando) {
      tabelaLoading.classList.remove('visually-hidden');
      tabelaContainer.classList.add('visually-hidden');
      estadoVazio.classList.add('visually-hidden');
    } else {
      tabelaLoading.classList.add('visually-hidden');
      tabelaContainer.classList.remove('visually-hidden');
    }
  }

  /**
   * Valida os campos antes do envio
   */
  function validarCampos(marca, nome, ano, valor) {
    if (!marca || marca.trim().length === 0) {
      exibirMensagem('Por favor, informe a marca do veículo.', 'alert-error');
      inputMarca.focus();
      return false;
    }

    if (!nome || nome.trim().length === 0) {
      exibirMensagem('Por favor, informe o modelo (nome) do veículo.', 'alert-error');
      inputNome.focus();
      return false;
    }

    const anoNum = parseInt(ano, 10);
    if (isNaN(anoNum) || anoNum < 1900 || anoNum > anoMaximoPermitido) {
      exibirMensagem(`Por favor, informe um ano válido entre 1900 e ${anoMaximoPermitido}.`, 'alert-error');
      inputAno.focus();
      return false;
    }

    const valorNum = normalizarValorMonetario(valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      exibirMensagem('Por favor, informe um preço maior que zero.', 'alert-error');
      inputValor.focus();
      return false;
    }

    return true;
  }

  /**
   * Busca e lista os veículos cadastrados na API (GET /api/carros)
   * Insere valores estritamente via textContent
   */
  async function carregarVeiculos() {
    alternarCarregamento(true);

    try {
      const resposta = await fetch(API_URL);

      if (!resposta.ok) {
        throw new Error(`Falha ao obter veículos da API (Status HTTP: ${resposta.status})`);
      }

      const veiculos = await resposta.json();
      renderizarTabela(veiculos);
    } catch (erro) {
      console.error('Erro na requisição GET /api/carros:', erro);
      tabelaCorpo.replaceChildren();
      contadorVeiculos.textContent = 'Erro ao sincronizar';
      estadoVazio.classList.add('visually-hidden');
      exibirMensagem(`Não foi possível carregar os dados da API: ${erro.message}`, 'alert-error');
    } finally {
      alternarCarregamento(false);
    }
  }

  /**
   * Renderiza a tabela no DOM utilizando textContent para segurança contra injeção
   */
  function renderizarTabela(veiculos) {
    tabelaCorpo.replaceChildren();

    if (!Array.isArray(veiculos) || veiculos.length === 0) {
      contadorVeiculos.textContent = '0 veículos';
      estadoVazio.classList.remove('visually-hidden');
      return;
    }

    estadoVazio.classList.add('visually-hidden');
    contadorVeiculos.textContent = `${veiculos.length} ${veiculos.length === 1 ? 'veículo' : 'veículos'}`;

    veiculos.forEach(veiculo => {
      const tr = document.createElement('tr');

      // Coluna ID
      const tdId = document.createElement('td');
      const strongId = document.createElement('strong');
      strongId.textContent = `#${veiculo.id}`;
      tdId.appendChild(strongId);
      tr.appendChild(tdId);

      // Coluna Marca (inserção segura com textContent)
      const tdMarca = document.createElement('td');
      tdMarca.textContent = veiculo.marca ?? '';
      tr.appendChild(tdMarca);

      // Coluna Modelo/Nome (inserção segura com textContent)
      const tdNome = document.createElement('td');
      tdNome.textContent = veiculo.nome ?? '';
      tr.appendChild(tdNome);

      // Coluna Ano
      const tdAno = document.createElement('td');
      tdAno.textContent = String(veiculo.ano ?? '');
      tr.appendChild(tdAno);

      // Coluna Preço
      const tdValor = document.createElement('td');
      tdValor.className = 'price-cell';
      tdValor.textContent = formatarMoeda(veiculo.valor);
      tr.appendChild(tdValor);

      // Coluna Ações
      const tdAcoes = document.createElement('td');
      tdAcoes.className = 'text-center';

      const actionsWrapper = document.createElement('div');
      actionsWrapper.className = 'table-actions';

      // Botão Visualizar
      const btnView = document.createElement('button');
      btnView.type = 'button';
      btnView.className = 'btn btn-sm btn-view';
      btnView.setAttribute('data-action', 'view');
      btnView.setAttribute('data-id', String(veiculo.id));
      btnView.textContent = 'Visualizar';

      // Botão Editar
      const btnEdit = document.createElement('button');
      btnEdit.type = 'button';
      btnEdit.className = 'btn btn-sm btn-edit';
      btnEdit.setAttribute('data-action', 'edit');
      btnEdit.setAttribute('data-id', String(veiculo.id));
      btnEdit.textContent = 'Editar';

      // Botão Excluir
      const btnDelete = document.createElement('button');
      btnDelete.type = 'button';
      btnDelete.className = 'btn btn-sm btn-delete';
      btnDelete.setAttribute('data-action', 'delete');
      btnDelete.setAttribute('data-id', String(veiculo.id));
      btnDelete.textContent = 'Excluir';

      actionsWrapper.appendChild(btnView);
      actionsWrapper.appendChild(btnEdit);
      actionsWrapper.appendChild(btnDelete);
      tdAcoes.appendChild(actionsWrapper);
      tr.appendChild(tdAcoes);

      tabelaCorpo.appendChild(tr);
    });
  }

  /**
   * Submete o formulário para Criar (POST) ou Atualizar (PUT)
   * Recarrega a lista da API após o sucesso
   */
  async function submeterFormulario(event) {
    event.preventDefault();

    const marca = inputMarca.value;
    const nome = inputNome.value;
    const ano = inputAno.value;
    const valor = inputValor.value;

    if (!validarCampos(marca, nome, ano, valor)) {
      return;
    }

    const payload = {
      marca: marca.trim(),
      nome: nome.trim(),
      ano: parseInt(ano, 10),
      valor: normalizarValorMonetario(valor)
    };

    btnSalvar.disabled = true;

    try {
      if (idEmEdicao !== null) {
        // Atualizar veículo existente via PUT /api/carros/{id}
        const resposta = await fetch(`${API_URL}/${idEmEdicao}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!resposta.ok) {
          throw new Error(`Erro ao atualizar veículo na API (Status HTTP: ${resposta.status})`);
        }

        exibirMensagem(`Veículo #${idEmEdicao} atualizado com sucesso na API!`, 'alert-success');
        cancelarModoEdicao();
      } else {
        // Criar novo veículo via POST /api/carros
        const resposta = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!resposta.ok) {
          throw new Error(`Erro ao cadastrar veículo na API (Status HTTP: ${resposta.status})`);
        }

        const veiculoCriado = await resposta.json().catch(() => null);
        const identificador = veiculoCriado && veiculoCriado.id ? `#${veiculoCriado.id}` : '';
        exibirMensagem(`Veículo ${identificador} cadastrado com sucesso na API!`, 'alert-success');
        form.reset();
      }

      // Recarrega os dados diretamente do backend após a gravação
      await carregarVeiculos();
    } catch (erro) {
      console.error('Erro na gravação do veículo:', erro);
      exibirMensagem(`Falha na operação: ${erro.message}`, 'alert-error');
    } finally {
      btnSalvar.disabled = false;
    }
  }

  /**
   * Obtém os dados do veículo pelo ID e preenche o formulário para edição
   */
  async function carregarParaEdicao(id) {
    try {
      const resposta = await fetch(`${API_URL}/${id}`);
      if (!resposta.ok) {
        throw new Error(`Veículo não encontrado na API (Status HTTP: ${resposta.status})`);
      }

      const veiculo = await resposta.json();

      idEmEdicao = veiculo.id;
      inputId.value = String(veiculo.id);
      inputMarca.value = veiculo.marca ?? '';
      inputNome.value = veiculo.nome ?? '';
      inputAno.value = String(veiculo.ano ?? '');
      inputValor.value = String(veiculo.valor ?? '');

      formTitulo.textContent = `Editar Veículo #${veiculo.id}`;
      formSubtitulo.textContent = 'Altere as informações e clique em Atualizar';
      btnSalvar.textContent = 'Atualizar Veículo';
      btnCancelar.classList.remove('visually-hidden');
      btnLimpar.classList.add('visually-hidden');

      inputMarca.focus();
    } catch (erro) {
      console.error('Erro ao buscar veículo para edição:', erro);
      exibirMensagem(`Não foi possível carregar o veículo para edição: ${erro.message}`, 'alert-error');
    }
  }

  /**
   * Cancela o modo de edição e restaura o formulário
   */
  function cancelarModoEdicao() {
    idEmEdicao = null;
    form.reset();
    inputId.value = '';
    formTitulo.textContent = 'Cadastrar Novo Veículo';
    formSubtitulo.textContent = 'Preencha os dados para registrar o veículo na API';
    btnSalvar.textContent = 'Salvar Veículo';
    btnCancelar.classList.add('visually-hidden');
    btnLimpar.classList.remove('visually-hidden');
  }

  /**
   * Remove um veículo da API (DELETE /api/carros/{id})
   * Recarrega a listagem após a exclusão
   */
  async function excluirVeiculo(id) {
    const confirmacao = window.confirm(`Confirma a exclusão do veículo #${id} na API?`);
    if (!confirmacao) return;

    try {
      const resposta = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!resposta.ok) {
        throw new Error(`Falha ao excluir veículo na API (Status HTTP: ${resposta.status})`);
      }

      if (idEmEdicao === id) {
        cancelarModoEdicao();
      }

      exibirMensagem(`Veículo #${id} excluído com sucesso da API!`, 'alert-info');

      // Recarrega os dados após a exclusão
      await carregarVeiculos();
    } catch (erro) {
      console.error('Erro ao excluir veículo:', erro);
      exibirMensagem(`Não foi possível excluir o veículo: ${erro.message}`, 'alert-error');
    }
  }

  /**
   * Visualiza os detalhes do veículo obtidos da API (GET /api/carros/{id})
   * Constrói o DOM do modal de forma segura usando textContent
   */
  async function visualizarDetalhes(id, disparador) {
    elementoDisparadorModal = disparador || document.activeElement;

    try {
      const resposta = await fetch(`${API_URL}/${id}`);
      if (!resposta.ok) {
        throw new Error(`Erro ao obter detalhes do veículo (Status HTTP: ${resposta.status})`);
      }

      const veiculo = await resposta.json();

      modalCorpo.replaceChildren();

      const detailList = document.createElement('div');
      detailList.className = 'detail-list';

      const campos = [
        { label: 'Identificador (ID):', valor: `#${veiculo.id}` },
        { label: 'Marca / Montadora:', valor: veiculo.marca ?? '' },
        { label: 'Modelo Comercial:', valor: veiculo.nome ?? '' },
        { label: 'Ano de Fabricação:', valor: String(veiculo.ano ?? '') },
        { label: 'Preço Estimado:', valor: formatarMoeda(veiculo.valor), isPrice: true }
      ];

      campos.forEach(campo => {
        const item = document.createElement('div');
        item.className = 'detail-item';

        const spanLabel = document.createElement('span');
        spanLabel.className = 'detail-label';
        spanLabel.textContent = campo.label;

        const spanValor = document.createElement('span');
        spanValor.className = `detail-value ${campo.isPrice ? 'price-cell' : ''}`;
        spanValor.textContent = campo.valor;

        item.appendChild(spanLabel);
        item.appendChild(spanValor);
        detailList.appendChild(item);
      });

      modalCorpo.appendChild(detailList);

      modalDetalhes.setAttribute('aria-hidden', 'false');
      modalDetalhes.classList.remove('visually-hidden');
      btnFecharModal.focus();
    } catch (erro) {
      console.error('Erro ao visualizar detalhes:', erro);
      exibirMensagem(`Falha ao carregar detalhes: ${erro.message}`, 'alert-error');
    }
  }

  /**
   * Fecha o modal de detalhes e restaura o foco
   */
  function fecharModal() {
    modalDetalhes.setAttribute('aria-hidden', 'true');
    modalDetalhes.classList.add('visually-hidden');
    modalCorpo.replaceChildren();

    if (elementoDisparadorModal && typeof elementoDisparadorModal.focus === 'function') {
      elementoDisparadorModal.focus();
      elementoDisparadorModal = null;
    }
  }

  // Delegação de eventos para as ações na tabela
  tabelaCorpo.addEventListener('click', (event) => {
    const target = event.target.closest('button[data-action]');
    if (!target) return;

    const action = target.getAttribute('data-action');
    const id = parseInt(target.getAttribute('data-id'), 10);
    if (isNaN(id)) return;

    if (action === 'view') {
      visualizarDetalhes(id, target);
    } else if (action === 'edit') {
      carregarParaEdicao(id);
    } else if (action === 'delete') {
      excluirVeiculo(id);
    }
  });

  // Event Listeners do formulário
  form.addEventListener('submit', submeterFormulario);

  form.addEventListener('reset', () => {
    cancelarModoEdicao();
  });

  btnCancelar.addEventListener('click', cancelarModoEdicao);

  // Event Listeners da Modal
  btnFecharModal.addEventListener('click', fecharModal);
  btnModalFecharRodape.addEventListener('click', fecharModal);
  modalDetalhes.addEventListener('click', (event) => {
    if (event.target === modalDetalhes) {
      fecharModal();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modalDetalhes.classList.contains('visually-hidden')) {
      fecharModal();
    }
  });

  // Inicialização da interface
  inputAno.setAttribute('max', String(anoMaximoPermitido));
  carregarVeiculos();

})();
