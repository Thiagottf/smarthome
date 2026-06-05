SELECT * FROM dispositivos;
SELECT COUNT(*) FROM leituras_consumo;

SELECT lc.id, d.nome AS dispositivo, c.nome AS comodo, lc.potencia_w, lc.presenca,
       lc.temperatura, lc.luminosidade, lc.custo_estimado, lc.created_at
FROM leituras_consumo lc
JOIN dispositivos d ON d.id = lc.dispositivo_id
JOIN comodos c ON c.id = d.comodo_id
ORDER BY lc.created_at DESC
LIMIT 50;
