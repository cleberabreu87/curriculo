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