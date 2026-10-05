# 1. Inicializar git si aún no está inicializado
git init

# 2. Agregar los archivos y hacer commit
git add .
git commit -m "feat: Sistema de producción impresión y router CNC"

# 3. Vincular con tu repositorio de GitHub (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/calculadora-produccion-cnc.git
git branch -M main

# 4. Subir el proyecto
git push -u origin main