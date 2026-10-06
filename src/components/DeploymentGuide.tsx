import React, { useState } from 'react';
import { Github, Globe, Check, Copy, Terminal, ExternalLink, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export const DeploymentGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const gitCommands = `# 1. Inicializar repositorio local
git init

# 2. Agregar todos los archivos y crear commit
git add .
git commit -m "feat: Sistema de tiempos de produccion para impresion y router CNC"

# 3. Vincular con tu repositorio de GitHub (reemplaza con tu usuario)
git remote add origin https://github.com/TU_USUARIO/calculadora-produccion-cnc.git
git branch -M main

# 4. Subir a GitHub
git push -u origin main`;

  const vercelCliCommands = `# Instalar Vercel CLI globalmente
npm install -g vercel

# Iniciar despliegue automático desde la terminal
vercel

# Para despliegue a producción
vercel --prod`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-6">
      
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Guía de Despliegue en GitHub y Vercel
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cómo publicar esta aplicación en internet de forma 100% gratuita y profesional
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            vercel.json listo en el proyecto
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 sm:p-6 space-y-6">
        
        {/* Error Troubleshooting Banner (Directly addresses ENOENT package.json error 254) */}
        <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-5 text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Solución al Error de Vercel: &quot;Could not read package.json (ENOENT: no such file or directory, exit 254)&quot;</span>
          </div>
          <p className="text-slate-300 leading-relaxed mb-3">
            Este error ocurre porque Vercel buscó el archivo <code className="font-mono text-amber-300 bg-slate-900 px-1 py-0.5 rounded">package.json</code> en la raíz de tu repositorio de GitHub, pero <strong>tus archivos están dentro de una subcarpeta</strong> o no se subió el archivo <code className="font-mono text-amber-300 bg-slate-900 px-1 py-0.5 rounded">package.json</code>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {/* Solución 1 */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
              <span className="font-bold text-white text-xs block text-cyan-400">
                Opción 1: Solución Rápida en Vercel (10 segundos, sin tocar Git)
              </span>
              <ol className="list-decimal list-inside space-y-1 text-slate-300">
                <li>Ve a tu proyecto en <strong>Vercel</strong> y haz clic en <strong>Settings</strong> (arriba).</li>
                <li>En la pestaña <strong>General</strong>, busca la sección <strong>Root Directory</strong>.</li>
                <li>Haz clic en <strong>Edit</strong> y presiona <strong>Browse</strong> para seleccionar la carpeta donde está tu <code className="font-mono text-cyan-300">package.json</code>.</li>
                <li>Haz clic en <strong>Save</strong>.</li>
                <li>Ve a la pestaña <strong>Deployments</strong>, haz clic en los 3 puntos del build fallido y selecciona <strong>Redeploy</strong>. ¡Compilará con éxito!</li>
              </ol>
            </div>

            {/* Solución 2 */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
              <span className="font-bold text-white text-xs block text-emerald-400">
                Opción 2: Asegurar que package.json esté en la raíz de GitHub
              </span>
              <p className="text-slate-300">
                Abre tu repositorio en <a href="https://github.com/nicoirarrazaval-lab/calculadora-produccion-cnc" target="_blank" rel="noreferrer" className="text-cyan-400 underline">github.com/nicoirarrazaval-lab/calculadora-produccion-cnc</a>.
              </p>
              <p className="text-slate-300">
                Si ves una carpeta que contiene los archivos adentro, mueve los archivos al nivel principal, o ejecuta en tu terminal local desde la carpeta donde está <code className="font-mono text-slate-200">package.json</code>:
              </p>
              <pre className="p-2 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-emerald-400 overflow-x-auto">
{`git add -A
git commit -m "fix: asegurar package.json en raiz"
git push origin main`}
              </pre>
            </div>
          </div>
        </div>

        {/* Recommendation highlight */}
        <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-cyan-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm mb-1.5">
            <Zap className="w-4 h-4" />
            <span>¿Por qué Vercel + GitHub es la mejor opción para esta app?</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Esta aplicación está desarrollada con <strong>React + Vite + Tailwind CSS</strong>. Vercel es el creador de los servidores de borde más rápidos del mundo y ofrece soporte nativo para Vite con <strong>despliegues automáticos (CI/CD)</strong>: cada vez que guardes cambios y hagas <code className="font-mono text-cyan-300 bg-slate-800 px-1 rounded">git push</code> a GitHub, tu sitio web se actualiza solo en 30 segundos.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
              <span className="text-emerald-400 font-bold block mb-1">100% Gratuito</span>
              <span className="text-slate-400">Plan Hobby sin límite de tiempo y con SSL/HTTPS automático.</span>
            </div>
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
              <span className="text-cyan-400 font-bold block mb-1">Cero Configuración</span>
              <span className="text-slate-400">Detecta Vite automáticamente y compila el directorio <code className="font-mono text-slate-300">dist/</code>.</span>
            </div>
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
              <span className="text-amber-400 font-bold block mb-1">Enrutamiento SPA</span>
              <span className="text-slate-400">Ya dejamos el archivo <code className="font-mono text-slate-300">vercel.json</code> configurado para evitar errores 404 al recargar.</span>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          
          {/* Step 1: GitHub */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-800 text-slate-200 flex items-center justify-center text-xs font-mono font-bold">
                  1
                </div>
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-white" />
                  <h3 className="text-sm font-semibold text-white">Subir el proyecto a GitHub</h3>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(gitCommands, 1)}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded font-mono transition-colors"
              >
                {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 1 ? '¡Copiado!' : 'Copiar Comandos'}</span>
              </button>
            </div>

            <ol className="text-xs text-slate-300 space-y-2 mb-3 list-decimal list-inside">
              <li>Crea un repositorio vacío en <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-0.5">github.com/new <ExternalLink className="w-3 h-3" /></a> (por ejemplo: <code className="font-mono text-slate-200">calculadora-produccion-cnc</code>).</li>
              <li>Abre una terminal en la carpeta del proyecto y ejecuta:</li>
            </ol>

            <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 overflow-x-auto">
              {gitCommands}
            </pre>
          </div>

          {/* Step 2: Vercel */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-mono font-bold">
                2
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Conectar y Desplegar en Vercel (2 minutos)</h3>
              </div>
            </div>

            <ol className="text-xs text-slate-300 space-y-2.5 list-decimal list-inside">
              <li>
                Ingresa en <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline font-medium inline-flex items-center gap-0.5">vercel.com <ExternalLink className="w-3 h-3" /></a> e inicia sesión con tu cuenta de <strong>GitHub</strong>.
              </li>
              <li>
                En el panel principal, haz clic en el botón <strong>"Add New..."</strong> y selecciona <strong>"Project"</strong>.
              </li>
              <li>
                Busca tu repositorio <code className="font-mono text-slate-200 bg-slate-900 px-1 py-0.5 rounded">calculadora-produccion-cnc</code> y haz clic en <strong>"Import"</strong>.
              </li>
              <li>
                Vercel detectará la configuración automáticamente:
                <ul className="mt-1.5 ml-5 list-disc text-slate-400 space-y-1">
                  <li><strong>Framework Preset:</strong> Vite</li>
                  <li><strong>Build Command:</strong> <code className="font-mono text-slate-300">npm run build</code></li>
                  <li><strong>Output Directory:</strong> <code className="font-mono text-slate-300">dist</code></li>
                </ul>
              </li>
              <li>
                Haz clic en el botón azul <strong>"Deploy"</strong>.
              </li>
              <li>
                ¡Listo! En aproximadamente 30 segundos tendrás tu enlace público del tipo:
                <div className="mt-1 font-mono text-emerald-400 font-semibold bg-slate-900 px-3 py-1.5 rounded inline-block">
                  https://calculadora-produccion-cnc.vercel.app
                </div>
              </li>
            </ol>
          </div>

          {/* Step 3: Vercel CLI Alternative */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-800 text-slate-200 flex items-center justify-center text-xs font-mono font-bold">
                  3
                </div>
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">Método Alternativo: Despliegue directo por CLI</h3>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(vercelCliCommands, 2)}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded font-mono transition-colors"
              >
                {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 2 ? '¡Copiado!' : 'Copiar Comandos'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-2">
              Si prefieres no usar la interfaz web de GitHub y desplegar directamente desde tu terminal local:
            </p>

            <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto">
              {vercelCliCommands}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
