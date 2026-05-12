# 🤖 CLAUDE CODE INSTRUCTIONS

## Tarea: Subir arkeon-landings a GitHub

**Contexto:**

- Carpeta local: `C:\Users\hugop\Repositories\arkeon-landings`
- Contiene: stripe.html (landing page completa en inglés)
- GitHub username: hugoprado8
- Repo destino: arkeon-landings (nuevo)

---

## PASO 1: Inicializar Git

```bash
cd C:\Users\hugop\Repositories\arkeon-landings

git init
git branch -M main
```

---

## PASO 2: Crear repo en GitHub

Opción A - Usando GitHub CLI (si está instalado):

```bash
gh repo create arkeon-landings --public --source=. --remote=origin
```

Opción B - Manual (si no tienes gh CLI):

1. Ir a https://github.com/new
2. Nombre: `arkeon-landings`
3. Visibilidad: Public
4. NO marcar "Add README" (ya lo tenemos)
5. Create repository

Luego añadir remote:

```bash
git remote add origin https://github.com/hugoprado8/arkeon-landings.git
```

---

## PASO 3: Commit y Push

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: Stripe landing page in English with hero section"

# Push
git push -u origin main
```

---

## PASO 4: Activar GitHub Pages

Opción A - GitHub CLI:

```bash
gh api repos/hugoprado8/arkeon-landings/pages -X POST -f source[branch]=main -f source[path]=/
```

Opción B - Manual:

1. Ir a https://github.com/hugoprado8/arkeon-landings/settings/pages
2. Source: "Deploy from a branch"
3. Branch: `main` / `/ (root)`
4. Save

---

## PASO 5: Verificar deployment

```bash
# Ver status de GitHub Pages
gh api repos/hugoprado8/arkeon-landings/pages

# O manualmente:
# Ir a https://github.com/hugoprado8/arkeon-landings/deployments
```

La landing quedará disponible en:

- https://hugoprado8.github.io/arkeon-landings/stripe.html

---

## NOTAS PARA CLAUDE CODE:

- Si `gh` no está instalado, usar la opción Manual (abrir browser)
- Si Git pide credenciales, usar GitHub Personal Access Token
- Después del push, GitHub Pages tarda 1-2 minutos en deployar

---

## Siguiente paso (Hugo hará manualmente):

Configurar DNS en Hostalia:

```
Type: CNAME
Name: stripe
Value: hugoprado8.github.io
TTL: 3600
```

Esto hace que https://stripe.arkeondata.com apunte a la landing.

---

**Archivo creado automáticamente por Claude para automatización con Claude Code**
