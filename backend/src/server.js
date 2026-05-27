import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'forneceja',
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 2500
});

const SCORE_FORMULA = [
  '30% pontualidade de entrega',
  '25% qualidade do produto',
  '15% atendimento',
  '10% preço',
  '10% consistência de atrasos',
  '10% volume e recência das avaliações'
];

const PLANS = [
  {
    id: 'gratuito',
    name: 'Gratuito',
    price: 0,
    highlight: 'Perfil público e pedidos orgânicos',
    features: ['Aparece na busca orgânica', 'Recebe pedidos do mercado', 'Score público e independente']
  },
  {
    id: 'destaque',
    name: 'Destaque',
    price: 99,
    highlight: 'Mais visibilidade nas buscas',
    features: ['Selo Patrocinado', 'Prioridade visual em áreas pagas', 'Métricas de oportunidades']
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 199,
    highlight: 'Operação comercial completa',
    features: ['Destaque pago', 'Analytics avançado', 'Perfil comercial completo']
  }
];

const demoUsers = [
  {
    id: 1,
    role: 'market',
    name: 'Silas Oliveira',
    company: 'Mercado do Bairro',
    email: 'silas@mercadodobairro.com',
    phone: '(47) 98888-0000'
  },
  {
    id: 2,
    role: 'supplier',
    supplier_id: 1,
    name: 'Marcos Silva',
    company: 'Bebidas Norte Distribuidora',
    email: 'marcos@bebidasnorte.com.br',
    phone: '(47) 99999-1111'
  },
  {
    id: 3,
    role: 'supplier',
    supplier_id: 4,
    name: 'Paula Costa',
    company: 'Embalagens Rápidas SC',
    email: 'paula@embalagensrapidas.com.br',
    phone: '(47) 99999-4444'
  },
  {
    id: 4,
    role: 'admin',
    name: 'Admin ForneceJá',
    company: 'ForneceJá',
    email: 'admin@forneceja.com'
  }
];

const demoSuppliers = [
  {
    id: 1,
    name: 'Bebidas Norte Distribuidora',
    category: 'Bebidas',
    products: 'refrigerante, água, suco, energético',
    avg_delivery_days: 2,
    avg_price: 89.9,
    region: 'Joinville e região norte',
    city: 'Joinville',
    state: 'SC',
    contact_name: 'Marcos Silva',
    phone: '(47) 99999-1111',
    email: 'vendas@bebidasnorte.com.br',
    is_verified: 1,
    is_sponsored: 1,
    plan: 'destaque',
    description: 'Distribuidora regional focada em bebidas para pequenos mercados.'
  },
  {
    id: 2,
    name: 'Sul Refri Atacadista',
    category: 'Bebidas',
    products: 'refrigerante, água mineral, cerveja sem álcool',
    avg_delivery_days: 4,
    avg_price: 82.5,
    region: 'Santa Catarina',
    city: 'Blumenau',
    state: 'SC',
    contact_name: 'Carla Mendes',
    phone: '(47) 99999-2222',
    email: 'comercial@sulrefri.com.br',
    is_verified: 1,
    is_sponsored: 0,
    plan: 'gratuito',
    description: 'Atacadista com preço competitivo e prazo maior para algumas regiões.'
  },
  {
    id: 3,
    name: 'HortiBom Fornecimentos',
    category: 'Hortifruti',
    products: 'frutas, verduras, legumes',
    avg_delivery_days: 1,
    avg_price: 120,
    region: 'Joinville',
    city: 'Joinville',
    state: 'SC',
    contact_name: 'João Pereira',
    phone: '(47) 99999-3333',
    email: 'contato@hortibom.com.br',
    is_verified: 1,
    is_sponsored: 0,
    plan: 'gratuito',
    description: 'Fornecedor local de hortifruti com entregas rápidas.'
  },
  {
    id: 4,
    name: 'Embalagens Rápidas SC',
    category: 'Embalagens',
    products: 'sacolas, caixas, potes, embalagens delivery',
    avg_delivery_days: 2,
    avg_price: 65,
    region: 'Joinville e Araquari',
    city: 'Araquari',
    state: 'SC',
    contact_name: 'Paula Costa',
    phone: '(47) 99999-4444',
    email: 'vendas@embalagensrapidas.com.br',
    is_verified: 0,
    is_sponsored: 1,
    plan: 'destaque',
    description: 'Fornecedor de embalagens para mercados, padarias e restaurantes.'
  },
  {
    id: 5,
    name: 'LimpaMais Atacado',
    category: 'Limpeza',
    products: 'detergente, desinfetante, papel toalha, álcool',
    avg_delivery_days: 3,
    avg_price: 74.9,
    region: 'Norte de SC',
    city: 'Joinville',
    state: 'SC',
    contact_name: 'Rafael Lima',
    phone: '(47) 99999-5555',
    email: 'atendimento@limpamais.com.br',
    is_verified: 1,
    is_sponsored: 0,
    plan: 'gratuito',
    description: 'Produtos de limpeza em atacado para pequenos comércios.'
  },
  {
    id: 6,
    name: 'Frios Serra Azul',
    category: 'Frios e laticínios',
    products: 'queijo, presunto, iogurte, manteiga',
    avg_delivery_days: 2,
    avg_price: 145,
    region: 'Joinville e São Bento do Sul',
    city: 'São Bento do Sul',
    state: 'SC',
    contact_name: 'Amanda Rocha',
    phone: '(47) 99999-6666',
    email: 'comercial@friosserra.com.br',
    is_verified: 1,
    is_sponsored: 0,
    plan: 'gratuito',
    description: 'Fornecedor de frios e laticínios para mercados de pequeno porte.'
  },
  {
    id: 7,
    name: 'Refri Vale Comércio',
    category: 'Bebidas',
    products: 'refrigerante, água com gás, chá gelado',
    avg_delivery_days: 2,
    avg_price: 94.5,
    region: 'Joinville e litoral norte',
    city: 'Joinville',
    state: 'SC',
    contact_name: 'Bruna Almeida',
    phone: '(47) 99999-7777',
    email: 'pedidos@refrivale.com.br',
    is_verified: 1,
    is_sponsored: 0,
    plan: 'gratuito',
    description: 'Fornecedor local com boa previsibilidade para reposição semanal de bebidas.'
  }
];

const demoEvaluations = [
  {
    id: 1,
    supplier_id: 1,
    order_id: 2,
    market_name: 'Mercado Central Joinville',
    on_time_delivery: 95,
    product_quality: 90,
    price_score: 82,
    service_score: 88,
    total_deliveries: 28,
    late_deliveries: 1,
    comment: 'Entrega rápida e bom atendimento. Ótima opção para reposição urgente de bebidas.',
    created_at: '2026-05-10T12:00:00.000Z'
  },
  {
    id: 2,
    supplier_id: 2,
    order_id: null,
    market_name: 'Mercadinho Boa Compra',
    on_time_delivery: 62,
    product_quality: 84,
    price_score: 92,
    service_score: 70,
    total_deliveries: 18,
    late_deliveries: 5,
    comment: 'Preço bom, mas já atrasou algumas entregas.',
    created_at: '2026-05-08T12:00:00.000Z'
  },
  {
    id: 3,
    supplier_id: 3,
    order_id: 3,
    market_name: 'Mercado Vila Nova',
    on_time_delivery: 96,
    product_quality: 91,
    price_score: 78,
    service_score: 87,
    total_deliveries: 35,
    late_deliveries: 0,
    comment: 'Hortifruti com boa qualidade e entrega muito rápida.',
    created_at: '2026-05-06T12:00:00.000Z'
  },
  {
    id: 4,
    supplier_id: 4,
    order_id: null,
    market_name: 'Padaria Sabor Caseiro',
    on_time_delivery: 54,
    product_quality: 65,
    price_score: 78,
    service_score: 58,
    total_deliveries: 14,
    late_deliveries: 5,
    comment: 'Fornecedor patrocinado, mas com atrasos e comunicação instável nas últimas compras.',
    created_at: '2026-05-04T12:00:00.000Z'
  },
  {
    id: 5,
    supplier_id: 5,
    order_id: null,
    market_name: 'Mercado Santa Clara',
    on_time_delivery: 82,
    product_quality: 79,
    price_score: 85,
    service_score: 81,
    total_deliveries: 22,
    late_deliveries: 2,
    comment: 'Fornecedor estável para produtos de limpeza.',
    created_at: '2026-05-02T12:00:00.000Z'
  },
  {
    id: 6,
    supplier_id: 6,
    order_id: null,
    market_name: 'Mercado Bom Dia',
    on_time_delivery: 88,
    product_quality: 92,
    price_score: 70,
    service_score: 84,
    total_deliveries: 19,
    late_deliveries: 1,
    comment: 'Produtos bons e entrega geralmente dentro do prazo.',
    created_at: '2026-04-29T12:00:00.000Z'
  },
  {
    id: 7,
    supplier_id: 7,
    order_id: null,
    market_name: 'Mercado Costa e Silva',
    on_time_delivery: 86,
    product_quality: 84,
    price_score: 76,
    service_score: 82,
    total_deliveries: 21,
    late_deliveries: 2,
    comment: 'Boa opção orgânica para bebidas, com prazo estável e atendimento direto.',
    created_at: '2026-05-12T12:00:00.000Z'
  }
];

const demoOrders = [
  {
    id: 1,
    supplier_id: 1,
    market_id: 1,
    market_name: 'Mercado do Bairro',
    requester_name: 'Silas Oliveira',
    requester_phone: '(47) 98888-0000',
    product_requested: 'Refrigerante 2L',
    quantity: '30 caixas',
    desired_delivery_days: 2,
    notes: 'Preciso para reposição até sexta-feira.',
    status: 'enviado',
    response_price: null,
    response_delivery_days: null,
    supplier_response: null,
    response_expires_at: null,
    responded_at: null,
    accepted_at: null,
    completed_at: null,
    created_at: '2026-05-26T11:30:00.000Z'
  },
  {
    id: 2,
    supplier_id: 1,
    market_id: 1,
    market_name: 'Mercado Central Joinville',
    requester_name: 'Silas',
    requester_phone: '(47) 98888-0000',
    product_requested: 'Água mineral 500ml',
    quantity: '50 fardos',
    desired_delivery_days: 2,
    notes: 'Preferência por entrega pela manhã.',
    status: 'respondido',
    response_price: 88.9,
    response_delivery_days: 2,
    supplier_response: 'Temos estoque para entrega em até 2 dias com frete incluso.',
    response_expires_at: '2026-05-30T18:00:00.000Z',
    responded_at: '2026-05-26T13:10:00.000Z',
    accepted_at: null,
    completed_at: null,
    created_at: '2026-05-25T16:00:00.000Z'
  },
  {
    id: 3,
    supplier_id: 3,
    market_id: 1,
    market_name: 'Mercado Vila Nova',
    requester_name: 'Ana',
    requester_phone: '(47) 97777-1111',
    product_requested: 'Banana e tomate',
    quantity: '20 caixas',
    desired_delivery_days: 1,
    notes: 'Entrega pela manhã.',
    status: 'concluido',
    response_price: 118,
    response_delivery_days: 1,
    supplier_response: 'Entrega confirmada para amanhã até 10h.',
    response_expires_at: '2026-05-29T18:00:00.000Z',
    responded_at: '2026-05-24T10:00:00.000Z',
    accepted_at: '2026-05-24T10:35:00.000Z',
    completed_at: '2026-05-25T09:50:00.000Z',
    created_at: '2026-05-24T09:20:00.000Z'
  },
  {
    id: 4,
    supplier_id: 4,
    market_id: 1,
    market_name: 'Padaria Sabor Caseiro',
    requester_name: 'Roberta',
    requester_phone: '(47) 96666-1111',
    product_requested: 'Embalagem delivery',
    quantity: '400 unidades',
    desired_delivery_days: 2,
    notes: 'Preciso comparar preço com fornecedores verificados.',
    status: 'em_analise',
    response_price: null,
    response_delivery_days: null,
    supplier_response: null,
    response_expires_at: null,
    responded_at: null,
    accepted_at: null,
    completed_at: null,
    created_at: '2026-05-26T08:20:00.000Z'
  }
];

let nextDemoOrderId = 5;
let nextDemoEvaluationId = 8;
let lastDbError = null;

function fixEncoding(value) {
  if (typeof value !== 'string' || !/[ÃÂâ]/.test(value)) return value;

  try {
    return Buffer.from(value, 'latin1').toString('utf8');
  } catch {
    return value;
  }
}

function cleanRow(row) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, fixEncoding(value)])
  );
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBool(value) {
  return value === true || value === 1 || value === '1';
}

function averageWeighted(items, field) {
  const weighted = items.map((item) => ({
    value: toNumber(item[field]),
    weight: recencyWeight(item.created_at)
  }));
  const weightTotal = weighted.reduce((sum, item) => sum + item.weight, 0);
  if (!weightTotal) return 0;
  return weighted.reduce((sum, item) => sum + item.value * item.weight, 0) / weightTotal;
}

function recencyWeight(createdAt) {
  if (!createdAt) return 0.75;
  const days = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / 86400000);
  if (days <= 30) return 1;
  if (days <= 90) return 0.85;
  return 0.65;
}

function scoreFromEvaluations(evaluations = []) {
  if (!evaluations.length) {
    return {
      score: 0,
      level: 'sem_avaliacao',
      label: 'Sem avaliação',
      warnings: ['Sem avaliações suficientes'],
      recommendation: 'Fornecedor ainda não possui histórico suficiente para recomendação automática.',
      formula: SCORE_FORMULA,
      components: { onTime: 0, quality: 0, service: 0, price: 0, consistency: 0, confidence: 0 },
      lateRate: 0,
      totalDeliveries: 0,
      lateDeliveries: 0,
      confidence: 0
    };
  }

  const onTime = averageWeighted(evaluations, 'on_time_delivery');
  const quality = averageWeighted(evaluations, 'product_quality');
  const service = averageWeighted(evaluations, 'service_score');
  const price = averageWeighted(evaluations, 'price_score');
  const totalDeliveries = evaluations.reduce((sum, item) => sum + toNumber(item.total_deliveries), 0);
  const lateDeliveries = evaluations.reduce((sum, item) => sum + toNumber(item.late_deliveries), 0);
  const lateRate = totalDeliveries > 0 ? lateDeliveries / totalDeliveries : 0;
  const consistency = totalDeliveries > 0 ? Math.max(0, 100 - lateRate * 100) : 45;
  const volume = Math.min(100, totalDeliveries * 3);
  const recent = Math.round(
    evaluations.reduce((sum, item) => sum + recencyWeight(item.created_at) * 100, 0) / evaluations.length
  );
  const confidence = Math.round(volume * 0.65 + recent * 0.35);

  const rawScore =
    onTime * 0.3 +
    quality * 0.25 +
    service * 0.15 +
    price * 0.1 +
    consistency * 0.1 +
    confidence * 0.1;
  const sampleRisk = totalDeliveries < 10 ? 8 : totalDeliveries < 20 ? 3 : 0;
  const score = Math.max(0, Math.min(100, Math.round(rawScore - sampleRisk)));

  const warnings = [];
  if (lateRate >= 0.25) warnings.push('histórico relevante de atrasos');
  else if (lateRate >= 0.1) warnings.push('alguns atrasos registrados');
  if (service < 75) warnings.push('atendimento abaixo da média');
  if (quality < 75) warnings.push('qualidade abaixo da média');
  if (totalDeliveries < 10) warnings.push('amostra de avaliações pequena');

  const level = score >= 80 ? 'confiavel' : score >= 60 ? 'atencao' : 'alto_risco';
  const label = score >= 80 ? 'Confiável' : score >= 60 ? 'Atenção' : 'Alto risco';
  const recommendation =
    score >= 80
      ? 'Fornecedor recomendado: histórico forte, recente e consistente.'
      : score >= 60
        ? `Fornecedor utilizável, mas vale comparar. ${warnings.join(', ') || 'Há sinais moderados de risco.'}`
        : `Fornecedor de maior risco para compras urgentes. ${warnings.join(', ') || 'O score está abaixo do ideal.'}`;

  return {
    score,
    level,
    label,
    warnings,
    recommendation,
    formula: SCORE_FORMULA,
    components: {
      onTime: Math.round(onTime),
      quality: Math.round(quality),
      service: Math.round(service),
      price: Math.round(price),
      consistency: Math.round(consistency),
      confidence
    },
    lateRate: Number(lateRate.toFixed(2)),
    totalDeliveries,
    lateDeliveries,
    confidence
  };
}

function matchSearch(supplier, filters) {
  const q = normalizeText(filters.q);
  const region = normalizeText(filters.region);
  const category = normalizeText(filters.category);
  const haystack = normalizeText(`${supplier.name} ${supplier.category} ${supplier.products} ${supplier.description}`);
  const regionStack = normalizeText(`${supplier.region} ${supplier.city} ${supplier.state}`);

  if (q && !haystack.includes(q)) return false;
  if (region && !regionStack.includes(region)) return false;
  if (category && normalizeText(supplier.category) !== category) return false;
  if (filters.maxDeliveryDays && toNumber(supplier.avg_delivery_days) > toNumber(filters.maxDeliveryDays)) return false;
  if (filters.maxPrice && toNumber(supplier.avg_price) > toNumber(filters.maxPrice)) return false;

  return true;
}

function supplierResponseRate(supplierId, orders = []) {
  const supplierOrders = orders.filter((order) => Number(order.supplier_id) === Number(supplierId));
  if (!supplierOrders.length) return 0;
  const responded = supplierOrders.filter((order) =>
    ['respondido', 'aceito', 'concluido'].includes(order.status)
  ).length;
  return Math.round((responded / supplierOrders.length) * 100);
}

function marketFitScore(supplier, filters, orders = []) {
  let fit = 42;
  const q = normalizeText(filters.q);
  const region = normalizeText(filters.region);
  const haystack = normalizeText(`${supplier.name} ${supplier.category} ${supplier.products}`);
  const regionStack = normalizeText(`${supplier.region} ${supplier.city} ${supplier.state}`);

  if (!q || haystack.includes(q)) fit += 18;
  if (!region || regionStack.includes(region)) fit += 13;
  if (!filters.maxDeliveryDays || toNumber(supplier.avg_delivery_days) <= toNumber(filters.maxDeliveryDays)) fit += 12;
  if (!filters.maxPrice || toNumber(supplier.avg_price) <= toNumber(filters.maxPrice)) fit += 8;
  if (toBool(supplier.is_verified)) fit += 7;
  if (supplier.score?.lateRate <= 0.1) fit += 6;
  fit += Math.min(6, Math.round(supplierResponseRate(supplier.id, orders) / 18));

  return Math.min(100, fit);
}

function enrichSupplier(supplier, evaluations = [], filters = {}, orders = []) {
  const supplierEvaluations = evaluations
    .filter((item) => Number(item.supplier_id) === Number(supplier.id))
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  const score = scoreFromEvaluations(supplierEvaluations);
  const responseRate = supplierResponseRate(supplier.id, orders);
  const base = {
    ...supplier,
    avg_delivery_days: toNumber(supplier.avg_delivery_days),
    avg_price: toNumber(supplier.avg_price),
    is_verified: toBool(supplier.is_verified),
    is_sponsored: toBool(supplier.is_sponsored),
    evaluations: supplierEvaluations,
    latestEvaluation: supplierEvaluations[0] || null,
    responseRate,
    score,
    sponsorNotice: toBool(supplier.is_sponsored)
      ? 'Patrocinado: destaque pago aumenta visibilidade, mas nunca altera score, ranking de confiança ou recomendação.'
      : 'Resultado orgânico: sem destaque pago.',
    trustSummary: `${score.totalDeliveries} entregas avaliadas, ${score.lateDeliveries} atraso(s), ${responseRate}% de resposta.`
  };

  return {
    ...base,
    searchFit: marketFitScore(base, filters, orders)
  };
}

function bestRecommendation(suppliers) {
  const scored = suppliers
    .filter((supplier) => supplier.score.score > 0)
    .map((supplier) => ({
      ...supplier,
      recommendationScore: Math.round(supplier.score.score * 0.68 + supplier.searchFit * 0.24 + supplier.responseRate * 0.08)
    }))
    .sort(
      (a, b) =>
        b.recommendationScore - a.recommendationScore ||
        b.score.score - a.score.score ||
        a.avg_delivery_days - b.avg_delivery_days
    );

  const best = scored[0] || null;
  if (!best) return null;

  return {
    id: best.id,
    name: best.name,
    category: best.category,
    city: best.city,
    state: best.state,
    score: best.score.score,
    fit: best.searchFit,
    responseRate: best.responseRate,
    avgDeliveryDays: best.avg_delivery_days,
    avgPrice: best.avg_price,
    isSponsored: best.is_sponsored,
    isVerified: best.is_verified,
    reason: 'Melhor combinação entre score, aderência à busca e taxa de resposta. Patrocínio não entra nesse cálculo.'
  };
}

function visibleSort(a, b) {
  return (
    Number(b.is_sponsored) - Number(a.is_sponsored) ||
    Number(b.is_verified) - Number(a.is_verified) ||
    b.searchFit - a.searchFit ||
    b.score.score - a.score.score ||
    a.avg_delivery_days - b.avg_delivery_days
  );
}

async function safeSelect(sql, params = [], fallback = []) {
  try {
    const [rows] = await pool.query(sql, params);
    return rows.map(cleanRow);
  } catch {
    return fallback.map(cleanRow);
  }
}

async function loadData() {
  try {
    const suppliers = await safeSelect('SELECT * FROM suppliers ORDER BY id ASC');
    const evaluations = await safeSelect('SELECT * FROM evaluations ORDER BY created_at DESC', [], demoEvaluations);
    const orders = await safeSelect('SELECT * FROM orders ORDER BY created_at DESC', [], demoOrders);
    const users = await safeSelect('SELECT * FROM users ORDER BY id ASC', [], demoUsers);
    lastDbError = null;

    if (!suppliers.length) {
      lastDbError = 'Banco conectado, mas sem fornecedores cadastrados. Usando dados de demonstração.';
      return demoData();
    }

    return { source: 'mysql', suppliers, evaluations, orders, users };
  } catch (error) {
    lastDbError = error.message;
    return demoData();
  }
}

function demoData() {
  return {
    source: 'demo',
    suppliers: demoSuppliers.map(cleanRow),
    evaluations: demoEvaluations.map(cleanRow),
    orders: demoOrders.map(cleanRow),
    users: demoUsers.map(cleanRow)
  };
}

function findSupplier(supplierId, suppliers) {
  return suppliers.find((item) => Number(item.id) === Number(supplierId));
}

function withOrderRelations(order, suppliers, users = []) {
  const supplier = findSupplier(order.supplier_id, suppliers);
  const marketUser = users.find((user) => Number(user.id) === Number(order.market_id));
  return {
    ...order,
    response_price: order.response_price == null ? null : toNumber(order.response_price),
    response_delivery_days: order.response_delivery_days == null ? null : toNumber(order.response_delivery_days),
    supplier_name: supplier?.name || 'Fornecedor não encontrado',
    supplier_plan: supplier?.plan || 'gratuito',
    supplier_is_sponsored: toBool(supplier?.is_sponsored),
    supplier_is_verified: toBool(supplier?.is_verified),
    market_company: marketUser?.company || order.market_name
  };
}

function filterOrders(orders, query) {
  return orders.filter((order) => {
    if (query.supplierId && Number(order.supplier_id) !== Number(query.supplierId)) return false;
    if (query.marketId && Number(order.market_id) !== Number(query.marketId)) return false;
    if (query.status && order.status !== query.status) return false;
    return true;
  });
}

function updateDemoOrder(id, patch) {
  const index = demoOrders.findIndex((order) => Number(order.id) === Number(id));
  if (index === -1) return null;
  demoOrders[index] = { ...demoOrders[index], ...patch };
  return demoOrders[index];
}

function commercialMetrics(suppliers, orders) {
  const responded = orders.filter((order) => ['respondido', 'aceito', 'concluido'].includes(order.status)).length;
  const accepted = orders.filter((order) => ['aceito', 'concluido'].includes(order.status)).length;
  const completed = orders.filter((order) => order.status === 'concluido').length;
  const quotedValue = orders.reduce((sum, order) => sum + toNumber(order.response_price), 0);
  const paidSuppliers = suppliers.filter((supplier) => supplier.plan !== 'gratuito').length;

  return {
    respondedOrders: responded,
    acceptedOrders: accepted,
    completedOrders: completed,
    responseRate: orders.length ? Math.round((responded / orders.length) * 100) : 0,
    acceptanceRate: responded ? Math.round((accepted / responded) * 100) : 0,
    quotedValue: Number(quotedValue.toFixed(2)),
    paidSuppliers,
    estimatedMrr: suppliers.reduce((sum, supplier) => {
      const plan = PLANS.find((item) => item.id === supplier.plan);
      return sum + (plan?.price || 0);
    }, 0)
  };
}

function planById(planId) {
  return PLANS.find((plan) => plan.id === planId) || PLANS[0];
}

app.get('/', (req, res) => {
  res.json({
    app: 'ForneceJá API',
    status: 'online',
    message: 'Backend ativo. Abra o frontend em http://localhost:5173.',
    endpoints: [
      '/api/health',
      '/api/auth/demo-users',
      '/api/suppliers',
      '/api/orders',
      '/api/supplier-dashboard/:id',
      '/api/plans',
      '/api/dashboard'
    ]
  });
});

app.get('/api', (req, res) => {
  res.json({ app: 'ForneceJá API', endpoints: ['/api/health', '/api/suppliers', '/api/orders'] });
});

app.get('/api/health', async (req, res) => {
  const data = await loadData();
  res.json({
    status: 'ok',
    app: 'ForneceJá API',
    dataSource: data.source,
    database: data.source === 'mysql' ? 'connected' : 'demo fallback',
    databaseError: data.source === 'demo' ? lastDbError : null
  });
});

app.get('/api/auth/demo-users', async (req, res) => {
  const data = await loadData();
  res.json({ dataSource: data.source, users: data.users });
});

app.post('/api/auth/login', async (req, res) => {
  const data = await loadData();
  const user = data.users.find((item) => Number(item.id) === Number(req.body.userId));
  if (!user) return res.status(404).json({ message: 'Usuário demo não encontrado.' });
  res.json({ user, dataSource: data.source });
});

app.get('/api/plans', (req, res) => {
  res.json({
    plans: PLANS,
    rule: 'Planos pagos compram visibilidade e métricas comerciais, nunca score maior.'
  });
});

app.get('/api/suppliers', async (req, res) => {
  const filters = {
    q: req.query.q || '',
    region: req.query.region || '',
    category: req.query.category || '',
    maxDeliveryDays: req.query.maxDeliveryDays || '',
    maxPrice: req.query.maxPrice || '',
    minScore: req.query.minScore || ''
  };
  const data = await loadData();
  const enriched = data.suppliers.map((supplier) => enrichSupplier(supplier, data.evaluations, filters, data.orders));
  const filtered = enriched
    .filter((supplier) => matchSearch(supplier, filters))
    .filter((supplier) => !filters.minScore || supplier.score.score >= toNumber(filters.minScore));
  const suppliers = filtered.sort(visibleSort);
  const recommendation = bestRecommendation(filtered);
  const categories = [...new Set(data.suppliers.map((supplier) => supplier.category))].sort();
  const regions = [...new Set(data.suppliers.map((supplier) => supplier.city))].sort();

  res.json({
    dataSource: data.source,
    scoreFormula: SCORE_FORMULA,
    recommendation,
    categories,
    regions,
    summary: {
      total: suppliers.length,
      sponsored: suppliers.filter((supplier) => supplier.is_sponsored).length,
      verified: suppliers.filter((supplier) => supplier.is_verified).length,
      reliable: suppliers.filter((supplier) => supplier.score.score >= 80).length,
      highRisk: suppliers.filter((supplier) => supplier.score.score > 0 && supplier.score.score < 60).length
    },
    suppliers
  });
});

app.get('/api/suppliers/:id', async (req, res) => {
  const data = await loadData();
  const supplier = findSupplier(req.params.id, data.suppliers);

  if (!supplier) return res.status(404).json({ message: 'Fornecedor não encontrado.' });

  const enriched = enrichSupplier(supplier, data.evaluations, {}, data.orders);
  const orders = data.orders
    .filter((order) => Number(order.supplier_id) === Number(req.params.id))
    .map((order) => withOrderRelations(order, data.suppliers, data.users));

  res.json({ ...enriched, orders, scoreFormula: SCORE_FORMULA });
});

app.patch('/api/suppliers/:id/plan', async (req, res) => {
  const plan = planById(req.body.plan);
  const isSponsored = plan.id !== 'gratuito';
  const data = await loadData();
  const supplier = findSupplier(req.params.id, data.suppliers);
  if (!supplier) return res.status(404).json({ message: 'Fornecedor não encontrado.' });

  if (data.source === 'mysql') {
    try {
      await pool.query('UPDATE suppliers SET plan = ?, is_sponsored = ? WHERE id = ?', [
        plan.id,
        isSponsored,
        req.params.id
      ]);
    } catch (error) {
      lastDbError = error.message;
    }
  }

  const demoSupplier = findSupplier(req.params.id, demoSuppliers);
  if (demoSupplier) {
    demoSupplier.plan = plan.id;
    demoSupplier.is_sponsored = isSponsored ? 1 : 0;
  }

  res.json({
    message: `Plano ${plan.name} ativado. O score não foi alterado.`,
    supplier: { ...supplier, plan: plan.id, is_sponsored: isSponsored },
    plan
  });
});

app.post('/api/orders', async (req, res) => {
  const {
    supplier_id,
    market_id,
    market_name,
    requester_name,
    requester_phone,
    product_requested,
    quantity,
    desired_delivery_days,
    notes
  } = req.body;

  if (!supplier_id || !market_name || !requester_name || !product_requested) {
    return res.status(400).json({ message: 'Informe fornecedor, mercado, solicitante e produto.' });
  }

  const newOrder = {
    supplier_id: Number(supplier_id),
    market_id: market_id ? Number(market_id) : null,
    market_name,
    requester_name,
    requester_phone: requester_phone || null,
    product_requested,
    quantity: quantity || null,
    desired_delivery_days: desired_delivery_days || null,
    notes: notes || null,
    status: 'enviado',
    created_at: new Date().toISOString()
  };
  const data = await loadData();

  if (data.source === 'mysql') {
    try {
      const [result] = await pool.query(
        'INSERT INTO orders (supplier_id, market_id, market_name, requester_name, requester_phone, product_requested, quantity, desired_delivery_days, notes) VALUES (?,?,?,?,?,?,?,?,?)',
        [
          newOrder.supplier_id,
          newOrder.market_id,
          newOrder.market_name,
          newOrder.requester_name,
          newOrder.requester_phone,
          newOrder.product_requested,
          newOrder.quantity,
          newOrder.desired_delivery_days,
          newOrder.notes
        ]
      );

      return res.status(201).json({ id: result.insertId, message: 'Pedido enviado ao fornecedor.', dataSource: 'mysql' });
    } catch (error) {
      lastDbError = error.message;
    }
  }

  const fallbackOrder = { id: nextDemoOrderId++, ...newOrder };
  demoOrders.unshift(fallbackOrder);
  res.status(201).json({
    id: fallbackOrder.id,
    message: data.source === 'mysql' ? 'Pedido salvo no modo demo por incompatibilidade do banco.' : 'Pedido salvo no modo demo.',
    dataSource: 'demo',
    order: fallbackOrder
  });
});

app.get('/api/orders', async (req, res) => {
  const data = await loadData();
  const orders = filterOrders(data.orders, req.query)
    .map((order) => withOrderRelations(order, data.suppliers, data.users))
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  res.json({ dataSource: data.source, orders });
});

app.patch('/api/orders/:id/respond', async (req, res) => {
  const { response_price, response_delivery_days, supplier_response, status = 'respondido' } = req.body;
  const allowed = ['respondido', 'em_analise', 'recusado'];
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Status de resposta inválido.' });
  const patch = {
    status,
    response_price: status === 'recusado' ? null : toNumber(response_price),
    response_delivery_days: status === 'recusado' ? null : toNumber(response_delivery_days),
    supplier_response: supplier_response || null,
    response_expires_at: status === 'respondido' ? new Date(Date.now() + 3 * 86400000).toISOString() : null,
    responded_at: new Date().toISOString()
  };
  const data = await loadData();

  if (data.source === 'mysql') {
    try {
      await pool.query(
        'UPDATE orders SET status = ?, response_price = ?, response_delivery_days = ?, supplier_response = ?, response_expires_at = ?, responded_at = ? WHERE id = ?',
        [
          patch.status,
          patch.response_price,
          patch.response_delivery_days,
          patch.supplier_response,
          patch.response_expires_at,
          patch.responded_at,
          req.params.id
        ]
      );
    } catch (error) {
      lastDbError = error.message;
    }
  }

  const updated = updateDemoOrder(req.params.id, patch);
  res.json({
    message: status === 'recusado' ? 'Pedido recusado pelo fornecedor.' : 'Cotação enviada ao mercado.',
    order: updated || { id: Number(req.params.id), ...patch }
  });
});

app.patch('/api/orders/:id/status', async (req, res) => {
  const allowed = ['enviado', 'em_analise', 'respondido', 'aceito', 'recusado', 'concluido', 'cancelado'];
  const status = req.body.status;
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Status inválido.' });
  const patch = {
    status,
    accepted_at: status === 'aceito' ? new Date().toISOString() : undefined,
    completed_at: status === 'concluido' ? new Date().toISOString() : undefined
  };
  Object.keys(patch).forEach((key) => patch[key] === undefined && delete patch[key]);
  const data = await loadData();

  if (data.source === 'mysql') {
    try {
      const columns = ['status = ?'];
      const params = [status];
      if (patch.accepted_at) {
        columns.push('accepted_at = ?');
        params.push(patch.accepted_at);
      }
      if (patch.completed_at) {
        columns.push('completed_at = ?');
        params.push(patch.completed_at);
      }
      params.push(req.params.id);
      await pool.query(`UPDATE orders SET ${columns.join(', ')} WHERE id = ?`, params);
    } catch (error) {
      lastDbError = error.message;
    }
  }

  const updated = updateDemoOrder(req.params.id, patch);
  res.json({ message: 'Status atualizado.', order: updated || { id: Number(req.params.id), ...patch } });
});

app.post('/api/evaluations', async (req, res) => {
  const {
    supplier_id,
    order_id,
    market_name,
    on_time_delivery,
    product_quality,
    price_score,
    service_score,
    late_deliveries = 0,
    comment
  } = req.body;

  if (!supplier_id || !market_name || !on_time_delivery || !product_quality || !price_score || !service_score) {
    return res.status(400).json({ message: 'Informe fornecedor, mercado e notas da avaliação.' });
  }

  const evaluation = {
    id: nextDemoEvaluationId++,
    supplier_id: Number(supplier_id),
    order_id: order_id ? Number(order_id) : null,
    market_name,
    on_time_delivery: toNumber(on_time_delivery),
    product_quality: toNumber(product_quality),
    price_score: toNumber(price_score),
    service_score: toNumber(service_score),
    total_deliveries: 1,
    late_deliveries: toNumber(late_deliveries),
    comment: comment || null,
    created_at: new Date().toISOString()
  };
  const data = await loadData();

  if (data.source === 'mysql') {
    try {
      const [result] = await pool.query(
        'INSERT INTO evaluations (supplier_id, order_id, market_name, on_time_delivery, product_quality, price_score, service_score, total_deliveries, late_deliveries, comment) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [
          evaluation.supplier_id,
          evaluation.order_id,
          evaluation.market_name,
          evaluation.on_time_delivery,
          evaluation.product_quality,
          evaluation.price_score,
          evaluation.service_score,
          evaluation.total_deliveries,
          evaluation.late_deliveries,
          evaluation.comment
        ]
      );
      return res.status(201).json({ id: result.insertId, message: 'Avaliação registrada.', dataSource: 'mysql' });
    } catch (error) {
      lastDbError = error.message;
    }
  }

  demoEvaluations.unshift(evaluation);
  res.status(201).json({ id: evaluation.id, message: 'Avaliação registrada no modo demo.', dataSource: 'demo' });
});

app.get('/api/supplier-dashboard/:supplierId', async (req, res) => {
  const data = await loadData();
  const supplier = findSupplier(req.params.supplierId, data.suppliers);
  if (!supplier) return res.status(404).json({ message: 'Fornecedor não encontrado.' });

  const enriched = enrichSupplier(supplier, data.evaluations, {}, data.orders);
  const orders = data.orders
    .filter((order) => Number(order.supplier_id) === Number(req.params.supplierId))
    .map((order) => withOrderRelations(order, data.suppliers, data.users))
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  const pending = orders.filter((order) => ['enviado', 'em_analise'].includes(order.status));
  const responded = orders.filter((order) => ['respondido', 'aceito', 'concluido'].includes(order.status));
  const accepted = orders.filter((order) => ['aceito', 'concluido'].includes(order.status));
  const plan = planById(supplier.plan);
  const profileViews = 120 + orders.length * 18 + (supplier.plan !== 'gratuito' ? 70 : 0);

  res.json({
    dataSource: data.source,
    supplier: enriched,
    plan,
    metrics: {
      profileViews,
      requests: orders.length,
      pending: pending.length,
      responded: responded.length,
      accepted: accepted.length,
      responseRate: orders.length ? Math.round((responded.length / orders.length) * 100) : 0,
      estimatedRevenue: orders.reduce((sum, order) => sum + toNumber(order.response_price), 0)
    },
    orders
  });
});

app.get('/api/dashboard', async (req, res) => {
  const data = await loadData();
  const enriched = data.suppliers.map((supplier) => enrichSupplier(supplier, data.evaluations, {}, data.orders));
  const ordersWithSupplier = data.orders.map((order) => withOrderRelations(order, data.suppliers, data.users));
  const metrics = commercialMetrics(enriched, ordersWithSupplier);
  const ranking = enriched
    .slice()
    .sort((a, b) => b.score.score - a.score.score || a.avg_delivery_days - b.avg_delivery_days)
    .slice(0, 5)
    .map((supplier) => ({
      id: supplier.id,
      name: supplier.name,
      category: supplier.category,
      delivery: supplier.avg_delivery_days,
      score: supplier.score.score,
      label: supplier.score.label,
      isSponsored: supplier.is_sponsored,
      isVerified: supplier.is_verified,
      responseRate: supplier.responseRate
    }));
  const averageScore = Math.round(
    enriched.reduce((sum, supplier) => sum + supplier.score.score, 0) / Math.max(enriched.length, 1)
  );

  res.json({
    dataSource: data.source,
    totalSuppliers: enriched.length,
    totalOrders: ordersWithSupplier.length,
    reliableSuppliers: enriched.filter((supplier) => supplier.score.score >= 80).length,
    attentionSuppliers: enriched.filter((supplier) => supplier.score.score >= 60 && supplier.score.score < 80).length,
    highRiskSuppliers: enriched.filter((supplier) => supplier.score.score > 0 && supplier.score.score < 60).length,
    sponsoredSuppliers: enriched.filter((supplier) => supplier.is_sponsored).length,
    verifiedSuppliers: enriched.filter((supplier) => supplier.is_verified).length,
    averageScore,
    conversionImpact: `${ordersWithSupplier.length} oportunidade(s), ${metrics.responseRate}% respondidas e R$ ${metrics.quotedValue.toLocaleString('pt-BR')} em cotações.`,
    scoreFormula: SCORE_FORMULA,
    ranking,
    recentOrders: ordersWithSupplier.slice(0, 5),
    categories: [...new Set(enriched.map((supplier) => supplier.category))].sort(),
    commercial: metrics,
    plans: PLANS
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: 'Rota não encontrada.',
    hint: 'Use http://localhost:5173 para o app ou /api/health para testar o backend.'
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Erro interno' });
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => console.log(`ForneceJá API rodando em http://localhost:${port}`));

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Porta ${port} já está em uso. Encerre o outro backend ou rode com PORT=3334 npm run dev.`);
    process.exit(1);
  }

  throw error;
});
