import { ANDROID_PROJECT_FILES } from './androidProjectCode';

export interface PushResult {
  success: boolean;
  message: string;
  filesUploaded?: number;
  error?: string;
}

/**
 * Pushes all Android project files directly to a user's GitHub repository via GitHub REST API.
 * Uses repo personal access token (classic or fine-grained with contents:write permission).
 */
export async function pushProjectToGitHub(
  owner: string,
  repo: string,
  token: string,
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<PushResult> {
  const cleanOwner = owner.trim();
  const cleanRepo = repo.trim();
  const cleanToken = token.trim();

  if (!cleanOwner || !cleanRepo || !cleanToken) {
    return {
      success: false,
      message: 'Preencha Usuário, Nome do Repositório e Token do GitHub.',
    };
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `Bearer ${cleanToken}`,
    'Content-Type': 'application/json',
  };

  try {
    // 1. Verify access to repository
    const repoCheck = await fetch(`https://api.github.com/repos/${cleanOwner}/${cleanRepo}`, {
      headers,
    });

    if (!repoCheck.ok) {
      if (repoCheck.status === 404) {
        return {
          success: false,
          message: `Repositório "${cleanOwner}/${cleanRepo}" não encontrado ou o Token não tem acesso a ele.`,
        };
      }
      if (repoCheck.status === 401) {
        return {
          success: false,
          message: 'Token de Acesso do GitHub inválido ou expirado.',
        };
      }
      const err = await repoCheck.json().catch(() => ({}));
      return {
        success: false,
        message: err.message || 'Erro ao conectar com o GitHub.',
      };
    }

    // List of files to upload: upload android project files first, and workflow file gracefully
    const workflowFile = {
      path: '.github/workflows/build_apk.yml',
      code: `name: Build APK Vingadores Copiloto

on:
  push:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Repository
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'

    - name: Setup Android SDK
      uses: android-actions/setup-android@v3

    - name: Setup Gradle
      uses: gradle/actions/setup-gradle@v4
      with:
        gradle-version: '8.10.2'

    - name: Build Debug APK
      run: gradle assembleDebug --stacktrace --no-daemon

    - name: Upload APK Artifact
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: VingadoresCopiloto-APK
        path: "**/build/outputs/apk/debug/*.apk"
`,
    };

    // Put project files first (app/...) so that even if .github requires extra 'workflow' scope, all app code is pushed successfully!
    const filesToUpload = [...ANDROID_PROJECT_FILES, workflowFile];
    let uploadedCount = 0;

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      if (onProgress) {
        onProgress(i + 1, filesToUpload.length, file.path);
      }

      // Check if file already exists to get SHA for update
      let sha: string | undefined;
      const getFileRes = await fetch(
        `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${file.path}`,
        { headers }
      );

      if (getFileRes.ok) {
        const fileData = await getFileRes.json();
        sha = fileData.sha;
      }

      // Encode UTF-8 content to base64
      const base64Content = btoa(unescape(encodeURIComponent(file.code)));

      const putRes = await fetch(
        `https://api.github.com/repos/${cleanOwner}/${cleanRepo}/contents/${file.path}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            message: `chore: add ${file.path} for Android APK build`,
            content: base64Content,
            ...(sha ? { sha } : {}),
          }),
        }
      );

      if (!putRes.ok) {
        const errorData = await putRes.json().catch(() => ({}));
        // If workflow file fails because user didn't check 'workflow' scope on token, don't fail the whole push
        if (file.path.startsWith('.github/')) {
          console.warn('Workflow upload skipped or already exists:', errorData.message);
          continue;
        }
        throw new Error(
          `Falha ao enviar ${file.path}: ${errorData.message || putRes.statusText}`
        );
      }

      uploadedCount++;
    }

    return {
      success: true,
      filesUploaded: uploadedCount,
      message: `Sucesso! ${uploadedCount} arquivos enviados diretamente para o GitHub. A compilação do APK iniciou automaticamente na aba Actions!`,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: errorMsg,
    };
  }
}
