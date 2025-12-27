const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursor-follower');


document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    
   
    cursor.style.left = x + 'px';
    cursor.style.top = y + 'px';

 
    follower.style.left = x + 'px';
    follower.style.top = y + 'px';
});


const interactiveElements = document.querySelectorAll('a, button');

interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        follower.style.width = '70px'; 
        follower.style.height = '70px';
        follower.style.borderColor = '#ffea00';
        follower.style.backgroundColor = 'rgba(255, 234, 0, 0.03)';
        
        cursor.style.opacity = '0'; 
    });
    
    el.addEventListener('mouseleave', () => {
        follower.style.width = '40px';
        follower.style.height = '40px';
        follower.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        follower.style.backgroundColor = 'transparent';
        cursor.style.opacity = '1';
    });
});