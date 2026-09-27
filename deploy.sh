#!/usr/bin/env bash
# ── PLASTIR RD — Universal Deployment Script (Docker Swarm + PM2) ──
#  Uso en el VPS:
#      cd /var/www/plastir && bash deploy.sh

set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/var/www/plastir}"
REPO_URL="${REPO_URL:-https://github.com/ExpertosTI/PLASTIR.git}"
STACK_NAME="${STACK_NAME:-plastir}"
PM2_APP_NAME="${PM2_APP_NAME:-plastir}"

cyan()  { printf "\033[36m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }
yellow(){ printf "\033[33m%s\033[0m\n" "$*"; }
red()   { printf "\033[31m%s\033[0m\n" "$*"; }

cyan "⚡ ── [PLASTIR RD] Iniciando Despliegue Universal ──"

# ── 1. Asegurar directorio y respaldar variables locales ──────
if [ ! -d "$PROJECT_DIR" ]; then
  cyan "Clonando repositorio en $PROJECT_DIR..."
  git clone "$REPO_URL" "$PROJECT_DIR"
fi

cd "$PROJECT_DIR"

# Limpiar respaldos temporales antiguos para liberar espacio en disco
rm -rf /tmp/plastir_backup_* 2>/dev/null || true

# Respaldar .env y archivos de configuración esenciales (*.json)
BACKUP_DIR="/tmp/plastir_backup_$(date +%s)"
mkdir -p "$BACKUP_DIR"
mkdir -p "$PROJECT_DIR/server/data"

if [ -f "$PROJECT_DIR/.env" ]; then
  cp "$PROJECT_DIR/.env" "$BACKUP_DIR/.env"
fi
if [ -d "$PROJECT_DIR/server/data" ]; then
  mkdir -p "$BACKUP_DIR"
  cp -r "$PROJECT_DIR/server/data" "$BACKUP_DIR/" 2>/dev/null || true
fi

# ── 2. Sincronización limpia con GitHub ─────────────────────────
cyan "── 1. Sincronizando fuente desde GitHub ──────"
git fetch origin main
git reset --hard origin/main
git clean -fd -e .env -e server/data

# ── 3. Restaurar variables locales de producción ───────────────
cyan "── 2. Preservando variables y estado local ───"
if [ -f "$BACKUP_DIR/.env" ]; then
  cp "$BACKUP_DIR/.env" "$PROJECT_DIR/.env"
  green "✔ .env local preservado correctamente."
fi

if [ -d "$BACKUP_DIR/data" ]; then
  mkdir -p "$PROJECT_DIR/server/data"
  cp -r "$BACKUP_DIR/data/"* "$PROJECT_DIR/server/data/" 2>/dev/null || true
  # Check if restored products.json has legacy sneakers and force official Plastir catalog
  if grep -qi "tenis" "$PROJECT_DIR/server/data/products.json" 2>/dev/null; then
    yellow "⚠ Purgando residuos de calzado en el servidor. Restaurando catálogo oficial Plastir..."
    git checkout origin/main -- server/data/products.json
  fi
  green "✔ Base de datos local, historias y configuración preservadas."
fi

# Permisos completos para que el contenedor Docker y PM2 puedan escribir sin trabas
chmod -R 777 "$PROJECT_DIR/server/data" 2>/dev/null || true
rm -rf "$BACKUP_DIR" 2>/dev/null || true

# ── 4. Compilación del Frontend en el Host (Rápido y Seguro) ──
cyan "── 3. Compilando bundle de producción (Vite) ──"
npm install --no-audit --no-fund
npm run build
green "✔ Bundle de producción compilado exitosamente en dist/."

# ── 5. Construir imagen Docker limpia ──────────────────────────
if command -v docker >/dev/null 2>&1; then
  cyan "── 4. Construyendo imagen Docker ultra-ligera (Node-Slim) ──"
  docker build -t plastir:latest .

  cyan "── 5. Desplegando en Docker Swarm (RenaceNet) ──"
  if ! docker network ls --format '{{.Name}}' | grep -qx "RenaceNet"; then
    docker network create --driver overlay --attachable RenaceNet || true
  fi
  
  # Desbloquear servicio si estaba pausado por el bind mount previo
  docker service rollback "${STACK_NAME}_plastir" >/dev/null 2>&1 || true

  # Desplegar stack en Swarm
  docker stack deploy --resolve-image never -c docker-compose.yml "$STACK_NAME"
  
  # Forzar actualización del servicio
  docker service update --force --image plastir:latest "${STACK_NAME}_plastir"
  
  sleep 4
  docker service ps "${STACK_NAME}_plastir" --no-trunc
  green "✔ Servicio Docker Swarm '${STACK_NAME}_plastir' desplegado."
fi

# ── 6. Actualizar Proceso PM2 (Node Host) ──────────────────────
if command -v pm2 >/dev/null 2>&1; then
  cyan "── 6. Sincronizando proceso PM2 ───────────────"
  if pm2 list | grep -qw "$PM2_APP_NAME"; then
    pm2 restart "$PM2_APP_NAME" --update-env
  else
    pm2 start server/server.js --name "$PM2_APP_NAME"
  fi
  pm2 save --force >/dev/null 2>&1 || true
  green "✔ PM2 '$PM2_APP_NAME' sincronizado."
fi

chmod +x "$PROJECT_DIR/deploy.sh" 2>/dev/null || true

green ""
green "✅ ¡Despliegue de PLASTIR RD completado con éxito!"
green "   🌐 Sitio: https://plastirrd.com"
