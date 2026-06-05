INSERT INTO residencias (nome, endereco)
VALUES ('Casa 01', 'Residencia simulada do projeto SmartHome Energy');

INSERT INTO comodos (residencia_id, nome)
VALUES
(1, 'Sala'),
(1, 'Quarto'),
(1, 'Cozinha'),
(1, 'Escritorio');

INSERT INTO dispositivos (comodo_id, nome, tipo, potencia_nominal_w)
VALUES
(1, 'TV', 'Entretenimento', 150),
(2, 'Ar-condicionado', 'Climatizacao', 1200),
(3, 'Geladeira', 'Eletrodomestico', 250),
(4, 'Computador', 'Informatica', 450);

INSERT INTO tarifas (residencia_id, valor_kwh, vigencia_inicio)
VALUES (1, 0.90, CURRENT_DATE);
