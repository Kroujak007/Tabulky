# Kalorie — webová aplikace pro iPhone

Toto je funkční prototyp ve formě progresivní webové aplikace (PWA). Má tmavý design, přehled kalorií a maker, jídelníček, vlastní potraviny, recepty, váhu, cíle a export/import zálohy.

## Jak ji otevřít na iPhonu
Aby šla otevřít z veřejného odkazu a přidat na plochu, je nutné ji nejprve zveřejnit na HTTPS hostingu. Tento archiv sám o sobě veřejný odkaz nevytvoří.

Jednoduché možnosti hostingu:
- GitHub Pages (veřejný repozitář) — nahraj obsah složky do repozitáře a zapni Pages.
- Netlify nebo Vercel — nahraj složku / propojuj repozitář a nasaď statickou stránku.

Po nasazení:
1. Otevři URL v Safari na iPhonu.
2. Stiskni Sdílet.
3. Vyber Přidat na plochu.
4. Potvrď Přidat.

## Ukládání a aktualizace
- Prototyp ukládá data do localStorage prohlížeče na konkrétním zařízení.
- Aktualizace kódu se projeví po nasazení nové verze. Service worker může držet starší soubory v cache; při větší aktualizaci zvyš verzi CACHE v `sw.js` (např. `kalorie-cache-v2`).
- Data se automaticky nesynchronizují mezi zařízeními. Exportuj pravidelně zálohu v Nastavení.
- Pro synchronizaci mezi zařízeními bude potřeba backend a přihlášení (např. Supabase/Firebase).

## Funkce prototypu
- Denní přehled kalorií a makroživin s nastavitelnými cíli.
- Navigace mezi dny.
- Zapisování jídel, gramáže a mazání záznamů.
- Vyhledávání lokální databáze a dotaz do Open Food Facts.
- Vyhledávání podle čárového kódu (zadání čísla kódu; kamera není implementována).
- Vlastní potraviny a recepty.
- Historie hmotnosti a jednoduchý graf.
- JSON export/import.
- Základní offline cache.

## Omezení
- Zdravotní data a Apple Watch nejsou dostupné přímo z běžné webové aplikace. Je potřeba nativní iOS aplikace s HealthKit.
- Recepty zatím ukládají ručně zadané nutriční hodnoty na porci; sčítání živin z ingrediencí je další krok.
- Databázové údaje mohou být chybné nebo neúplné; umožni uživateli hodnoty ověřit.
- Pro veřejné použití doplň zásady ochrany osobních údajů, důkladné testování a bezpečnostní kontroly.
