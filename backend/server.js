require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mqtt = require("mqtt");
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

let S3Client, PutObjectCommand;
try {
  ({ S3Client, PutObjectCommand } = require("@aws-sdk/client-s3"));
} catch (_) {
  // S3 e opcional no prototipo local. Instale @aws-sdk/client-s3 para upload real.
}

const app = express();
app.use(cors());
app.use(express.json());
app.use("/dashboard", express.static("public"));

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

const mqttClient = mqtt.connect(process.env.MQTT_HOST || "mqtt://localhost");

mqttClient.on("connect", () => {
  console.log("Conectado ao broker MQTT");
  mqttClient.subscribe(process.env.MQTT_TOPIC || "smarthome/casa01/#", (err) => {
    if (err) console.error("Erro ao assinar topico MQTT:", err);
    else console.log(`Assinando topico: ${process.env.MQTT_TOPIC}`);
  });
});

mqttClient.on("error", (error) => console.error("Erro MQTT:", error));

mqttClient.on("message", async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log("Mensagem MQTT recebida:", topic, data);

    const tarifaResult = await pool.query(`
      SELECT valor_kwh
      FROM tarifas
      WHERE residencia_id = 1
      ORDER BY vigencia_inicio DESC
      LIMIT 1
    `);

    const valorKwh = Number(tarifaResult.rows[0]?.valor_kwh || 0.90);
    const intervaloHoras = 5 / 3600;
    const energiaKwh = (Number(data.potencia_w) * intervaloHoras) / 1000;
    const custoEstimado = energiaKwh * valorKwh;

    await pool.query(
      `INSERT INTO leituras_consumo
       (dispositivo_id, potencia_w, presenca, temperatura, luminosidade, custo_estimado)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        data.dispositivo_id,
        data.potencia_w,
        data.presenca,
        data.temperatura,
        data.luminosidade,
        custoEstimado,
      ]
    );

    await gerarAlertas(data);
    console.log("Leitura salva no RDS com sucesso.");
  } catch (error) {
    console.error("Erro ao processar mensagem MQTT:", error);
  }
});

async function gerarAlertas(data) {
  if (!data.presenca && Number(data.potencia_w) > 100) {
    await pool.query(
      `INSERT INTO alertas (dispositivo_id, tipo, mensagem, nivel)
       VALUES ($1, $2, $3, $4)`,
      [
        data.dispositivo_id,
        "DESPERDICIO",
        `${data.dispositivo} esta consumindo energia sem presenca detectada no comodo.`,
        "medio",
      ]
    );
  }

  if (Number(data.potencia_w) > 1000) {
    await pool.query(
      `INSERT INTO alertas (dispositivo_id, tipo, mensagem, nivel)
       VALUES ($1, $2, $3, $4)`,
      [
        data.dispositivo_id,
        "CONSUMO_ALTO",
        `${data.dispositivo} apresentou consumo elevado.`,
        "alto",
      ]
    );
  }
}

app.get("/", (req, res) => {
  res.json({
    message: "SmartHome Energy API funcionando",
    mqtt: "Conectado ao broker Mosquitto",
    database: "PostgreSQL RDS",
    dashboard: "/dashboard/",
  });
});

app.get("/leituras", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT lc.id, d.nome AS dispositivo, c.nome AS comodo, lc.potencia_w,
             lc.presenca, lc.temperatura, lc.luminosidade, lc.custo_estimado, lc.created_at
      FROM leituras_consumo lc
      JOIN dispositivos d ON d.id = lc.dispositivo_id
      JOIN comodos c ON c.id = d.comodo_id
      ORDER BY lc.created_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar leituras:", error);
    res.status(500).json({ error: "Erro ao buscar leituras", details: error.message });
  }
});

app.get("/alertas", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.id, d.nome AS dispositivo, a.tipo, a.mensagem, a.nivel, a.created_at
      FROM alertas a
      JOIN dispositivos d ON d.id = a.dispositivo_id
      ORDER BY a.created_at DESC
      LIMIT 20
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar alertas:", error);
    res.status(500).json({ error: "Erro ao buscar alertas", details: error.message });
  }
});

app.get("/resumo", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT COALESCE(SUM(potencia_w), 0) AS potencia_total,
             COALESCE(SUM(custo_estimado), 0) AS custo_total,
             COUNT(*) AS total_leituras
      FROM leituras_consumo
    `);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar resumo:", error);
    res.status(500).json({ error: "Erro ao buscar resumo", details: error.message });
  }
});

app.get("/relatorios/consumo.csv", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT lc.created_at, c.nome AS comodo, d.nome AS dispositivo, lc.potencia_w,
             lc.presenca, lc.temperatura, lc.luminosidade, lc.custo_estimado
      FROM leituras_consumo lc
      JOIN dispositivos d ON d.id = lc.dispositivo_id
      JOIN comodos c ON c.id = d.comodo_id
      ORDER BY lc.created_at DESC
      LIMIT 500
    `);

    const header = "created_at,comodo,dispositivo,potencia_w,presenca,temperatura,luminosidade,custo_estimado\n";
    const rows = result.rows.map(r => [
      r.created_at?.toISOString?.() || r.created_at,
      r.comodo,
      r.dispositivo,
      r.potencia_w,
      r.presenca,
      r.temperatura,
      r.luminosidade,
      r.custo_estimado
    ].map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const csv = header + rows + "\n";

    const fileName = `consumo-${new Date().toISOString().slice(0,10)}.csv`;
    fs.mkdirSync(path.join(__dirname, "relatorios"), { recursive: true });
    fs.writeFileSync(path.join(__dirname, "relatorios", fileName), csv);

    if (process.env.S3_BUCKET && S3Client && PutObjectCommand) {
      const s3 = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });
      await s3.send(new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: `relatorios/${fileName}`,
        Body: csv,
        ContentType: "text/csv"
      }));
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.send(csv);
  } catch (error) {
    console.error("Erro ao gerar relatorio:", error);
    res.status(500).json({ error: "Erro ao gerar relatorio", details: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
