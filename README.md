# ⚖️ ProContra — AI-Powered Decision Making Desktop App

<p align="center">
  <img src="https://raw.githubusercontent.com/Doginnet/pro-contra/main/public/favicon.svg" width="80" height="80" alt="ProContra Logo" />
</p>

<p align="center">
  <b>Минималистичное и быстрое десктопное приложение для взвешивания решений методом «За и Против» с 10-балльной шкалой, интерактивным балансом и встроенным AI-советником.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Electron-44-47848F?logo=electron&logoColor=white" alt="Electron" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Google_Gemini-3.x-8E75B2?logo=google-gemini&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
</p>

---

## ✨ Ключевые особенности / Features

### 1. 📋 Раздельная доска аргументов (Split Board)
- **Две контрастные колонки**: **PRO (За)** в мягких изумрудных тонах и **CONTRA (Против)** в рубиновых тонах.
- **Взвешивание 1–10**: плавные ползунки для каждого аргумента с подсказками степени важности (*Незначительный, Умеренный, Важный, Критический*).
- **Быстрый ввод**: добавление нового довода по нажатию `Enter` с возможностью сразу задать начальный вес.

### 2. ⚖️ Интерактивная шкала баланса (Tug-of-War Bar)
- Автоматический расчет суммы баллов и процентного соотношения сил в реальном времени.
- Визуальная динамическая шкала перетягивания каната с отметкой центра и цветовой индикацией перевеса.
- Понятный текстовый вердикт с расчетом дельты очков (*например: «🏆 Перевес в пользу «ЗА» на +11 баллов (64% против 36%)»*).

### 3. 🤖 AI Decision Coach ("ASK AGENT")
Выдвижная боковая панель справа (Side Drawer), которая позволяет общаться с AI, не закрывая аргументы на доске. Вся информация структурированно передается в модель.

- 📊 **Глубокий анализ**: беспристрастный стратегический аудит, оценка обратимости решений, асимметрии рисков и контрольные вопросы.
- 💡 **Brainstorm аргументов**: AI анализирует контекст и предлагает упущенные сильные доводы «За» и «Против». Каждый аргумент можно добавить на свою доску в **1 клик**!
- 😈 **Адвокат дьявола**: жесткий стресс-тест предположений, выявление когнитивных искажений (*loss aversion, optimism bias, status quo bias*) и моделирование сценария провала (Pre-Mortem).
- 💬 **Эфемерный диалог**: контекстная сессия вопросов и ответов для уточнения деталей. История сохраняется в памяти и легко стирается по кнопке сброса.

### 4. 🔌 Поддержка LLM провайдеров
- **Google Gemini**: нативная поддержка моделей нового поколения `gemini-3.5-flash-lite`, `gemini-3.5-flash`, `gemini-3.8-flash`, `gemini-3.5-pro` через бесплатный API-ключ из [Google AI Studio](https://aistudio.google.com/app/apikey).
- **OpenAI Compatible**: возможность подключить любой совместимый endpoint — **OpenAI**, **OpenRouter**, **Groq**, **DeepSeek** или локальный **Ollama** (`http://localhost:11434/v1`).
- Встроенная кнопка проверки подключения.

### 5. 💾 Сохранение и экспорт
- Локальное автосохранение всех дилемм в `localStorage`.
- Модальное окно со списком всех сохраненных решений, датами и переключением в 1 клик.
- Экспорт полного отчета в отформатированный файл **Markdown** (`.md`).
- Премиальная тёмная тема в стиле Raycast / Linear с возможностью переключения на светлую.

---

## 🛠️ Стек технологий / Tech Stack

- **Runtime**: [Electron](https://www.electronjs.org/)
- **UI Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 8](https://vite.dev/) + `vite-plugin-electron`
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI Integration**: Google Gemini REST API & OpenAI Chat Completions API

---

## 🚀 Быстрый старт / Getting Started

### Требования
- [Node.js](https://nodejs.org/) версии 18+ (рекомендуется 20+)
- npm / pnpm / yarn

### Установка и запуск

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/Doginnet/pro-contra.git
   cd pro-contra
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Запустите приложение в режиме разработки:
   ```bash
   npm run dev
   ```

---

## 📦 Сборка дистрибутива / Build

Для создания релизного исполняемого файла под вашу операционную систему:

```bash
# Компиляция TypeScript и бандлов Vite + Electron
npm run build

# Создание инсталлятора (Windows exe / macOS dmg / Linux AppImage)
npm run package
```

Собранные файлы появятся в папке `release/` или `dist/`.

---

## ⚙️ Настройка AI ключа

1. Откройте приложение и нажмите на иконку шестеренки **⚙️ (Настройки)** в правом верхнем углу.
2. Для Gemini: получите бесплатный API-ключ в [Google AI Studio](https://aistudio.google.com/app/apikey) и вставьте его в поле ключа.
3. Выберите модель (по умолчанию `gemini-3.5-flash`) или укажите любую свою.
4. Нажмите **«Проверить соединение»** и **«Сохранить»**.

---

## 📄 Лицензия / License

Проект распространяется под лицензией [MIT](LICENSE).
Любой вклад, предложения и pull requests приветствуются!
