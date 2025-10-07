document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('#sidebar nav a');
    const sections = document.querySelectorAll('main section');
    
    
    const offset = 100;
    
    function removeActiveClasses() {
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
    }
    
    function addActiveClass(targetId) {
        const targetLink = document.querySelector(`#sidebar nav a[href="#${targetId}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }
    }
    
    function highlightCurrentSection() {
        let currentSection = '';
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionHeight = rect.height;
            
            if (sectionTop <= offset && sectionTop + sectionHeight > offset) {
                currentSection = section.id;
            }
        });
        
        if (!currentSection) {
            let closestSection = '';
            let closestDistance = Infinity;
            
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const distance = Math.abs(rect.top);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestSection = section.id;
                }
            });
            
            currentSection = closestSection;
        }
        
        if (currentSection) {
            removeActiveClasses();
            addActiveClass(currentSection);
        }
    }
    
    function smoothScrollToSection(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            const targetPosition = targetSection.offsetTop - 50;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            removeActiveClasses();
            addActiveClass(targetId);
        }
    }
    
    let isScrolling = false;
    window.addEventListener('scroll', function() {
        if (!isScrolling) {
            window.requestAnimationFrame(function() {
                highlightCurrentSection();
                isScrolling = false;
            });
            isScrolling = true;
        }
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', smoothScrollToSection);
    });
    
    highlightCurrentSection();
    
    if (window.location.hash) {
        setTimeout(() => {
            const targetId = window.location.hash.substring(1);
            addActiveClass(targetId);
        }, 100);
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('#sidebar nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            this.appendChild(ripple);
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});