import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const initialFilters = {
  q: 'refrigerante',
  region: 'Joinville',
  category: '',
  maxDeliveryDays: '2',
  maxPrice: '',
  minScore: ''
};

const primaryNavItems = [
  { id: 'market', label: 'Buscar', short: 'Buscar' },
  { id: 'dash', label: 'Dashboard', short: 'Dash' },
  { id: 'orders', label: 'Pedidos', short: 'Pedidos' }
];

const secondaryNavItems = [
  { id: 'supplier', label: 'Fornecedor', short: 'Painel' },
  { id: 'plans', label: 'Planos', short: 'Planos' }
];

const pageCopy = {
  market: ['Busca rápida', 'Do fornecedor certo ao pedido enviado em poucos cliques.'],
  profile: ['Fornecedor', 'Score independente e pedido rápido.'],
  orders: ['Pedidos enviados', 'Acompanhe pedido, WhatsApp e avaliação.'],
  supplier: ['Painel fornecedor', 'Oportunidades, respostas e reputação.'],
  plans: ['Modelo de negócio', 'Taxa por pedido, sem comprar score.'],
  dash: ['Dashboard', 'Impacto, confiança e viabilidade.']
};

const quickCategories = ['Bebidas', 'Hortifruti', 'Limpeza', 'Embalagens'];

const scoreFormula = [
  'Entrega no prazo: 30%',
  'Qualidade do produto: 30%',
  'Preço justo: 20%',
  'Atendimento: 20%',
  'Atrasos recorrentes penalizam o score'
];

const futureSteps = [
  'Integração direta com WhatsApp por fornecedor',
  'Pagamento automático da taxa por pedido',
  'Ranking por categoria',
  'Recomendação inteligente',
  'Geolocalização',
  'Área do fornecedor'
];

const api = {
  get: async (path) => request(path),
  post: async (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  patch: async (path, data) => request(path, { method: 'PATCH', body: JSON.stringify(data) })
};

async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'Erro na API');
  return normalizeApiText(body);
}

function normalizeApiText(value) {
  if (Array.isArray(value)) return value.map(normalizeApiText);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeApiText(item)]));
  }
  if (typeof value !== 'string' || !/[ÃÂ]/.test(value)) return value;

  try {
    const bytes = Uint8Array.from(Array.from(value, (char) => {
      const code = char.charCodeAt(0);
      return code <= 255 ? code : 63;
    }));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return value
      .replaceAll('Ã¡', 'á')
      .replaceAll('Ã ', 'à')
      .replaceAll('Ã£', 'ã')
      .replaceAll('Ã¢', 'â')
      .replaceAll('Ã©', 'é')
      .replaceAll('Ãª', 'ê')
      .replaceAll('Ã­', 'í')
      .replaceAll('Ã³', 'ó')
      .replaceAll('Ã´', 'ô')
      .replaceAll('Ãµ', 'õ')
      .replaceAll('Ãº', 'ú')
      .replaceAll('Ã§', 'ç')
      .replaceAll('Ã', 'Á')
      .replaceAll('Ã‰', 'É')
      .replaceAll('Ã“', 'Ó')
      .replaceAll('Â·', '-');
  }
}

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function formatMoney(value) {
  return money.format(Number(value || 0));
}

function parseMoney(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const raw = String(value || '').trim();
  const normalized = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')
    : raw.replace(/[^\d.]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function platformFee(value) {
  const amount = parseMoney(value);
  return amount > 0 ? amount * 0.03 : 0;
}

function platformFeeText(value) {
  const fee = platformFee(value);
  return fee > 0 ? formatMoney(fee) : 'Taxa calculada após confirmação do pedido';
}

function whatsappLink(phone, product = 'produtos') {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  const number = digits.startsWith('55') ? digits : `55${digits}`;
  const text = encodeURIComponent(`Olá, vim pelo ForneceJá e quero fazer um pedido de ${product || 'produtos'}.`);
  return `https://wa.me/${number}?text=${text}`;
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function statusText(status) {
  const labels = {
    enviado: 'Enviado',
    em_analise: 'Em análise',
    respondido: 'Respondido',
    aceito: 'Aceito',
    recusado: 'Recusado',
    concluido: 'Concluído',
    cancelado: 'Cancelado'
  };
  return labels[status] || status;
}

function roleText(role) {
  const labels = { market: 'Mercado', supplier: 'Fornecedor', admin: 'Admin' };
  return labels[role] || role;
}

function levelLabel(level) {
  const labels = {
    confiavel: 'Alta confiança',
    atencao: 'Atenção',
    alto_risco: 'Alto risco',
    sem_avaliacao: 'Sem histórico'
  };
  return labels[level] || 'Confiança';
}

function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function ScorePill({ score, compact = false }) {
  if (!score) return null;
  return (
    <div className={`score-pill ${score.level || 'sem_avaliacao'} ${compact ? 'compact' : ''}`}>
      <span>Score</span>
      <strong>{score.score}</strong>
      <small>{score.label || levelLabel(score.level)}</small>
    </div>
  );
}

function Metric({ label, value, detail, tone = 'neutral' }) {
  return (
    <div className={`metric ${tone}`}>
      <span>{label}</span>
      <b>{value}</b>
      {detail && <small>{detail}</small>}
    </div>
  );
}

function Meter({ label, value }) {
  const safeValue = Math.max(0, Math.min(100, Number(value || 0)));
  return (
    <div className="meter">
      <div>
        <span>{label}</span>
        <b>{Math.round(safeValue)}</b>
      </div>
      <i><span style={{ width: `${safeValue}%` }} /></i>
    </div>
  );
}

function EmptyState({ title, message, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">FJ</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}

function SectionTitle({ eyebrow, title, text, action }) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <span>{eyebrow}</span>}
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {action}
    </div>
  );
}

function Alert({ type = 'success', children }) {
  if (!children) return null;
  return <div className={`alert ${type}`}>{children}</div>;
}

function FilterChip({ active, children, onClick }) {
  return (
    <button type="button" className={`filter-chip ${active ? 'active' : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return <div className="toast">{message}</div>;
}

function Modal({ title, eyebrow, children, onClose }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-head">
          <div>
            {eyebrow && <span>{eyebrow}</span>}
            <h2>{title}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function BusinessModelCard() {
  return (
    <section className="business-card">
      <div>
        <span>Como o ForneceJá ganha?</span>
        <h3>Mercados buscam de graça. A plataforma recebe uma pequena taxa por pedido gerado para o fornecedor.</h3>
        <p>O fornecedor paga quando existe geração de valor. O score continua independente e não pode ser comprado.</p>
      </div>
      <div className="business-steps">
        <small>Busca grátis</small>
        <small>Pedido gerado</small>
        <small>Taxa vinculada</small>
      </div>
    </section>
  );
}

function FutureSteps() {
  return (
    <section className="panel future-panel">
      <SectionTitle eyebrow="Próximos passos" title="Evolução da plataforma" text="Recursos planejados para ampliar o produto após o fluxo principal." />
      <div className="future-grid">
        {futureSteps.map((item) => <span key={item}>{item}</span>)}
      </div>
    </section>
  );
}

function ReviewFields({ review, onChange }) {
  return (
    <div className="rating-grid">
      <label>Entrega no prazo<input name="on_time_delivery" type="number" min="0" max="100" value={review.on_time_delivery} onChange={onChange} /></label>
      <label>Qualidade<input name="product_quality" type="number" min="0" max="100" value={review.product_quality} onChange={onChange} /></label>
      <label>Atendimento<input name="service_score" type="number" min="0" max="100" value={review.service_score} onChange={onChange} /></label>
      <label>Preço justo<input name="price_score" type="number" min="0" max="100" value={review.price_score} onChange={onChange} /></label>
      <label>Nota geral<input name="general_score" type="number" min="0" max="100" value={review.general_score} onChange={onChange} /></label>
      <label>Atrasou?<select name="late_deliveries" value={review.late_deliveries} onChange={onChange}><option value="0">Não</option><option value="1">Sim</option></select></label>
      <label className="wide">Comentário<textarea name="comment" value={review.comment} onChange={onChange} /></label>
    </div>
  );
}

function Layout({ page, setPage, users, user, setUser, children }) {
  const [title, subtitle] = pageCopy[page] || pageCopy.market;

  function changeUser(event) {
    const next = users.find((item) => Number(item.id) === Number(event.target.value));
    if (!next) return;
    setUser(next);
    if (next.role === 'supplier') setPage('supplier');
    if (next.role === 'market') setPage('market');
  }

  function isActive(item) {
    return page === item.id || (page === 'profile' && item.id === 'market');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setPage('market')}>
          <span className="brand-mark">FJ</span>
          <span>
            <strong>ForneceJá</strong>
            <small>Marketplace B2B</small>
          </span>
        </button>

        <nav className="side-nav" aria-label="Navegação principal">
          {primaryNavItems.map((item) => (
            <button key={item.id} className={isActive(item) ? 'active' : ''} onClick={() => setPage(item.id)}>
              {item.label}
            </button>
          ))}
          <span className="nav-divider">Futuro e operação</span>
          {secondaryNavItems.map((item) => (
            <button key={item.id} className={isActive(item) ? 'active muted-nav' : 'muted-nav'} onClick={() => setPage(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="trust-box">
          <b>Modelo de negócio</b>
          <span>O mercado busca de graça. A plataforma ganha apenas quando gera pedido para o fornecedor.</span>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="topbar-title">
            <span>{title}</span>
            <strong>{subtitle}</strong>
          </div>
          <label className="user-switch">
            Entrar como
            <select value={user?.id || ''} onChange={changeUser}>
              {users.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.company} - {roleText(item.role)}
                </option>
              ))}
            </select>
          </label>
        </header>
        <main>{children}</main>
      </div>

      <nav className="bottom-nav" aria-label="Navegação mobile">
        {primaryNavItems.map((item) => (
          <button key={item.id} className={isActive(item) ? 'active' : ''} onClick={() => setPage(item.id)}>
            <span>{item.short}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function Recommendation({ recommendation, onOpen }) {
  if (!recommendation) {
    return (
      <section className="recommendation muted">
        <div>
          <span>Recomendação automática</span>
          <h3>Nenhum fornecedor recomendado</h3>
          <p>Ajuste produto, região ou prazo para ampliar as opções.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="recommendation">
      <div className="recommendation-copy">
        <span>Melhor opção para esta busca</span>
        <h3>{recommendation.name}</h3>
        <p>{recommendation.reason}</p>
        <div className="inline-list">
          <Badge tone="good">Score {recommendation.score}</Badge>
          <Badge>{recommendation.fit}% aderência</Badge>
          <Badge>{recommendation.responseRate}% resposta</Badge>
          <Badge>Entrega {recommendation.avgDeliveryDays} dia(s)</Badge>
          {recommendation.isSponsored && <Badge tone="sponsored">Patrocinado</Badge>}
          {recommendation.isVerified && <Badge tone="verified">Verificado</Badge>}
        </div>
      </div>
      <button className="primary-action" onClick={() => onOpen(recommendation.id)}>Pedir agora</button>
    </section>
  );
}

function SupplierCard({ supplier, onOpen, checked, onCompare, showToast }) {
  const lateDeliveries = supplier.score?.lateDeliveries ?? 0;
  const totalDeliveries = supplier.score?.totalDeliveries ?? 0;
  const lateRate = Math.round(Number(supplier.score?.lateRate || 0) * 100);

  return (
    <article className={`supplier-card ${supplier.is_sponsored ? 'sponsored-card' : ''}`}>
      <div className="supplier-card-top">
        <div className="inline-list">
          {supplier.is_verified && <Badge tone="verified">Verificado</Badge>}
          {supplier.score?.score >= 80 && <Badge tone="good">Confiável</Badge>}
          {supplier.score?.score > 0 && supplier.score?.score < 80 && <Badge>Atenção</Badge>}
          {supplier.responseRate >= 80 && <Badge>Resposta rápida</Badge>}
          {supplier.avg_delivery_days <= 2 && <Badge>Entrega até 2 dias</Badge>}
          {supplier.is_sponsored && <Badge tone="sponsored">Patrocinado</Badge>}
          <Badge>{supplier.category}</Badge>
        </div>
        <ScorePill score={supplier.score} compact />
      </div>

      <div className="supplier-card-body">
        <h3>{supplier.name}</h3>
        <p>{supplier.description}</p>
      </div>

      <div className="supplier-facts">
        <Metric label="Prazo médio" value={`${supplier.avg_delivery_days} dia(s)`} />
        <Metric label="Preço médio" value={formatMoney(supplier.avg_price)} />
        <Metric label="Região" value={supplier.region} />
        <Metric label="Atrasos" value={`${lateDeliveries}/${totalDeliveries}`} detail={`${lateRate}% histórico`} tone={lateRate > 20 ? 'risk' : 'neutral'} />
      </div>

      <div className="sponsor-note">
        {supplier.is_sponsored ? 'Destaque comercial identificado. O score permanece independente.' : 'Fornecedor ranqueado por histórico, prazo e avaliações.'}
      </div>

      <div className="card-actions">
        <button type="button" className="secondary" onClick={() => showToast('Fornecedor salvo para comparar depois.')}>Salvar fornecedor</button>
        <button type="button" className="secondary" onClick={() => onOpen(supplier.id)}>Ver detalhes</button>
        <button type="button" className="secondary" onClick={() => showToast('Solicitação registrada. O fornecedor poderá retornar o contato pela plataforma.')}>Solicitar contato</button>
        <label className={`compare-check ${checked ? 'checked' : ''}`}>
          <input type="checkbox" checked={checked} onChange={() => onCompare(supplier.id)} />
          Comparar opções
        </label>
        <button className="primary-action" onClick={() => onOpen(supplier.id)}>Pedir agora</button>
      </div>
    </article>
  );
}

function ComparePanel({ suppliers, onRemove, onOpen }) {
  if (!suppliers.length) return null;

  const rows = [
    ['Score', (supplier) => supplier.score?.score ?? '-'],
    ['Prazo médio', (supplier) => `${supplier.avg_delivery_days} dia(s)`],
    ['Preço médio', (supplier) => formatMoney(supplier.avg_price)],
    ['Resposta', (supplier) => `${supplier.responseRate}%`],
    ['Atrasos', (supplier) => `${supplier.score?.lateDeliveries ?? 0}/${supplier.score?.totalDeliveries ?? 0}`],
    ['Visibilidade', (supplier) => (supplier.is_sponsored ? 'Patrocinado' : 'Orgânico')]
  ];

  return (
    <section className="compare-panel">
      <SectionTitle
        eyebrow="Comparar opções"
        title={`${suppliers.length} fornecedor(es) selecionado(s)`}
        text="Compare score, prazo, preço e atrasos antes de enviar o pedido."
      />
      <div className="compare-scroll">
        <div className="compare-grid" style={{ '--cols': suppliers.length }}>
          <div className="compare-label">Critério</div>
          {suppliers.map((supplier) => (
            <div className="compare-supplier" key={supplier.id}>
              <b>{supplier.name}</b>
              <button type="button" onClick={() => onRemove(supplier.id)}>Remover</button>
            </div>
          ))}
          {rows.map(([label, resolver]) => (
            <React.Fragment key={label}>
              <div className="compare-label">{label}</div>
              {suppliers.map((supplier) => (
                <div key={`${supplier.id}-${label}`}>{resolver(supplier)}</div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="compare-actions">
        {suppliers.map((supplier) => (
          <button key={supplier.id} type="button" onClick={() => onOpen(supplier.id)}>
            Ver detalhes
          </button>
        ))}
      </div>
    </section>
  );
}

function Marketplace({ user, open, showToast }) {
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState({ suppliers: [], categories: [], regions: [], summary: {}, recommendation: null });
  const [compareIds, setCompareIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load(nextFilters = filters) {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      Object.entries(nextFilters).forEach(([key, value]) => value && params.append(key, value));
      setData(await api.get(`/suppliers?${params.toString()}`));
    } catch {
      setError('Não foi possível carregar fornecedores. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(initialFilters); }, []);

  const suppliers = data.suppliers || [];
  const compareSuppliers = useMemo(
    () => compareIds.map((id) => suppliers.find((supplier) => supplier.id === id)).filter(Boolean),
    [compareIds, suppliers]
  );
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  function setFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function changeFilter(event) {
    setFilter(event.target.name, event.target.value);
  }

  function submit(event) {
    event.preventDefault();
    setCompareIds([]);
    load(filters);
  }

  function resetSuggestedSearch() {
    setFilters(initialFilters);
    setCompareIds([]);
    load(initialFilters);
  }

  function toggleCompare(id) {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  }

  return (
    <section className="page market-page">
      <div className="market-hero">
        <div className="inline-list">
          <Badge tone="good">Mercado grátis</Badge>
        </div>
        <h1>ForneceJá</h1>
        <p>Encontre fornecedores confiáveis para o seu mercado em poucos cliques.</p>
      </div>

      <form className="search-card" onSubmit={submit}>
        <label className="search-main">
          O que você precisa comprar?
          <input name="q" value={filters.q} onChange={changeFilter} placeholder="Ex: refrigerante até 2 dias" />
        </label>

        <div className="quick-filter-row" aria-label="Filtros rápidos">
          <FilterChip active={filters.maxDeliveryDays === '1'} onClick={() => setFilter('maxDeliveryDays', '1')}>Até 1 dia</FilterChip>
          <FilterChip active={filters.maxDeliveryDays === '2'} onClick={() => setFilter('maxDeliveryDays', '2')}>Até 2 dias</FilterChip>
          <FilterChip active={filters.minScore === '80'} onClick={() => setFilter('minScore', filters.minScore === '80' ? '' : '80')}>Score 80+</FilterChip>
          {quickCategories.map((category) => (
            <FilterChip key={category} active={filters.category === category} onClick={() => setFilter('category', filters.category === category ? '' : category)}>
              {category}
            </FilterChip>
          ))}
        </div>

        <div className="filter-grid">
          <label>
            Região
            <input name="region" value={filters.region} onChange={changeFilter} placeholder="Ex: Joinville" list="region-list" />
            <datalist id="region-list">
              {(data.regions || []).map((region) => <option key={region} value={region} />)}
            </datalist>
          </label>
          <label>
            Categoria
            <select name="category" value={filters.category} onChange={changeFilter}>
              <option value="">Todas</option>
              {(data.categories || []).map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label>
            Entrega até
            <select name="maxDeliveryDays" value={filters.maxDeliveryDays} onChange={changeFilter}>
              <option value="">Qualquer prazo</option>
              <option value="1">1 dia</option>
              <option value="2">2 dias</option>
              <option value="3">3 dias</option>
              <option value="5">5 dias</option>
            </select>
          </label>
          <label>
            Score mínimo
            <select name="minScore" value={filters.minScore} onChange={changeFilter}>
              <option value="">Qualquer score</option>
              <option value="50">50+</option>
              <option value="80">80+</option>
              <option value="90">90+</option>
            </select>
          </label>
          <label>
            Preço até
            <input name="maxPrice" value={filters.maxPrice} onChange={changeFilter} placeholder="Ex: 100" inputMode="decimal" />
          </label>
        </div>

        <div className="filter-actions">
          <button type="submit" className="primary-action">Buscar fornecedor</button>
          <button type="button" className="secondary" onClick={resetSuggestedSearch}>Busca sugerida</button>
          <span>{activeFilterCount} filtro(s) ativo(s)</span>
        </div>
      </form>

      <Alert type="error">{error}</Alert>
      <BusinessModelCard />

      <Recommendation recommendation={data.recommendation} onOpen={open} />

      <div className="summary-strip">
        <Metric label="Resultados" value={loading ? '...' : data.summary?.total || 0} />
        <Metric label="Busca" value="Grátis" detail="Para mercados" />
        <Metric label="Verificados" value={data.summary?.verified || 0} />
        <Metric label="Confiáveis" value={data.summary?.reliable || 0} />
      </div>

      <SectionTitle
        eyebrow="Fornecedores compatíveis"
        title={loading ? 'Carregando...' : `${data.summary?.total || 0} resultado(s)`}
        text="Compare por score, prazo, preço e histórico de atrasos antes de pedir."
      />

      {loading ? (
        <div className="loader">Carregando fornecedores...</div>
      ) : suppliers.length ? (
        <div className="supplier-grid">
          {suppliers.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              onOpen={open}
              checked={compareIds.includes(supplier.id)}
              onCompare={toggleCompare}
              showToast={showToast}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum fornecedor encontrado"
          message="Ajuste os filtros para ampliar as opções disponíveis na sua região."
          action={<button type="button" onClick={resetSuggestedSearch}>Usar busca sugerida</button>}
        />
      )}

      <ComparePanel
        suppliers={compareSuppliers}
        onRemove={(id) => setCompareIds((current) => current.filter((item) => item !== id))}
        onOpen={open}
      />
    </section>
  );
}

function Profile({ id, user, back, goToOrders }) {
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [contactNotice, setContactNotice] = useState('');
  const [form, setForm] = useState({
    market_name: user?.company || 'Mercado do Bairro',
    requester_name: user?.name || '',
    requester_phone: user?.phone || '',
    product_requested: '',
    quantity: '30 caixas',
    estimated_value: '',
    desired_delivery_days: 2,
    notes: 'Preciso validar disponibilidade, preço final e prazo.'
  });
  const [review, setReview] = useState({
    on_time_delivery: 90,
    product_quality: 90,
    price_score: 85,
    service_score: 90,
    general_score: 90,
    late_deliveries: 0,
    comment: 'Fornecedor avaliado pelo fluxo do ForneceJá.'
  });

  async function load() {
    setLoading(true);
    const data = await api.get(`/suppliers/${id}`);
    setSupplier(data);
    setForm((current) => ({
      ...current,
      market_name: user?.company || current.market_name,
      requester_name: user?.name || current.requester_name,
      requester_phone: user?.phone || current.requester_phone,
      product_requested: data.products?.split(',')[0]?.trim() || current.product_requested
    }));
    setLoading(false);
  }

  useEffect(() => { if (id) load(); }, [id, user?.id]);

  function change(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function openOrder() {
    setOrderResult(null);
    setMessage(null);
    setContactNotice('');
    setOrderOpen(true);
  }

  async function send(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const result = await api.post('/orders', { supplier_id: id, market_id: user?.id, ...form });
      setOrderResult(result);
      setMessage({ type: 'success', text: 'Pedido enviado com sucesso.' });
      await load();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Não foi possível enviar o pedido.' });
    } finally {
      setSubmitting(false);
    }
  }

  function changeReview(event) {
    setReview((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submitReview(event) {
    event.preventDefault();
    await api.post('/evaluations', {
      supplier_id: id,
      order_id: orderResult?.id || null,
      market_name: form.market_name,
      ...review
    });
    setReviewOpen(false);
    setOrderOpen(false);
    setMessage({ type: 'success', text: 'Avaliação registrada. Obrigado por fortalecer a rede.' });
    await load();
  }

  if (loading) return <div className="loader">Carregando perfil...</div>;
  if (!supplier) return <EmptyState title="Fornecedor não encontrado" message="Volte para a busca e selecione outro fornecedor." />;

  const lateRate = Math.round(Number(supplier.score?.lateRate || 0) * 100);
  const supplierWhatsapp = whatsappLink(supplier.phone, form.product_requested);
  const feeEstimate = platformFeeText(form.estimated_value);

  return (
    <section className="page profile-page">
      <button className="back-button" onClick={back}>Voltar para busca</button>

      <div className="profile-hero">
        <div className="profile-title">
          <div className="inline-list">
            {supplier.is_sponsored && <Badge tone="sponsored">Patrocinado</Badge>}
            {supplier.is_verified && <Badge tone="verified">Verificado</Badge>}
            <Badge>{supplier.category}</Badge>
          </div>
          <h1>{supplier.name}</h1>
          <p>{supplier.description}</p>
          <span>{supplier.region}</span>
        </div>
        <ScorePill score={supplier.score} />
        <button className="primary-action hero-cta" onClick={openOrder}>Pedir agora</button>
      </div>

      <div className="profile-metrics">
        <Metric label="Prazo médio" value={`${supplier.avg_delivery_days} dia(s)`} />
        <Metric label="Preço médio" value={formatMoney(supplier.avg_price)} />
        <Metric label="Resposta" value={`${supplier.responseRate}%`} />
        <Metric label="Atrasos" value={`${supplier.score.lateDeliveries}/${supplier.score.totalDeliveries}`} detail={`${lateRate}% do histórico`} tone={lateRate > 20 ? 'risk' : 'neutral'} />
      </div>

      <div className="profile-layout">
        <div className="profile-main">
          <section className="panel accent">
            <span className="eyebrow">Recomendação</span>
            <h3>{supplier.score.recommendation}</h3>
            <p>{supplier.sponsorNotice}</p>
          </section>

          <section className="panel">
            <SectionTitle eyebrow="Score público" title={`${supplier.score.score} pontos`} text={supplier.trustSummary} />
            <div className="meters">
              <Meter label="Pontualidade" value={supplier.score.components.onTime} />
              <Meter label="Qualidade" value={supplier.score.components.quality} />
              <Meter label="Preço" value={supplier.score.components.price} />
              <Meter label="Atendimento" value={supplier.score.components.service} />
            </div>
            <div className="formula-list compact">
              {scoreFormula.map((item) => <span key={item}>{item}</span>)}
            </div>
          </section>

          <section className="panel">
            <SectionTitle eyebrow="Histórico" title="Avaliações recentes" text={`${supplier.evaluations.length} avaliação(ões)`} />
            {supplier.evaluations.length ? supplier.evaluations.map((evaluation) => (
              <div className="review" key={evaluation.id}>
                <b>{evaluation.market_name}</b>
                <p>{evaluation.comment}</p>
                <span>Entrega {evaluation.on_time_delivery} - Qualidade {evaluation.product_quality} - Atendimento {evaluation.service_score}</span>
              </div>
            )) : <EmptyState title="Sem avaliações" message="Ainda não há histórico suficiente para este fornecedor." />}
          </section>
        </div>

        <aside className="profile-side">
          <section className="panel facts">
            <h3>Dados comerciais</h3>
            <Metric label="Produtos" value={supplier.products} />
            <Metric label="Contato" value={supplier.contact_name || supplier.phone} detail={supplier.phone} />
            <Metric label="Região atendida" value={supplier.region} />
            <Metric label="Verificação" value={supplier.is_verified ? 'Verificado' : 'Não verificado'} />
            {supplierWhatsapp ? (
              <a className="button whatsapp" href={supplierWhatsapp} target="_blank" rel="noreferrer">Chamar no WhatsApp</a>
            ) : (
              <button type="button" className="secondary" onClick={() => setContactNotice('Fornecedor ainda não possui WhatsApp cadastrado.')}>Solicitar contato</button>
            )}
          </section>

          <section className="panel order-panel" id="pedido">
            <SectionTitle eyebrow="Pedido rápido" title="Pedir em poucos cliques" text="Poucos campos, pedido registrado e taxa vinculada apenas quando há oportunidade." />
            {message && <Alert type={message.type}>{message.text}</Alert>}
            {contactNotice && <Alert type="error">{contactNotice}</Alert>}
            <div className="quick-order-summary">
              <span>Taxa por pedido gerado</span>
              <b>{feeEstimate}</b>
              <p>O mercado busca gratuitamente. O fornecedor paga apenas quando o ForneceJá gera oportunidade real.</p>
            </div>
            <button className="primary-action" onClick={openOrder}>Pedir agora</button>
          </section>
        </aside>
      </div>

      <div className="profile-mobile-cta">
        <span>{supplier.name}</span>
        <button onClick={openOrder}>Pedir agora</button>
      </div>

      {orderOpen && (
        <Modal title={orderResult ? 'Pedido enviado com sucesso' : 'Pedido rápido'} eyebrow={supplier.name} onClose={() => setOrderOpen(false)}>
          {orderResult ? (
            <div className="success-flow">
              <div className="success-icon">OK</div>
              <h3>Pedido enviado com sucesso.</h3>
              <div className="success-details">
                <span><b>Fornecedor</b>{supplier.name}</span>
                <span><b>Produto</b>{form.product_requested}</span>
                <span><b>Prazo desejado</b>{form.desired_delivery_days} dia(s)</span>
                <span><b>Taxa estimada</b>{feeEstimate}</span>
              </div>
              <p>O mercado busca gratuitamente. A plataforma recebe uma pequena taxa apenas quando gera um pedido para o fornecedor.</p>
              {contactNotice && <Alert type="error">{contactNotice}</Alert>}
              <div className="post-order-actions">
                {supplierWhatsapp ? (
                  <a className="button whatsapp" href={supplierWhatsapp} target="_blank" rel="noreferrer">Chamar no WhatsApp</a>
                ) : (
                  <button type="button" className="secondary" onClick={() => setContactNotice('Fornecedor ainda não possui WhatsApp cadastrado.')}>Chamar no WhatsApp</button>
                )}
                <button type="button" className="secondary" onClick={() => { setOrderOpen(false); goToOrders(); }}>Ver pedidos</button>
                <button type="button" className="secondary" onClick={() => { setOrderOpen(false); setReviewOpen(true); }}>Avaliar fornecedor após entrega</button>
              </div>
              <div className="review-incentive">
                <b>Avalie este fornecedor e ajude outros mercados a comprarem com mais segurança.</b>
                <span>Sua avaliação fortalece a rede e melhora o score de confiança dos fornecedores.</span>
              </div>
            </div>
          ) : (
            <form className="order-form compact-order" onSubmit={send}>
              <label>Produto<input name="product_requested" value={form.product_requested} onChange={change} required /></label>
              <label>Quantidade<input name="quantity" value={form.quantity} onChange={change} /></label>
              <label>Valor estimado do pedido<input name="estimated_value" value={form.estimated_value} onChange={change} placeholder="Ex: 2700,00" inputMode="decimal" /></label>
              <label>
                Prazo desejado
                <select name="desired_delivery_days" value={form.desired_delivery_days} onChange={change}>
                  <option value="1">Até 1 dia</option>
                  <option value="2">Até 2 dias</option>
                  <option value="3">Até 3 dias</option>
                  <option value="5">Até 5 dias</option>
                </select>
              </label>
              <label>Observação<textarea name="notes" value={form.notes} onChange={change} /></label>
              <div className="fee-note">Taxa estimada da plataforma: {feeEstimate}. Score do fornecedor segue independente.</div>
              {message && <Alert type={message.type}>{message.text}</Alert>}
              <button className="primary-action" disabled={submitting}>{submitting ? 'Enviando...' : 'Enviar pedido'}</button>
            </form>
          )}
        </Modal>
      )}

      {reviewOpen && (
        <Modal title="Avaliar fornecedor" eyebrow="Confiança da rede" onClose={() => setReviewOpen(false)}>
          <form className="review-form" onSubmit={submitReview}>
            <p>Avalie este fornecedor e ajude outros mercados a comprarem com mais segurança.</p>
            <ReviewFields review={review} onChange={changeReview} />
            <button className="primary-action">Salvar avaliação</button>
          </form>
        </Modal>
      )}
    </section>
  );
}

function OrderCard({ order, onRefresh, supplierMode = false, showToast = () => {} }) {
  const orderWhatsapp = whatsappLink(order.supplier_phone, order.product_requested);
  const [quote, setQuote] = useState({
    response_price: order.response_price || '',
    response_delivery_days: order.response_delivery_days || order.desired_delivery_days || 2,
    supplier_response: order.supplier_response || 'Consigo atender esse pedido dentro do prazo solicitado.'
  });
  const [reviewOpen, setReviewOpen] = useState(false);
  const [review, setReview] = useState({
    on_time_delivery: 90,
    product_quality: 90,
    price_score: 85,
    service_score: 90,
    general_score: 90,
    late_deliveries: 0,
    comment: 'Entrega concluída conforme combinado.'
  });

  function changeQuote(event) {
    setQuote((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function changeReview(event) {
    setReview((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function respond(status = 'respondido') {
    await api.patch(`/orders/${order.id}/respond`, { ...quote, status });
    onRefresh();
  }

  async function setStatus(status) {
    await api.patch(`/orders/${order.id}/status`, { status });
    onRefresh();
  }

  async function submitReview(event) {
    event.preventDefault();
    await api.post('/evaluations', {
      supplier_id: order.supplier_id,
      order_id: order.id,
      market_name: order.market_name,
      ...review
    });
    setReviewOpen(false);
    onRefresh();
  }

  return (
    <article className="order-card">
      <div className="order-main">
        <div className="order-copy">
          <div className="inline-list">
            <Badge tone={order.status === 'concluido' ? 'good' : order.status === 'recusado' ? 'danger' : 'neutral'}>
              {statusText(order.status)}
            </Badge>
            {order.supplier_is_sponsored && <Badge tone="sponsored">Fornecedor patrocinado</Badge>}
            {order.supplier_is_verified && <Badge tone="verified">Verificado</Badge>}
          </div>
          <h3>{order.product_requested}</h3>
          <p>{order.market_name} para {order.supplier_name}</p>
          <small>{order.quantity || 'Quantidade não informada'} - desejado em {order.desired_delivery_days || '-'} dia(s) - {formatDate(order.created_at)}</small>
        </div>
        {order.response_price ? (
          <div className="quote-summary">
            <span>Cotação</span>
            <b>{formatMoney(order.response_price)}</b>
            <small>{order.response_delivery_days} dia(s) · taxa {platformFeeText(order.response_price)}</small>
          </div>
        ) : (
          <div className="quote-summary muted">
            <span>Status</span>
            <b>Aguardando</b>
            <small>Resposta do fornecedor</small>
          </div>
        )}
      </div>

      {order.supplier_response && <p className="quote-note">{order.supplier_response}</p>}

      {!supplierMode && (
        <div className="row-actions order-quick-actions">
          {orderWhatsapp ? (
            <a className="button whatsapp" href={orderWhatsapp} target="_blank" rel="noreferrer">Chamar no WhatsApp</a>
          ) : (
            <button type="button" className="secondary" onClick={() => showToast('Fornecedor ainda não possui WhatsApp cadastrado.')}>Chamar no WhatsApp</button>
          )}
          <button type="button" className="secondary" onClick={() => showToast('Este recurso estará disponível na próxima versão da plataforma.')}>Repetir pedido</button>
          <button
            type="button"
            className="secondary"
            onClick={() => order.status === 'concluido' ? setReviewOpen((current) => !current) : showToast('Avaliação liberada após a entrega do pedido.')}
          >
            Avaliar fornecedor
          </button>
        </div>
      )}

      {supplierMode && ['enviado', 'em_analise'].includes(order.status) && (
        <form className="quote-form" onSubmit={(event) => { event.preventDefault(); respond(); }}>
          <label>Preço final<input name="response_price" value={quote.response_price} onChange={changeQuote} placeholder="Ex: 89.90" required /></label>
          <label>Prazo confirmado<input name="response_delivery_days" value={quote.response_delivery_days} onChange={changeQuote} required /></label>
          <label className="wide">Mensagem<textarea name="supplier_response" value={quote.supplier_response} onChange={changeQuote} /></label>
          <div className="row-actions wide">
            <button type="submit">Enviar cotação</button>
            <button type="button" className="secondary" onClick={() => respond('em_analise')}>Em análise</button>
            <button type="button" className="danger" onClick={() => respond('recusado')}>Recusar</button>
          </div>
        </form>
      )}

      {!supplierMode && order.status === 'respondido' && (
        <div className="row-actions">
          <button onClick={() => setStatus('aceito')}>Aceitar cotação</button>
          <button className="secondary" onClick={() => setStatus('cancelado')}>Cancelar</button>
        </div>
      )}

      {!supplierMode && order.status === 'aceito' && (
        <div className="row-actions">
          <button onClick={() => setStatus('concluido')}>Marcar como concluído</button>
        </div>
      )}

      {reviewOpen && (
        <form className="quote-form" onSubmit={submitReview}>
          <div className="review-incentive wide">
            <b>Avalie este fornecedor e ajude outros mercados a comprarem com mais segurança.</b>
            <span>Sua avaliação fortalece a rede e melhora o score de confiança dos fornecedores.</span>
          </div>
          <ReviewFields review={review} onChange={changeReview} />
          <div className="row-actions wide"><button>Salvar avaliação</button></div>
        </form>
      )}
    </article>
  );
}

function Orders({ user, showToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (user?.role === 'market') params.append('marketId', user.id);
      if (user?.role === 'supplier') params.append('supplierId', user.supplier_id);
      const result = await api.get(`/orders?${params.toString()}`);
      setOrders(result.orders || []);
    } catch {
      setError('Não foi possível carregar seus pedidos.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (user) load(); }, [user?.id]);

  const stats = useMemo(() => ({
    total: orders.length,
    open: orders.filter((order) => ['enviado', 'em_analise'].includes(order.status)).length,
    quoted: orders.filter((order) => ['respondido', 'aceito', 'concluido'].includes(order.status)).length,
    done: orders.filter((order) => order.status === 'concluido').length
  }), [orders]);

  return (
    <section className="page">
      <SectionTitle
        eyebrow="Pedidos"
        title={user?.role === 'supplier' ? 'Pedidos recebidos' : 'Pedidos enviados'}
        text="Do envio até a avaliação, tudo fica registrado para reduzir compra no escuro."
      />

      <div className="summary-strip">
        <Metric label="Total" value={stats.total} />
        <Metric label="Em aberto" value={stats.open} />
        <Metric label="Cotados" value={stats.quoted} />
        <Metric label="Concluídos" value={stats.done} />
      </div>

      <Alert type="error">{error}</Alert>

      {loading ? <div className="loader">Carregando pedidos...</div> : (
        <div className="order-list">
          {orders.length ? orders.map((order) => (
            <OrderCard key={order.id} order={order} onRefresh={load} supplierMode={user?.role === 'supplier'} showToast={showToast} />
          )) : (
            <EmptyState
              title="Nenhum pedido encontrado"
              message="Abra um fornecedor, confira score e prazo, e envie o primeiro pedido."
            />
          )}
        </div>
      )}
    </section>
  );
}

function SupplierDesk({ user }) {
  const supplierId = user?.supplier_id || 1;
  const [desk, setDesk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setDesk(await api.get(`/supplier-dashboard/${supplierId}`));
    } catch {
      setError('Não foi possível carregar o painel do fornecedor.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [supplierId]);

  if (loading) return <div className="loader">Carregando painel do fornecedor...</div>;
  if (error) return <Alert type="error">{error}</Alert>;
  if (!desk) return null;

  return (
    <section className="page">
      <div className="supplier-hero">
        <div>
          <div className="inline-list"><Badge tone="sponsored">{desk.plan.name}</Badge></div>
          <h1>{desk.supplier.name}</h1>
          <p>Pedidos recebidos, respostas comerciais, métricas e reputação em um painel simples.</p>
        </div>
        <ScorePill score={desk.supplier.score} />
      </div>

      <div className="summary-strip supplier-metrics">
        <Metric label="Visualizações" value={desk.metrics.profileViews} />
        <Metric label="Pedidos" value={desk.metrics.requests} />
        <Metric label="Pendentes" value={desk.metrics.pending} />
        <Metric label="Respondidos" value={desk.metrics.responded} />
        <Metric label="Aceitos" value={desk.metrics.accepted} />
        <Metric label="Resposta" value={`${desk.metrics.responseRate}%`} />
        <Metric label="Cotado" value={formatMoney(desk.metrics.estimatedRevenue)} />
      </div>

      <SectionTitle eyebrow="Inbox comercial" title="Responder oportunidades" text="Preço final, prazo confirmado e observação comercial." />
      <div className="order-list">
        {desk.orders.length ? desk.orders.map((order) => (
          <OrderCard key={order.id} order={order} onRefresh={load} supplierMode />
        )) : <EmptyState title="Sem pedidos" message="Quando mercados enviarem pedidos, eles aparecem aqui." />}
      </div>
    </section>
  );
}

function Plans({ user }) {
  const supplierId = user?.supplier_id || 1;
  const [plans, setPlans] = useState([]);
  const [rule, setRule] = useState('');
  const [supplier, setSupplier] = useState(null);
  const [message, setMessage] = useState('');

  async function load() {
    const planData = await api.get('/plans');
    const desk = await api.get(`/supplier-dashboard/${supplierId}`);
    setPlans(planData.plans);
    setRule(planData.rule);
    setSupplier(desk.supplier);
  }

  useEffect(() => { load(); }, [supplierId]);

  async function activate(plan) {
    const result = await api.patch(`/suppliers/${supplierId}/plan`, { plan });
    setMessage(result.message);
    await load();
  }

  return (
    <section className="page">
      <SectionTitle
        eyebrow="Monetização"
        title="Taxa por pedido gerado"
        text="O fornecedor recebe oportunidades reais e a plataforma cobra apenas quando gera valor. Planos e destaque ficam como extensão futura."
      />
      <BusinessModelCard />
      <Alert>{message}</Alert>
      <SectionTitle eyebrow="Futuro" title="Destaques patrocinados" text={rule} />
      <div className="plan-grid">
        {plans.map((plan) => (
          <article className={`plan-card ${supplier?.plan === plan.id ? 'current' : ''}`} key={plan.id}>
            <span>{supplier?.plan === plan.id ? 'Plano atual' : 'Plano'}</span>
            <h3>{plan.name}</h3>
            <strong>{formatMoney(plan.price)}<small>/mês</small></strong>
            <p>{plan.highlight}</p>
            <div className="feature-list">
              {plan.features.map((feature) => <small key={feature}>{feature}</small>)}
            </div>
            <button onClick={() => activate(plan.id)}>{supplier?.plan === plan.id ? 'Manter plano' : 'Solicitar destaque'}</button>
          </article>
        ))}
      </div>
      <section className="panel rule-panel">
        <h3>Garantia de confiança</h3>
        <p>Ao trocar de plano, apenas o destaque comercial muda. O score segue calculado por entrega no prazo, qualidade, preço, atendimento, avaliações e histórico de atrasos.</p>
      </section>
      <FutureSteps />
    </section>
  );
}

function Dashboard({ open }) {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard').then(setDashboard).catch(() => setError('Não foi possível carregar o dashboard.'));
  }, []);

  if (error) return <Alert type="error">{error}</Alert>;
  if (!dashboard) return <div className="loader">Carregando dashboard...</div>;

  return (
    <section className="page">
      <SectionTitle
        eyebrow="Executivo"
        title="Dashboard de produto e impacto"
        text={dashboard.conversionImpact}
      />
      <div className="summary-strip dashboard-metrics">
        <Metric label="Fornecedores" value={dashboard.totalSuppliers} />
        <Metric label="Pedidos" value={dashboard.totalOrders} />
        <Metric label="Respondidos" value={`${dashboard.commercial.responseRate}%`} />
        <Metric label="Aceite" value={`${dashboard.commercial.acceptanceRate}%`} />
        <Metric label="Monetização" value="Por pedido" detail="Taxa quando gera valor" />
        <Metric label="Alto risco" value={dashboard.highRiskSuppliers} tone="risk" />
        <Metric label="Score médio" value={dashboard.averageScore} />
      </div>

      <BusinessModelCard />

      <div className="dashboard-grid">
        <section className="panel">
          <SectionTitle eyebrow="Ranking" title="Confiança real" text="Ordenado por score, sem influência de plano pago." />
          <div className="ranking-list">
            {dashboard.ranking.map((supplier) => (
              <button className="ranking-row" key={supplier.id} onClick={() => open(supplier.id)}>
                <span>
                  <b>{supplier.name}</b>
                  <small>{supplier.category} - entrega {supplier.delivery} dia(s) - resposta {supplier.responseRate}%</small>
                </span>
                <strong>{supplier.score}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <SectionTitle eyebrow="Score" title="Fórmula explicável" />
          <div className="formula-list">
            {scoreFormula.map((item) => <span key={item}>{item}</span>)}
          </div>
          <p className="notice">Fornecedor pode pagar por oportunidade ou taxa por pedido, mas nunca para aumentar o score.</p>
        </section>

        <section className="panel recent-panel">
          <SectionTitle eyebrow="Movimento" title="Pedidos recentes" />
          <div className="mini-order-list">
            {dashboard.recentOrders.map((order) => (
              <div className="mini-order" key={order.id}>
                <span>{statusText(order.status)}</span>
                <b>{order.product_requested}</b>
                <small>{order.supplier_name} - {formatDate(order.created_at)}</small>
              </div>
            ))}
          </div>
        </section>
      </div>
      <FutureSteps />
    </section>
  );
}

function App() {
  const [page, setPage] = useState('market');
  const [selected, setSelected] = useState(null);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [bootError, setBootError] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    api.get('/auth/demo-users')
      .then((result) => {
        setUsers(result.users || []);
        setUser(result.users?.[0] || null);
      })
      .catch(() => setBootError('Não foi possível conectar ao backend do ForneceJá.'));
  }, []);

  function openSupplier(id) {
    setSelected(id);
    setPage('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showToast(message) {
    setToast(message);
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => setToast(''), 2600);
  }

  if (bootError) return <div className="loader full">{bootError}</div>;
  if (!user) return <div className="loader full">Carregando ForneceJá...</div>;

  return (
    <Layout page={page} setPage={setPage} users={users} user={user} setUser={setUser}>
      {page === 'market' && <Marketplace user={user} open={openSupplier} showToast={showToast} />}
      {page === 'profile' && <Profile id={selected} user={user} back={() => setPage('market')} goToOrders={() => setPage('orders')} />}
      {page === 'orders' && <Orders user={user} showToast={showToast} />}
      {page === 'supplier' && <SupplierDesk user={user} />}
      {page === 'plans' && <Plans user={user} />}
      {page === 'dash' && <Dashboard open={openSupplier} />}
      <Toast message={toast} />
    </Layout>
  );
}

createRoot(document.getElementById('root')).render(<App />);
