# Perguntas provaveis da banca

**Por que MQTT?**  
Porque e leve, adequado para IoT e usa o modelo publish/subscribe, desacoplando dispositivo e backend.

**Por que RDS PostgreSQL?**  
Porque os dados estruturados do projeto possuem relacionamentos claros: residencia, comodos, dispositivos, leituras e alertas.

**Por que S3?**  
Porque relatorios CSV, faturas, snapshots e backups sao objetos nao estruturados e nao devem ficar como tabelas relacionais.

**Por que usar PM2?**  
Para manter o backend Node.js rodando mesmo apos fechar o terminal SSH.

**Por que o simulador Python?**  
Porque o enunciado permite dispositivo simulado, e ele garantiu dados periodicos via MQTT para demonstrar a arquitetura end-to-end.

**Qual maior desafio?**  
Configurar a comunicacao entre EC2, RDS e MQTT; tambem foi necessario habilitar SSL na conexao Node.js -> RDS.
