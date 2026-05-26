// ==========================================
// 1. KONFIGURACJA LOGOWANIA DISCORD (OAUTH2)
// ==========================================
const DISCORD_CLIENT_ID = "1503696971771416647"; 

let REDIRECT_URI = window.location.origin + window.location.pathname;
if (REDIRECT_URI.endsWith('index.html')) { REDIRECT_URI = REDIRECT_URI.slice(0, -10); }
if (REDIRECT_URI.endsWith('/')) { REDIRECT_URI = REDIRECT_URI.slice(0, -1); }

const loginBtn = document.getElementById('btn-discord-login');
const profileWrapper = document.getElementById('discord-profile-wrapper');
const dropdownMenu = document.getElementById('discord-user-dropdown');
const dropdownAvatar = document.getElementById('dropdown-avatar');
const dropdownUsername = document.getElementById('dropdown-username');
const logoutBtn = document.getElementById('btn-discord-logout');

function renderLoggedInUser(user) {
    const avatarUrl = user.avatar 
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';

    if (loginBtn) {
        loginBtn.classList.add('logged-in');
        loginBtn.innerHTML = `
            <div class="user-profile-badge">
                <img src="${avatarUrl}" id="nav-avatar" alt="Avatar">
                <span id="nav-username">${user.username}</span>
            </div>
        `;

        loginBtn.onclick = function(e) {
            e.stopPropagation();
            if (dropdownMenu) dropdownMenu.classList.toggle('show');
        };
    }

    if (dropdownAvatar) dropdownAvatar.src = avatarUrl;
    if (dropdownUsername) dropdownUsername.innerText = user.username;
}

function fetchDiscordData(token) {
    fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
        if (!res.ok) throw new Error("Token wygasł lub jest nieprawidłowy");
        return res.json();
    })
    .then(user => {
        if (user.username) {
            renderLoggedInUser(user);
        }
    })
    .catch(err => {
        console.error(err);
        localStorage.removeItem('discord_access_token');
    });
}

if (loginBtn) {
    loginBtn.addEventListener('click', function(e) {
        if (loginBtn.classList.contains('logged-in')) return; 
        
        e.preventDefault();
        if (window.location.protocol === 'file:') {
            alert("Błąd: Uruchom stronę przez Live Server!");
            return;
        }
        
        const scope = encodeURIComponent('identify guilds');
        const redirect = encodeURIComponent(REDIRECT_URI);
        const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${redirect}&response_type=token&scope=${scope}`;
        
        window.location.href = discordAuthUrl;
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('discord_access_token');
        showNotification("Wylogowano pomyślnie.", "info");
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    });
}

document.addEventListener('click', () => {
    if (dropdownMenu) dropdownMenu.classList.remove('show');
});


// ==========================================
// 2. SLIDER TŁA INTERFEJSU
// ==========================================
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function nextSlide() {
    if(slides.length === 0) return;
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}
if(slides.length > 0) {
    setInterval(nextSlide, 5000);
}


// ==========================================
// 3. SYSTEM POWIADOMIEŃ W PRAWYM DOLNYM ROGU
// ==========================================
function showNotification(message, type = 'info') {
    const container = document.getElementById('custom-notification-container');
    if(!container) return;
    
    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    
    let icon = 'ℹ️';
    if(type === 'error') icon = '⚠️';
    if(type === 'success') icon = '✅';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 4500);
}


// ==========================================
// 4. BAZA PYTAŃ DO FORMULARZY REKRUTACYJNYCH
// ==========================================
const factionQuestions = {
    PSP: [
        { id: "psp_name", label: "Imię i Nazwisko postaci", type: "text", placeholder: "np. Marek Nowak" },
        { id: "psp_age", label: "Wiek postaci / data urodzenia", type: "text", placeholder: "np. 25" },
        { id: "psp_motive", label: "Dlaczego chcesz dołączyć w szeregi Państwowej Straży Pożarnej?", type: "textarea", placeholder: "Napisz swoje uzasadnienie..." },
        { id: "psp_exp", label: "Czy posiadasz doświadczenie z innych serwerów? Opisz je.", type: "textarea", placeholder: "Twoje doświadczenie..." },
        { id: "psp_cmd", label: "Opisz krótko, jakie cechy powinien mieć dobry dowódca sekcji ratowniczej.", type: "textarea", placeholder: "Twoja opinia..." }
    ],
    KSP: [
        { id: "ksp_name", label: "Imię, Nazwisko oraz HexID", type: "text", placeholder: "np. Janusz Nosacz | 1100001xxxxxxxx" },
        { id: "ksp_motive", label: "Co motywuje Cię do podjęcia ciężkiej służby w Policji?", type: "textarea", placeholder: "Rozwiń swoją myśl..." },
        { id: "ksp_hierarchy", label: "Jak rozumiesz pojęcie hierarchii i bezwzględnego wykonywania rozkazów?", type: "textarea", placeholder: "Napisz wyjaśnienie..." },
        { id: "ksp_scen", label: "Sytuacja RP: Zatrzymany pluje na Ciebie i rzuca wyzwiskami. Opisz zachowanie swojego funkcjonariusza.", type: "textarea", placeholder: "Opis akcji..." }
    ],
    PRM: [
        { id: "prm_name", label: "Imię i Nazwisko (OOC oraz IC)", type: "text", placeholder: "np. Kamil / Adam Smith" },
        { id: "prm_bls", label: "Czy znasz procedury BLS, ALS i potrafisz przeprowadzić segregację poszkodowanych (Triage)?", type: "text", placeholder: "Tak / Nie (możesz rozwinąć)" },
        { id: "prm_motive", label: "Dlaczego to właśnie Ty sprawdzisz się jako Ratownik Medyczny?", type: "textarea", placeholder: "Uzasadnij..." },
        { id: "prm_danger", label: "Podczas reanimacji na strefie zjawia się agresywny napastnik z bronią. Co robisz?", type: "textarea", placeholder: "Opisz reakcję..." }
    ],
    Taxi: [
        { id: "taxi_name", label: "Imię i Nazwisko", type: "text", placeholder: "np. Robert Driver" },
        { id: "taxi_geo", label: "W skali od 1 do 10, jak dobrze znasz ulice i najważniejsze lokalizacje w mieście?", type: "text", placeholder: "np. 8/10" },
        { id: "taxi_why", label: "Dlaczego akurat firma transportowa TAXI? Co oferujesz od siebie?", type: "textarea", placeholder: "Twoje zalety..." },
        { id: "taxi_hours", label: "W jakich godzinach najczęściej przebywasz na wyspie?", type: "text", placeholder: "np. 16:00 - 22:00" }
    ],
    Mechanik: [
        { id: "mech_name", label: "Nick z gry / Imię i Nazwisko", type: "text", placeholder: "np. Sebastian Car" },
        { id: "mech_tuning", label: "Czy znasz się na modyfikacjach mechanicznych, tuningu oraz lakiernictwie?", type: "text", placeholder: "Tak / Nie" },
        { id: "mech_action", label: "Opisz kreatywną akcję RP polegającą na wymianie uszkodzonej turbosprężarki w aucie sportowym.", type: "textarea", placeholder: "Opisz procedurę RP krok po krok..." },
        { id: "mech_rules", label: "Czy akceptujesz cennik, regulamin wewnętrzny oraz system rozliczeń w warsztacie?", type: "text", placeholder: "Tak, akceptuję / Nie" }
    ]
};


// ==========================================
// 5. SYSTEM ZAKŁADEK I PODSTRON
// ==========================================
const menuItems = document.querySelectorAll('.nav-item');
const contentArea = document.getElementById('content-area');

const pages = {
    start: `
        <h1 class="hero-title">Witaj na WarszawaRP</h1>
        <p class="hero-desc">Najlepsza rozgrywka Roleplay. Dołącz już teraz.</p>
    `,
onas: `
        <div class="about-modern-container">
            <div class="about-hero-side">
                <div class="about-badge-terminal">O NAS</div>
                <h1 class="about-main-title">WITAJ NA <span class="highlight-pink">WarszawaRP</span></h1>
                <p class="about-description">
                    Szukasz miejsca z prawdziwym <span class="highlight-white">vibe'em</span> i brakiem ograniczeń? Nasz serwer to idealnie zbalansowany świat, tworzony z pasją. Stawiamy na czyste, mocne <span class="highlight-pink">Roleplay</span>, gdzie każda Twoja decyzja ma znaczenie. Wejdź na ulice Warszawy i napisz własną historię.
                </p>
                <div class="about-actions-area">
                    <a href="https://www.roblox.com/pl/games/2534724415/Emergency-Response-Liberty-County" target="_blank" class="btn-about-play">▶ GRAJ TERAZ</a>
                </div>>
            </div>

            <div class="about-logs-side">
                
                <div class="about-log-card">
                    <div class="log-card-header">
                        <span class="log-prefix">[ZESPÓŁ]</span>
                        <h4>Zgrana Administracja</h4>
                    </div>
                    <p>Doświadczona i pomocna ekipa, która dba o porządek, optymalizację kodu oraz każdego gracza na serwerze.</p>
                </div>

                <div class="about-log-card">
                    <div class="log-card-header">
                        <span class="log-prefix">[STATUS]</span>
                        <h4>Ogromna Aktywność</h4>
                    </div>
                    <p>Tętniące życiem miasto, w pełni obsadzone frakcje publiczne oraz dynamiczne akcje RP o każdej porze dnia i nocy.</p>
                </div>

                <div class="about-log-card">
                    <div class="log-card-header">
                        <span class="log-prefix">[DEVELOPMENT]</span>
                        <h4>Ciągłe Nowości & Skrypty</h4>
                    </div>
                    <p>Regularne aktualizacje bazujące na Waszych propozycjach. Autorskie systemy i non-stop coś nowego do odkrycia.</p>
                </div>

            </div>
        </div>
    `,
podania: `
        <div class="premium-recruitment-container">
            <h1 class="premium-page-title">PODANIA</h1>
            <p class="premium-hero-desc">WYBIERZ SWOJĄ FRAKCJĘ</p>
            
            <div id="faction-selection-wrapper" class="premium-cards-flex-row">
                
                <div class="premium-faction-card-v2" data-value="KSP">
                    <div class="card-image-header" style="background-image: url('img/ksp_bg.jpg');">
                        <div class="card-mini-badge-overlay badge-blue">
                            <span class="card-fallback-emoji">🚓</span>
                        </div>
                        <span class="status-badge-overlay badge-open">• OTWARTE</span>
                    </div>
                    <div class="card-body-content">
                        <h3 class="card-main-title">POLICJA KSP</h3>
                        <p class="card-description">Dołącz do KSP i dbaj o porządek oraz bezpieczeństwo mieszkańców na ulicach miasta.</p>
                        
                        <div class="card-requirements">
                            <div class="req-item">👤 Min. 16 lat</div>
                            <div class="req-item">🕒 Min. 20h gry</div>
                            <div class="req-item">🎙️ Mikrofon</div>
                        </div>
                        
                        <button type="button" class="btn-premium-apply">SOON ↗</button>
                    </div>
                </div>

                <div class="premium-faction-card-v2" data-value="PRM">
                    <div class="card-image-header" style="background-image: url('img/prm_bg.jpg');">
                        <div class="card-mini-badge-overlay badge-red">
                            <span class="card-fallback-emoji">🚑</span>
                        </div>
                        <span class="status-badge-overlay badge-open">• OTWARTE</span>
                    </div>
                    <div class="card-body-content">
                        <h3 class="card-main-title">POGOTOWIE PRM</h3>
                        <p class="card-description">Ratuj życie ludzkie, wyjeżdżaj do zgłoszeń wypadków jako wykwalifikowany ratownik medyczny.</p>
                        
                        <div class="card-requirements">
                            <div class="req-item">👤 Min. 16 lat</div>
                            <div class="req-item">🕒 Min. 15h gry</div>
                            <div class="req-item">🎙️ Mikrofon</div>
                        </div>
                        
                        <button type="button" class="btn-premium-apply">SOON ↗</button>
                    </div>
                </div>

                <div class="premium-faction-card-v2" data-value="PSP">
                    <div class="card-image-header" style="background-image: url('img/psp_bg.jpg');">
                        <div class="card-mini-badge-overlay badge-orange">
                            <span class="card-fallback-emoji">🚒</span>
                        </div>
                        <span class="status-badge-overlay badge-open">• SOON</span>
                    </div>
                    <div class="card-body-content">
                        <h3 class="card-main-title">STRAŻ PSP</h3>
                        <p class="card-description">Zabezpieczaj miejsca zdarzeń, walcz z pożarami i pomagaj w najtrudniejszych kryzysach.</p>
                        
                        <div class="card-requirements">
                            <div class="req-item">👤 Min. 15 lat</div>
                            <div class="req-item">🕒 Min. 10h gry</div>
                            <div class="req-item">🎙️ Mikrofon</div>
                        </div>
                        
                        <button type="button" class="btn-premium-apply">SOON ↗</button>
                    </div>
                </div>

                <div class="premium-faction-card-v2" data-value="Mechanik">
                    <div class="card-image-header" style="background-image: url('img/mechanik_bg.jpg');">
                        <div class="card-mini-badge-overlay badge-yellow">
                            <span class="card-fallback-emoji">🔧</span>
                        </div>
                        <span class="status-badge-overlay badge-open">• OTWARTE</span>
                    </div>
                    <div class="card-body-content">
                        <h3 class="card-main-title">MECHANIK SM</h3>
                        <p class="card-description"> SuperMechanik | Naprawiaj uszkodzone pojazdy, holuj auta z wypadków i dbaj o stan techniczny maszyn.</p>
                        
                        <div class="card-requirements">
                            <div class="req-item">👤 Min. 14 lat</div>
                            <div class="req-item">🕒 Min. 10h gry</div>
                            <div class="req-item">🔧 Zalecany</div>
                        </div>
                        
                        <button type="button" class="btn-premium-apply">SOON ↗</button>
                    </div>
                </div>

            </div>

            <div id="application-form-window" class="dope-form-window" style="display: none;">
                <div class="dope-form-header">
                    <h2>Formularz: <span id="target-faction-title" style="color: #ff007f;">---</span></h2>
                    <button type="button" id="btn-return-list" class="btn-dope-back">KROK WSTECZ</button>
                </div>
                <form id="application-form">
                    <div id="dynamic-questions-container"></div>
                    <button type="submit" class="btn-dope-submit">WYŚLIJ KWESTIONARIUSZ ↗</button>
                </form>
            </div>
        </div>
    `,

    changelog: `
        <h1 class="page-title">Lista Zmian (Changelog)</h1>
        <p class="hero-desc" style="margin-bottom: 30px;">Śledź na bieżąco rozwój i nowości wprowadzane na serwerze WarszawaRP</p>
        
        <div class="changelog-container">
            
            <div class="changelog-box">
                <div class="changelog-header">
                    <span class="changelog-version">Changelog #2</span>
                </div>
                <div class="changelog-body">
                    <div class="changelog-section-title">Dodano</div>
                    <ul class="changelog-list">
                        <li><span class="prefix-plus">[+]</span> Customowe Liverki do Frakcji - PSP, KSP, PRM, ŹW, TAXI</li>
                        <li><span class="prefix-plus">[+]</span> Customowe Stroje dla Frakcji - PSP, KSP, PRM, ŹW, TAXI itp..</li>
                        <li><span class="prefix-plus">[+]</span> Customowe modele na mapie takie jak Baza wojskowa, ogrodzenie psp, ogrodenie ksp, ogrodzenie prm, customowe barierki zabezpieczajce na drogach, progi zwalniające, znaki, itp..</li>
                        <li><span class="prefix-plus">[+]</span> Customowe Loga na Budynkach PSP, KSP itp.</li>
                    </ul>
                </div>
            </div>

            <div class="changelog-box">
                <div class="changelog-header">
                    <span class="changelog-version">Changelog #1</span>
                </div>
                <div class="changelog-body">
                    <div class="changelog-section-title">Dodano</div>
                    <ul class="changelog-list">
                        <li><span class="prefix-plus">[+]</span> Dodano Autorskiego Bota.</li>
                        <li><span class="prefix-plus">[+]</span> Dodano Autorskie wyrabiania dowodu osobistego.</li>
                        <li><span class="prefix-plus">[+]</span> Dodano Autorskie rejestrowanie pojazdów.</li>
                        <li><span class="prefix-plus">[+]</span> Dodano Autorskie Ticket na Discord.</li>
                        <li><span class="prefix-plus">[+]</span> Dodano Autorskie Wysylanie wiadomosci dla administracji przez BOTA.</li>
                        <li><span class="prefix-plus">[+]</span> Dodano Autorską Komendę taką jak /ban - banuje osobe i wysyla komunikat na banroom.</li>
                        <li><span class="prefix-plus">[+]</span> Dodano Autorskie SELFROLE - ping ogłoszenia, ankiety, roleplay, sneak-peek.</li>
                        <li><span class="prefix-plus">[+]</span> Dodano Autorski System Weryfikacji po kliknięciu przycisku bot daje łatwy przykład matematyczny do rozwiązania.</li>
                    </ul>
                </div>
            </div>

        </div>
    `,
    regulamin: `
        <h1 class="page-title">Regulamin Serwera</h1>
        <p class="hero-desc" style="margin-bottom: 30px;">Zasady rozgrywki ERLC ROLEPLAY (WL OFF). Nieznajomość regulaminu nie zwalnia z jego przestrzegania.</p>
        
        <div class="rules-container">
            
            <div class="rules-card">
                <h3>Zasady ogólne</h3>
                <ul>
                    <li><span class="rules-dot">[•]</span> Każdy gracz ma obowiązek przestrzegać regulaminu serwera.</li>
                    <li><span class="rules-dot">[•]</span> Administracja ma zawsze ostatnie słowo.</li>
                    <li><span class="rules-dot">[•]</span> Nieznajomość regulaminu nie zwalnia z jego przestrzegania.</li>
                    <li><span class="rules-dot">[•]</span> Wchodząc na serwer, akceptujesz wszystkie zasady.</li>
                </ul>
            </div>

            <div class="rules-card">
                <h3>Roleplay (RP)</h3>
                <ul>
                    <li><span class="rules-dot">[•]</span> Musisz odgrywać realistyczne zachowania swojej postaci.</li>
                    <li><span class="rules-dot">[•]</span> RP jest zawsze ważniejsze niż wygrana.</li>
                    <li><span class="rules-dot">[•]</span> Zakaz robienia rzeczy nierealistycznych (FailRP).</li>
                    <li><span class="rules-dot">[•]</span> Każda akcja musi mieć sens fabularny.</li>
                </ul>
            </div>

            <div class="rules-card-alert">
                <h3>Zakazane zachowania</h3>
                <ul>
                    <li><span class="rules-dot">[•]</span> <strong>RDM</strong> – losowe zabijanie graczy bez powodu RP.</li>
                    <li><span class="rules-dot">[•]</span> <strong>VDM</strong> – taranowanie lub zabijanie pojazdem bez RP.</li>
                    <li><span class="rules-dot">[•]</span> <strong>NLR (New Life Rule)</strong> – po śmierci nie pamiętasz poprzedniej akcji.</li>
                    <li><span class="rules-dot">[•]</span> <strong>Meta Gaming</strong> – używanie informacji spoza gry (Discord, stream itp.).</li>
                    <li><span class="rules-dot">[•]</span> <strong>Combat Logging</strong> – wychodzenie z gry podczas akcji RP.</li>
                </ul>
            </div>

            <div class="rules-card">
                <h3>FearRP</h3>
                <ul>
                    <li><span class="rules-dot">[•]</span> Musisz bać się o swoje życie w realistycznych sytuacjach.</li>
                    <li><span class="rules-dot">[•]</span> Jeśli ktoś celuje bronią &rarr; reagujesz realistycznie (np. poddanie się).</li>
                    <li><span class="rules-dot">[•]</span> Nie możesz zachowywać się jak „superbohater”.</li>
                </ul>
            </div>

            <div class="rules-card">
                <h3>Służby i policja</h3>
                <ul>
                    <li><span class="rules-dot">[•]</span> Policja musi zachowywać profesjonalizm.</li>
                    <li><span class="rules-dot">[•]</span> EMS i FD działają zgodnie z procedurami.</li>
                    <li><span class="rules-dot">[•]</span> Nadużywanie uprawnień = kara.</li>
                </ul>
            </div>

            <div class="rules-card">
                <h3>Zachowanie na serwerze</h3>
                <ul>
                    <li><span class="rules-dot">[•]</span> Zakaz toxicu, obrażania i prowokacji.</li>
                    <li><span class="rules-dot">[•]</span> Szanuj innych graczy i administrację.</li>
                    <li><span class="rules-dot">[•]</span> Spam i trollowanie są zabronione.</li>
                </ul>
            </div>

            <div class="rules-card">
                <h3>Pojazdy i jazda</h3>
                <ul>
                    <li><span class="rules-dot">[•]</span> Jedź realistycznie (bez GTA driving).</li>
                    <li><span class="rules-dot">[•]</span> Zakaz celowego niszczenia pojazdów.</li>
                    <li><span class="rules-dot">[•]</span> Kolizje muszą być odgrywane (RP crash).</li>
                </ul>
            </div>

            <div class="rules-card">
                <h3>Administracja</h3>
                <ul>
                    <li><span class="rules-dot">[•]</span> Decyzje administracji są ostateczne.</li>
                    <li><span class="rules-dot">[•]</span> Możesz zgłosić gracza, ale bez nadużywania reportów.</li>
                    <li><span class="rules-dot">[•]</span> Admin ma prawo przerwać każdą akcję RP.</li>
                </ul>
            </div>

            <div class="rules-card-highlight">
                <h3>Regulamin Napadów</h3>
                <ul>
                    <li><span class="rules-dot">[•]</span> Do rozpoczęcia napadu wymaganych jest minimum 2 aktywnych policjantów.</li>
                    <li><span class="rules-dot">[•]</span> Podczas napadu obowiązuje RP i zakaz trollowania.</li>
                    <li><span class="rules-dot">[•]</span> Po rozpoczęciu napadu przestępcy muszą czekać minimum 5 minut na przyjazd policji.</li>
                    <li><span class="rules-dot">[•]</span> Zakazuje się odjeżdżania z miejsca napadu przed upływem 5 minut.</li>
                    <li><span class="rules-dot">[•]</span> Maksymalnie można posiadać 3 zakładników podczas napadu.</li>
                    <li><span class="rules-dot">[•]</span> Zakładnicy muszą być traktowani realistycznie i nie mogą być zabijani bez powodu RP.</li>
                    <li><span class="rules-dot">[•]</span> Zakaz RDM, VDM oraz Combat Logu.</li>
                    <li><span class="rules-dot">[•]</span> Policja i przestępcy mają obowiązek prowadzić negocjacje RP.</li>
                    <li><span class="rules-dot">[•]</span> Celowe psucie akcji RP będzie karane.</li>
                </ul>
            </div>

        </div>
    `,
    pojecia_rp: `
        <h1 class="page-title">Pojęcia Roleplay</h1>
        <p class="hero-desc" style="margin-bottom: 30px;"></p>
        
        <div class="changelog-container">
            
            <div class="changelog-box">
                <div class="changelog-header" style="border-left: 4px solid #ff007f;">
                    <span class="changelog-version">Podstawowe Pojęcia RP</span>
                </div>
                <div class="changelog-body">
                    <ul class="changelog-list">
                        <li><span class="prefix-plus">[•]</span> <strong>IC (In Character)</strong> &ndash; wszystko, co dotyczy bezpośrednio Twojej postaci w świecie gry.</li>
                        <li><span class="prefix-plus">[•]</span> <strong>OOC (Out Of Character)</strong> &ndash; sprawy niezwiązane z postacią, np. bezpośrednia rozmowa graczy.</li>
                        <li><span class="prefix-plus">[•]</span> <strong>Mixing</strong> &ndash; zabronione mieszanie sfer IC oraz OOC.</li>
                    </ul>
                </div>
            </div>

            <div class="changelog-box">
                <div class="changelog-header" style="border-left: 4px solid #ff007f;">
                    <span class="changelog-version">Zasady Rozgrywki & Zakazy</span>
                </div>
                <div class="changelog-body">
                    <ul class="changelog-list">
                        <li><span class="prefix-plus">[•]</span> <strong>MG (MetaGaming)</strong> &ndash; wykorzystywanie w grze wiadomości zdobytych poza nią.</li>
                        <li><span class="prefix-plus">[•]</span> <strong>PG (PowerGaming)</strong> &ndash; wykonywanie nierealistycznych czynności lub brutalne wymuszanie akcji na innych.</li>
                        <li><span class="prefix-plus">[•]</span> <strong>RDM (Random DeathMatch)</strong> &ndash; zabicie lub atakowanie kogoś bez sensownego powodu fabularnego.</li>
                        <li><span class="prefix-plus">[•]</span> <strong>VDM (Vehicle DeathMatch)</strong> &ndash; celowe rozjeżdżanie lub taranowanie ludzi pojazdem bez podłoża RP.</li>
                        <li><span class="prefix-plus">[•]</span> <strong>FearRP</strong> &ndash; obowiązkowe i realistyczne odgrywanie strachu o własne życie.</li>
                        <li><span class="prefix-plus">[•]</span> <strong>FailRP</strong> &ndash; słabe, błędne lub całkowicie nierealistyczne odgrywanie postaci.</li>
                        <li><span class="prefix-plus">[•]</span> <strong>Combat Log</strong> &ndash; ucieczka z serwera (wyjście z gry) podczas trwania akcji RP.</li>
                        <li><span class="prefix-plus">[•]</span> <strong>Cop Baiting</strong> &ndash; celowe, bezmyślne prowokowanie policji bez żadnego uzasadnienia w RP.</li>
                        <li><span class="prefix-plus">[•]</span> <strong>Bunny Hop</strong> &ndash; ciągłe skakanie w celu nienaturalnego przyspieszenia ruchu postaci.</li>
                        <li><span class="prefix-plus">[•]</span> <strong>Loot RP</strong> &ndash; granie wyłącznie w celu szybkiego zarobku/zdobywania itemów zamiast budowania fabuły.</li>
                        <li><span class="prefix-plus">[•]</span> <strong>Stream Sniping</strong> &ndash; śledzenie transmisji streamera i używanie tej wiedzy przeciwko niemu IC.</li>
                        <li><span class="prefix-plus">[•]</span> <strong>Toxic RP</strong> &ndash; toksyczne zachowanie gracza, które niszczy przyjemność z rozgrywki innym.</li>
                    </ul>
                </div>
            </div>

            <div class="changelog-box">
                <div class="changelog-header" style="border-left: 4px solid #ff007f;">
                    <span class="changelog-version">Postacie, Życie & Organizacje</span>
                </div>
                <div class="changelog-body">
                    <ul class="changelog-list">
                        <li><span class="prefix-plus">[•]</span> <strong>CK (Character Kill)</strong> &ndash; całkowite, trwałe uśmiercenie i usunięcie danej postaci z serwera.</li>
                        <li><span class="prefix-plus">[•]</span> <strong>Frakcja</strong> &ndash; legalna bądź nielegalna organizacja działająca na serwerze (np. KSP, PRM, CRIME).</li>
                        <li><span class="prefix-plus">[•]</span> <strong>Civ</strong> &ndash; postać w pełni cywilna, niezrzeszona w żadnej oficjalnej frakcji.</li>
                    </ul>
                </div>
            </div>

        </div>
    `
};


let selectedFaction = "";

function switchPage(target) {
    if(!contentArea) return;
    contentArea.classList.remove('hero-super-slow-animated');
    void contentArea.offsetWidth; 
    contentArea.classList.add('hero-super-slow-animated');
    contentArea.innerHTML = pages[target] || `<h1>404</h1><p>Nie odnaleziono strony.</p>`;
}

// ==================================================
// DELEGACJA ZDARZEŃ DLA PODSTRONY "PODANIA" (ZABEZPIECZONA)
// ==================================================
if (contentArea) {
    // 1. Kliknięcie w kartę frakcji
    contentArea.addEventListener('click', function(e) {
        const card = e.target.closest('.faction-card');
        if (!card) return;

        selectedFaction = card.getAttribute('data-value');
        const selectionWrapper = document.getElementById('faction-selection-wrapper');
        const formWindow = document.getElementById('application-form-window');
        const factionTitle = document.getElementById('target-faction-title');
        const dynamicContainer = document.getElementById('dynamic-questions-container');

        if (!selectionWrapper || !formWindow || !dynamicContainer) return;

        // Sprawdzenie, czy użytkownik jest zalogowany przez Discord
        if (!localStorage.getItem('discord_access_token')) {
            showNotification("Musisz zalogować się przez Discord przed złożeniem podania! LOGOWANIE SOON", "error");
            return;
        }

        selectionWrapper.style.display = 'none';
        formWindow.style.display = 'block';
        if (factionTitle) factionTitle.innerText = selectedFaction;
        
        dynamicContainer.innerHTML = "";
        const fields = factionQuestions[selectedFaction];
        
        if (fields) {
            fields.forEach(field => {
                const group = document.createElement('div');
                group.className = 'form-group';
                
                const label = document.createElement('label');
                label.setAttribute('for', field.id);
                label.innerText = field.label;
                
                let inputElement;
                if(field.type === 'textarea') {
                    inputElement = document.createElement('textarea');
                    inputElement.setAttribute('id', field.id);
                    inputElement.setAttribute('rows', '4');
                    inputElement.setAttribute('placeholder', field.placeholder);
                    inputElement.required = true;
                } else {
                    inputElement = document.createElement('input');
                    inputElement.setAttribute('type', 'text');
                    inputElement.setAttribute('id', field.id);
                    inputElement.setAttribute('placeholder', field.placeholder);
                    inputElement.required = true;
                }
                
                group.appendChild(label);
                group.appendChild(inputElement);
                dynamicContainer.appendChild(group);
            });

            const firstInput = dynamicContainer.querySelector('input, textarea');
            if (firstInput) firstInput.focus();
        }
    });

    // 2. Kliknięcie przycisku "Powrót do listy"
    contentArea.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'btn-return-list') {
            const selectionWrapper = document.getElementById('faction-selection-wrapper');
            const formWindow = document.getElementById('application-form-window');
            if (formWindow && selectionWrapper) {
                formWindow.style.display = 'none';
                selectionWrapper.style.display = 'block';
                selectedFaction = "";
            }
        }
    });

    // 3. Obsługa wysyłania formularza podania
    contentArea.addEventListener('submit', function(e) {
        if (e.target && e.target.id === 'application-form') {
            e.preventDefault();
            const dynamicContainer = document.getElementById('dynamic-questions-container');
            if (!dynamicContainer) return;

            const elements = dynamicContainer.querySelectorAll('input, textarea');
            let isFormValid = true;

            elements.forEach(el => {
                const value = el.value.trim();
                if(el.tagName.toLowerCase() === 'textarea' && value.length < 10) {
                    showNotification(`Odpowiedź w polu "${el.previousElementSibling.innerText}" jest za krótka! (Min. 10 znaków)`, 'error');
                    isFormValid = false;
                }
            });

            if(!isFormValid) return;

            // Tutaj w przyszłości zepniesz wysyłanie na Webhook Discorda
            showNotification('Twoje podanie zostało pomyślnie wysłane!', 'success');
            
            e.target.reset();
            const selectionWrapper = document.getElementById('faction-selection-wrapper');
            const formWindow = document.getElementById('application-form-window');
            if (formWindow && selectionWrapper) {
                formWindow.style.display = 'none';
                selectionWrapper.style.display = 'block';
                selectedFaction = "";
            }
        }
    });
}

// Obsługa nawigacji górnej
menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        menuItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        switchPage(this.getAttribute('data-target'));
    });
});

const logoTrigger = document.getElementById('logo-trigger');
if(logoTrigger) {
    logoTrigger.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('active'));
        const startTab = document.querySelector('[data-target="start"]');
        if(startTab) startTab.classList.add('active');
        switchPage('start');
    });
}

// Inicjalizacja przy załadowaniu strony
window.addEventListener('DOMContentLoaded', () => {
    switchPage('start');

    const fragment = new URLSearchParams(window.location.hash.slice(1));
    let accessToken = fragment.get('access_token');

    if (accessToken) {
        localStorage.setItem('discord_access_token', accessToken);
        window.history.replaceState({}, document.title, window.location.pathname); 
        showNotification("Zalogowano pomyślnie przez Discord!", "success");
        fetchDiscordData(accessToken);
    } else {
        const savedToken = localStorage.getItem('discord_access_token');
        if (savedToken) {
            fetchDiscordData(savedToken);
        }
    }
});

document.getElementById('btn-discord-login').addEventListener('click', function(e) {
    e.preventDefault(); // Blokuje przeładowanie strony

    const container = document.getElementById('notification-container');
    
    // Tworzenie powiadomienia
    const div = document.createElement('div');
    div.className = 'notification';
    div.innerText = 'Logowanie Discord - SOON';
    
    container.appendChild(div);
    
    // Usuwanie po 3 sekundach
    setTimeout(() => {
        div.remove();
    }, 3000);
});