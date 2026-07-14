const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");


const observerOptions = {
    root: null, 
    rootMargin: "0px",
    threshold: 0.5, 
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");

            navLinks.forEach((link) => link.classList.remove("active"));

            const activeLink = document.querySelector(`nav a[href="#${id}"]`);
            if (activeLink) {
                activeLink.classList.add("active");
            }
        }
    });
}, observerOptions);

sections.forEach((section) => {
    observer.observe(section);
});

const menuBtn = document.getElementById("menu-btn");
const nav = document.querySelector("nav");

menuBtn.addEventListener("click", () => {
    nav.classList.toggle("open");
});

navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
        nav.classList.remove("open");
        
        // Custom smooth scroll implementation
        const targetId = link.getAttribute("href");
        if (targetId.startsWith("#")) {
            e.preventDefault();
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                const navHeight = window.innerWidth <= 900 ? 90 : 0;
                const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth"
                });
            }
        }
    });
});

// Lógica do Carrossel de Projetos
document.addEventListener("DOMContentLoaded", () => {
    const track = document.getElementById("project-track");
    const prevBtn = document.getElementById("prev-project-btn");
    const nextBtn = document.getElementById("next-project-btn");
    const dots = document.querySelectorAll("#carousel-dots-container .dot");

    if (!track || !prevBtn || !nextBtn) return;

    let autoPlayInterval;
    const AUTO_PLAY_TIME = 4000; // Rotaciona a cada 4 segundos
    const cloneCount = 3; // Número de cards para clonar em cada lado (para desktop)

    // Clonagem dinâmica dos cartões para rolagem contínua infinita
    const originalCards = Array.from(track.querySelectorAll(".project-card"));
    const numCards = originalCards.length;

    if (numCards === 0) return;

    // Clonar os primeiros 3 cards e adicionar ao final
    for (let i = 0; i < cloneCount; i++) {
        const clone = originalCards[i].cloneNode(true);
        clone.classList.add("cloned");
        track.appendChild(clone);
    }

    // Clonar os últimos 3 cards e adicionar ao início
    for (let i = numCards - 1; i >= numCards - cloneCount; i--) {
        const clone = originalCards[i].cloneNode(true);
        clone.classList.add("cloned");
        track.insertBefore(clone, track.firstChild);
    }

    // Função para obter o deslocamento de scroll (largura do card + gap)
    const getScrollOffset = () => {
        const card = track.querySelector(".project-card");
        if (!card) return 0;
        const style = window.getComputedStyle(track);
        const gap = parseInt(style.columnGap || style.gap || "30", 10);
        return card.getBoundingClientRect().width + gap;
    };

    // Define o scroll inicial para o primeiro card original (pulando os clones do início)
    const initScrollPosition = () => {
        const offset = getScrollOffset();
        track.scrollLeft = cloneCount * offset;
    };

    // Navegar para o próximo slide
    const scrollNext = () => {
        const offset = getScrollOffset();
        track.scrollBy({
            left: offset,
            behavior: "smooth"
        });
    };

    // Navegar para o slide anterior
    const scrollPrev = () => {
        const offset = getScrollOffset();
        track.scrollBy({
            left: -offset,
            behavior: "smooth"
        });
    };

    // Gerenciamento do Auto-play
    const startAutoPlay = () => {
        stopAutoPlay();
        autoPlayInterval = setInterval(scrollNext, AUTO_PLAY_TIME);
    };

    const stopAutoPlay = () => {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
    };

    // Clique nas setas de navegação
    nextBtn.addEventListener("click", () => {
        stopAutoPlay();
        scrollNext();
        startAutoPlay();
    });

    prevBtn.addEventListener("click", () => {
        stopAutoPlay();
        scrollPrev();
        startAutoPlay();
    });

    // Clique nos dots (bolinhas indicadoras)
    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            stopAutoPlay();
            const offset = getScrollOffset();
            // O primeiro card original está em index = cloneCount
            track.scrollTo({
                left: (cloneCount + index) * offset,
                behavior: "smooth"
            });
            startAutoPlay();
        });
    });

    // Sincronização em tempo real das bolinhas (dots)
    const syncDots = () => {
        const offset = getScrollOffset();
        if (offset <= 0) return;

        // O scrollLeft correspondente aos originais vai de (cloneCount * offset) até ((cloneCount + numCards - 1) * offset)
        let activeIndex = Math.round(track.scrollLeft / offset) - cloneCount;
        
        // Normaliza o índice caso esteja nas zonas clonadas
        if (activeIndex < 0) {
            activeIndex = numCards + activeIndex;
        } else if (activeIndex >= numCards) {
            activeIndex = activeIndex % numCards;
        }

        dots.forEach((dot, index) => {
            if (index === activeIndex) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    };

    // Pulo silencioso (instantâneo) quando cruza os limites das áreas clonadas
    const checkBoundary = () => {
        const offset = getScrollOffset();
        if (offset <= 0) return;

        const currentScroll = track.scrollLeft;
        const rightBoundary = (cloneCount + numCards) * offset;
        const leftBoundary = (cloneCount - 1) * offset;

        // Se passou do último card original e pousou no primeiro clone do final
        if (currentScroll >= rightBoundary - 10) {
            track.style.scrollSnapType = "none";
            track.scrollLeft = currentScroll - (numCards * offset);
            track.offsetHeight; // Força reflow do layout
            track.style.scrollSnapType = "x mandatory";
        }
        // Se passou do primeiro card original e pousou no último clone do início
        else if (currentScroll <= leftBoundary + 10) {
            track.style.scrollSnapType = "none";
            track.scrollLeft = currentScroll + (numCards * offset);
            track.offsetHeight; // Força reflow do layout
            track.style.scrollSnapType = "x mandatory";
        }
    };

    // Eventos de rolagem
    let scrollTimeout;
    track.addEventListener("scroll", () => {
        // Atualiza as bolinhas em tempo real
        syncDots();

        // Aguarda a rolagem (incluindo animação de snap) terminar para fazer o pulo invisível
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(checkBoundary, 100); // 100ms garante que o snap suave terminou
    });

    // Pausar auto-play com hover do mouse ou toque
    const carouselContainer = document.querySelector(".carousel-container");
    if (carouselContainer) {
        carouselContainer.addEventListener("mouseenter", stopAutoPlay);
        carouselContainer.addEventListener("mouseleave", startAutoPlay);
    }
    track.addEventListener("touchstart", stopAutoPlay, { passive: true });
    track.addEventListener("touchend", startAutoPlay, { passive: true });

    // Ajustar posicionamento no redimensionamento da janela
    window.addEventListener("resize", () => {
        const offset = getScrollOffset();
        const currentIndex = Math.round(track.scrollLeft / offset);
        track.scrollLeft = currentIndex * offset;
    });

    // Inicialização da posição e auto-play
    const init = () => {
        initScrollPosition();
        startAutoPlay();
    };

    if (document.readyState === "complete") {
        setTimeout(init, 100);
    } else {
        window.addEventListener("load", init);
    }
});