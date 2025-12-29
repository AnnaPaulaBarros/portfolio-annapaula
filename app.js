import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// CONFIGURAÇÃO FIREBASE
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "ID",
    appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// VARIÁVEIS DE CONTROLE
let currentProjIndex = 0;
let currentDepoIndex = 0;
let currentLang = "pt";

// ======= FUNÇÕES DE NAVEGAÇÃO =======
window.startGame = () => {
    const hero = document.getElementById('hero');
    const content = document.getElementById('content');
    const coinSound = document.getElementById('coinSound');
    if (hero && content) {
        if (coinSound) { coinSound.currentTime = 0; coinSound.play(); }
        hero.classList.add('hidden');
        content.classList.remove('hidden');
        window.scrollTo(0, 0);
    }
};

window.restartGame = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
        document.getElementById('content').classList.add('hidden');
        document.getElementById('hero').classList.remove('hidden');
    }, 500);
};

// SLIDER DE PROJETOS
window.moveProject = (direction) => {
    const inner = document.getElementById('projects-inner');
    const cards = document.querySelectorAll('.project-card');
    if (!inner || cards.length === 0) return;

    const totalCards = cards.length;
    currentProjIndex = (currentProjIndex + direction + totalCards) % totalCards;

    const step = cards[0].offsetWidth + 20; // passo automático baseado no tamanho do card
    inner.style.transform = `translateX(${-currentProjIndex * step}px)`;
};

// SLIDER DE DEPOIMENTOS
window.moveDepoimento = (direction) => {
    const slider = document.querySelector('.testimonial-slider');
    const cards = document.querySelectorAll('.testimonial-card');
    if (!slider || cards.length === 0) return;

    const totalCards = cards.length;
    const cardsPerView = 3;
    const maxIndex = Math.max(0, totalCards - cardsPerView);

    currentDepoIndex += direction;
    if (currentDepoIndex < 0) currentDepoIndex = 0;
    if (currentDepoIndex > maxIndex) currentDepoIndex = maxIndex;

    const step = cards[0].offsetWidth + 30; 
    slider.style.transform = `translateX(${currentDepoIndex * -step}px)`;
};

// MODAL DE PROJETOS
window.openDetails = (index) => {
    const modal = document.getElementById('project-modal');
    const title = document.getElementById('modal-title');
    const desc = document.getElementById('modal-description');

    const proj = translations[currentLang].projects.items[index];
    title.innerText = proj.title;
    desc.innerText = proj.desc || proj.tech;

    modal.classList.remove('hidden');
};

// ======= FIREBASE & DEPOIMENTOS =======
document.addEventListener("DOMContentLoaded", () => {
    // CARREGAR DEPOIMENTOS
    const testimonialContainer = document.querySelector('.testimonial-slider');
    const q = query(collection(db, "depoimentos"), orderBy("data", "desc"));
    
    onSnapshot(q, (snapshot) => {
        if (!testimonialContainer) return;
        testimonialContainer.innerHTML = ""; 
        snapshot.forEach((doc) => {
            const data = doc.data();
            const div = document.createElement('div');
            div.className = 'testimonial-card';
            div.innerHTML = `
                <div class="dialog-box">
                    <p>"${data.mensagem}"</p>
                    <span class="author">- ${data.nome} ${"⭐".repeat(data.estrela || 5)}</span>
                </div>
            `;
            testimonialContainer.appendChild(div);
        });
    });

    // FORMULÁRIO
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.onsubmit = async (e) => {
            e.preventDefault();
            try {
                await addDoc(collection(db, "depoimentos"), {
                    nome: document.getElementById('review-name').value,
                    mensagem: document.getElementById('review-text').value,
                    estrela: parseInt(document.getElementById('star-value').value),
                    data: serverTimestamp()
                });
                document.getElementById('coinSound')?.play();
                alert(translations[currentLang].testimonials.alert || "Depoimento enviado!");
                reviewForm.reset();
            } catch (err) {
                alert("Erro: " + err.message);
            }
        };
    }

    // ESTRELAS
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.onclick = () => {
            const val = star.getAttribute('data-value');
            document.getElementById('star-value').value = val;
            stars.forEach(s => s.style.opacity = s.getAttribute('data-value') <= val ? "1" : "0.3");
        };
    });
});

// ================== TRADUÇÕES ==================
const translations = {
  pt: {
    hero: { title: "ANNA PAULA", subtitle: "PORTFÓLIO", text: "Prepare-se para a aventura: transformo Dados, UX e Frontend em soluções incríveis!", startBtn: "INÍCIO" },
    about: { 
      title: "Olá, me chamo Anna Paula.", 
      text: "Minha jornada começou no trajeto do banco para casa. Ao ver animais abandonados, percebi que precisava transformar essa realidade. Foi assim que nasceu o Miaucaomigo, um aplicativo que permite fotografar animais abandonados e marcar onde foram vistos, ajudando pessoas a adotarem em vez de comprarem, prevenindo abusos e salvando vidas. Na época, ainda não sabia programar. Então iniciei minha formação em Engenharia de Computação, fiz o ENEM e consegui bolsa pelo Prouni no curso de Análise e Desenvolvimento de Sistemas, complementando meus estudos com cursos técnicos. Com o tempo, encontrei minha essência na área e tive coragem de mudar de carreira, realizando o mestrado em Ciências de Dados para fortalecer meu perfil profissional. Hoje, utilizo a tecnologia para criar soluções digitais que impactam pessoas, animais e o agro, unindo propósito e inovação para gerar mudanças reais."
    },
    services: { title: "Meus Serviços", items: [
      { title: "1", desc: "Transformo dados em insights estratégicos para decisões de negócios, dashboards e análises financeiras.", tag: "Dados" },
      { title: "2", desc: "Criação de sites, aplicativos, identidade da marca e interfaces intuitivas que conectam pessoas à tecnologia.", tag: "UX / Frontend" },
      { title: "3", desc: "Automatizo processos, workflows e sistemas, economizando tempo e aumentando eficiência.", tag: "Automação" }
    ]},
    projects: { title: "Meus Projetos", items: [
      { title: "Aplicativo", tech: "Flutter, Firebase, Google Maps API" },
      { title: "Site", tech: "HTML, CSS, JS, Firebase" },
      { title: "Dashboard", tech: "Python, R, Estatística" },
      { title: "Dashboard", tech: "Python, Análise Estatística" },
      { title: "Automação de Cadastro", tech: "Python, PyAutoGUI, Pandas" }
    ]},
    testimonials: { title: "Depoimentos", reviewBtn: "ENVIAR", alert: "Mamma Mia! Depoimento enviado!" },
    gameOver: { title: "GAME OVER", text: "OBRIGADO POR JOGAR!\nSUA JORNADA FOI LENDÁRIA.", restartBtn: "FIM DE JOGO" }
  },
  en: {
    hero: { title: "ANNA PAULA", subtitle: "PORTFOLIO", text: "Get ready for adventure: I turn Data, UX and Frontend into amazing solutions!", startBtn: "START" },
    about: { 
      title: "Hello, my name is Anna Paula.", 
      text: "My journey started on the way home from the bank. Seeing abandoned animals, I realized I had to change this reality. That’s how Miaucaomigo was born, an app that lets you photograph abandoned animals and mark where they were seen, helping people adopt instead of buying, preventing abuse and saving lives. Back then, I didn’t know how to program. So I started my Computer Engineering studies, took the ENEM, and got a Prouni scholarship for Analysis and Systems Development, complementing my studies with technical courses. Over time, I found my essence in the area and had the courage to change careers, completing a master’s in Data Science to strengthen my professional profile. Today, I use technology to create digital solutions that impact people, animals, and agriculture, combining purpose and innovation to make real change."
    },
    services: { title: "My Services", items: [
      { title: "1", desc: "I turn data into strategic insights for business decisions, dashboards, and financial analysis.", tag: "Data" },
      { title: "2", desc: "Website and app creation, brand identity, and intuitive interfaces that connect people to technology.", tag: "UX / Frontend" },
      { title: "3", desc: "I automate processes, workflows, and systems, saving time and increasing efficiency.", tag: "Automation" }
    ]},
    projects: { title: "My Projects", items: [
      { title: "App", tech: "Flutter, Firebase, Google Maps API" },
      { title: "Website", tech: "HTML, CSS, JS, Firebase" },
      { title: "Dashboard", tech: "Python, R, Statistics" },
      { title: "Dashboard", tech: "Python, Statistical Analysis" },
      { title: "Student Registration Automation", tech: "Python, PyAutoGUI, Pandas" }
    ]},
    testimonials: { title: "Testimonials", reviewBtn: "SEND", alert: "Testimonial sent!" },
    gameOver: { title: "GAME OVER", text: "THANK YOU FOR PLAYING!\nYOUR JOURNEY WAS LEGENDARY.", restartBtn: "END GAME" }
  },
  es: {
    hero: { title: "ANNA PAULA", subtitle: "PORTAFOLIO", text: "¡Prepárate para la aventura: convierto Datos, UX y Frontend en soluciones increíbles!", startBtn: "INICIO" },
    about: { 
      title: "Hola, me llamo Anna Paula.", 
      text: "Mi viaje comenzó de camino a casa desde el banco. Al ver animales abandonados, me di cuenta de que necesitaba cambiar esta realidad. Así nació Miaucaomigo, una aplicación que permite fotografiar animales abandonados y marcar dónde se vieron, ayudando a las personas a adoptar en lugar de comprar, previniendo abusos y salvando vidas. En ese momento, todavía no sabía programar. Comencé mis estudios en Ingeniería en Computación, hice el ENEM y obtuve una beca Prouni para Análisis y Desarrollo de Sistemas, complementando mis estudios con cursos técnicos. Con el tiempo, encontré mi esencia en el área y tuve el valor de cambiar de carrera, realizando una maestría en Ciencias de Datos para fortalecer mi perfil profesional. Hoy utilizo la tecnología para crear soluciones digitales que impactan a personas, animales y la agricultura, uniendo propósito e innovación para generar cambios reales."
    },
    services: { title: "Mis Servicios", items: [
      { title: "1", desc: "Transformo datos en información estratégica para decisiones de negocio, dashboards y análisis financieros.", tag: "Datos" },
      { title: "2", desc: "Creación de sitios web, aplicaciones, identidad de marca e interfaces intuitivas.", tag: "UX / Frontend" },
      { title: "3", desc: "Automatizo procesos, flujos de trabajo y sistemas, ahorrando tiempo y aumentando eficiencia.", tag: "Automatización" }
    ]},
    projects: { title: "Mis Proyectos", items: [
      { title: "Aplicación", tech: "Flutter, Firebase, Google Maps API" },
      { title: "Sitio Web", tech: "HTML, CSS, JS, Firebase" },
      { title: "Dashboard", tech: "Python, R, Estadística" },
      { title: "Dashboard", tech: "Python, Análisis Estadístico" },
      { title: "Automatización de Registro", tech: "Python, PyAutoGUI, Pandas" }
    ]},
    testimonials: { title: "Testimonios", reviewBtn: "ENVIAR", alert: "¡Testimonio enviado!" },
    gameOver: { title: "GAME OVER", text: "¡GRACIAS POR JUGAR!\nTU VIAJE FUE LEGENDARIO.", restartBtn: "FIN DEL JUEGO" }
  },
  fr: {
    hero: { title: "ANNA PAULA", subtitle: "PORTFOLIO", text: "Préparez-vous pour l'aventure : je transforme les données, UX et Frontend en solutions incroyables !", startBtn: "DÉMARRER" },
    about: { 
      title: "Bonjour, je m'appelle Anna Paula.", 
      text: "Mon parcours a commencé sur le chemin du retour de la banque. En voyant des animaux abandonnés, j'ai réalisé que je devais changer cette réalité. C’est ainsi qu’est né Miaucaomigo, une application qui permet de photographier des animaux abandonnés et d’indiquer où ils ont été vus, aidant les gens à adopter plutôt qu’à acheter, prévenant les abus et sauvant des vies. À l’époque, je ne savais pas programmer. J’ai donc commencé mes études en Génie Informatique, passé le ENEM et obtenu une bourse Prouni pour le cours d’Analyse et Développement des Systèmes, complétant mes études par des cours techniques. Avec le temps, j’ai trouvé mon essence dans le domaine et j’ai eu le courage de changer de carrière, réalisant un master en Sciences des Données pour renforcer mon profil professionnel. Aujourd’hui, j’utilise la technologie pour créer des solutions digitales impactant les personnes, les animaux et l’agro, alliant but et innovation pour générer de réels changements."
    },
    services: { title: "Mes Services", items: [
      { title: "1", desc: "Je transforme les données en informations stratégiques pour les décisions commerciales, tableaux de bord et analyses financières.", tag: "Données" },
      { title: "2", desc: "Création de sites web, applications, identité de marque et interfaces intuitives.", tag: "UX / Frontend" },
      { title: "3", desc: "J'automatise les processus, flux de travail et systèmes, économisant du temps et augmentant l'efficacité.", tag: "Automatisation" }
    ]},
    projects: { title: "Mes Projets", items: [
      { title: "Application", tech: "Flutter, Firebase, Google Maps API" },
      { title: "Site Web", tech: "HTML, CSS, JS, Firebase" },
      { title: "Dashboard", tech: "Python, R, Statistiques" },
      { title: "Dashboard", tech: "Python, Analyse Statistique" },
      { title: "Automatisation de l'Inscription", tech: "Python, PyAutoGUI, Pandas" }
    ]},
    testimonials: { title: "Témoignages", reviewBtn: "ENVOYER", alert: "Témoignage envoyé !" },
    gameOver: { title: "GAME OVER", text: "MERCI D'AVOIR JOUÉ !\nVOTRE VOYAGE ÉTAIT LÉGENDAIRE.", restartBtn: "FIN DU JEU" }
  },
  it: {
    hero: { title: "ANNA PAULA", subtitle: "PORTFOLIO", text: "Preparati per l'avventura: trasformo Dati, UX e Frontend in soluzioni incredibili!", startBtn: "INIZIO" },
    about: { 
      title: "Ciao, mi chiamo Anna Paula.", 
      text: "Il mio percorso è iniziato tornando a casa dalla banca. Vedendo animali abbandonati, ho capito che dovevo cambiare questa realtà. È così che è nato Miaucaomigo, un’app che permette di fotografare animali abbandonati e segnare dove sono stati visti, aiutando le persone ad adottare invece di comprare, prevenendo abusi e salvando vite. All’epoca, non sapevo programmare. Ho quindi iniziato gli studi in Ingegneria Informatica, fatto l’ENEM e ottenuto una borsa di studio Prouni per Analisi e Sviluppo dei Sistemi, completando gli studi con corsi tecnici. Col tempo, ho trovato la mia essenza nel settore e ho avuto il coraggio di cambiare carriera, completando un master in Data Science per rafforzare il mio profilo professionale. Oggi uso la tecnologia per creare soluzioni digitali che impattano persone, animali e agro, unendo scopo e innovazione per generare cambiamenti reali."
    },
    services: { title: "I Miei Servizi", items: [
      { title: "1", desc: "Trasformo i dati in informazioni strategiche per decisioni aziendali, dashboard e analisi finanziarie.", tag: "Dati" },
      { title: "2", desc: "Creazione di siti web, applicazioni, identità del marchio e interfacce intuitive.", tag: "UX / Frontend" },
      { title: "3", desc: "Automatizzo processi, flussi di lavoro e sistemi, risparmiando tempo e aumentando l'efficienza.", tag: "Automazione" }
    ]},
    projects: { title: "I Miei Progetti", items: [
      { title: "App", tech: "Flutter, Firebase, Google Maps API" },
      { title: "Sito Web", tech: "HTML, CSS, JS, Firebase" },
      { title: "Dashboard", tech: "Python, R, Statistica" },
      { title: "Dashboard", tech: "Python, Analisi Statistica" },
      { title: "Automazione Registrazione", tech: "Python, PyAutoGUI, Pandas" }
    ]},
    testimonials: { title: "Testimonianze", reviewBtn: "INVIA", alert: "Testimonianza inviata!" },
    gameOver: { title: "GAME OVER", text: "GRAZIE PER AVER GIOCATO!\nIL TUO VIAGGIO È STATO LEGGENDARIO.", restartBtn: "FINE GIOCO" }
  }
};

// ================== FUNÇÃO PARA TROCAR IDIOMA ==================
function changeLang(lang) {
  currentLang = lang;
  const t = translations[lang];

  // Hero
  document.querySelector('.title').textContent = t.hero.title;
  document.querySelector('.subtitle').textContent = t.hero.subtitle;
  document.querySelector('.hero-text').textContent = t.hero.text;
  document.getElementById('startBtn').textContent = t.hero.startBtn;

  // About
  document.querySelector('#about .level-title').textContent = t.about.title;
  document.querySelector('#about .dialog-box p').textContent = t.about.text;

  // Services
  document.querySelector('#services .level-title').textContent = t.services.title;
  const serviceCards = document.querySelectorAll('.power-up-card');
  serviceCards.forEach((card, i) => {
    if (!t.services.items[i]) return;
    card.querySelector('h3').textContent = t.services.items[i].title;
    card.querySelector('.item-desc').textContent = t.services.items[i].desc;
    card.querySelector('.power-tag').textContent = t.services.items[i].tag;
  });

  // Projects
  document.querySelector('#projects .level-title').textContent = t.projects.title;
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach((card, i) => {
    if (!t.projects.items[i]) return;
    card.querySelector('h4').textContent = t.projects.items[i].title;
    card.querySelector('.tech-stack').textContent = t.projects.items[i].tech;
  });

  // Testimonials
  document.querySelector('#testimonials .level-title').textContent = t.testimonials.title;
  document.querySelector('#review-form button').textContent = t.testimonials.reviewBtn;

  // Game Over
  document.querySelector('.game-over-section h2').textContent = t.gameOver.title;
  document.querySelector('.game-over-section p').textContent = t.gameOver.text;
  document.querySelector('.game-over-section .mario-btn').textContent = t.gameOver.restartBtn;
}

// Expondo para o HTML
window.changeLang = changeLang;
