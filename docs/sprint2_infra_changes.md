
---

## ¿Qué cambió y por qué?

Este documento explica todos los cambios realizados a la base del proyecto antes de arrancar el desarrollo de features del Sprint 2. Los cambios son de **infraestructura** (no tocan la UI ni las páginas que ya funcionaban).

---

## 1. 🟡 Runtime migrado de Node/NPM → BUN

**¿Qué es Bun?**  
Bun es un reemplazo moderno de Node.js que corre TypeScript directamente, instala dependencias ~5x más rápido y es requisito del ramo.

**¿Qué cambia para ti?**

| Antes | Ahora |
|---|---|
| `npm install` | `bun install` |
| `npm run dev` | `bun run dev` |
| `npm run build` | `bun run build` |
| `npx prisma studio` | `bunx prisma studio` |

**Archivos modificados:**
- `package.json` → scripts actualizados a Bun
- `bun.lockb` → nuevo archivo de lock (reemplaza a `package-lock.json`)

> ⚠️ **Acción requerida:** Instala Bun en tu máquina corriendo esto en PowerShell:
> ```powershell
> powershell -c "irm bun.sh/install.ps1 | iex"
> ```
> Luego **reinicia tu terminal** y ejecuta `bun install` dentro de la carpeta del proyecto.

---

## 2. 🐳 Docker y Docker Compose

**¿Por qué?**  
Requisito del ramo: "Despliegue dockerizado en Docker Compose (al menos Base de Datos)".

**¿Afecta Supabase?** ❌ No. Supabase sigue siendo nuestra BD en producción y desarrollo normal. Docker es solo para que el profesor pueda levantar el proyecto localmente sin nada configurado.

**Archivos nuevos:**
- `Dockerfile` → cómo construir la app en un contenedor usando Bun
- `docker-compose.yml` → orquesta la app + una BD PostgreSQL local

**Comandos útiles (solo si el profesor lo pide):**
```bash
docker-compose up -d        # Levanta todo (app + BD local)
docker-compose down         # Apaga los contenedores
docker-compose exec web bunx prisma migrate deploy  # Migra la BD local
```

---

## 3. 📧 Login OTP por Email (Magic Link)

**¿Qué es OTP?**  
One-Time Password. El usuario ingresa su email, recibe un link/código único por correo y hace click para iniciar sesión. Es el segundo método de autenticación además de Google.

**¿Rompe el login con Google?** ❌ No. Google SSO sigue funcionando exactamente igual. Solo se agrega una opción adicional.

**¿Cómo funciona técnicamente?**
1. Usuario escribe su email en el login
2. NextAuth genera un token aleatorio seguro
3. Lo hashea con SHA-256 y lo guarda en la tabla `VerificationToken` (ya existía en Supabase)
4. Envía un email con el link vía **Resend** (servicio de emails)
5. Usuario hace click → el sistema valida el hash → sesión iniciada

**Archivos modificados:**
- `src/app/api/auth/[...nextauth]/route.ts` → se agregó `EmailProvider`
- `.env` → se agregaron `EMAIL_SERVER` y `EMAIL_FROM` con credenciales de Resend

> ⚠️ **Acción requerida:** El `.env` no se sube a git (está en `.gitignore`). Pídel que te compartan el archivo `.env` por privado para que tengas las credenciales de Resend y Supabase en tu máquina.

---

## 4. 📁 Limpieza de archivos

Se eliminaron archivos que no servían:
- `prisma.config.ts.bak` → backup obsoleto de configuración de Prisma
- `implementation_plan.md` (raíz) → archivo de planificación temporal, movido a `docs/`

Se reorganizaron traducciones:
- `messages/` (raíz) → movido a `src/i18n/messages/` para seguir la estructura de `src/`

---

## 5. 📄 Documentación nueva en `/docs`

| Archivo | Contenido |
|---|---|
| `docs/cryptography_architecture.md` | Explica todos los algoritmos criptográficos usados (JWT HS256, SHA-256 OTP, RSA Google, TLS 1.3) — requerido por el ramo |
| `docs/sprint2_infra_changes.md` | Este archivo |

---

## ✅ Verificación — ¿Qué sigue funcionando igual?

| Funcionalidad | Estado |
|---|---|
| Landing page (`/`) | ✅ Sin cambios |
| Login con Google SSO | ✅ Sin cambios |
| Redirección a dashboard según rol | ✅ Sin cambios |
| Dashboard Conserje y Residente | ✅ Sin cambios |
| Multilenguaje ES/EN (`next-intl`) | ✅ Sin cambios |
| Conexión a Supabase | ✅ Sin cambios |

---

## 🚀 Setup rápido para tu máquina (después de hacer `git pull`)

```bash
# 1. Instalar Bun (solo la primera vez)
powershell -c "irm bun.sh/install.ps1 | iex"
# → Reinicia la terminal

# 2. Instalar dependencias
bun install

# 3. Pedir el .env a Tomás y colocarlo en la raíz del proyecto

# 4. Levantar el servidor de desarrollo
bun run dev
```

---

