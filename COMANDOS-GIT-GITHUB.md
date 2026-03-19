# 📚 Comandos Git/GitHub - Guía de Referencia Rápida

## 🎯 Comandos que puedes pedirle a Cascade

### **Para guardar cambios:**
```
"Cascade, guarda mis cambios en GitHub"
"Cascade, haz commit de mis cambios con el mensaje: [tu mensaje]"
"Cascade, sube todo a GitHub"
```

### **Para ver el estado:**
```
"Cascade, muéstrame qué archivos he modificado"
"Cascade, muéstrame el estado de Git"
"Cascade, muéstrame el historial de commits"
```

### **Para descargar cambios:**
```
"Cascade, descarga los últimos cambios de GitHub"
"Cascade, sincroniza con GitHub"
```

### **Para crear nuevos proyectos:**
```
"Cascade, crea un nuevo repositorio en GitHub para [nombre del proyecto]"
"Cascade, inicializa Git en esta carpeta"
```

### **Para resolver problemas:**
```
"Cascade, ayúdame a resolver este conflicto de Git"
"Cascade, quiero volver a la versión anterior"
"Cascade, muéstrame las diferencias en mis archivos"
```

---

## 💻 Comandos Git Directos (para ejecutar en terminal)

### **📊 Ver estado y cambios**
```bash
git status                    # Ver qué archivos cambiaron
git log --oneline            # Ver historial de commits
git log --oneline -5         # Ver últimos 5 commits
git diff                     # Ver diferencias en archivos
```

### **💾 Guardar cambios localmente**
```bash
git add .                              # Agregar todos los archivos
git add archivo.html                   # Agregar un archivo específico
git commit -m "Descripción del cambio" # Guardar cambios con mensaje
```

### **☁️ Sincronizar con GitHub**
```bash
git push                     # Subir cambios a GitHub
git pull                     # Descargar cambios de GitHub
git push -u origin main      # Primera vez subiendo a GitHub
```

### **🔄 Workflow completo (lo más común)**
```bash
cd /Users/apkuzz/CascadeProjects
git add .
git commit -m "Tu mensaje aquí"
git push
```

### **🌿 Trabajar con ramas (avanzado)**
```bash
git branch                   # Ver ramas
git branch nueva-rama        # Crear nueva rama
git checkout nueva-rama      # Cambiar a otra rama
git merge otra-rama          # Fusionar ramas
```

### **⏪ Deshacer cambios**
```bash
git checkout -- archivo.html    # Descartar cambios en un archivo
git reset HEAD~1               # Deshacer último commit (mantiene cambios)
git reset --hard HEAD~1        # Deshacer último commit (borra cambios)
```

### **🔍 Información del repositorio**
```bash
git remote -v                # Ver URL del repositorio en GitHub
git show                     # Ver detalles del último commit
git log --graph --oneline    # Ver historial visual
```

---

## 🚀 Flujos de trabajo comunes

### **Flujo diario básico:**
```bash
# 1. Ver qué cambió
git status

# 2. Guardar cambios
git add .
git commit -m "Descripción de lo que hiciste"

# 3. Subir a GitHub
git push
```

### **Empezar el día (si trabajas desde otra computadora):**
```bash
cd /Users/apkuzz/CascadeProjects
git pull
# Ahora tienes la última versión
```

### **Crear un nuevo proyecto y subirlo a GitHub:**
```bash
# 1. Crear repositorio en GitHub.com primero
# 2. En tu carpeta del proyecto:
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main
```

---

## 📝 Mensajes de commit recomendados

### **Buenos ejemplos:**
```bash
git commit -m "Agregué funcionalidad de búsqueda al dashboard"
git commit -m "Arreglé bug en el calendario de presentaciones"
git commit -m "Actualicé estilos del menú principal"
git commit -m "Eliminé código no utilizado"
```

### **Malos ejemplos (evitar):**
```bash
git commit -m "cambios"           # Muy vago
git commit -m "asdf"              # Sin sentido
git commit -m "fix"               # No dice qué arregló
```

---

## 🆘 Solución de problemas comunes

### **"No puedo hacer push"**
```bash
git pull                    # Primero descarga cambios
git push                    # Luego sube los tuyos
```

### **"Quiero descartar todos mis cambios"**
```bash
git checkout .              # Descarta todos los cambios no guardados
```

### **"Olvidé agregar un archivo al último commit"**
```bash
git add archivo-olvidado.html
git commit --amend --no-edit
git push -f
```

### **"Ver qué cambié en un archivo específico"**
```bash
git diff archivo.html
```

---

## 🎓 Conceptos clave

- **Working Directory** = Tus archivos actuales en Windsurf
- **Staging Area** = Archivos marcados con `git add`
- **Repository** = Historial de todos tus commits
- **Remote (GitHub)** = Copia en la nube de tu repositorio
- **Commit** = "Foto" de tu código en un momento específico
- **Push** = Subir commits a GitHub
- **Pull** = Descargar commits de GitHub

---

## ✅ Checklist antes de cerrar Windsurf

```
□ ¿Guardé mis archivos? (Cmd+S)
□ ¿Hice commit de mis cambios? (git commit)
□ ¿Subí todo a GitHub? (git push)
□ ¿Funciona todo correctamente?
```

---

## 🔗 Enlaces útiles

- **Tu repositorio:** https://github.com/oscarfraijor-lgtm/Lacascada
- **GitHub Desktop:** https://desktop.github.com/ (alternativa visual)
- **Git Documentation:** https://git-scm.com/doc

---

## 💡 Tips profesionales

1. **Haz commits frecuentes** - Mejor muchos commits pequeños que uno grande
2. **Mensajes descriptivos** - Tu yo del futuro te lo agradecerá
3. **Push al final del día** - Siempre ten respaldo en la nube
4. **Revisa antes de commit** - Usa `git status` y `git diff`
5. **No subas archivos grandes** - Usa `.gitignore` para excluirlos

---

## 🤖 Comandos específicos para Cascade

### **Pídeme ayuda con:**
- "Cascade, explícame qué hace este comando Git"
- "Cascade, muéstrame el historial de cambios"
- "Cascade, crea un .gitignore para [tipo de proyecto]"
- "Cascade, ayúdame a resolver este error de Git"
- "Cascade, muéstrame las diferencias entre mi código y GitHub"

---

**Última actualización:** 18 de Marzo, 2026  
**Ubicación:** `/Users/apkuzz/CascadeProjects/COMANDOS-GIT-GITHUB.md`
