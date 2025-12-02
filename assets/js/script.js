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