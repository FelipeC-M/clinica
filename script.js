const API_BASE = "https://clinica-backend-production-9b95.up.railway.app";

const CONFIG = {
  clientes: {
    nomeExibicao: "Cliente",
    rota: "clientes",
    campos: [
      { id: "nome",             label: "Nome",               tipo: "text",   maxlength: "100", placeholder: "Nome completo" },
      { id: "cpf",              label: "CPF",                tipo: "text",   maxlength: "14",  placeholder: "000.000.000-00", pattern: "\d{3}\.\d{3}\.\d{3}-\d{2}" },
      { id: "email",            label: "Email",              tipo: "email",  maxlength: "100", placeholder: "email@exemplo.com" },
      { id: "telefone",         label: "Telefone",           tipo: "text",   maxlength: "15",  placeholder: "(21) 00000-0000" },
      { id: "dataNascimento",   label: "Data de Nascimento", tipo: "date" }
    ]
  },
  profissionais: {
    nomeExibicao: "Profissional",
    rota: "profissionais",
    campos: [
      { id: "nome",              label: "Nome",               tipo: "text",  maxlength: "100", placeholder: "Nome completo" },
      { id: "cpf",               label: "CPF",                tipo: "text",  maxlength: "14",  placeholder: "000.000.000-00", pattern: "\d{3}\.\d{3}\.\d{3}-\d{2}" },
      { id: "email",             label: "Email",              tipo: "email", maxlength: "100", placeholder: "email@exemplo.com" },
      { id: "especialidade",     label: "Especialidade",      tipo: "text",  maxlength: "80",  placeholder: "Ex: Cardiologia" },
      { id: "registroConselho", label: "Registro (CRM/CRP)", tipo: "text",  maxlength: "20",  placeholder: "CRM-RJ 000000" },
      { id: "telefone",          label: "Telefone",           tipo: "text",  maxlength: "15",  placeholder: "(21) 00000-0000" },
      { id: "status",            label: "Status",             tipo: "text",  maxlength: "20",  placeholder: "Ativo" }
    ]
  },
  servicos: {
    nomeExibicao: "Serviço",
    rota: "servicos",
    campos: [
      { id: "nome",             label: "Nome do Serviço", tipo: "text",   maxlength: "100", placeholder: "Ex: Consulta Geral" },
      { id: "descricao",        label: "Descrição",       tipo: "text",   maxlength: "255", placeholder: "Breve descrição do serviço" },
      { id: "duracaoMinutos",  label: "Duração (min)",   tipo: "number", min: "5",   max: "480" },
      { id: "valor",            label: "Valor (R$)",      tipo: "number", step: "0.01", min: "0", max: "99999" },
      { id: "status",           label: "Status",          tipo: "text",   maxlength: "20",  placeholder: "Ativo" }
    ]
  },
  agendamentos: {
    nomeExibicao: "Agendamento",
    rota: "agendamentos",
    campos: [
      { id: "dataAgendamento",  label: "Data",                tipo: "date" },
      { id: "horaInicio",       label: "Hora Início",         tipo: "time" },
      { id: "horaFim",          label: "Hora Fim",            tipo: "time" },
      { id: "cliente.id",        label: "ID do Cliente",       tipo: "number", min: "1" },
      { id: "profissional.id",   label: "ID do Profissional",  tipo: "number", min: "1" },
      { id: "servico.id",        label: "ID do Serviço",       tipo: "number", min: "1" },
      { id: "status",            label: "Status",              tipo: "text",   maxlength: "20", placeholder: "Agendado" },
      { id: "observacoes",       label: "Observações",         tipo: "text",   maxlength: "255", placeholder: "Observações opcionais" }
    ]
  }
};

// --- FUNÇÕES DE APOIO ---
function getEntidadeSelecionada() { return document.getElementById("entidade").value; }
function getConfigAtual() { return CONFIG[getEntidadeSelecionada()]; }

const SUBTITULOS = {
  clientes:      "Gerencie os clientes da clínica",
  profissionais: "Gerencie os profissionais de saúde",
  servicos:      "Gerencie os serviços oferecidos",
  agendamentos:  "Gerencie os agendamentos e consultas"
};

const TITULOS = {
  clientes: "Clientes", profissionais: "Profissionais",
  servicos: "Serviços", agendamentos: "Agendamentos"
};

function ativarEntidade(entidade) {
  document.getElementById("entidade").value = entidade;
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.entidade === entidade);
  });
  document.getElementById("tituloPagina").textContent = TITULOS[entidade];
  document.getElementById("subtituloPagina").textContent = SUBTITULOS[entidade];
  renderizarFormulario();
  limparTabela();
  limparFormulario();
}

function mostrarMensagem(texto, tipo = "neutra") {
  const mensagem = document.getElementById("mensagem");
  mensagem.className = `mensagem ${tipo}`;
  const span = document.getElementById("mensagemTexto");
  if (span) span.textContent = texto;
  else mensagem.textContent = texto;
}

function mostrarResultado(dados) {
  document.getElementById("resultado").textContent = JSON.stringify(dados, null, 2);
}

function mostrarErro(texto) {
  mostrarMensagem(texto, "erro");
  document.getElementById("resultado").textContent = `Erro: ${texto}`;
}

function mensagemHttp(status, contexto) {
  const config = getConfigAtual();
  const entidade = config.nomeExibicao;
  const msgs = {
    400: `Dados inválidos. Verifique os campos preenchidos.`,
    404: `${entidade} não encontrado. Verifique se o ID existe.`,
    405: `Operação não permitida para ${entidade}.`,
    409: `Conflito de dados — pode já existir um registro com essas informações.`,
    422: `Dados incompletos ou mal formatados. Verifique os campos.`,
    500: `Erro interno no servidor. Tente novamente em instantes.`,
    503: `Servidor indisponível. Verifique se a API está rodando na porta certa.`,
  };
  if (msgs[status]) return msgs[status];
  if (status === 0) return `Não foi possível conectar ao servidor. Verifique se a API está rodando.`;
  return `${contexto} (código ${status})`;
}

function limparTabela() {
  document.getElementById("tabelaWrapper").innerHTML = '<p class="sem-dados">Nenhum dado carregado.</p>';
}

function limparFormulario() {
  const config = getConfigAtual();
  config.campos.forEach(c => {
    const el = document.getElementById(c.id);
    if (el) el.value = "";
  });
  document.getElementById("idRegistro").value = "";
}

// --- RENDERIZAÇÃO ---
function renderizarFormulario() {
  const formulario = document.getElementById("formularioDinamico");
  const config = getConfigAtual();
  formulario.innerHTML = "";
  config.campos.forEach(campo => {
    const wrapper = document.createElement("div");
    wrapper.className = "campo";
    const label = document.createElement("label");
    label.textContent = campo.label;
    const input = document.createElement("input");
    input.type = campo.tipo;
    input.id = campo.id;
    if (campo.step)        input.step = campo.step;
    if (campo.maxlength)   input.maxLength = campo.maxlength;
    if (campo.placeholder) input.placeholder = campo.placeholder;
    if (campo.pattern)     input.pattern = campo.pattern;
    if (campo.min)         input.min = campo.min;
    if (campo.max)         input.max = campo.max;
    if (campo.id === "cpf") aplicarMascaraCpf(input);
    if (campo.id === "telefone") aplicarMascaraTelefone(input);
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    formulario.appendChild(wrapper);
  });
}

function aplicarMascaraCpf(input) {
  input.addEventListener("input", () => {
    let v = input.value.replace(/\D/g, "").substring(0, 11);
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{0,3})/, "$1.$2");
    input.value = v;
  });
}

function aplicarMascaraTelefone(input) {
  input.addEventListener("input", () => {
    let v = input.value.replace(/\D/g, "").substring(0, 11);
    if (v.length > 10) v = v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    else if (v.length > 6) v = v.replace(/(\d{2})(\d{4,5})(\d{0,4})/, "($1) $2-$3");
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, "($1) $2");
    input.value = v;
  });
}

// --- FUNÇÃO RENDER TABELA ---
function renderTabela(dados) {
  const lista = Array.isArray(dados) ? dados : [dados];
  const wrapper = document.getElementById("tabelaWrapper");
  const entidade = getEntidadeSelecionada();

  if (!lista.length || !lista[0]) {
    wrapper.innerHTML = '<p class="sem-dados">Nenhum registro encontrado.</p>';
    return;
  }

  const nomesAmigaveis = {
    'id': 'ID', 'nome': 'Nome', 'cpf': 'CPF', 'email': 'E-mail', 'telefone': 'Telefone',
    'especialidade': 'Especialidade', 'status': 'Status', 'observacoes': 'Observações',
    'valor': 'Valor (R$)', 'descricao': 'Descrição', 'registroconselho': 'Registro/CRM',
    'registro_conselho': 'Registro/CRM', 'duracaominutos': 'Duração (min)',
    'duracao_minutos': 'Duração (min)', 'datanascimento': 'Data de Nascimento', 'dataNascimento': 'Data de Nascimento',
    'dataagendamento': 'Data do Agendamento', 'horainicio': 'Hora Início', 'horafim': 'Hora Fim'
  };

  let html = "<table><thead><tr>";
  const colunas = Object.keys(lista[0]).filter(k => typeof lista[0][k] !== 'object');

  colunas.forEach(col => {
    const nomeBonito = nomesAmigaveis[col.toLowerCase()] || col.toUpperCase();
    html += `<th>${nomeBonito}</th>`;
  });

  if (entidade === "agendamentos") html += "<th>CLIENTE</th><th>PROFISSIONAL</th>";
  html += "</tr></thead><tbody>";

  lista.forEach(item => {
    html += "<tr>";
    colunas.forEach(col => {
      let valor = item[col] ?? "";
      if (col.toLowerCase().includes('hora') && typeof valor === 'string' && valor.length >= 5) {
        valor = valor.substring(0, 5);
      }
      html += `<td>${valor}</td>`;
    });

    if (entidade === "agendamentos") {
      html += `<td>${item.cliente?.nome ?? item.cliente_id ?? "-"}</td>`;
      html += `<td>${item.profissional?.nome ?? item.profissional_id ?? "-"}</td>`;
    }
    html += "</tr>";
  });
  wrapper.innerHTML = html + "</tbody></table>";
}

// --- LÓGICA DE DADOS ---
function normalizarPayload(entidade, dados) {
  if (entidade === "agendamentos") {
    return {
      dataAgendamento: dados["dataAgendamento"],
      horaInicio: dados["horaInicio"],
      horaFim: dados["horaFim"],
      observacoes: dados["observacoes"],
      status: dados["status"] || "Agendado",
      cliente: { id: Number(dados["cliente.id"]) },
      profissional: { id: Number(dados["profissional.id"]) },
      servico: { id: Number(dados["servico.id"]) }
    };
  }
  return dados;
}

function coletarCampos() {
  const config = getConfigAtual();
  const campos = {};
  config.campos.forEach(c => {
    const el = document.getElementById(c.id);
    if (el) campos[c.id] = el.value;
  });
  return campos;
}

function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
}

function preencherFormulario(dados) {
  const config = getConfigAtual();
  config.campos.forEach(c => {
    const el = document.getElementById(c.id);
    if (!el) return;

    if (c.id === "cliente.id" && dados.cliente) {
      el.value = dados.cliente.id ?? "";
    } else if (c.id === "profissional.id" && dados.profissional) {
      el.value = dados.profissional.id ?? "";
    } else if (c.id === "servico.id" && dados.servico) {
      el.value = dados.servico.id ?? "";
    } else {
      const camel = snakeToCamel(c.id);
      el.value = dados[c.id] ?? dados[camel] ?? "";
    }
  });
}

// --- OPERAÇÕES API ---
async function listar() {
  const config = getConfigAtual();
  try {
    let res;
    try { res = await fetch(`${API_BASE}/${config.rota}`); }
    catch { throw new Error("Não foi possível conectar ao servidor. Verifique se a API está rodando na porta certa."); }
    if (!res.ok) throw new Error(mensagemHttp(res.status, 'Erro ao listar'));
    const dados = await res.json();
    renderTabela(dados);
    mostrarResultado(dados);
    mostrarMensagem("Lista carregada com sucesso!", "sucesso");
  } catch (e) {
    mostrarErro(e.message);
  }
}

async function buscarAgendaPorProfissional(idProfissional) {
    try {
        // Endpoint novo que criamos no Java
        const res = await fetch(`${API_BASE}/agendamentos/buscar-por-profissional/${idProfissional}`);
        
        if (!res.ok) throw new Error(mensagemHttp(res.status, 'Erro ao carregar agenda'));
        
        const dados = await res.json();
        
        // Se a lista vier vazia
        if (dados.length === 0) {
            limparTabela();
            mostrarMensagem("Este profissional não possui agendamentos.", "neutra");
            return;
        }

        renderTabela(dados); // Sua função que já monta a tabela
        mostrarResultado(dados); // Para o debug no JSON
        mostrarMensagem(`Agenda do profissional ${idProfissional} carregada!`, "sucesso");
    } catch (e) {
        mostrarErro(e.message);
    }
}

async function buscarPorId(id) {
  const config = getConfigAtual();
  try {
    const res = await fetch(`${API_BASE}/${config.rota}/${id}`);
    if (!res.ok) throw new Error(mensagemHttp(res.status, 'Erro ao buscar por ID'));
    const dados = await res.json().catch(() => { throw new Error(mensagemHttp(res.status, 'Erro ao buscar por ID')); });
    renderTabela(dados);
    mostrarResultado(dados);
    mostrarMensagem(`${config.nomeExibicao} encontrado!`, "sucesso");
    return dados;
  } catch (e) {
    mostrarErro(e.message);
    return null;
  }
}

async function buscarPorNome(nome) { // O parâmetro chama 'nome'
  const config = getConfigAtual();
  try {
    // Trocado 'valorDoInput' por 'nome'
    const res = await fetch(`${API_BASE}/agendamentos/buscar-por-nome?nome=${nome}`);
    
    if (!res.ok) throw new Error(mensagemHttp(res.status, 'Erro ao buscar por nome'));
    const dados = await res.json();
    
    // O resto continua igual...
    const lista = Array.isArray(dados) ? dados : [dados];
    if (!lista.length || !lista[0]) {
      limparTabela();
      mostrarResultado([]);
      mostrarMensagem(`Nenhum ${config.nomeExibicao.toLowerCase()} encontrado com esse nome.`, "erro");
      return;
    }
    renderTabela(dados);
    mostrarResultado(dados);
    mostrarMensagem(`${lista.length} registro(s) encontrado(s).`, "sucesso");
  } catch (e) {
    mostrarErro(e.message);
  }
}

async function adicionar() {
  const config = getConfigAtual();
  const entidade = getEntidadeSelecionada();
  const campos = coletarCampos();
  const payload = normalizarPayload(entidade, campos);

  try {
    const res = await fetch(`${API_BASE}/${config.rota}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // AJUSTE AQUI: Se não for OK, tenta ler o texto do erro enviado pelo Java
    if (!res.ok) {
      const textoErro = await res.text(); 
      throw new Error(textoErro || mensagemHttp(res.status, "Erro ao adicionar"));
    }

    const dados = await res.json().catch(() => ({}));
    mostrarResultado(dados);
    mostrarMensagem(`${config.nomeExibicao} cadastrado com sucesso!`, "sucesso");
    limparFormulario();
    listar();
  } catch (e) {
    mostrarErro(e.message);
  }
}

async function atualizar() {
  const config = getConfigAtual();
  const entidade = getEntidadeSelecionada();
  const id = document.getElementById("idRegistro").value;

  if (!id) {
    mostrarMensagem("Informe o ID do registro a ser atualizado.", "erro");
    return;
  }

  const campos = coletarCampos();
  const payload = normalizarPayload(entidade, campos);

  try {
    const res = await fetch(`${API_BASE}/${config.rota}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    // AJUSTE AQUI: Se não for OK, tenta ler o texto do erro enviado pelo Java
    if (!res.ok) {
      const textoErro = await res.text();
      throw new Error(textoErro || mensagemHttp(res.status, "Erro ao atualizar"));
    }

    const dados = await res.json().catch(() => ({}));
    mostrarResultado(dados);
    mostrarMensagem(`${config.nomeExibicao} atualizado com sucesso!`, "sucesso");
    limparFormulario();
    listar();
  } catch (e) {
    mostrarErro(e.message);
  }
}

async function deletar() {
  const config = getConfigAtual();
  const id = document.getElementById("idRegistro").value;

  if (!id) {
    mostrarMensagem("Informe o ID do registro a ser deletado.", "erro");
    return;
  }

  const confirmado = confirm(`Tem certeza que deseja deletar o ${config.nomeExibicao} de ID ${id}?`);
  if (!confirmado) return;

  try {
    const res = await fetch(`${API_BASE}/${config.rota}/${id}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error(mensagemHttp(res.status, "Erro ao deletar"));
    mostrarMensagem(`${config.nomeExibicao} deletado com sucesso!`, "sucesso");
    document.getElementById("resultado").textContent = `ID ${id} removido.`;
    limparFormulario();
    listar();
  } catch (e) {
    mostrarErro(e.message);
  }
}

// --- CONFIGURAÇÃO DE EVENTOS ---
function configurarEventos() {
  // Sidebar nav
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => ativarEntidade(btn.dataset.entidade));
  });

  // Listar
  document.getElementById("btnListar").addEventListener("click", listar);

  // Buscar por ID
  document.getElementById("btnBuscarId").addEventListener("click", () => {
    const id = document.getElementById("buscarId").value;
    if (!id) { mostrarMensagem("Digite um ID para buscar.", "erro"); return; }
    buscarPorId(id);
  });

  // Buscar por Nome
  document.getElementById("btnBuscarNome").addEventListener("click", () => {
    const nome = document.getElementById("buscarNome").value.trim();
    if (!nome) { mostrarMensagem("Digite um nome para buscar.", "erro"); return; }
    buscarPorNome(nome);
  });

  // Carregar dados no formulário ao sair do campo idRegistro (blur)
  document.getElementById("idRegistro").addEventListener("blur", async () => {
    const id = document.getElementById("idRegistro").value;
    if (!id) return;
    const dados = await buscarPorId(id);
    if (dados) preencherFormulario(dados);
  });

  // CRUD
  document.getElementById("btnAdicionar").addEventListener("click", adicionar);
  document.getElementById("btnAtualizar").addEventListener("click", atualizar);
  document.getElementById("btnDeletar").addEventListener("click", deletar);
}

window.addEventListener("DOMContentLoaded", () => {
  configurarEventos();
  renderizarFormulario();
});

//Buscar profissional por id
document.getElementById("btnBuscarProfissional").addEventListener("click", () => {
    const id = document.getElementById("buscarId").value;
    if (!id) { 
        mostrarMensagem("Por favor, digite o ID do profissional.", "erro"); 
        return; 
    }
    buscarAgendaPorProfissional(id);
});
