#!/bin/bash
echo "Subindo banco e Redis..."
docker compose up -d

echo "Aguardando banco inicializar..."
sleep 3

echo "Iniciando backend..."
cd backend && npm run dev