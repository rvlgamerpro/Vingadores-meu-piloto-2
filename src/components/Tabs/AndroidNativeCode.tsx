import React, { useState } from 'react';
import { ANDROID_PROJECT_FILES, downloadAndroidProjectZip } from '../../utils/androidProjectCode';
import { pushProjectToGitHub, PushResult } from '../../utils/githubDirectUploader';
import { 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  ShieldCheck, 
  Smartphone, 
  Layers, 
  ExternalLink,
  Code2,
  Terminal,
  Cpu,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound
} from 'lucide-react';

export const AndroidNativeCode: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Direct GitHub Push states
  const [githubUser, setGithubUser] = useState('rvlgamerpro');
  const [githubRepo, setGithubRepo] = useState('Vingadores-meu-piloto-2');
  const [githubToken, setGithubToken] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [pushProgress, setPushProgress] = useState<{ current: number; total: number; file: string } | null>(null);
  const [pushResult, setPushResult] = useState<PushResult | null>(null);

  const selectedFile = ANDROID_PROJECT_FILES[selectedFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      await downloadAndroidProjectZip();
    } finally {
      setDownloading(false);
    }
  };

  const handleDirectPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUser || !githubRepo || !githubToken) return;

    setIsPushing(true);
    setPushResult(null);
    setPushProgress({ current: 0, total: 10, file: 'Iniciando conexão...' });

    try {
      const res = await pushProjectToGitHub(
        githubUser,
        githubRepo,
        githubToken,
        (current, total, file) => {
          setPushProgress({ current, total, file });
        }
      );
      setPushResult(res);
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400">
              <Code2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Código Nativo Android (Kotlin + Jetpack Compose)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Projeto nativo pronto para compilar no Android Studio. Compatível com Android 9.0 (API 28) ou superior, com arquitetura limpa em Kotlin, Leitor de Acessibilidade e Janela Flutuante em Jetpack Compose.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={downloading}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer self-start md:self-auto shrink-0"
        >
          <Download className="w-4 h-4 stroke-[3]" />
          <span>{downloading ? 'Gerando ZIP...' : 'Baixar Projeto Android (ZIP)'}</span>
        </button>
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm mb-1">
            <Cpu className="w-4 h-4" />
            <span>Serviço de Acessibilidade</span>
          </div>
          <p className="text-xs text-slate-400">
            Classe <code className="text-emerald-400 font-mono">RVAccessibilityService.kt</code> que intercepta nós de texto dos pacotes da Uber (<code className="text-slate-300 font-mono">com.ubercab.driver</code>), 99 (<code className="text-slate-300 font-mono">com.taxis99</code>) e inDrive.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm mb-1">
            <Smartphone className="w-4 h-4" />
            <span>Janela Flutuante Compose</span>
          </div>
          <p className="text-xs text-slate-400">
            Utiliza <code className="text-emerald-400 font-mono">TYPE_APPLICATION_OVERLAY</code> com <code className="text-slate-300 font-mono">ComposeView</code> para desenhar a interface com números gigantes e semáforo sobre qualquer app.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-purple-400 font-extrabold text-sm mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Android 9.0+ (API 28+)</span>
          </div>
          <p className="text-xs text-slate-400">
            Total compatibilidade com aparelhos Motorola, Samsung, Xiaomi e Realme populares entre motoristas brasileiros.
          </p>
        </div>
      </div>

      {/* Code Explorer */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
        {/* File Sidebar */}
        <div className="w-full lg:w-72 bg-slate-950/70 border-b lg:border-b-0 lg:border-r border-slate-800 p-3 space-y-1">
          <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-3 py-2">
            Arquivos do Projeto Nativo
          </div>
          {ANDROID_PROJECT_FILES.map((file, idx) => (
            <button
              key={file.path}
              onClick={() => setSelectedFileIndex(idx)}
              className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-mono cursor-pointer ${
                selectedFileIndex === idx
                  ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <FileCode className="w-4 h-4 shrink-0" />
              <div className="truncate">
                <div className="truncate">{file.name}</div>
                <div className="text-[10px] text-slate-500 truncate font-sans">{file.language.toUpperCase()}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Code Viewer */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
          {/* File Header */}
          <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono font-bold text-slate-200 flex items-center gap-2">
                <span>{selectedFile.path}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {selectedFile.description}
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>

          {/* Syntax Code Container */}
          <div className="p-4 overflow-x-auto max-h-[550px] font-mono text-xs leading-relaxed text-slate-300 selection:bg-emerald-500 selection:text-slate-950">
            <pre>
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Opções Para Gerar o APK pelo Celular vs PWA */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Smartphone className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-black text-white">
              Como Fazer Isso APENAS pelo Celular (Sem Computador)
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            Como um arquivo <code className="text-emerald-400 font-mono">.APK</code> precisa ser compilado com Java/Kotlin e o Android SDK, você pode enviar os arquivos <strong>direto deste app para o seu GitHub</strong> com 1 clique:
          </p>
        </div>

        {/* NOVA FERRAMENTA: ENVIAR DIRETO DESTE APP PARA O SEU GITHUB */}
        <div className="bg-gradient-to-r from-emerald-950/70 to-slate-950 border-2 border-emerald-500/50 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-emerald-400 animate-bounce" />
              NOVO: Enviar Arquivos Direto Daqui para o GitHub
            </span>
            <span className="text-xs text-emerald-400 font-bold">100% Automático</span>
          </div>

          <div className="space-y-1">
            <h4 className="text-white font-black text-base">
              Envio Automático dos Arquivos do APK para o seu Repositório
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              O celular bloqueia o envio de pastas inteiras como <code className="text-emerald-400 font-mono">app</code>. Preencha seus dados abaixo e este app enviará <strong>todos os arquivos do projeto e a pasta app</strong> direto para o seu repositório via API do GitHub!
            </p>
          </div>

          <form onSubmit={handleDirectPush} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">Seu Usuário GitHub:</label>
              <input
                type="text"
                value={githubUser}
                onChange={(e) => setGithubUser(e.target.value)}
                placeholder="ex: rvlgamerpro"
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-emerald-400 focus:outline-none font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">Nome do Repositório:</label>
              <input
                type="text"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="ex: Vingadores-meu-piloto-2"
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-emerald-400 focus:outline-none font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                <span>GitHub Token (Classic):</span>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=VingadoresCopilotoAPK"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 underline font-semibold flex items-center gap-0.5 hover:text-cyan-300"
                >
                  <KeyRound className="w-3 h-3" />
                  Gerar Token em 1 clique
                </a>
              </label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="Cole seu ghp_... aqui"
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-emerald-400 focus:outline-none font-mono"
                required
              />
            </div>

            <div className="sm:col-span-3 pt-2">
              <button
                type="submit"
                disabled={isPushing || !githubToken}
                className={`w-full py-3 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                  isPushing
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-emerald-500/30'
                }`}
              >
                {isPushing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando arquivos ({pushProgress?.current}/{pushProgress?.total})...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Enviar Todos os Arquivos para o GitHub Agora</span>
                  </>
                )}
              </button>

              {pushProgress && isPushing && (
                <p className="text-[11px] text-cyan-300 mt-2 text-center font-mono">
                  Enviando: {pushProgress.file} ({pushProgress.current} de {pushProgress.total})
                </p>
              )}

              {pushResult && (
                <div
                  className={`mt-3 p-3 rounded-xl border text-xs flex items-start gap-2 ${
                    pushResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {pushResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold">{pushResult.message}</p>
                    {pushResult.success && (
                      <p className="mt-1 text-slate-300">
                        Vá na aba <strong>Actions</strong> do seu repositório no GitHub para acompanhar a compilação do APK!
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Opção 1: Compilar na Nuvem Grátis via GitHub Actions pelo navegador do celular */}
          <div className="bg-slate-950/90 border border-indigo-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Opção 1 (Via Arquivo build_apk.yml Autônomo)
              </span>
              <span className="text-[10px] text-slate-400 font-bold">Sem Upload</span>
            </div>

            <h4 className="text-white font-extrabold text-sm flex items-center gap-1.5">
              <span>Compilação Automática Apenas Editando 1 Arquivo</span>
            </h4>

            <p className="text-xs text-slate-400 leading-relaxed">
              O robô do GitHub agora é autônomo e gera todo o código nativo sozinho na nuvem se você preferir não usar o token:
            </p>

            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <li>No seu repositório GitHub, edite o arquivo <code className="text-emerald-400 font-mono">build_apk.yml</code>.</li>
              <li>Cole o novo código autônomo (que gera as pastas na hora da compilação).</li>
              <li>O GitHub compilará o APK em 2 minutos e liberará o link de download direto no celular!</li>
            </ol>
          </div>

          {/* Opção 2: PWA Web App Instantâneo */}
          <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Opção 2 (Instalação Imediata em 5 Segundos)
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">Sem Compilar</span>
            </div>

            <h4 className="text-white font-extrabold text-sm flex items-center gap-1.5">
              <span>Instalar como Web App (PWA) Direto na Tela Inicial</span>
            </h4>

            <p className="text-xs text-slate-400 leading-relaxed">
              Você pode usar o aplicativo do Vingadores Copiloto agora mesmo no seu celular sem precisar de APK:
            </p>

            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <li>No Chrome do celular, toque nos <strong>3 pontinhos (⋮)</strong> no canto superior direito.</li>
              <li>Toque em <strong>&ldquo;Adicionar à tela inicial&rdquo;</strong> ou <strong>&ldquo;Instalar aplicativo&rdquo;</strong>.</li>
              <li>Um ícone do <strong>Vingadores Copiloto</strong> aparecerá na tela do seu celular como se fosse um app da Play Store!</li>
              <li>Você terá calculadora de lucro líquido instantânea, histórico de corridas e o simulador interativo na palma da mão.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Step by Step Guide for Drivers / Developers to build APK with Android Studio */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div>
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            Passo a Passo com Computador (Android Studio Tradicional)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Se preferir compilar no seu computador ou no notebook de um colega:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 font-black flex items-center justify-center text-xs">
              1
            </span>
            <div className="font-bold text-white">Baixar o Projeto</div>
            <p className="text-slate-400">
              Clique no botão verde acima <strong>&ldquo;Baixar Projeto Android (ZIP)&rdquo;</strong> e descompacte a pasta no seu computador.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-xs">
              2
            </span>
            <div className="font-bold text-white">Abrir no Android Studio</div>
            <p className="text-slate-400">
              Abra o <strong>Android Studio</strong> (gratuito), clique em <strong>Open</strong> e selecione a pasta descompactada. Aguarde o Gradle sincronizar os pacotes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-black flex items-center justify-center text-xs">
              3
            </span>
            <div className="font-bold text-white">Gerar o APK no Menu</div>
            <p className="text-slate-400">
              Vá no menu superior: <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>. Em 1 minuto o APK estará pronto!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-black flex items-center justify-center text-xs">
              4
            </span>
            <div className="font-bold text-white">Instalar e Ativar Permissões</div>
            <p className="text-slate-400">
              Transfira o arquivo <code className="text-emerald-400 font-mono">app-debug.apk</code> para o WhatsApp ou cabo USB do celular, instale e ative as duas permissões (Sobreposição e Acessibilidade).
            </p>
          </div>
        </div>

        {/* Informações detalhadas das duas permissões obrigatórias do Android */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/20 text-xs space-y-2">
          <div className="font-bold text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Por que o Android exige essas 2 permissões para funcionar?</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-white font-bold block mb-1">1. Sobrepor a outros aplicativos:</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Permite que a janelinha com o Semáforo e Lucro Líquido Real flutue por cima da Uber, 99 e inDrive enquanto você dirige.
              </p>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-white font-bold block mb-1">2. Serviço de Acessibilidade:</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Lê os textos na tela da chamada (valor em R$, km até o passageiro, km da viagem e tempo estimado) sem precisar tirar foto ou print.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
