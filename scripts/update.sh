#!/bin/bash
# Script de atualização do ZapAgenda no servidor
# Executar após push da imagem no Docker Hub:
# ./scripts/update.sh

set -e
cd ~/servidor/zapagenda

echo "Baixando imagens atualizadas..."
docker compose -f docker-compose.prod.yml pull zapagenda-api zapagenda-nlp

echo "Reiniciando serviços..."
docker compose -f docker-compose.prod.yml up -d --no-deps zapagenda-api zapagenda-nlp

echo "Limpando imagens antigas..."
docker image prune -f

echo "Status:"
docker compose -f docker-compose.prod.yml ps
