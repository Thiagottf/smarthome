# Roteiro de apresentacao - 10 a 15 minutos

## Slide 1 - Titulo
Apresentar o nome do projeto, tema escolhido e integrantes.

## Slide 2 - Problema
Explicar o desperdicio de energia em residencias e a dificuldade de visualizar consumo por aparelho em tempo real.

## Slide 3 - Solucao
Apresentar o SmartHome Energy como um sistema IoT para monitorar consumo, presenca, temperatura e luminosidade.

## Slide 4 - Arquitetura AWS
Explicar o caminho dos dados: simulador -> Mosquitto na EC2 -> backend -> RDS -> dashboard. Mencionar S3 para relatorios.

## Slide 5 - Comunicacao MQTT
Explicar publish/subscribe e os topicos `smarthome/casa01/#`.

## Slide 6 - Banco de dados
Explicar tabelas: residencias, comodos, dispositivos, tarifas, leituras_consumo e alertas.

## Slide 7 - Backend e dashboard
Mostrar rotas da API e dashboard.

## Slide 8 - Demonstracao
Rodar simulador, mostrar logs, abrir `/leituras`, `/resumo`, `/alertas` e dashboard.

## Slide 9 - S3 e relatorios
Mostrar bucket ou rota de relatorio CSV. Explicar uso para arquivos nao estruturados.

## Slide 10 - Desafios e decisoes
Explicar problemas resolvidos: IP publico variavel, SSL no RDS, PM2, Wokwi e simulador Python.

## Slide 11 - Divisao de fala
Cada membro apresenta uma parte: contexto, AWS, backend/banco, demonstracao.

## Slide 12 - Conclusao
Reforcar que a solucao entregou fluxo IoT end-to-end.
