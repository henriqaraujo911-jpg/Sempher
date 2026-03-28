/* ============================================================
   SEMPHER FLYTEAM PROJECT – script.js
   Login + controle de acesso por função + dados editáveis
   ============================================================ */
'use strict';

/* ============================================================
   1. AUTENTICAÇÃO
   ============================================================ */
var AUTH = {
  MANAGER_USER: 'SempherFlyTeamProject',
  MANAGER_PASS: 'SempherRFCnine',
  SESSION_KEY:  'sft_session'
};

// Papel atual: 'manager' | 'guest' | null
var currentRole = null;

function getSession() {
  try { return JSON.parse(sessionStorage.getItem(AUTH.SESSION_KEY)); } catch(e) { return null; }
}
function setSession(role) {
  sessionStorage.setItem(AUTH.SESSION_KEY, JSON.stringify({ role: role }));
}
function clearSession() {
  sessionStorage.removeItem(AUTH.SESSION_KEY);
}

function isManager() { return currentRole === 'manager'; }

/* ============================================================
   2. TELA DE LOGIN
   ============================================================ */
var loginScreen = document.getElementById('loginScreen');
var appRoot     = document.getElementById('appRoot');

function showApp(role) {
  currentRole = role;
  setSession(role);

  // Esconde login, mostra app
  loginScreen.classList.add('hidden');
  appRoot.classList.remove('app-hidden');

  // Badge de sessão na sidebar
  var badge = document.getElementById('sessionBadge');
  if (badge) {
    if (role === 'manager') {
      badge.className = 'session-badge manager';
      badge.innerHTML = '<span class="session-dot manager"></span>MANAGER';
    } else {
      badge.className = 'session-badge guest';
      badge.innerHTML = '<span class="session-dot guest"></span>VISITANTE · SOMENTE LEITURA';
    }
  }

  // Badge no topbar
  var rtb = document.getElementById('roleTopbarBadge');
  if (rtb) {
    if (role === 'manager') {
      rtb.className = 'role-topbar-badge manager';
      rtb.textContent = '🔑 MANAGER';
    } else {
      rtb.className = 'role-topbar-badge guest';
      rtb.textContent = '👁 VISITANTE';
    }
  }

  // Inicia o app
  init();
}

function doLogin() {
  var user = document.getElementById('loginUser').value.trim();
  var pass = document.getElementById('loginPass').value;
  var errEl = document.getElementById('loginError');

  if (user === AUTH.MANAGER_USER && pass === AUTH.MANAGER_PASS) {
    errEl.classList.remove('visible');
    showApp('manager');
  } else {
    errEl.classList.remove('visible');
    // Força reflow para re-disparar animação de shake
    void errEl.offsetWidth;
    errEl.classList.add('visible');
    document.getElementById('loginPass').value = '';
    document.getElementById('loginPass').focus();
  }
}

function doLogout() {
  clearSession();
  currentRole = null;
  // Limpa inputs
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginError').classList.remove('visible');
  // Volta pra tela de login
  appRoot.classList.add('app-hidden');
  loginScreen.classList.remove('hidden');
}

// Eventos de login
document.getElementById('loginBtn').addEventListener('click', doLogin);
document.getElementById('loginGuest').addEventListener('click', function(){ showApp('guest'); });
document.getElementById('loginPass').addEventListener('keydown', function(e){ if (e.key === 'Enter') doLogin(); });
document.getElementById('loginUser').addEventListener('keydown', function(e){ if (e.key === 'Enter') document.getElementById('loginPass').focus(); });

// Mostrar/ocultar senha
document.getElementById('loginEye').addEventListener('click', function(){
  var inp = document.getElementById('loginPass');
  inp.type = inp.type === 'password' ? 'text' : 'password';
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', doLogout);

// Verifica sessão existente (recarregamento de página)
(function checkExistingSession() {
  var s = getSession();
  if (s && (s.role === 'manager' || s.role === 'guest')) {
    showApp(s.role);
  }
})();

/* ============================================================
   3. PROTEÇÃO DE EDIÇÃO – bloqueia guests
   ============================================================ */
var guestTipTimer = null;

function guardEdit(fn) {
  if (isManager()) return fn();
  showGuestTip();
}

function showGuestTip() {
  var tip = document.getElementById('guestLockTip');
  if (!tip) {
    tip = document.createElement('div');
    tip.id = 'guestLockTip';
    tip.className = 'guest-lock-tip';
    tip.textContent = '🔒 Apenas Managers podem editar. Faça login com suas credenciais.';
    document.body.appendChild(tip);
  }
  tip.classList.add('show');
  clearTimeout(guestTipTimer);
  guestTipTimer = setTimeout(function(){ tip.classList.remove('show'); }, 2800);
}

/* ============================================================
   4. DADOS PADRÃO + PERSISTÊNCIA
   ============================================================ */
var DEFAULT_DATA = {
  pilotos: [
    { id:1, nome:'Rafael Sempher', nickname:'SEMPH3R', emoji:'🏎️', nacionalidade:'🇧🇷 Brasil', status:'Ativo', especialidade:'GT3 / Endurance', simulador:'iRacing', estiloPilotagem:'Agressivo e consistente', equipamentos:{volante:'Fanatec DD Pro',pedais:'Heusinkveld Sprint',assento:'Next Level V3'}, bio:'Piloto fundador da equipe, Rafael construiu a Sempher FlyTeam do zero. Com mais de 5 anos de experiência no SimRacing competitivo, é reconhecido pela sua capacidade de extrair o máximo de qualquer setup.', conquistas:[{icon:'🏆',text:'Campeão GT3 Pro Series 2023'},{icon:'🥈',text:'Vice-Campeão iRacing Brasil 2022'},{icon:'🏁',text:'3x Pole Position Endurance 2024'}], stats:{corridas:148,vitorias:32,podios:67,pontos:2840} },
    { id:2, nome:'Lucas Aerofly', nickname:'AERO_77', emoji:'🎮', nacionalidade:'🇧🇷 Brasil', status:'Ativo', especialidade:'Formula / Oval', simulador:'Assetto Corsa Competizione', estiloPilotagem:'Técnico e calculista', equipamentos:{volante:'Thrustmaster T300',pedais:'Thrustmaster T-LCM',assento:'Playseat Challenge'}, bio:'Especialista em fórmulas e traçados ovais, Lucas traz uma abordagem científica para o setup e estratégia.', conquistas:[{icon:'🏆',text:'Campeão ACC Open Series 2024'},{icon:'🏅',text:'15 vitórias no iRacing Oval'},{icon:'⭐',text:'Piloto do Mês – Maio 2023'}], stats:{corridas:112,vitorias:24,podios:51,pontos:2110} },
    { id:3, nome:'Gabriel Velocity', nickname:'VELO_GBR', emoji:'🚀', nacionalidade:'🇧🇷 Brasil', status:'Ativo', especialidade:'Rally / Drift', simulador:'EA WRC', estiloPilotagem:'Instintivo e explosivo', equipamentos:{volante:'Logitech G923',pedais:'G923 Pedais',assento:'Prata Gamer'}, bio:'Gabriel é o coringa da equipe, dominando disciplinas que vão do rally ao drift.', conquistas:[{icon:'🥇',text:'Campeão WRC Virtual 2023'},{icon:'🔥',text:'3º lugar Drift Open 2024'},{icon:'🏆',text:'MVP Campeonato Misto 2022'}], stats:{corridas:97,vitorias:19,podios:41,pontos:1750} },
    { id:4, nome:'André Telemetry', nickname:'TELE_X', emoji:'📡', nacionalidade:'🇧🇷 Brasil', status:'Ativo', especialidade:'GT4 / LMP2', simulador:'rFactor 2', estiloPilotagem:'Analítico e preciso', equipamentos:{volante:'Simagic Alpha',pedais:'Heusinkveld Ultimate',assento:'GT Omega Prime'}, bio:'André é o estrategista da equipe. Analisa telemetria com precisão cirúrgica.', conquistas:[{icon:'🏆',text:'Vencedor 12h de Sebring Virtual 2024'},{icon:'📊',text:'Melhor setup LMP2 – rFactor 2 Brasil'},{icon:'🥈',text:'Vice-campeão GT4 Series 2023'}], stats:{corridas:88,vitorias:15,podios:38,pontos:1490} },
    { id:5, nome:'Felipe Apex', nickname:'FLY_APEX', emoji:'⚡', nacionalidade:'🇧🇷 Brasil', status:'Reserva', especialidade:'F1 / Open Wheel', simulador:'F1 24', estiloPilotagem:'Agressivo nas ultrapassagens', equipamentos:{volante:'Fanatec CSL DD',pedais:'Fanatec V3',assento:'Playseat Formula'}, bio:'Felipe é o talento jovem da equipe, com foco total em categorias open wheel.', conquistas:[{icon:'🏅',text:'Top 10 F1 Liga Brasileira 2024'},{icon:'⚡',text:'Qualificação mais rápida da temporada'}], stats:{corridas:54,vitorias:8,podios:22,pontos:920} },
    { id:6, nome:'Marcos Nitro', nickname:'NITRO_MK', emoji:'💨', nacionalidade:'🇧🇷 Brasil', status:'Inativo', especialidade:'GT3 / Sprint', simulador:'Assetto Corsa', estiloPilotagem:'Ofensivo e rápido', equipamentos:{volante:'Thrustmaster TS-XW',pedais:'Thrustmaster T-LCM',assento:'Cadeira gamer padrão'}, bio:'Marcos fez parte das primeiras temporadas da equipe, contribuindo com vitórias importantes.', conquistas:[{icon:'🏆',text:'2x Campeão Sprint GT3 2021-2022'},{icon:'🏁',text:'10 vitórias pela Sempher FlyTeam'}], stats:{corridas:76,vitorias:12,podios:29,pontos:1100} }
  ],
  titulos: [
    {id:1,nome:'GT3 Pro Series',ano:2023,categoria:'GT3',piloto:'Rafael Sempher',tipo:'Campeonato Online'},
    {id:2,nome:'ACC Open Series',ano:2024,categoria:'GT3 / GT4',piloto:'Lucas Aerofly',tipo:'Campeonato Online'},
    {id:3,nome:'WRC Virtual Championship',ano:2023,categoria:'Rally',piloto:'Gabriel Velocity',tipo:'Liga Fechada'},
    {id:4,nome:'Sprint GT3 Series',ano:2022,categoria:'GT3 Sprint',piloto:'Marcos Nitro',tipo:'Liga Fechada'},
    {id:5,nome:'Sprint GT3 Series',ano:2021,categoria:'GT3 Sprint',piloto:'Marcos Nitro',tipo:'Liga Fechada'},
    {id:6,nome:'12h de Sebring Virtual',ano:2024,categoria:'LMP2 Endurance',piloto:'André Telemetry',tipo:'Evento Especial'},
    {id:7,nome:'Campeonato Misto FlyTeam',ano:2022,categoria:'Multidisciplinar',piloto:'Gabriel Velocity',tipo:'Liga Interna'}
  ],
  campAtivos: [
    {id:1,nome:'iRacing GT3 Masters 2025',simulador:'iRacing',pilotos:['Rafael Sempher','Lucas Aerofly'],posicaoAtual:'2',pontos:'312',proximaCorrida:{nome:'Spa-Francorchamps GP',dataISO:'2025-04-12T20:00:00',data:'12 Abr 2025',horario:'20:00 BRT'}},
    {id:2,nome:'ACC Brasil Championship 2025',simulador:'ACC',pilotos:['André Telemetry','Felipe Apex'],posicaoAtual:'4',pontos:'187',proximaCorrida:{nome:'Nurburgring Sprint',dataISO:'2025-04-19T21:00:00',data:'19 Abr 2025',horario:'21:00 BRT'}},
    {id:3,nome:'WRC Liga Brasileira Season 3',simulador:'EA WRC',pilotos:['Gabriel Velocity'],posicaoAtual:'1',pontos:'278',proximaCorrida:{nome:'Rally Portugal - Etapa 4',dataISO:'2025-04-26T19:30:00',data:'26 Abr 2025',horario:'19:30 BRT'}}
  ],
  campFuturos: [
    {id:1,nome:'Endurance Masters 24H - Edicao 2025',data:'Jul 2025',simulador:'rFactor 2',pilotos:['Rafael Sempher','André Telemetry','Lucas Aerofly']},
    {id:2,nome:'F1 Liga Pro Brasil - S2 2025',data:'Ago 2025',simulador:'F1 24',pilotos:['Felipe Apex']},
    {id:3,nome:'FlyTeam Invitational Cup 2025',data:'Set 2025',simulador:'Multi-Sim',pilotos:['Todos os pilotos']},
    {id:4,nome:'SimRacing World Challenge - BR',data:'Out 2025',simulador:'iRacing',pilotos:['Rafael Sempher','Lucas Aerofly','André Telemetry']}
  ],
  campPassados: [
    {id:1,nome:'GT3 Pro Series',ano:2023,participantes:'Sempher, Aerofly',colocacao:'1º',destaque:'Título garantido na última etapa'},
    {id:2,nome:'iRacing Brasil Open',ano:2022,participantes:'Sempher',colocacao:'2º',destaque:'Vice com 2 vitórias consecutivas'},
    {id:3,nome:'WRC Virtual Championship',ano:2023,participantes:'Velocity',colocacao:'1º',destaque:'Domínio absoluto na temporada'},
    {id:4,nome:'Sprint GT3 Series',ano:2022,participantes:'Nitro',colocacao:'1º',destaque:'Bicampeonato do piloto'},
    {id:5,nome:'Sprint GT3 Series',ano:2021,participantes:'Nitro',colocacao:'1º',destaque:'9 vitórias em 12 etapas'},
    {id:6,nome:'rFactor 2 Endurance Open',ano:2023,participantes:'Telemetry, Sempher',colocacao:'3º',destaque:'Pódio de estreia no endurance'},
    {id:7,nome:'ACC Liga Fechada BR',ano:2022,participantes:'Aerofly, Apex',colocacao:'4º',destaque:'Melhor classificação coletiva na época'},
    {id:8,nome:'12h Sebring Virtual',ano:2024,participantes:'Telemetry',colocacao:'1º',destaque:'Venceu com margem de 4 voltas'},
    {id:9,nome:'ACC Open Series',ano:2024,participantes:'Aerofly',colocacao:'1º',destaque:'Título na penúltima etapa'},
    {id:10,nome:'F1 Liga Brasileira',ano:2024,participantes:'Apex',colocacao:'8º',destaque:'Melhor estreia entre os jovens pilotos'}
  ],
  resultadosRecentes: [
    {pos:1,piloto:'Rafael Sempher',corrida:'Monza GT Sprint',sim:'iRacing'},
    {pos:3,piloto:'Gabriel Velocity',corrida:'Rally Finlândia E3',sim:'EA WRC'},
    {pos:2,piloto:'Lucas Aerofly',corrida:'Suzuka ACC Open',sim:'ACC'},
    {pos:1,piloto:'André Telemetry',corrida:'3h Imola LMP2',sim:'rFactor 2'},
    {pos:5,piloto:'Felipe Apex',corrida:'Hungaroring F1 Liga',sim:'F1 24'}
  ]
};

var STORAGE_KEY = 'sempher_flyteam_data';
function loadData() {
  try { var s = localStorage.getItem(STORAGE_KEY); if (s) return JSON.parse(s); } catch(e){}
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}
function saveData() { if (isManager()) localStorage.setItem(STORAGE_KEY, JSON.stringify(DB)); }
function resetData() {
  if (!isManager()) return showGuestTip();
  if (!confirm('Resetar todos os dados para o padrão?')) return;
  localStorage.removeItem(STORAGE_KEY); location.reload();
}

var DB = {};  // preenchido no init()
function nextId(arr) { return arr.length ? Math.max.apply(null, arr.map(function(x){ return x.id; })) + 1 : 1; }

/* ============================================================
   5. MODAL DE EDIÇÃO
   ============================================================ */
function openModal(html, onSave) {
  var overlay = document.createElement('div');
  overlay.className = 'edit-overlay';
  overlay.innerHTML = '<div class="edit-modal"><div class="edit-modal-inner">' + html +
    '<div class="edit-actions"><button class="btn-cancel">Cancelar</button><button class="btn-save">💾 Salvar</button></div>' +
    '</div></div>';
  document.body.appendChild(overlay);
  requestAnimationFrame(function(){ overlay.classList.add('open'); });
  overlay.querySelector('.btn-cancel').addEventListener('click', function(){ closeModal(overlay); });
  overlay.querySelector('.btn-save').addEventListener('click', function(){ if (onSave(overlay)) closeModal(overlay); });
  overlay.addEventListener('click', function(e){ if (e.target === overlay) closeModal(overlay); });
  return overlay;
}
function closeModal(overlay) {
  overlay.classList.remove('open');
  setTimeout(function(){ overlay.remove(); }, 260);
}

function field(id, label, value, type) {
  type = type || 'text';
  var v = String(value == null ? '' : value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  return '<div class="ef-group"><label class="ef-label">' + label + '</label><input class="ef-input" id="' + id + '" type="' + type + '" value="' + v + '" /></div>';
}
function selectField(id, label, value, options) {
  var opts = options.map(function(o){ return '<option value="' + o + '"' + (o===value?' selected':'') + '>' + o + '</option>'; }).join('');
  return '<div class="ef-group"><label class="ef-label">' + label + '</label><select class="ef-input" id="' + id + '">' + opts + '</select></div>';
}
function textareaField(id, label, value, rows) {
  rows = rows || 3;
  var v = String(value == null ? '' : value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return '<div class="ef-group"><label class="ef-label">' + label + '</label><textarea class="ef-input ef-textarea" id="' + id + '" rows="' + rows + '">' + v + '</textarea></div>';
}
function val(overlay, id) { var el = overlay.querySelector('#' + id); return el ? el.value.trim() : ''; }

function showToast(msg, type) {
  type = type || 'success';
  var t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(function(){ t.classList.add('show'); });
  setTimeout(function(){ t.classList.remove('show'); setTimeout(function(){ t.remove(); }, 400); }, 2800);
}

/* ============================================================
   6. SIDEBAR & NAVEGAÇÃO
   ============================================================ */
var sidebar        = document.getElementById('sidebar');
var sidebarOverlay = document.getElementById('sidebarOverlay');
var hamburger      = document.getElementById('hamburger');
var sidebarToggle  = document.getElementById('sidebarToggle');
var breadcrumb     = document.getElementById('breadcrumb');

var PAGE_LABELS = { dashboard:'Dashboard', pilotos:'Pilotos', titulos:'Títulos', 'camp-ativos':'Campeonatos em Andamento', 'camp-futuros':'Campeonatos Futuros', 'camp-passados':'Histórico de Campeonatos', estatisticas:'Estatísticas Gerais' };

function openSidebar()  { sidebar.classList.add('open');    sidebarOverlay.classList.add('open'); }
function closeSidebar() { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('open'); }

hamburger.addEventListener('click', openSidebar);
sidebarToggle.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active'); });
  var t = document.getElementById('page-' + pageId);
  if (t) t.classList.add('active');
  document.querySelectorAll('.nav-link').forEach(function(l){ l.classList.toggle('active', l.dataset.page===pageId); });
  breadcrumb.textContent = PAGE_LABELS[pageId] || pageId;
  if (window.innerWidth <= 900) closeSidebar();
  if (pageId === 'estatisticas') setTimeout(animateBarChart, 120);
}

document.querySelectorAll('.nav-link').forEach(function(link){
  link.addEventListener('click', function(e){ e.preventDefault(); showPage(link.dataset.page); });
});

/* ============================================================
   7. COUNTDOWN CORRIGIDO
   Usa a data/hora real da próxima corrida (campo dataISO).
   Suporta formato "YYYY-MM-DDTHH:MM:SS" (hora local).
   ============================================================ */
var countdownInterval = null;

function startCountdown(dataISO) {
  // Cancela interval anterior, se houver
  if (countdownInterval) clearInterval(countdownInterval);

  function tick() {
    var el = document.getElementById('dashCountdown');
    if (!el) { clearInterval(countdownInterval); return; }

    var target = dataISO ? new Date(dataISO).getTime() : 0;
    var now    = Date.now();
    var diff   = target - now;

    if (!dataISO || isNaN(target) || diff <= 0) {
      // Corrida já começou ou sem data
      el.textContent = '00:00:00';
      el.style.color = '#ff4444';
      clearInterval(countdownInterval);
      return;
    }

    var totalSec = Math.floor(diff / 1000);
    var d  = Math.floor(totalSec / 86400);
    var h  = Math.floor((totalSec % 86400) / 3600);
    var m  = Math.floor((totalSec % 3600) / 60);
    var s  = totalSec % 60;

    if (d > 0) {
      el.textContent = d + 'd ' + pad(h) + ':' + pad(m) + ':' + pad(s);
    } else {
      el.textContent = pad(h) + ':' + pad(m) + ':' + pad(s);
    }
    el.style.color = '';
  }

  tick();
  countdownInterval = setInterval(tick, 1000);
}

function pad(n) { return String(n).padStart(2, '0'); }

/* ============================================================
   8. DASHBOARD
   ============================================================ */
function renderDashboard() {
  var ativos = DB.pilotos.filter(function(p){ return p.status==='Ativo'; }).length;
  animateCount('kpiPilotos', ativos);
  animateCount('kpiTitulos', DB.titulos.length);
  animateCount('kpiCamp',    DB.campAtivos.length);
  animateCount('kpiVitorias', DB.pilotos.reduce(function(a,p){ return a+p.stats.vitorias; }, 0));

  // Piloto destaque
  var destaque = DB.pilotos.filter(function(p){ return p.status==='Ativo'; })
    .sort(function(a,b){ return b.stats.vitorias - a.stats.vitorias; })[0];
  var fdEl = document.getElementById('featuredDriver');
  if (destaque && fdEl) {
    fdEl.innerHTML = '<div class="featured-label">⭐ PILOTO DESTAQUE</div>' +
      '<div class="featured-driver-inner">' +
        '<div class="featured-avatar">' + destaque.emoji + '</div>' +
        '<div class="featured-info">' +
          '<div class="driver-name">' + destaque.nome + '</div>' +
          '<div class="driver-nick">' + destaque.nickname + '</div>' +
          '<div class="featured-stats">' +
            '<div class="fstat"><span class="fstat-val">' + destaque.stats.vitorias + '</span><span class="fstat-lbl">Vitórias</span></div>' +
            '<div class="fstat"><span class="fstat-val">' + destaque.stats.podios + '</span><span class="fstat-lbl">Pódios</span></div>' +
            '<div class="fstat"><span class="fstat-val">' + destaque.stats.corridas + '</span><span class="fstat-lbl">Corridas</span></div>' +
          '</div>' +
          '<div style="margin-top:10px;font-size:.78rem;color:var(--white-dim)">' + destaque.especialidade + '</div>' +
        '</div>' +
      '</div>';
  }

  // Próxima corrida
  var prox  = DB.campAtivos[0];
  var nrEl  = document.getElementById('nextRaceCard');
  if (prox && nrEl) {
    var nr = prox.proximaCorrida;
    var editBtn = isManager()
      ? '<button class="edit-btn-inline" onclick="editNextRace(' + prox.id + ')">✏️ Editar corrida</button>'
      : '';
    nrEl.innerHTML =
      '<div class="next-race-label">🔴 PRÓXIMA CORRIDA</div>' +
      '<div class="next-race-content">' +
        '<div class="race-name">' + nr.nome + '</div>' +
        '<div class="next-race-meta">' +
          '<div class="race-meta-row">📅 <strong>' + nr.data + '</strong></div>' +
          '<div class="race-meta-row">🕐 <strong>' + nr.horario + '</strong></div>' +
          '<div class="race-meta-row">🏁 ' + prox.nome + '</div>' +
          '<div class="race-meta-row">🎮 ' + prox.simulador + '</div>' +
        '</div>' +
        '<div class="countdown" id="dashCountdown">--:--:--</div>' +
        '<div class="countdown-label">ATÉ O INÍCIO DA CORRIDA</div>' +
      '</div>' + editBtn;

    // Inicia countdown com a data real
    startCountdown(nr.dataISO || null);
  }

  // Resultados recentes
  var ul = document.getElementById('recentResults');
  if (ul) {
    ul.innerHTML = DB.resultadosRecentes.map(function(r, i){
      var posClass = r.pos===1?'p1':r.pos===2?'p2':r.pos===3?'p3':'other';
      var posLabel = r.pos===1?'🥇':r.pos===2?'🥈':r.pos===3?'🥉':r.pos+'º';
      var editBtns = isManager()
        ? '<button class="row-edit-btn" title="Editar" onclick="editResultado(' + i + ')">✏️</button>' +
          '<button class="row-del-btn"  title="Excluir" onclick="deleteResultado(' + i + ')">🗑️</button>'
        : '';
      return '<li class="result-item">' +
        '<div class="result-pos ' + posClass + '">' + posLabel + '</div>' +
        '<div class="result-info"><div class="result-race">' + r.corrida + '</div><div class="result-pilot">' + r.piloto + '</div></div>' +
        '<div class="result-sim">' + r.sim + '</div>' + editBtns +
      '</li>';
    }).join('');
  }

  // Botão adicionar resultado (apenas manager)
  var rrTitle = document.querySelector('.last-results-card .card-header-title');
  if (rrTitle && isManager() && !document.getElementById('btnAddResultado')) {
    var addBtn = document.createElement('button');
    addBtn.id = 'btnAddResultado';
    addBtn.className = 'btn-add-inline';
    addBtn.textContent = '+ Resultado';
    addBtn.onclick = addResultado;
    rrTitle.after(addBtn);
  }
}

function animateCount(elId, target, dur) {
  dur = dur || 900;
  var el = document.getElementById(elId); if (!el) return;
  var cur = 0; var step = Math.ceil(target / (dur / 16));
  var t = setInterval(function(){ cur += step; if (cur >= target) { cur=target; clearInterval(t); } el.textContent = cur; }, 16);
}

/* Editar próxima corrida */
function editNextRace(campId) {
  if (!isManager()) return showGuestTip();
  var c = DB.campAtivos.find(function(x){ return x.id===campId; }); if (!c) return;
  var nr = c.proximaCorrida;
  var html = '<div class="edit-modal-title">✏️ Próxima Corrida</div>' +
    field('nr_nome','Nome da Corrida', nr.nome) +
    field('nr_data','Data (ex: 12 Abr 2025)', nr.data) +
    field('nr_hora','Horário (ex: 20:00 BRT)', nr.horario) +
    field('nr_iso','Data/Hora Exata (YYYY-MM-DDTHH:MM:SS) para o contador', nr.dataISO||'');
  openModal(html, function(ov){
    nr.nome    = val(ov,'nr_nome');
    nr.data    = val(ov,'nr_data');
    nr.horario = val(ov,'nr_hora');
    nr.dataISO = val(ov,'nr_iso');
    saveData(); renderDashboard(); showToast('Próxima corrida atualizada!'); return true;
  });
}

function editResultado(idx) {
  if (!isManager()) return showGuestTip();
  var r = DB.resultadosRecentes[idx];
  openModal('<div class="edit-modal-title">✏️ Editar Resultado</div>' +
    field('r_pos','Posição',r.pos,'number') + field('r_piloto','Piloto',r.piloto) +
    field('r_corrida','Corrida',r.corrida) + field('r_sim','Simulador',r.sim),
  function(ov){
    DB.resultadosRecentes[idx]={pos:parseInt(val(ov,'r_pos'))||1,piloto:val(ov,'r_piloto'),corrida:val(ov,'r_corrida'),sim:val(ov,'r_sim')};
    saveData(); renderDashboard(); showToast('Resultado atualizado!'); return true;
  });
}
function deleteResultado(idx) {
  if (!isManager()) return showGuestTip();
  if (!confirm('Excluir resultado?')) return;
  DB.resultadosRecentes.splice(idx,1); saveData(); renderDashboard(); showToast('Removido.','warn');
}
function addResultado() {
  if (!isManager()) return showGuestTip();
  openModal('<div class="edit-modal-title">➕ Novo Resultado</div>' +
    field('r_pos','Posição','1','number') + field('r_piloto','Piloto','') +
    field('r_corrida','Corrida','') + field('r_sim','Simulador',''),
  function(ov){
    DB.resultadosRecentes.unshift({pos:parseInt(val(ov,'r_pos'))||1,piloto:val(ov,'r_piloto'),corrida:val(ov,'r_corrida'),sim:val(ov,'r_sim')});
    if (DB.resultadosRecentes.length>8) DB.resultadosRecentes.pop();
    saveData(); renderDashboard(); showToast('Resultado adicionado!'); return true;
  });
}

/* ============================================================
   9. PILOTOS
   ============================================================ */
var currentFilter = 'todos';
function renderPilots(filter) {
  if (filter!==undefined) currentFilter=filter;
  var grid = document.getElementById('pilotsGrid');
  var lista = currentFilter==='todos' ? DB.pilotos : DB.pilotos.filter(function(p){ return p.status===currentFilter; });

  grid.innerHTML = lista.map(function(p){
    var sc = {Ativo:'status-ativo',Reserva:'status-reserva',Inativo:'status-inativo'}[p.status]||'';
    var editBtns = isManager()
      ? '<div class="pilot-card-actions">' +
          '<button class="row-edit-btn" onclick="event.stopPropagation();editPilot(' + p.id + ')" title="Editar">✏️</button>' +
          '<button class="row-del-btn"  onclick="event.stopPropagation();deletePilot(' + p.id + ')" title="Excluir">🗑️</button>' +
        '</div>' : '';
    return '<div class="pilot-card" data-id="' + p.id + '">' + editBtns +
      '<div class="pilot-card-top"><div class="pilot-avatar">' + p.emoji + '</div>' +
        '<div><div class="pilot-card-name">' + p.nome + '</div><div class="pilot-card-nick">' + p.nickname + '</div></div>' +
      '</div>' +
      '<span class="pilot-status-badge ' + sc + '">' + p.status + '</span>' +
      '<div class="pilot-meta"><span>🌍 <strong>' + p.nacionalidade + '</strong></span><span>🎯 ' + p.especialidade + '</span><span>🎮 ' + p.simulador + '</span></div>' +
      '<div class="pilot-equip"><span class="equip-tag">🏎️ ' + p.equipamentos.volante + '</span><span class="equip-tag">🦶 ' + p.equipamentos.pedais + '</span></div>' +
      '<div class="pilot-stats-row">' +
        '<div class="pstat"><span class="pstat-val">' + p.stats.corridas + '</span><span class="pstat-lbl">Corridas</span></div>' +
        '<div class="pstat"><span class="pstat-val">' + p.stats.vitorias + '</span><span class="pstat-lbl">Vitórias</span></div>' +
        '<div class="pstat"><span class="pstat-val">' + p.stats.podios + '</span><span class="pstat-lbl">Pódios</span></div>' +
      '</div>' +
      '<button class="pilot-view-btn" onclick="event.stopPropagation();openPilotProfile(' + p.id + ')">VER PERFIL COMPLETO</button>' +
    '</div>';
  }).join('') || '<p style="color:var(--white-dim);padding:20px">Nenhum piloto encontrado.</p>';
}

document.querySelectorAll('.filter-btn').forEach(function(btn){
  btn.addEventListener('click', function(){
    document.querySelectorAll('.filter-btn').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active'); renderPilots(btn.dataset.filter);
  });
});

function editPilot(id) {
  if (!isManager()) return showGuestTip();
  var p = DB.pilotos.find(function(x){ return x.id===id; }); if (!p) return;
  var cStr = p.conquistas.map(function(c){ return c.icon+' '+c.text; }).join('\n');
  openModal(
    '<div class="edit-modal-title">✏️ Editar Piloto – ' + p.nome + '</div>' +
    '<div class="edit-cols">' +
      '<div class="edit-col"><div class="edit-section-label">INFORMAÇÕES GERAIS</div>' +
        field('p_nome','Nome Completo',p.nome) + field('p_nick','Nickname',p.nickname) +
        field('p_emoji','Emoji/Avatar',p.emoji) + field('p_nac','Nacionalidade',p.nacionalidade) +
        selectField('p_status','Status',p.status,['Ativo','Reserva','Inativo']) +
        field('p_espec','Especialidade',p.especialidade) + field('p_sim','Simulador',p.simulador) +
        field('p_estilo','Estilo de Pilotagem',p.estiloPilotagem) +
      '</div>' +
      '<div class="edit-col"><div class="edit-section-label">EQUIPAMENTOS</div>' +
        field('p_vol','Volante',p.equipamentos.volante) + field('p_ped','Pedais',p.equipamentos.pedais) + field('p_ass','Assento',p.equipamentos.assento) +
        '<div class="edit-section-label" style="margin-top:16px">ESTATÍSTICAS</div>' +
        field('p_cor','Corridas',p.stats.corridas,'number') + field('p_vit','Vitórias',p.stats.vitorias,'number') +
        field('p_pod','Pódios',p.stats.podios,'number') + field('p_pts','Pontos',p.stats.pontos,'number') +
      '</div>' +
    '</div>' +
    '<div class="edit-section-label" style="margin-top:16px">BIOGRAFIA</div>' + textareaField('p_bio','Bio',p.bio,3) +
    '<div class="edit-section-label" style="margin-top:12px">CONQUISTAS (uma por linha: emoji texto)</div>' + textareaField('p_con','Conquistas',cStr,4),
  function(ov){
    var cl = val(ov,'p_con').split('\n').filter(function(l){ return l.trim(); });
    var conquistas = cl.map(function(l){ return {icon:Array.from(l.trim())[0]||'🏆',text:l.trim().replace(/^\S+\s*/,'')}; });
    p.nome=val(ov,'p_nome'); p.nickname=val(ov,'p_nick'); p.emoji=val(ov,'p_emoji');
    p.nacionalidade=val(ov,'p_nac'); p.status=val(ov,'p_status'); p.especialidade=val(ov,'p_espec');
    p.simulador=val(ov,'p_sim'); p.estiloPilotagem=val(ov,'p_estilo'); p.bio=val(ov,'p_bio');
    p.conquistas=conquistas;
    p.equipamentos={volante:val(ov,'p_vol'),pedais:val(ov,'p_ped'),assento:val(ov,'p_ass')};
    p.stats={corridas:parseInt(val(ov,'p_cor'))||0,vitorias:parseInt(val(ov,'p_vit'))||0,podios:parseInt(val(ov,'p_pod'))||0,pontos:parseInt(val(ov,'p_pts'))||0};
    saveData(); renderPilots(); renderDashboard(); renderEstatisticas();
    showToast(p.nome+' atualizado!'); return true;
  });
}

function addPilot() {
  if (!isManager()) return showGuestTip();
  openModal(
    '<div class="edit-modal-title">➕ Adicionar Piloto</div>' +
    '<div class="edit-cols">' +
      '<div class="edit-col"><div class="edit-section-label">INFORMAÇÕES GERAIS</div>' +
        field('p_nome','Nome Completo','') + field('p_nick','Nickname','') + field('p_emoji','Emoji','🏎️') +
        field('p_nac','Nacionalidade','🇧🇷 Brasil') + selectField('p_status','Status','Ativo',['Ativo','Reserva','Inativo']) +
        field('p_espec','Especialidade','') + field('p_sim','Simulador','') + field('p_estilo','Estilo','') +
      '</div>' +
      '<div class="edit-col"><div class="edit-section-label">EQUIPAMENTOS</div>' +
        field('p_vol','Volante','') + field('p_ped','Pedais','') + field('p_ass','Assento','') +
        '<div class="edit-section-label" style="margin-top:16px">ESTATÍSTICAS</div>' +
        field('p_cor','Corridas','0','number') + field('p_vit','Vitórias','0','number') +
        field('p_pod','Pódios','0','number') + field('p_pts','Pontos','0','number') +
      '</div>' +
    '</div>' +
    textareaField('p_bio','Biografia','',3) +
    '<div class="edit-section-label" style="margin-top:12px">CONQUISTAS (uma por linha)</div>' + textareaField('p_con','Conquistas','',3),
  function(ov){
    var nome=val(ov,'p_nome'); if (!nome){ showToast('Nome obrigatório!','error'); return false; }
    var cl=val(ov,'p_con').split('\n').filter(function(l){ return l.trim(); });
    DB.pilotos.push({id:nextId(DB.pilotos),nome:nome,nickname:val(ov,'p_nick'),emoji:val(ov,'p_emoji'),
      nacionalidade:val(ov,'p_nac'),status:val(ov,'p_status'),especialidade:val(ov,'p_espec'),
      simulador:val(ov,'p_sim'),estiloPilotagem:val(ov,'p_estilo'),bio:val(ov,'p_bio'),
      conquistas:cl.map(function(l){ return {icon:Array.from(l.trim())[0]||'🏆',text:l.trim().replace(/^\S+\s*/,'')}; }),
      equipamentos:{volante:val(ov,'p_vol'),pedais:val(ov,'p_ped'),assento:val(ov,'p_ass')},
      stats:{corridas:parseInt(val(ov,'p_cor'))||0,vitorias:parseInt(val(ov,'p_vit'))||0,podios:parseInt(val(ov,'p_pod'))||0,pontos:parseInt(val(ov,'p_pts'))||0}
    });
    saveData(); renderPilots(); renderDashboard(); renderEstatisticas();
    showToast(nome+' adicionado!'); return true;
  });
}

function deletePilot(id) {
  if (!isManager()) return showGuestTip();
  var p=DB.pilotos.find(function(x){ return x.id===id; });
  if (!p||!confirm('Excluir "'+p.nome+'"?')) return;
  DB.pilotos=DB.pilotos.filter(function(x){ return x.id!==id; });
  saveData(); renderPilots(); renderDashboard(); renderEstatisticas(); showToast(p.nome+' removido.','warn');
}

/* ============================================================
   10. PERFIL DO PILOTO
   ============================================================ */
function openPilotProfile(id) {
  var p=DB.pilotos.find(function(x){ return x.id===id; }); if (!p) return;
  var taxa=p.stats.corridas?((p.stats.vitorias/p.stats.corridas)*100).toFixed(1):'0.0';
  var sc={Ativo:'status-ativo',Reserva:'status-reserva',Inativo:'status-inativo'}[p.status]||'';
  var editBtn = isManager() ? '<button class="profile-edit-btn" onclick="editPilot('+p.id+')">✏️ Editar</button>' : '';
  document.getElementById('pilotProfileModal').innerHTML =
    '<button class="profile-close" id="profileClose">&#10005;</button>' + editBtn +
    '<div class="profile-header">' +
      '<div class="profile-avatar">'+p.emoji+'</div>' +
      '<div class="profile-name-block">' +
        '<div class="profile-fullname">'+p.nome+'</div>' +
        '<div class="profile-nickname">'+p.nickname+'</div>' +
        '<span class="pilot-status-badge '+sc+'">'+p.status+'</span>' +
      '</div>' +
    '</div>' +
    '<div class="profile-body">' +
      '<div>' +
        '<div class="profile-section"><div class="profile-section-title">Informações Gerais</div>' +
          '<div class="profile-row"><span class="prow-key">Nacionalidade</span><span class="prow-val">'+p.nacionalidade+'</span></div>' +
          '<div class="profile-row"><span class="prow-key">Especialidade</span><span class="prow-val">'+p.especialidade+'</span></div>' +
          '<div class="profile-row"><span class="prow-key">Simulador</span><span class="prow-val">'+p.simulador+'</span></div>' +
          '<div class="profile-row"><span class="prow-key">Estilo</span><span class="prow-val">'+p.estiloPilotagem+'</span></div>' +
        '</div>' +
        '<div class="profile-section"><div class="profile-section-title">Equipamentos</div>' +
          '<div class="profile-row"><span class="prow-key">🏎️ Volante</span><span class="prow-val">'+p.equipamentos.volante+'</span></div>' +
          '<div class="profile-row"><span class="prow-key">🦶 Pedais</span><span class="prow-val">'+p.equipamentos.pedais+'</span></div>' +
          '<div class="profile-row"><span class="prow-key">💺 Assento</span><span class="prow-val">'+p.equipamentos.assento+'</span></div>' +
        '</div>' +
        '<div class="profile-section"><div class="profile-section-title">Biografia</div><p class="profile-bio">'+p.bio+'</p></div>' +
      '</div>' +
      '<div>' +
        '<div class="profile-section"><div class="profile-section-title">Estatísticas</div>' +
          '<div class="profile-stats-grid">' +
            '<div class="pstat-big"><span class="pstat-big-val">'+p.stats.corridas+'</span><span class="pstat-big-lbl">Corridas</span></div>' +
            '<div class="pstat-big"><span class="pstat-big-val">'+p.stats.vitorias+'</span><span class="pstat-big-lbl">Vitórias</span></div>' +
            '<div class="pstat-big"><span class="pstat-big-val">'+p.stats.podios+'</span><span class="pstat-big-lbl">Pódios</span></div>' +
            '<div class="pstat-big"><span class="pstat-big-val">'+taxa+'%</span><span class="pstat-big-lbl">Taxa Vitória</span></div>' +
            '<div class="pstat-big"><span class="pstat-big-val">'+p.stats.pontos+'</span><span class="pstat-big-lbl">Pontos</span></div>' +
            '<div class="pstat-big"><span class="pstat-big-val">'+p.conquistas.length+'</span><span class="pstat-big-lbl">Títulos</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="profile-section"><div class="profile-section-title">Conquistas</div>' +
          '<div class="achievements-list">'+p.conquistas.map(function(c){ return '<div class="achievement-item"><span class="ach-icon">'+c.icon+'</span><span class="ach-text">'+c.text+'</span></div>'; }).join('')+'</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  var ov=document.getElementById('pilotProfileOverlay');
  ov.classList.add('open');
  document.getElementById('profileClose').addEventListener('click', closePilotProfile);
  ov.addEventListener('click', function(e){ if(e.target===ov) closePilotProfile(); });
}
function closePilotProfile() { document.getElementById('pilotProfileOverlay').classList.remove('open'); }

/* ============================================================
   11. TÍTULOS
   ============================================================ */
function renderTitulos() {
  var grid=document.getElementById('titlesGrid');
  grid.innerHTML=DB.titulos.map(function(t){
    var eb=isManager()?'<div class="title-card-actions"><button class="row-edit-btn" onclick="editTitulo('+t.id+')">✏️</button><button class="row-del-btn" onclick="deleteTitulo('+t.id+')">🗑️</button></div>':'';
    return '<div class="title-card">'+eb+'<div class="title-trophy">🏆</div><span class="title-year-badge">'+t.ano+'</span>' +
      '<div class="title-name">'+t.nome+'</div><div class="title-meta"><span>📂 <strong>'+t.categoria+'</strong></span><span>👤 '+t.piloto+'</span></div>' +
      '<span class="title-type-badge">'+t.tipo+'</span></div>';
  }).join('');
}
function editTitulo(id) {
  if (!isManager()) return showGuestTip();
  var t=DB.titulos.find(function(x){ return x.id===id; }); if (!t) return;
  openModal('<div class="edit-modal-title">✏️ Editar Título</div>'+
    field('t_nome','Nome',t.nome)+field('t_ano','Ano',t.ano,'number')+
    field('t_cat','Categoria',t.categoria)+field('t_piloto','Piloto(s)',t.piloto)+field('t_tipo','Tipo',t.tipo),
  function(ov){ t.nome=val(ov,'t_nome');t.ano=parseInt(val(ov,'t_ano'))||t.ano;t.categoria=val(ov,'t_cat');t.piloto=val(ov,'t_piloto');t.tipo=val(ov,'t_tipo');
    saveData();renderTitulos();renderDashboard();showToast('Título atualizado!');return true; });
}
function addTitulo() {
  if (!isManager()) return showGuestTip();
  openModal('<div class="edit-modal-title">➕ Novo Título</div>'+
    field('t_nome','Nome','')+field('t_ano','Ano',new Date().getFullYear(),'number')+
    field('t_cat','Categoria','')+field('t_piloto','Piloto(s)','')+field('t_tipo','Tipo','Campeonato Online'),
  function(ov){ var n=val(ov,'t_nome');if(!n){showToast('Nome obrigatório!','error');return false;}
    DB.titulos.push({id:nextId(DB.titulos),nome:n,ano:parseInt(val(ov,'t_ano'))||2025,categoria:val(ov,'t_cat'),piloto:val(ov,'t_piloto'),tipo:val(ov,'t_tipo')});
    saveData();renderTitulos();renderDashboard();showToast('Título adicionado!');return true; });
}
function deleteTitulo(id) {
  if (!isManager()) return showGuestTip();
  var t=DB.titulos.find(function(x){ return x.id===id; });
  if (!t||!confirm('Excluir "'+t.nome+'"?')) return;
  DB.titulos=DB.titulos.filter(function(x){ return x.id!==id; });
  saveData();renderTitulos();renderDashboard();showToast('Título removido.','warn');
}

/* ============================================================
   12. CAMP ATIVOS
   ============================================================ */
function renderCampAtivos() {
  var grid=document.getElementById('champActivesGrid');
  grid.innerHTML=DB.campAtivos.map(function(c){
    var eb=isManager()?'<div class="champ-card-actions"><button class="row-edit-btn" onclick="editCampAtivo('+c.id+')">✏️</button><button class="row-del-btn" onclick="deleteCampAtivo('+c.id+')">🗑️</button></div>':'';
    return '<div class="champ-card">'+eb+
      '<div class="champ-status-dot" style="color:#ff4444"><span class="dot dot-live"></span> AO VIVO</div>' +
      '<div class="champ-name">'+c.nome+'</div>' +
      '<div class="champ-meta"><span>🎮 <strong>'+c.simulador+'</strong></span><span>🏅 '+c.pontos+' pts</span></div>' +
      '<div class="champ-position"><div><div class="pos-num">'+c.posicaoAtual+'º</div></div>' +
        '<div><div class="pos-label">POSIÇÃO ATUAL</div><div style="font-size:.82rem;color:var(--white-dim)">'+c.posicaoAtual+'º lugar</div></div></div>' +
      '<div class="next-race-row">📅 <strong>Próxima:</strong> '+c.proximaCorrida.nome+' – '+c.proximaCorrida.data+'</div>' +
      '<div class="pilots-chips" style="margin-top:12px">'+c.pilotos.map(function(pp){ return '<span class="pilot-chip">'+pp+'</span>'; }).join('')+'</div>' +
    '</div>';
  }).join('');
}
function editCampAtivo(id) {
  if (!isManager()) return showGuestTip();
  var c=DB.campAtivos.find(function(x){ return x.id===id; }); if (!c) return;
  openModal('<div class="edit-modal-title">✏️ Campeonato Ativo</div>'+
    field('ca_nome','Nome',c.nome)+field('ca_sim','Simulador',c.simulador)+
    field('ca_pos','Posição Atual',c.posicaoAtual,'number')+field('ca_pts','Pontos',c.pontos)+
    field('ca_pil','Pilotos (vírgula)',c.pilotos.join(', '))+
    '<div class="edit-section-label" style="margin-top:14px">PRÓXIMA CORRIDA</div>'+
    field('ca_nn','Nome da Corrida',c.proximaCorrida.nome)+
    field('ca_nd','Data (ex: 12 Abr 2025)',c.proximaCorrida.data)+
    field('ca_nh','Horário',c.proximaCorrida.horario)+
    field('ca_ni','Data/Hora Exata (YYYY-MM-DDTHH:MM:SS)',c.proximaCorrida.dataISO||''),
  function(ov){
    c.nome=val(ov,'ca_nome');c.simulador=val(ov,'ca_sim');c.posicaoAtual=val(ov,'ca_pos');c.pontos=val(ov,'ca_pts');
    c.pilotos=val(ov,'ca_pil').split(',').map(function(s){ return s.trim(); }).filter(Boolean);
    c.proximaCorrida={nome:val(ov,'ca_nn'),data:val(ov,'ca_nd'),horario:val(ov,'ca_nh'),dataISO:val(ov,'ca_ni')};
    saveData();renderCampAtivos();renderDashboard();showToast('Campeonato atualizado!');return true;
  });
}
function addCampAtivo() {
  if (!isManager()) return showGuestTip();
  openModal('<div class="edit-modal-title">➕ Novo Campeonato Ativo</div>'+
    field('ca_nome','Nome','')+field('ca_sim','Simulador','')+
    field('ca_pos','Posição','1','number')+field('ca_pts','Pontos','')+field('ca_pil','Pilotos (vírgula)','')+
    '<div class="edit-section-label" style="margin-top:14px">PRÓXIMA CORRIDA</div>'+
    field('ca_nn','Nome da Corrida','')+field('ca_nd','Data','')+field('ca_nh','Horário','')+
    field('ca_ni','Data/Hora Exata (YYYY-MM-DDTHH:MM:SS)',''),
  function(ov){ var n=val(ov,'ca_nome');if(!n){showToast('Nome obrigatório!','error');return false;}
    DB.campAtivos.push({id:nextId(DB.campAtivos),nome:n,simulador:val(ov,'ca_sim'),posicaoAtual:val(ov,'ca_pos'),pontos:val(ov,'ca_pts'),
      pilotos:val(ov,'ca_pil').split(',').map(function(s){ return s.trim(); }).filter(Boolean),
      proximaCorrida:{nome:val(ov,'ca_nn'),data:val(ov,'ca_nd'),horario:val(ov,'ca_nh'),dataISO:val(ov,'ca_ni')}});
    saveData();renderCampAtivos();renderDashboard();showToast('Adicionado!');return true; });
}
function deleteCampAtivo(id) {
  if (!isManager()) return showGuestTip();
  var c=DB.campAtivos.find(function(x){ return x.id===id; });
  if (!c||!confirm('Excluir "'+c.nome+'"?')) return;
  DB.campAtivos=DB.campAtivos.filter(function(x){ return x.id!==id; });
  saveData();renderCampAtivos();renderDashboard();showToast('Removido.','warn');
}

/* ============================================================
   13. CAMP FUTUROS
   ============================================================ */
function renderCampFuturos() {
  var grid=document.getElementById('champFutureGrid');
  grid.innerHTML=DB.campFuturos.map(function(c){
    var eb=isManager()?'<div class="champ-card-actions"><button class="row-edit-btn" onclick="editCampFuturo('+c.id+')">✏️</button><button class="row-del-btn" onclick="deleteCampFuturo('+c.id+')">🗑️</button></div>':'';
    return '<div class="champ-card">'+eb+
      '<div class="champ-status-dot" style="color:var(--gold)"><span class="dot dot-future"></span> EM BREVE</div>'+
      '<span class="champ-date-badge">'+c.data+'</span>'+
      '<div class="champ-name">'+c.nome+'</div>'+
      '<div class="champ-meta"><span>🎮 <strong>'+c.simulador+'</strong></span></div>'+
      '<div class="pilots-chips" style="margin-top:14px">'+c.pilotos.map(function(pp){ return '<span class="pilot-chip">'+pp+'</span>'; }).join('')+'</div>'+
    '</div>';
  }).join('');
}
function editCampFuturo(id) {
  if (!isManager()) return showGuestTip();
  var c=DB.campFuturos.find(function(x){ return x.id===id; }); if (!c) return;
  openModal('<div class="edit-modal-title">✏️ Campeonato Futuro</div>'+
    field('cf_nome','Nome',c.nome)+field('cf_data','Previsão',c.data)+
    field('cf_sim','Simulador',c.simulador)+field('cf_pil','Pilotos (vírgula)',c.pilotos.join(', ')),
  function(ov){ c.nome=val(ov,'cf_nome');c.data=val(ov,'cf_data');c.simulador=val(ov,'cf_sim');
    c.pilotos=val(ov,'cf_pil').split(',').map(function(s){ return s.trim(); }).filter(Boolean);
    saveData();renderCampFuturos();showToast('Atualizado!');return true; });
}
function addCampFuturo() {
  if (!isManager()) return showGuestTip();
  openModal('<div class="edit-modal-title">➕ Novo Campeonato Futuro</div>'+
    field('cf_nome','Nome','')+field('cf_data','Previsão','')+field('cf_sim','Simulador','')+field('cf_pil','Pilotos (vírgula)',''),
  function(ov){ var n=val(ov,'cf_nome');if(!n){showToast('Nome obrigatório!','error');return false;}
    DB.campFuturos.push({id:nextId(DB.campFuturos),nome:n,data:val(ov,'cf_data'),simulador:val(ov,'cf_sim'),
      pilotos:val(ov,'cf_pil').split(',').map(function(s){ return s.trim(); }).filter(Boolean)});
    saveData();renderCampFuturos();showToast('Adicionado!');return true; });
}
function deleteCampFuturo(id) {
  if (!isManager()) return showGuestTip();
  var c=DB.campFuturos.find(function(x){ return x.id===id; });
  if (!c||!confirm('Excluir "'+c.nome+'"?')) return;
  DB.campFuturos=DB.campFuturos.filter(function(x){ return x.id!==id; });
  saveData();renderCampFuturos();showToast('Removido.','warn');
}

/* ============================================================
   14. CAMP PASSADOS
   ============================================================ */
function renderCampPassados() {
  var tbody=document.getElementById('champPastBody');
  tbody.innerHTML=DB.campPassados.map(function(c){
    var pn=parseInt(c.colocacao);
    var pc=pn===1?'pos-1':pn===2?'pos-2':pn===3?'pos-3':'';
    var md=pn===1?'🥇':pn===2?'🥈':pn===3?'🥉':'';
    var eb=isManager()?'<td class="td-actions"><button class="row-edit-btn" onclick="editCampPassado('+c.id+')">✏️</button><button class="row-del-btn" onclick="deleteCampPassado('+c.id+')">🗑️</button></td>':'<td></td>';
    return '<tr><td><strong>'+c.nome+'</strong></td><td>'+c.ano+'</td><td>'+c.participantes+'</td>'+
      '<td><span class="pos-badge '+pc+'">'+md+' '+c.colocacao+'</span></td>'+
      '<td style="color:var(--white-dim);font-size:.82rem">'+c.destaque+'</td>'+eb+'</tr>';
  }).join('');
}
function editCampPassado(id) {
  if (!isManager()) return showGuestTip();
  var c=DB.campPassados.find(function(x){ return x.id===id; }); if (!c) return;
  openModal('<div class="edit-modal-title">✏️ Campeonato Passado</div>'+
    field('cp_nome','Nome',c.nome)+field('cp_ano','Ano',c.ano,'number')+
    field('cp_part','Participantes',c.participantes)+field('cp_col','Colocação (ex: 1º)',c.colocacao)+
    textareaField('cp_dest','Destaque',c.destaque,2),
  function(ov){ c.nome=val(ov,'cp_nome');c.ano=parseInt(val(ov,'cp_ano'))||c.ano;
    c.participantes=val(ov,'cp_part');c.colocacao=val(ov,'cp_col');c.destaque=val(ov,'cp_dest');
    saveData();renderCampPassados();showToast('Atualizado!');return true; });
}
function addCampPassado() {
  if (!isManager()) return showGuestTip();
  openModal('<div class="edit-modal-title">➕ Novo Campeonato Passado</div>'+
    field('cp_nome','Nome','')+field('cp_ano','Ano',new Date().getFullYear(),'number')+
    field('cp_part','Participantes','')+field('cp_col','Colocação (ex: 1º)','')+textareaField('cp_dest','Destaque','',2),
  function(ov){ var n=val(ov,'cp_nome');if(!n){showToast('Nome obrigatório!','error');return false;}
    DB.campPassados.push({id:nextId(DB.campPassados),nome:n,ano:parseInt(val(ov,'cp_ano'))||2025,
      participantes:val(ov,'cp_part'),colocacao:val(ov,'cp_col'),destaque:val(ov,'cp_dest')});
    saveData();renderCampPassados();showToast('Adicionado!');return true; });
}
function deleteCampPassado(id) {
  if (!isManager()) return showGuestTip();
  var c=DB.campPassados.find(function(x){ return x.id===id; });
  if (!c||!confirm('Excluir "'+c.nome+'"?')) return;
  DB.campPassados=DB.campPassados.filter(function(x){ return x.id!==id; });
  saveData();renderCampPassados();showToast('Removido.','warn');
}

/* ============================================================
   15. ESTATÍSTICAS
   ============================================================ */
function renderEstatisticas() {
  var tc=DB.pilotos.reduce(function(a,p){ return a+p.stats.corridas; },0);
  var tv=DB.pilotos.reduce(function(a,p){ return a+p.stats.vitorias; },0);
  var tp=DB.pilotos.reduce(function(a,p){ return a+p.stats.podios; },0);
  var tg=tc?((tv/tc)*100).toFixed(1):'0.0';
  var tn=DB.pilotos.reduce(function(a,p){ return a+p.stats.pontos; },0);

  var data=[
    {icon:'🏁',val:tc,label:'Corridas Totais',sub:'todas as temporadas'},
    {icon:'🥇',val:tv,label:'Vitórias',sub:'acumuladas'},
    {icon:'🏅',val:tp,label:'Pódios',sub:'top 3 finalizações'},
    {icon:'📈',val:tg+'%',label:'Taxa de Vitória',sub:'média geral'},
    {icon:'🏆',val:DB.titulos.length,label:'Títulos',sub:'campeonatos ganhos'},
    {icon:'⭐',val:tn,label:'Pontos Acumulados',sub:'em todas categorias'},
    {icon:'👥',val:DB.pilotos.filter(function(p){ return p.status==='Ativo'; }).length,label:'Pilotos Ativos',sub:'na equipe agora'},
    {icon:'🎯',val:DB.campAtivos.length,label:'Camps. Ativos',sub:'em andamento'}
  ];
  document.getElementById('statsBigGrid').innerHTML=data.map(function(s){
    return '<div class="stat-big-card"><div class="stat-big-icon">'+s.icon+'</div><span class="stat-big-val">'+s.val+'</span><div class="stat-big-lbl">'+s.label+'</div><div class="stat-big-sub">'+s.sub+'</div></div>';
  }).join('');

  var sorted=DB.pilotos.slice().sort(function(a,b){ return b.stats.vitorias-a.stats.vitorias; });
  document.getElementById('statsTableBody').innerHTML=sorted.map(function(p,i){
    var tx=p.stats.corridas?((p.stats.vitorias/p.stats.corridas)*100).toFixed(1):'0.0';
    var ri=i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1);
    var eb=isManager()?'<td class="td-actions"><button class="row-edit-btn" onclick="quickEditStats('+p.id+')" title="Editar stats">✏️</button></td>':'<td></td>';
    return '<tr><td style="font-size:1.1rem">'+ri+'</td>' +
      '<td><div style="font-weight:600">'+p.nome+'</div><div style="font-size:.72rem;color:var(--orange);font-family:var(--font-cond);letter-spacing:.8px">'+p.nickname+'</div></td>' +
      '<td>'+p.stats.corridas+'</td>' +
      '<td style="color:var(--gold);font-family:var(--font-display);font-size:1rem;font-weight:700">'+p.stats.vitorias+'</td>' +
      '<td>'+p.stats.podios+'</td>' +
      '<td><div style="display:flex;align-items:center;gap:8px"><div style="flex:1;height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden"><div style="width:'+tx+'%;height:100%;background:linear-gradient(90deg,var(--blue-mid),var(--orange));border-radius:3px"></div></div><span style="font-family:var(--font-display);font-size:.85rem;font-weight:700;color:var(--gold);width:42px">'+tx+'%</span></div></td>' +
      '<td style="font-family:var(--font-display);font-weight:600;color:var(--white)">'+p.stats.pontos+'</td>' + eb + '</tr>';
  }).join('');

  document.getElementById('barChart').innerHTML=sorted.map(function(p){
    var tx=p.stats.corridas?((p.stats.vitorias/p.stats.corridas)*100).toFixed(1):'0.0';
    return '<div class="bar-row"><div class="bar-name" title="'+p.nome+'">'+p.nome.split(' ')[0]+'</div><div class="bar-track"><div class="bar-fill" style="width:0%" data-target="'+tx+'"></div></div><div class="bar-pct">'+tx+'%</div></div>';
  }).join('');
}

function quickEditStats(id) {
  if (!isManager()) return showGuestTip();
  var p=DB.pilotos.find(function(x){ return x.id===id; }); if (!p) return;
  openModal('<div class="edit-modal-title">📊 Stats – '+p.nome+'</div>'+
    field('qs_cor','Corridas',p.stats.corridas,'number')+field('qs_vit','Vitórias',p.stats.vitorias,'number')+
    field('qs_pod','Pódios',p.stats.podios,'number')+field('qs_pts','Pontos',p.stats.pontos,'number'),
  function(ov){
    p.stats.corridas=parseInt(val(ov,'qs_cor'))||0;p.stats.vitorias=parseInt(val(ov,'qs_vit'))||0;
    p.stats.podios=parseInt(val(ov,'qs_pod'))||0;p.stats.pontos=parseInt(val(ov,'qs_pts'))||0;
    saveData();renderEstatisticas();renderDashboard();renderPilots();
    setTimeout(animateBarChart,100);showToast('Stats de '+p.nome+' atualizados!');return true;
  });
}

function animateBarChart() {
  document.querySelectorAll('.bar-fill').forEach(function(bar){
    setTimeout(function(){ bar.style.width=(bar.dataset.target||'0')+'%'; }, 50);
  });
}

/* ============================================================
   16. BOTÕES ADD + TOOLBAR (apenas manager)
   ============================================================ */
function injectManagerControls() {
  if (!isManager()) return;

  function addBtn(sel, label, fn) {
    var h=document.querySelector(sel); if (!h||h.querySelector('.btn-add')) return;
    var b=document.createElement('button'); b.className='btn-add'; b.textContent=label; b.onclick=fn; h.appendChild(b);
  }
  addBtn('#page-pilotos .page-header',      '+ Novo Piloto',     addPilot);
  addBtn('#page-titulos .page-header',       '+ Novo Título',     addTitulo);
  addBtn('#page-camp-ativos .page-header',   '+ Novo Campeonato', addCampAtivo);
  addBtn('#page-camp-futuros .page-header',  '+ Novo Campeonato', addCampFuturo);
  addBtn('#page-camp-passados .page-header', '+ Novo Campeonato', addCampPassado);

  // Colunas Ações nas tabelas
  ['#champPastTable thead tr','#statsTable thead tr'].forEach(function(sel){
    var row=document.querySelector(sel);
    if (row&&!row.querySelector('.th-acoes')){ var th=document.createElement('th');th.className='th-acoes';th.textContent='Ações';row.appendChild(th); }
  });

  // Toolbar topo
  var topbar=document.querySelector('.topbar-right');
  if (topbar&&!document.getElementById('topbarTools')) {
    var wrap=document.createElement('div'); wrap.id='topbarTools'; wrap.style.cssText='display:flex;gap:8px;align-items:center';
    wrap.innerHTML='<button class="toolbar-btn" id="btnExport">💾 Export</button>'+
      '<label class="toolbar-btn" style="cursor:pointer">📂 Import<input type="file" accept=".json" id="importFile" style="display:none"></label>'+
      '<button class="toolbar-btn toolbar-btn-danger" id="btnReset">🔄 Reset</button>';
    topbar.prepend(wrap);
    document.getElementById('btnExport').addEventListener('click', exportData);
    document.getElementById('btnReset').addEventListener('click', resetData);
    document.getElementById('importFile').addEventListener('change', importData);
  }
}

function exportData() {
  var blob=new Blob([JSON.stringify(DB,null,2)],{type:'application/json'});
  var a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='sempher_flyteam_'+new Date().toISOString().slice(0,10)+'.json'; a.click();
  showToast('Dados exportados!');
}
function importData(e) {
  var file=e.target.files[0]; if (!file) return;
  var r=new FileReader();
  r.onload=function(ev){ try{ var p=JSON.parse(ev.target.result); if(!p.pilotos) throw 0; DB=p;saveData();location.reload(); }
    catch(err){ showToast('Erro ao importar JSON!','error'); } };
  r.readAsText(file); e.target.value='';
}

/* ============================================================
   17. INIT
   ============================================================ */
function init() {
  DB = loadData();
  renderDashboard();
  renderPilots();
  renderTitulos();
  renderCampAtivos();
  renderCampFuturos();
  renderCampPassados();
  renderEstatisticas();
  injectManagerControls();
}
