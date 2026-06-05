CREATE TABLE residencias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    endereco VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comodos (
    id SERIAL PRIMARY KEY,
    residencia_id INTEGER NOT NULL REFERENCES residencias(id),
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE dispositivos (
    id SERIAL PRIMARY KEY,
    comodo_id INTEGER NOT NULL REFERENCES comodos(id),
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    potencia_nominal_w NUMERIC(10,2)
);

CREATE TABLE tarifas (
    id SERIAL PRIMARY KEY,
    residencia_id INTEGER NOT NULL REFERENCES residencias(id),
    valor_kwh NUMERIC(10,2) NOT NULL,
    vigencia_inicio DATE NOT NULL
);

CREATE TABLE leituras_consumo (
    id SERIAL PRIMARY KEY,
    dispositivo_id INTEGER NOT NULL REFERENCES dispositivos(id),
    potencia_w NUMERIC(10,2) NOT NULL,
    presenca BOOLEAN NOT NULL,
    temperatura NUMERIC(5,2),
    luminosidade NUMERIC(10,2),
    custo_estimado NUMERIC(10,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE alertas (
    id SERIAL PRIMARY KEY,
    dispositivo_id INTEGER NOT NULL REFERENCES dispositivos(id),
    tipo VARCHAR(50) NOT NULL,
    mensagem TEXT NOT NULL,
    nivel VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
