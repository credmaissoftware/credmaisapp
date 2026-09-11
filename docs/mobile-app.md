# Aplicativo mobile

O CredMais usa Capacitor para entregar a mesma experiência web em shells nativos para Android e iOS, com navegação adaptada para toque, safe areas e barra inferior mobile.

## Desenvolvimento

```bash
npm install
npm run mobile:build
```

O comando `mobile:build` gera a aplicação web e sincroniza os arquivos para `android/` e `ios/`.

## Android

Requisitos: Android Studio, JDK compatível e Android SDK configurado.

```bash
npm run mobile:android
```

No Android Studio, selecione um emulador ou dispositivo e execute o projeto. Para gerar um pacote de release, use o fluxo **Build > Generate Signed Bundle / APK**.

## iOS

Requisitos: macOS com Xcode instalado e uma conta Apple para assinatura.

```bash
npm run mobile:ios
```

No Xcode, selecione um simulador ou dispositivo, configure o time de assinatura e execute o target `App`.

Sempre que o frontend mudar, rode `npm run mobile:build` antes de abrir o projeto nativo para atualizar os assets embarcados.
