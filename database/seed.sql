USE forneceja;

INSERT INTO suppliers (id, name, category, products, avg_delivery_days, avg_price, region, city, state, contact_name, phone, email, is_verified, is_sponsored, plan, description) VALUES
(1,'Bebidas Norte Distribuidora','Bebidas','refrigerante, água, suco, energético',2,89.90,'Joinville e região norte','Joinville','SC','Marcos Silva','(47) 99999-1111','vendas@bebidasnorte.com.br',TRUE,TRUE,'destaque','Distribuidora regional focada em bebidas para pequenos mercados.'),
(2,'Sul Refri Atacadista','Bebidas','refrigerante, água mineral, cerveja sem álcool',4,82.50,'Santa Catarina','Blumenau','SC','Carla Mendes','(47) 99999-2222','comercial@sulrefri.com.br',TRUE,FALSE,'gratuito','Atacadista com preço competitivo e prazo maior para algumas regiões.'),
(3,'HortiBom Fornecimentos','Hortifruti','frutas, verduras, legumes',1,120.00,'Joinville','Joinville','SC','João Pereira','(47) 99999-3333','contato@hortibom.com.br',TRUE,FALSE,'gratuito','Fornecedor local de hortifruti com entregas rápidas.'),
(4,'Embalagens Rápidas SC','Embalagens','sacolas, caixas, potes, embalagens delivery',2,65.00,'Joinville e Araquari','Araquari','SC','Paula Costa','(47) 99999-4444','vendas@embalagensrapidas.com.br',FALSE,TRUE,'destaque','Fornecedor de embalagens para mercados, padarias e restaurantes.'),
(5,'LimpaMais Atacado','Limpeza','detergente, desinfetante, papel toalha, álcool',3,74.90,'Norte de SC','Joinville','SC','Rafael Lima','(47) 99999-5555','atendimento@limpamais.com.br',TRUE,FALSE,'gratuito','Produtos de limpeza em atacado para pequenos comércios.'),
(6,'Frios Serra Azul','Frios e laticínios','queijo, presunto, iogurte, manteiga',2,145.00,'Joinville e São Bento do Sul','São Bento do Sul','SC','Amanda Rocha','(47) 99999-6666','comercial@friosserra.com.br',TRUE,FALSE,'gratuito','Fornecedor de frios e laticínios para mercados de pequeno porte.'),
(7,'Refri Vale Comércio','Bebidas','refrigerante, água com gás, chá gelado',2,94.50,'Joinville e litoral norte','Joinville','SC','Bruna Almeida','(47) 99999-7777','pedidos@refrivale.com.br',TRUE,FALSE,'gratuito','Fornecedor local com boa previsibilidade para reposição semanal de bebidas.');

INSERT INTO users (id, role, supplier_id, name, company, email, phone) VALUES
(1,'market',NULL,'Silas Oliveira','Mercado do Bairro','silas@mercadodobairro.com','(47) 98888-0000'),
(2,'supplier',1,'Marcos Silva','Bebidas Norte Distribuidora','marcos@bebidasnorte.com.br','(47) 99999-1111'),
(3,'supplier',4,'Paula Costa','Embalagens Rápidas SC','paula@embalagensrapidas.com.br','(47) 99999-4444'),
(4,'admin',NULL,'Admin ForneceJá','ForneceJá','admin@forneceja.com',NULL);

INSERT INTO orders (id, supplier_id, market_id, market_name, requester_name, requester_phone, product_requested, quantity, desired_delivery_days, notes, status, response_price, response_delivery_days, supplier_response, response_expires_at, responded_at, accepted_at, completed_at, created_at) VALUES
(1,1,1,'Mercado do Bairro','Silas Oliveira','(47) 98888-0000','Refrigerante 2L','30 caixas',2,'Preciso para reposição até sexta-feira.','enviado',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-26 11:30:00'),
(2,1,1,'Mercado Central Joinville','Silas','(47) 98888-0000','Água mineral 500ml','50 fardos',2,'Preferência por entrega pela manhã.','respondido',88.90,2,'Temos estoque para entrega em até 2 dias com frete incluso.','2026-05-30 18:00:00','2026-05-26 13:10:00',NULL,NULL,'2026-05-25 16:00:00'),
(3,3,1,'Mercado Vila Nova','Ana','(47) 97777-1111','Banana e tomate','20 caixas',1,'Entrega pela manhã.','concluido',118.00,1,'Entrega confirmada para amanhã até 10h.','2026-05-29 18:00:00','2026-05-24 10:00:00','2026-05-24 10:35:00','2026-05-25 09:50:00','2026-05-24 09:20:00'),
(4,4,1,'Padaria Sabor Caseiro','Roberta','(47) 96666-1111','Embalagem delivery','400 unidades',2,'Preciso comparar preço com fornecedores verificados.','em_analise',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-26 08:20:00');

INSERT INTO evaluations (supplier_id, order_id, market_name, on_time_delivery, product_quality, price_score, service_score, total_deliveries, late_deliveries, comment, created_at) VALUES
(1,2,'Mercado Central Joinville',95,90,82,88,28,1,'Entrega rápida e bom atendimento. Ótima opção para reposição urgente de bebidas.','2026-05-10 12:00:00'),
(2,NULL,'Mercadinho Boa Compra',62,84,92,70,18,5,'Preço bom, mas já atrasou algumas entregas.','2026-05-08 12:00:00'),
(3,3,'Mercado Vila Nova',96,91,78,87,35,0,'Hortifruti com boa qualidade e entrega muito rápida.','2026-05-06 12:00:00'),
(4,NULL,'Padaria Sabor Caseiro',54,65,78,58,14,5,'Fornecedor patrocinado, mas com atrasos e comunicação instável nas últimas compras.','2026-05-04 12:00:00'),
(5,NULL,'Mercado Santa Clara',82,79,85,81,22,2,'Fornecedor estável para produtos de limpeza.','2026-05-02 12:00:00'),
(6,NULL,'Mercado Bom Dia',88,92,70,84,19,1,'Produtos bons e entrega geralmente dentro do prazo.','2026-04-29 12:00:00'),
(7,NULL,'Mercado Costa e Silva',86,84,76,82,21,2,'Boa opção orgânica para bebidas, com prazo estável e atendimento direto.','2026-05-12 12:00:00');
