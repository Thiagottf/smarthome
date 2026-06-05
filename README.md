# SmartHome Energy - Projeto IoT End-to-End em AWS

Projeto desenvolvido para a tematica F - SmartHome: automacao residencial e consumo energetico. A solucao monitora consumo eletrico, presenca, temperatura e luminosidade em uma residencia simulada.

## Arquitetura

- Simulador IoT em Python publicando dados via MQTT.
- EC2 com Mosquitto Broker MQTT e backend Node.js/Express.
- RDS PostgreSQL para persistencia relacional.
- Dashboard Web servido pelo backend.
- S3 preparado para relatorios CSV, faturas simuladas, backups e snapshots.

Fluxo principal:

```text
Simulador Python -> MQTT Mosquitto EC2 -> Backend Node.js -> RDS PostgreSQL -> API/Dashboard
```

## Rotas principais

- `GET /` - status da API.
- `GET /dashboard/` - dashboard web.
- `GET /leituras` - ultimas leituras salvas no RDS.
- `GET /resumo` - resumo de consumo.
- `GET /alertas` - alertas gerados.
- `GET /relatorios/consumo.csv` - gera relatorio CSV; se `S3_BUCKET` estiver configurado, envia ao S3.

## Como implantar na EC2

```bash
sudo apt update
sudo apt install mosquitto mosquitto-clients nodejs npm postgresql-client python3 python3-pip python3-venv -y
sudo systemctl enable mosquitto
sudo systemctl start mosquitto
```

Configurar Mosquitto em `/etc/mosquitto/conf.d/smarthome.conf`:

```text
listener 1883 0.0.0.0
allow_anonymous true
```

Reiniciar:

```bash
sudo systemctl restart mosquitto
```

## Banco de dados

Criar o banco `smarthome` no RDS PostgreSQL e executar:

```bash
psql -h ENDPOINT_DO_RDS -U postgres -d smarthome -f sql/01_create_tables.sql
psql -h ENDPOINT_DO_RDS -U postgres -d smarthome -f sql/02_seed_data.sql
```

## Backend

```bash
cd backend
cp .env.example .env
nano .env
npm install
pm2 start server.js --name smarthome-backend
pm2 save
```

## Simulador IoT

```bash
cd simulador
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python simulador.py
```

## Observacao de seguranca

O arquivo `.env` real nao deve ser versionado. Use `.env.example` no repositorio publico.
