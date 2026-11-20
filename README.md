# AI Marketing Studio

Ссылка на товар → 3 переупакованные карточки + 5 продающих текстов (Telegram, Дзен, ВК, Одноклассники, сайт) → топ-10 поисковых запросов → вертикальный рекламный ролик 9:16.

**Стек:** FastAPI · SQLite (WAL) · JWT · Qwen/GPT/Claude/Groq/DeepSeek/OpenRouter · Wan (DashScope) · ffmpeg · vanilla-JS SPA · nginx · Docker.

> Новичку: начните с **[docs/START.md](docs/START.md)** — пошагово от пустого компьютера до рабочего сайта.
> Оператору: **[docs/SETUP.md](docs/SETUP.md)** и **[docs/RUNBOOK.md](docs/RUNBOOK.md)**.

## Быстрый старт (DEMO, без ключей)

```bash
cp .env.example .env
make up                 # docker compose up -d --build
```
Открыть http://localhost · Swagger http://localhost/docs

Без Docker:
```bash
make install && make run    # http://localhost:8000
```

## Переход в LIVE

```bash
cp configure.env.example configure.env   # впишите MODE=live и LLM_API_KEY
make configure-probe                     # проверка ключа реальным запросом
make configure                           # запись .env (600) + первый аккаунт
make doctor-live                         # диагностика всех подсистем
make verify                              # 38 автотестов
make up
```
Интерактивная альтернатива: `python setup.py`.

## Прод на своём сервере

```bash
sudo bash deploy/vps-bootstrap.sh ваш-домен.ru /opt/ai-marketing-studio
```
Ставит Docker, nginx, Let's Encrypt, firewall и ночные бэкапы. Прод-стек слушает `127.0.0.1:8080` за внешним nginx.

## GitHub Pages

Workflow `.github/workflows/pages.yml` публикует витрину (`docs/index.html`) и студию в DEMO (`/app/`) на `https://<user>.github.io/<repo>/`. Включается: Settings → Pages → Source: **GitHub Actions**.

## Управление

```bash
python admin.py create boss@shop.ru --balance 1000000
python admin.py topup  boss@shop.ru 500000
python admin.py stats  --email boss@shop.ru
python admin.py list
make backup
```

## API (основное)

| Метод | Путь | Назначение |
|---|---|---|
| GET | `/api/health` | режим, провайдер, ffmpeg |
| POST | `/api/parse` | парсинг товара (SSRF-защищённый) |
| POST | `/api/generate` | 3 карточки + 5 текстов + image-промпты |
| POST | `/api/keywords` | топ-10 запросов + insights |
| POST | `/api/video` | раскадровка + master-prompt + SEO |
| POST | `/api/video/render` | задачи Wan по сценам |
| GET | `/api/video/status/{id}` | статус и ссылка на клип |
| POST | `/api/video/assemble` | ffmpeg → MP4, иначе ZIP |
| POST | `/api/auth/register` · `/login` | JWT |
| GET | `/api/me` | баланс и расход токенов |
| GET/POST/DELETE | `/api/history[/{id}]` | серверная история |

## Безопасность и честность

* SSRF-фильтр (приватные диапазоны, редиректы, лимит 3 МБ), rate-limit по `X-Real-IP`, отдельный лимит на `/api/auth/*`.
* PBKDF2-SHA256 600 000 итераций; JWT HS256; CORS whitelist.
* Атомарное списание токенов (`UPDATE … WHERE balance >= n`), резерв под полный ответ модели.
* Ответ LLM валидируется Pydantic-схемой с повторной попыткой.
* Частотность запросов помечена как оценка LLM (`_estimated`), пока не подключён Wordstat.
* Подробности: [SECURITY.md](SECURITY.md).

## Ограничения (осознанные)

* Wildberries/Ozon отдают данные через JS — для них включите `PARSER_ENGINE=playwright` (`make optional`).
* SQLite single-writer и rate-limit в памяти процесса: при росте переходите на Postgres + Redis.
* DNS-rebinding закрывается сетевой egress-политикой, а не кодом.

## Лицензия

MIT
