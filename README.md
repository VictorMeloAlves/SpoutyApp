# Projeto Spouty - Aplicativo Móvel (Módulo de Autenticação e Banco de Dados)

Este repositório contém o código-fonte do aplicativo móvel multiplataforma (Android/iOS) para o projeto de vaso interativo "Spouty". Esta entrega foca no módulo de autenticação de usuários e na integração com o banco de dados em tempo real.

## 📜 Descrição do Módulo

O aplicativo serve como a interface principal do usuário com o sistema Spouty. Este módulo em particular demonstra as funcionalidades de:
- **Cadastro de Novos Usuários:** Permite que novos usuários criem uma conta segura.
- **Login de Usuários Existentes:** Autentica usuários cadastrados.
- **Gerenciamento de Sessão:** Mantém o usuário logado e redireciona para a tela principal ou de login conforme o status da autenticação.
- **Conexão com Banco de Dados em Tempo Real:** Exibe dados (atualmente simulados) vindos do Firebase Firestore, demonstrando a capacidade de o app reagir a atualizações na nuvem.

## 🚀 Tecnologias Utilizadas

- **Linguagem de Programação:** TypeScript
- **Framework de Desenvolvimento:** React Native
- **Gerenciamento de Telas:** React Navigation (`@react-navigation/native-stack`)
- **Serviços de Nuvem (Backend as a Service - BaaS):** Google Firebase
  - **Firebase Authentication:** Para cadastro, login e gerenciamento de usuários.
  - **Firebase Firestore:** Banco de dados NoSQL em tempo real para persistência e recuperação de dados.

## ⚙️ Configuração do Ambiente de Desenvolvimento

Para executar este projeto localmente, é necessário configurar o ambiente de desenvolvimento React Native:

1.  **Instale Node.js:** Versão LTS recomendada. [Download aqui](https://nodejs.org/en).
2.  **Instale o Java Development Kit (JDK):** **Versão 17** é obrigatória. [Download do Adoptium Temurin JDK 17 aqui](https://adoptium.net/temurin/releases/?version=17).
    * Durante a instalação do JDK, certifique-se de que a variável de ambiente `JAVA_HOME` seja configurada corretamente, apontando para a pasta do JDK 17.
3.  **Instale o Android Studio:** Necessário para o Android SDK e ferramentas como `adb`. [Download aqui](https://developer.android.com/studio).
    * No Android Studio, instale o **Android SDK Platform** para a API mais recente (ex: API 34 ou superior) e **Android SDK Build-Tools**.
    * **Configure a variável de ambiente `ANDROID_HOME`:** No Windows, aponte para a pasta raiz do seu SDK (ex: `C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk`).
    * Adicione `%ANDROID_HOME%\platform-tools` e `%ANDROID_HOME%\tools` ao `Path` do sistema.
    * **Importante:** Reinicie seu computador após configurar as variáveis de ambiente para que elas sejam aplicadas.
4.  **Instale o Git:** Necessário para clonar e versionar o código.

## 🔑 Integração com o Firebase (Detalhes Cruciais)

Este projeto utiliza o Firebase para autenticação e banco de dados. A conexão é configurada da seguinte forma:

1.  **Crie um Projeto Firebase:**
    * Acesse [Firebase Console](https://console.firebase.google.com/) e crie um novo projeto.
    * **Habilite o Firebase Authentication:** Na seção "Build", vá em "Authentication" e ative o provedor "E-mail/senha".
    * **Crie o Firestore Database:** Na seção "Build", vá em "Firestore Database", clique em "Criar banco de dados" e escolha **"Iniciar em modo de teste"** e selecione a localização `southamerica-east1 (São Paulo)`.

2.  **Registre o Aplicativo Android no Firebase:**
    * No painel do seu projeto Firebase, clique no **ícone do Android (🤖)**.
    * Preencha o "Nome do pacote Android" com `com.spoutyapp` (este é o ID único do aplicativo).
    * Clique em "Registrar app".

3.  **Baixe o `google-services.json`:**
    * Após registrar o app, o Firebase oferecerá o download do arquivo `google-services.json`.
    * Baixe este arquivo e coloque-o na pasta **`SpoutyApp/android/app/`** do seu projeto local. **Este arquivo não contém chaves secretas e deve ser versionado no Git.**

4.  **Configurações Gradle:**
    * No arquivo `android/build.gradle` (raiz da pasta android), adicione a linha `classpath 'com.google.gms:google-services:4.4.2'` (ou a versão mais recente) dentro de `buildscript { dependencies { ... } }`.
    * No arquivo `android/app/build.gradle`, adicione a linha `apply plugin: 'com.google.gms.google-services'` no topo do arquivo.

## ▶️ Como Executar o Sistema Localmente

1.  **Clone o Repositório:**
    ```bash
    git clone [https://github.com/VictorMeloAlves/SpoutyApp.git](https://github.com/VictorMeloAlves/SpoutyApp.git)
    cd SpoutyApp
    ```
2.  **Instale as Dependências JavaScript:**
    ```bash
    npm install
    ```
3.  **Prepare o Celular Android:**
    * Habilite as "Opções do desenvolvedor" e a "Depuração USB".
    * Conecte o celular ao PC via cabo USB.
    * Na tela do celular, permita a depuração USB e marque "Sempre permitir a partir deste computador".
    * Garanta que o celular e o computador estão na **mesma rede Wi-Fi**.
4.  **Execute o Aplicativo:**
    ```bash
    npx react-native run-android
    ```
    * Uma nova janela de terminal (Metro Bundler) será aberta. Mantenha-a ativa.
    * O app será compilado e instalado no seu celular.
    