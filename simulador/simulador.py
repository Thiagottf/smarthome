import json
import random
import time
from datetime import datetime, timezone
import paho.mqtt.client as mqtt

BROKER_HOST = "localhost"
BROKER_PORT = 1883

dispositivos = [
    {"dispositivo_id": 1, "comodo": "Sala", "dispositivo": "TV", "potencia_min": 80, "potencia_max": 180},
    {"dispositivo_id": 2, "comodo": "Quarto", "dispositivo": "Ar-condicionado", "potencia_min": 700, "potencia_max": 1400},
    {"dispositivo_id": 3, "comodo": "Cozinha", "dispositivo": "Geladeira", "potencia_min": 100, "potencia_max": 300},
    {"dispositivo_id": 4, "comodo": "Escritorio", "dispositivo": "Computador", "potencia_min": 200, "potencia_max": 600},
]

def normalizar_topico(texto):
    return (texto.lower().replace("á","a").replace("à","a").replace("ã","a").replace("â","a")
            .replace("é","e").replace("ê","e").replace("í","i").replace("ó","o")
            .replace("ô","o").replace("õ","o").replace("ú","u").replace("ç","c")
            .replace(" ","_").replace("-","_"))

def gerar_leitura(dispositivo):
    return {
        "dispositivo_id": dispositivo["dispositivo_id"],
        "comodo": dispositivo["comodo"],
        "dispositivo": dispositivo["dispositivo"],
        "potencia_w": round(random.uniform(dispositivo["potencia_min"], dispositivo["potencia_max"]), 2),
        "presenca": random.choice([True, False]),
        "temperatura": round(random.uniform(22, 34), 2),
        "luminosidade": round(random.uniform(50, 900), 2),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

client = mqtt.Client()
client.connect(BROKER_HOST, BROKER_PORT, 60)
print("Simulador IoT conectado ao broker MQTT local.")

while True:
    dispositivo = random.choice(dispositivos)
    payload = gerar_leitura(dispositivo)
    topic = f"smarthome/casa01/{normalizar_topico(dispositivo['comodo'])}/{normalizar_topico(dispositivo['dispositivo'])}"
    client.publish(topic, json.dumps(payload))
    print(f"Publicado em {topic}")
    print(json.dumps(payload, indent=2, ensure_ascii=False))
    print("-" * 60)
    time.sleep(5)
