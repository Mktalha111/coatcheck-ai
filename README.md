# CoatCheck AI 2.1

**Live: [coatcheck-ai.pages.dev](https://coatcheck-ai.pages.dev/)**

Keep secrets out of AI chats. Scrub API keys, passwords and personal data from a prompt before you paste it into ChatGPT, Claude or Gemini, then put the real values back into the reply.

Everything runs in your browser. Nothing you paste is uploaded: a Content-Security-Policy blocks the app from making any network request.

## The five tools

| Tool | What it does |
|---|---|
| **Sanitize** | Finds secrets as you type and swaps them for placeholders like `{{OPENAI_KEY_1}}`. Highlights every swap, lists what was found, and lets you "keep" anything that isn't really secret. |
| **Restore** | Paste the AI's reply and every placeholder turns back into your real value, even if the AI wrote `{{ EMAIL_1 }}`, `[EMAIL_1]` or plain `EMAIL_1`. Warns about placeholders it doesn't know. |
| **Scan** | Checks untrusted text (resumes, web pages, emails) for hidden characters, reversed text (Trojan Source), hidden "ASCII smuggling" messages, look-alike letters, Base64 payloads and prompt-injection phrases, in English and 20+ other languages (Spanish, French, German, Chinese, Japanese, Korean, Arabic, Urdu, Hindi, Russian, Turkish, Indonesian…). Shows an x-ray view and can strip, neutralize or wrap the text as safe data. |
| **Compress** | Removes comments, blank lines and extra spaces, and minifies JSON, without touching strings, URLs or Python/YAML indentation. Shows the tokens saved. |
| **Bundle** | Drop files or a whole folder and get one structured prompt (XML or Markdown) with a file tree. Secrets are scrubbed with the same key map, so Restore works on the answer. |

### What Sanitize catches

- API keys and tokens: OpenAI, Anthropic, AWS, Google, GitHub, GitLab, Stripe, Slack, Discord, Hugging Face, SendGrid, Twilio, npm, Shopify, Telegram, Groq, xAI, Replicate, Mailgun, DigitalOcean, PyPI, bearer and basic-auth headers, secrets in URLs
- Private key blocks, JWTs, connection strings (`postgres://`, `mongodb+srv://`, `user:pass@` links, Azure `AccountKey=`)
- Passwords and secret settings: `password=…`, `"api_key": "…"`, `.env` and YAML lines
- Random-looking strings (catches key formats nobody has listed yet)
- **Phone numbers from any country.** Numbers with `+`, `00` or `011` are checked against 215 country calling codes and the right length for that country. Local formats are recognised too (`020 7946 0958`, `(11) 91234-5678`, `03-1234-5678`, `98765 43210`, `138 0013 8000`, …), as are numbers after a label in many languages (`Tel:`, `WhatsApp`, `Teléfono`, `电话`, `هاتف`, `फ़ोन`, `тел.`, …). Dates, years, prices, versions, ISBNs and IP addresses are left alone.
- **ID, tax and bank numbers**, using the official check digit wherever the country has one: China resident ID, Brazil CPF and CNPJ, Spain DNI/NIE, Italy codice fiscale, France social security number, UK National Insurance number, India PAN and Aadhaar (Verhoeff), Mexico CURP and RFC, UAE Emirates ID, Singapore NRIC/FIN, Korea resident number, Sweden, Finland, Denmark and Belgium personal numbers, Russia SNILS, Poland PESEL, Turkey TC Kimlik, Egypt and South Africa IDs, Canada SIN, US SSN and ITIN, Pakistan CNIC, and IBAN for every country. Any value written after a label such as "passport no.", "ID number", "account number", "رقم الهوية", "身份证号码" or "पासपोर्ट नंबर" is hidden too.
- **Card numbers**: Visa, Mastercard, Amex, UnionPay, JCB, RuPay, Mir, Troy and more, checked with the Luhn sum.
- **Emails in any alphabet** (`müller@münchen.de`, `пользователь@пример.рф`), even when written right next to Chinese, Japanese or Thai text.
- **Native digits**: Arabic-Indic, Persian, Devanagari, Bengali, Thai and full-width digits are recognised. The original characters are kept, so Restore gives back exactly what you wrote.
- IP addresses, and your own words: names, projects, clients. Write `Acme Corp = Company X` to choose the stand-in.

## The key map

The key map links each placeholder to its real value. It lives in the tab's memory and, by default, in the tab's session storage, so a reload doesn't lose it; closing the tab clears it. Open it with the **Key map** button (or press `K`) to see values, save the map to a file, or load one back later.

## Shortcuts

| Keys | Action |
|---|---|
| `Alt` + `1`–`5` | Switch tool |
| `Ctrl` + `Enter` | Copy the result of the current tool |
| `K` | Open the key map |
| `?` | Help |
| `Esc` | Close a dialog |

## Run it

Double-click `index.html` for the homepage, or `app.html` for the app. That's it.

To install it as an app and use it offline, serve the folder over http (the service worker only runs on http/https):

```bash
py -3.12 -m http.server 8137
```

Then open `http://localhost:8137`.

Open `http://localhost:8137/testing.html` for the test kit: a one-click self-check (about 240 checks) and a step-by-step manual checklist.

## Deploy on Cloudflare Pages

The site is plain static files: there is no build step. Static requests on Cloudflare Pages are free and unlimited, so a traffic spike cannot use up a monthly allowance.

1. Push this folder to a GitHub repository.
2. In the [Cloudflare dashboard](https://dash.cloudflare.com), open **Workers & Pages → Create → Pages → Connect to Git** and pick the repository.
3. Framework preset: **None**. Leave the build command empty and set the build output directory to `/`. Press **Save and Deploy**.
4. Optional: **Custom domains** to connect your own domain.

`_headers` sets the security headers: a strict Content-Security-Policy, no framing by other sites, no MIME sniffing, no referrer, all device permissions off, HTTPS only, and no caching of `sw.js` so updates reach people right away. Cloudflare serves clean addresses such as `/privacy` by itself.

If the host ever has trouble, returning visitors still get their saved copy of the app.

## Files

```
coatcheck-ai/
├── index.html        the homepage
├── app.html          the whole app (HTML, CSS and JS in one file)
├── testing.html      test kit (self-check + manual checklist)
├── privacy.html      privacy policy
├── terms.html        terms of use
├── 404.html          "page not found"
├── manifest.json     install-as-app info, screenshots, shortcuts
├── sw.js             offline support, and a saved copy if the host has trouble
├── _headers          Cloudflare Pages security headers
├── LICENSE           MIT (fonts: SIL OFL, see assets/fonts/OFL.txt)
├── assets/
│   ├── fonts/        self-hosted fonts, so nothing loads from Google
│   ├── screenshots/  shown in the install dialog
│   ├── og-image.png  link preview card (1200×630)
│   └── icon-*.png    app icons (incl. Android maskable)
└── _backup/          the original v1 files (not published)
```

## Notes

- Token counts are estimates (about ±15%). Real tokenizers differ by model.
- Prices are input-token list prices for Claude models as of Nov 2026. Choose "Edit custom model" in any price menu to add any other model and price.
- Fonts are self-hosted. The site makes no request to any other server.
- Add `?demo` to a link (for example `/app?demo#scan`) to open a tool with its demo already loaded. Handy for launch posts.
- No detector is perfect. Glance over the highlights before you send.

## License

MIT for the code. The fonts in `assets/fonts` are under the SIL Open Font License 1.1.
