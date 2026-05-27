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
  return body;
}

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function formatMoney(value) {
  return money.format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
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

function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function DataSource({ value }) {
  if (!value) return null;
  return <span className={`source ${value === 'mysql' ? 'mysql' : 'demo'}`}>{value === 'mysql' ? 'MySQL' : 'Demo'}</span>;
}

function ScorePill({ score }) {
  if (!score) return null;
  return (
    <div className={`score-pill ${score.level}`}>
      <strong>{score.score}</strong>
      <span>{score.label}</span>
    </div>
  );
}

function Metric({ label, value, detail }) {
  return (
    <div className="metric">
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

function EmptyState({ title, message }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}

function SectionTitle({ eyebrow, title, text, action }) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <span>{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

function Layout({ page, setPage, users, user, setUser, children }) {
  const nav = [
    { id: 'market', label: 'Buscar fornecedores' },
    { id: 'orders', label: 'Meus pedidos' },
    { id: 'supplier', label: 'Painel fornecedor' },
    { id: 'plans', label: 'Planos' },
    { id: 'dash', label: 'Dashboard' }
  ];

  function changeUser(event) {
    const next = users.find((item) => Number(item.id) === Number(event.target.value));
    if (next) {
      setUser(next);
      if (next.role === 'supplier') setPage('supplier');
      if (next.role === 'market') setPage('market');
    }
  }

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">FJ</div>
          <div>
            <h1>ForneceJá</h1>
            <p>Confiança comercial para mercados independentes.</p>
          </div>
        </div>

        <nav>
          {nav.map((item) => (
            <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => setPage(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="trust-box">
          <b>Regra de monetização</b>
          <span>Plano pago compra destaque e analytics. Score, ranking e recomendação continuam independentes.</span>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Produto piloto</span>
            <strong>{page === 'supplier' ? 'Operação do fornecedor' : 'Marketplace B2B local'}</strong>
          </div>
          <label className="user-switch">
            Entrar como
            <select value={user?.id || ''} onChange={changeUser}>
              {users.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.company} · {item.role}
                </option>
              ))}
            </select>
          </label>
        </header>
        <main>{children}</main>
      </div>
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
          <p>Ajuste produto, prazo ou região para ampliar o universo de compra.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="recommendation">
      <div>
        <span>Melhor fornecedor para esta busca</span>
        <h3>{recommendation.name}</h3>
        <p>{recommendation.reason}</p>
        <div className="inline-list">
          <Badge tone="good">Score {recommendation.score}</Badge>
          <Badge>{recommendation.fit}% aderência</Badge>
          <Badge>{recommendation.responseRate}% resposta</Badge>
          {recommendation.isSponsored && <Badge tone="sponsored">Patrocinado</Badge>}
          {recommendation.isVerified && <Badge tone="verified">Verificado</Badge>}
        </div>
      </div>
      <button onClick={() => onOpen(recommendation.id)}>Abrir perfil</button>
    </section>
  );
}

function SupplierCard({ supplier, onOpen, checked, onCompare }) {
  return (
    <article className="supplier-card">
      <div className="card-head">
        <div>
          <div className="inline-list">
            {supplier.is_sponsored && <Badge tone="sponsored">Patrocinado</Badge>}
            {supplier.is_verified && <Badge tone="verified">Verificado</Badge>}
            <Badge>{supplier.category}</Badge>
          </div>
          <h3>{supplier.name}</h3>
          <p>{supplier.description}</p>
        </div>
        <ScorePill score={supplier.score} />
      </div>

      <div className="stat-grid compact">
        <Metric label="Entrega" value={`${supplier.avg_delivery_days} dia(s)`} />
        <Metric label="Preço médio" value={formatMoney(supplier.avg_price)} />
        <Metric label="Resposta" value={`${supplier.responseRate}%`} />
        <Metric label="Atrasos" value={`${supplier.score.lateDeliveries}/${supplier.score.totalDeliveries}`} />
      </div>

      <p className="notice">{supplier.sponsorNotice}</p>

      <div className="card-actions">
        <label className="compare-check">
          <input type="checkbox" checked={checked} onChange={() => onCompare(supplier.id)} />
          Comparar
        </label>
        <button onClick={() => onOpen(supplier.id)}>Ver perfil</button>
      </div>
    </article>
  );
}

function ComparePanel({ suppliers, onRemove, onOpen }) {
  if (!suppliers.length) return null;
  const rows = [
    ['Score', (supplier) => supplier.score.score],
    ['Prazo médio', (supplier) => `${supplier.avg_delivery_days} dia(s)`],
    ['Preço médio', (supplier) => formatMoney(supplier.avg_price)],
    ['Taxa de resposta', (supplier) => `${supplier.responseRate}%`],
    ['Atrasos', (supplier) => `${supplier.score.lateDeliveries}/${supplier.score.totalDeliveries}`],
    ['Plano', (supplier) => (supplier.is_sponsored ? 'Patrocinado' : 'Orgânico')]
  ];

  return (
    <section className="compare-panel">
      <SectionTitle
        eyebrow="Comparador"
        title={`${suppliers.length} fornecedor(es)`}
        text="A comparação preserva o score real: patrocinado aparece como visibilidade, não como reputação."
      />
      <div className="compare-grid" style={{ '--cols': suppliers.length }}>
        <div className="compare-label">Critério</div>
        {suppliers.map((supplier) => (
          <div className="compare-supplier" key={supplier.id}>
            <b>{supplier.name}</b>
            <button onClick={() => onRemove(supplier.id)}>Remover</button>
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
      <div className="compare-actions">
        {suppliers.map((supplier) => (
          <button key={supplier.id} onClick={() => onOpen(supplier.id)}>Abrir {supplier.name}</button>
        ))}
      </div>
    </section>
  );
}

function Marketplace({ user, open }) {
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState({ suppliers: [], categories: [], summary: {}, recommendation: null });
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

  function changeFilter(event) {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function submit(event) {
    event.preventDefault();
    setCompareIds([]);
    load(filters);
  }

  function resetDemo() {
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
    <section className="page">
      <div className="market-hero">
        <div className="hero-copy">
          <div className="inline-list"><DataSource value={data.dataSource} /><Badge tone="good">Mercado grátis</Badge></div>
          <h2>Compre com previsibilidade, não só com menor preço.</h2>
          <p>
            {user?.company || 'Seu mercado'} encontra fornecedores por produto, prazo, região,
            confiança e resposta comercial. Patrocínio nunca entra no score.
          </p>
        </div>
        <img src="/assets/forneceja-hero.png" alt="" />
      </div>

      <form className="filters" onSubmit={submit}>
        <label>Produto<input name="q" value={filters.q} onChange={changeFilter} placeholder="Ex: refrigerante" /></label>
        <label>Região<input name="region" value={filters.region} onChange={changeFilter} placeholder="Ex: Joinville" /></label>
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
            <option value="">Qualquer</option>
            <option value="1">1 dia</option>
            <option value="2">2 dias</option>
            <option value="3">3 dias</option>
            <option value="5">5 dias</option>
          </select>
        </label>
        <label>Preço até<input name="maxPrice" value={filters.maxPrice} onChange={changeFilter} placeholder="Ex: 100" /></label>
        <label>
          Score mínimo
          <select name="minScore" value={filters.minScore} onChange={changeFilter}>
            <option value="">Qualquer</option>
            <option value="60">60+</option>
            <option value="80">80+</option>
            <option value="90">90+</option>
          </select>
        </label>
        <div className="filter-actions">
          <button type="submit">Buscar</button>
          <button type="button" className="secondary" onClick={resetDemo}>Demo</button>
        </div>
      </form>

      {error && <div className="alert error">{error}</div>}
      <Recommendation recommendation={data.recommendation} onOpen={open} />

      <SectionTitle
        eyebrow="Resultados"
        title={loading ? 'Carregando...' : `${data.summary?.total || 0} fornecedor(es)`}
        text={`${data.summary?.sponsored || 0} patrocinado(s), ${data.summary?.verified || 0} verificado(s), ${data.summary?.reliable || 0} confiável(is)`}
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
            />
          ))}
        </div>
      ) : (
        <EmptyState title="Nenhum fornecedor encontrado" message="Remova algum filtro para ampliar a busca." />
      )}

      <ComparePanel
        suppliers={compareSuppliers}
        onRemove={(id) => setCompareIds((current) => current.filter((item) => item !== id))}
        onOpen={open}
      />
    </section>
  );
}

function Profile({ id, user, back }) {
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    market_name: user?.company || 'Mercado do Bairro',
    requester_name: user?.name || '',
    requester_phone: user?.phone || '',
    product_requested: '',
    quantity: '30 caixas',
    desired_delivery_days: 2,
    notes: 'Preciso validar disponibilidade, preço final e prazo.'
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

  async function send(event) {
    event.preventDefault();
    setMessage('');
    const result = await api.post('/orders', { supplier_id: id, market_id: user?.id, ...form });
    setMessage(result.message || 'Pedido enviado.');
    await load();
  }

  if (loading) return <div className="loader">Carregando perfil...</div>;
  if (!supplier) return null;

  return (
    <section className="page">
      <button className="back-button" onClick={back}>Voltar para busca</button>
      <div className="profile-head">
        <div>
          <div className="inline-list">
            {supplier.is_sponsored && <Badge tone="sponsored">Patrocinado</Badge>}
            {supplier.is_verified && <Badge tone="verified">Verificado</Badge>}
            <Badge>{supplier.plan}</Badge>
            <Badge>{supplier.responseRate}% resposta</Badge>
          </div>
          <h2>{supplier.name}</h2>
          <p>{supplier.description}</p>
          <span>{supplier.category} · {supplier.region}</span>
        </div>
        <ScorePill score={supplier.score} />
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
              <Meter label="Atendimento" value={supplier.score.components.service} />
              <Meter label="Preço" value={supplier.score.components.price} />
              <Meter label="Consistência" value={supplier.score.components.consistency} />
              <Meter label="Volume e recência" value={supplier.score.components.confidence} />
            </div>
            <p className="formula">{supplier.scoreFormula.join(' · ')}</p>
          </section>

          <section className="panel">
            <SectionTitle eyebrow="Histórico" title="Avaliações recentes" text={`${supplier.evaluations.length} avaliação(ões)`} />
            {supplier.evaluations.map((evaluation) => (
              <div className="review" key={evaluation.id}>
                <b>{evaluation.market_name}</b>
                <p>{evaluation.comment}</p>
                <span>Entrega {evaluation.on_time_delivery} · Qualidade {evaluation.product_quality} · Atendimento {evaluation.service_score}</span>
              </div>
            ))}
          </section>
        </div>

        <aside className="profile-side">
          <section className="panel facts">
            <h3>Dados comerciais</h3>
            <Metric label="Produtos" value={supplier.products} />
            <Metric label="Entrega média" value={`${supplier.avg_delivery_days} dia(s)`} />
            <Metric label="Preço médio" value={formatMoney(supplier.avg_price)} />
            <Metric label="Contato" value={supplier.contact_name || supplier.phone} />
          </section>

          <section className="panel">
            <h3>Enviar pedido</h3>
            {message && <div className="alert success">{message}</div>}
            <form className="order-form" onSubmit={send}>
              <label>Mercado<input name="market_name" value={form.market_name} onChange={change} required /></label>
              <label>Seu nome<input name="requester_name" value={form.requester_name} onChange={change} required /></label>
              <label>Telefone<input name="requester_phone" value={form.requester_phone} onChange={change} /></label>
              <label>Produto<input name="product_requested" value={form.product_requested} onChange={change} required /></label>
              <label>Quantidade<input name="quantity" value={form.quantity} onChange={change} /></label>
              <label>
                Prazo desejado
                <select name="desired_delivery_days" value={form.desired_delivery_days} onChange={change}>
                  <option value="1">Até 1 dia</option>
                  <option value="2">Até 2 dias</option>
                  <option value="3">Até 3 dias</option>
                  <option value="5">Até 5 dias</option>
                </select>
              </label>
              <label>Observações<textarea name="notes" value={form.notes} onChange={change} /></label>
              <button>Enviar para cotação</button>
            </form>
          </section>
        </aside>
      </div>
    </section>
  );
}

function OrderCard({ order, onRefresh, supplierMode = false }) {
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
        <div>
          <div className="inline-list">
            <Badge tone={order.status === 'concluido' ? 'good' : order.status === 'recusado' ? 'danger' : 'neutral'}>
              {statusText(order.status)}
            </Badge>
            {order.supplier_is_sponsored && <Badge tone="sponsored">Fornecedor patrocinado</Badge>}
          </div>
          <h3>{order.product_requested}</h3>
          <p>{order.market_name} → {order.supplier_name}</p>
          <small>{order.quantity || 'Quantidade não informada'} · desejado em {order.desired_delivery_days || '-'} dia(s) · {formatDate(order.created_at)}</small>
        </div>
        {order.response_price && (
          <div className="quote-summary">
            <span>Cotação</span>
            <b>{formatMoney(order.response_price)}</b>
            <small>{order.response_delivery_days} dia(s)</small>
          </div>
        )}
      </div>

      {order.supplier_response && <p className="quote-note">{order.supplier_response}</p>}

      {supplierMode && ['enviado', 'em_analise'].includes(order.status) && (
        <form className="quote-form" onSubmit={(event) => { event.preventDefault(); respond(); }}>
          <label>Preço final<input name="response_price" value={quote.response_price} onChange={changeQuote} placeholder="Ex: 89.90" required /></label>
          <label>Prazo confirmado<input name="response_delivery_days" value={quote.response_delivery_days} onChange={changeQuote} required /></label>
          <label className="wide">Mensagem<textarea name="supplier_response" value={quote.supplier_response} onChange={changeQuote} /></label>
          <div className="row-actions wide">
            <button type="submit">Enviar cotação</button>
            <button type="button" className="secondary" onClick={() => respond('em_analise')}>Marcar em análise</button>
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

      {!supplierMode && order.status === 'concluido' && (
        <div className="row-actions">
          <button className="secondary" onClick={() => setReviewOpen((current) => !current)}>Avaliar fornecedor</button>
        </div>
      )}

      {reviewOpen && (
        <form className="quote-form" onSubmit={submitReview}>
          <label>Entrega<input name="on_time_delivery" value={review.on_time_delivery} onChange={changeReview} /></label>
          <label>Produto<input name="product_quality" value={review.product_quality} onChange={changeReview} /></label>
          <label>Preço<input name="price_score" value={review.price_score} onChange={changeReview} /></label>
          <label>Atendimento<input name="service_score" value={review.service_score} onChange={changeReview} /></label>
          <label>Atrasou?<select name="late_deliveries" value={review.late_deliveries} onChange={changeReview}><option value="0">Não</option><option value="1">Sim</option></select></label>
          <label className="wide">Comentário<textarea name="comment" value={review.comment} onChange={changeReview} /></label>
          <div className="row-actions wide"><button>Salvar avaliação</button></div>
        </form>
      )}
    </article>
  );
}

function Orders({ user }) {
  const [orders, setOrders] = useState([]);
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (user?.role === 'market') params.append('marketId', user.id);
    if (user?.role === 'supplier') params.append('supplierId', user.supplier_id);
    const result = await api.get(`/orders?${params.toString()}`);
    setOrders(result.orders || []);
    setSource(result.dataSource);
    setLoading(false);
  }

  useEffect(() => { if (user) load(); }, [user?.id]);

  return (
    <section className="page">
      <SectionTitle
        eyebrow="Pedidos"
        title={user?.role === 'supplier' ? 'Pedidos do fornecedor' : 'Pedidos do mercado'}
        text="O ciclo comercial fecha com resposta do fornecedor, aceite do mercado e avaliação após entrega."
        action={<DataSource value={source} />}
      />
      {loading ? <div className="loader">Carregando pedidos...</div> : (
        <div className="order-list">
          {orders.length ? orders.map((order) => (
            <OrderCard key={order.id} order={order} onRefresh={load} supplierMode={user?.role === 'supplier'} />
          )) : <EmptyState title="Nenhum pedido encontrado" message="Envie uma cotação a partir do perfil de um fornecedor." />}
        </div>
      )}
    </section>
  );
}

function SupplierDesk({ user }) {
  const supplierId = user?.supplier_id || 1;
  const [desk, setDesk] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setDesk(await api.get(`/supplier-dashboard/${supplierId}`));
    setLoading(false);
  }

  useEffect(() => { load(); }, [supplierId]);

  if (loading || !desk) return <div className="loader">Carregando painel do fornecedor...</div>;

  return (
    <section className="page">
      <div className="supplier-hero">
        <div>
          <div className="inline-list"><DataSource value={desk.dataSource} /><Badge tone="sponsored">{desk.plan.name}</Badge></div>
          <h2>{desk.supplier.name}</h2>
          <p>Pedidos recebidos, respostas comerciais, métricas e reputação em um painel simples.</p>
        </div>
        <ScorePill score={desk.supplier.score} />
      </div>

      <div className="metrics">
        <Metric label="Visualizações" value={desk.metrics.profileViews} />
        <Metric label="Pedidos" value={desk.metrics.requests} />
        <Metric label="Pendentes" value={desk.metrics.pending} />
        <Metric label="Respondidos" value={desk.metrics.responded} />
        <Metric label="Aceitos" value={desk.metrics.accepted} />
        <Metric label="Taxa resposta" value={`${desk.metrics.responseRate}%`} />
        <Metric label="Cotado" value={formatMoney(desk.metrics.estimatedRevenue)} />
      </div>

      <SectionTitle eyebrow="Inbox comercial" title="Responder oportunidades" text="O fornecedor responde com preço final, prazo confirmado e observação." />
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
      <SectionTitle eyebrow="Monetização" title="Planos para fornecedores" text={rule} />
      {message && <div className="alert success">{message}</div>}
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
            <button onClick={() => activate(plan.id)}>{supplier?.plan === plan.id ? 'Reaplicar plano' : 'Simular upgrade'}</button>
          </article>
        ))}
      </div>
      <section className="panel rule-panel">
        <h3>Garantia de confiança</h3>
        <p>Ao trocar de plano, apenas `plan` e `is_sponsored` mudam. O score é calculado somente com avaliações, atrasos, volume, recência e taxa operacional.</p>
      </section>
    </section>
  );
}

function Dashboard({ open }) {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => { api.get('/dashboard').then(setDashboard); }, []);
  if (!dashboard) return <div className="loader">Carregando dashboard...</div>;

  return (
    <section className="page">
      <SectionTitle
        eyebrow="Executivo"
        title="Dashboard de produto e impacto"
        text={dashboard.conversionImpact}
        action={<DataSource value={dashboard.dataSource} />}
      />
      <div className="metrics">
        <Metric label="Fornecedores" value={dashboard.totalSuppliers} />
        <Metric label="Pedidos" value={dashboard.totalOrders} />
        <Metric label="Respondidos" value={`${dashboard.commercial.responseRate}%`} />
        <Metric label="Aceite" value={`${dashboard.commercial.acceptanceRate}%`} />
        <Metric label="MRR estimado" value={formatMoney(dashboard.commercial.estimatedMrr)} />
        <Metric label="Alto risco" value={dashboard.highRiskSuppliers} />
        <Metric label="Score médio" value={dashboard.averageScore} />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <SectionTitle eyebrow="Ranking" title="Confiança real" text="Ordenado por score, sem influência de plano pago." />
          {dashboard.ranking.map((supplier) => (
            <button className="ranking-row" key={supplier.id} onClick={() => open(supplier.id)}>
              <span>
                <b>{supplier.name}</b>
                <small>{supplier.category} · entrega {supplier.delivery} dia(s) · resposta {supplier.responseRate}%</small>
              </span>
              <strong>{supplier.score}</strong>
            </button>
          ))}
        </section>

        <section className="panel">
          <SectionTitle eyebrow="Score" title="Fórmula explicável" />
          <div className="formula-list">
            {dashboard.scoreFormula.map((item) => <span key={item}>{item}</span>)}
          </div>
          <p className="notice">Patrocínio afeta visibilidade comercial, não confiança. Esse é o diferencial ético e monetizável do ForneceJá.</p>
        </section>
      </div>
    </section>
  );
}

function App() {
  const [page, setPage] = useState('market');
  const [selected, setSelected] = useState(null);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get('/auth/demo-users').then((result) => {
      setUsers(result.users || []);
      setUser(result.users?.[0] || null);
    });
  }, []);

  function openSupplier(id) {
    setSelected(id);
    setPage('profile');
  }

  if (!user) return <div className="loader full">Carregando ForneceJá...</div>;

  return (
    <Layout page={page} setPage={setPage} users={users} user={user} setUser={setUser}>
      {page === 'market' && <Marketplace user={user} open={openSupplier} />}
      {page === 'profile' && <Profile id={selected} user={user} back={() => setPage('market')} />}
      {page === 'orders' && <Orders user={user} />}
      {page === 'supplier' && <SupplierDesk user={user} />}
      {page === 'plans' && <Plans user={user} />}
      {page === 'dash' && <Dashboard open={openSupplier} />}
    </Layout>
  );
}

createRoot(document.getElementById('root')).render(<App />);
