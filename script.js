// Background animation
const backgroundAnimation = document.getElementById('backgroundAnimation');
const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e'];

function createBubble() {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    const size = Math.random() * 100 + 50;
    bubble.style.width = ${size}px;
    bubble.style.height = ${size}px;
    bubble.style.background = colors[Math.floor(Math.random() * colors.length)];
    bubble.style.left = ${Math.random() * 100}vw;
    bubble.style.top = ${Math.random() * 100}vh;
    bubble.style.animationDuration = ${Math.random() * 10 + 10}s;
    bubble.style.animationDelay = ${Math.random() * 5}s;
    backgroundAnimation.appendChild(bubble);

    setTimeout(() => {
        bubble.remove();
        createBubble();
    }, 15000);
}

for (let i = 0; i < 20; i++) {
    createBubble();
}

// Typing animation for title
const mainTitle = document.getElementById('mainTitle');
const titles = ["FinalRAGConverterPlease", "Try Now for Free"];
let titleIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeWriter() {
    const currentTitle = titles[titleIndex];
    if (isDeleting) {
        mainTitle.textContent = currentTitle.substring(0, charIndex - 1);
        charIndex--;
    } else {
        mainTitle.textContent = currentTitle.substring(0, charIndex + 1);
        charIndex++;
    }

    if (!isDeleting && charIndex === currentTitle.length) {
        isDeleting = true;
        setTimeout(typeWriter, 1000);
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        titleIndex = (titleIndex + 1) % titles.length;
        setTimeout(typeWriter, 500);
    } else {
        setTimeout(typeWriter, isDeleting ? 50 : 100);
    }
}

typeWriter();

// Form toggle animation
const authContainer = document.getElementById('authContainer');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const converterBox = document.getElementById('converterBox');

showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    gsap.to(loginForm, { rotationY: -180, duration: 0.6, ease: "back.inOut(1.7)" });
    gsap.to(registerForm, { rotationY: 0, duration: 0.6, ease: "back.inOut(1.7)" });
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    gsap.to(registerForm, { rotationY: 180, duration: 0.6, ease: "back.inOut(1.7)" });
    gsap.to(loginForm, { rotationY: 0, duration: 0.6, ease: "back.inOut(1.7)" });
});

// Form float animation
function startFloating() {
    gsap.to(authContainer, {
        y: 10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
    });
}

function stopFloating() {
    gsap.killTweensOf(authContainer);
    gsap.to(authContainer, { y: 0, duration: 0.5 });
}

startFloating();

authContainer.addEventListener('mouseenter', stopFloating);
authContainer.addEventListener('mouseleave', startFloating);

// API URL
const API_URL = 'https://api.finalragconverterplease.com'; // Update this with your actual API URL

// Login functionality
document.getElementById('loginBtn').addEventListener('click', async () => {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(${API_URL}/token, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            showSuccessMessage('Login successful!');
            showConverterInterface();
        } else {
            showErrorMessage('Invalid username or password');
        }
    } catch (error) {
        showErrorMessage('An error occurred. Please try again.');
    }
});

// Registration functionality
document.getElementById('registerBtn').addEventListener('click', async () => {
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (password !== confirmPassword) {
        showErrorMessage('Passwords do not match');
        return;
    }

    try {
        const response = await fetch(${API_URL}/users, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        if (response.ok) {
            showSuccessMessage('Registration successful! Please log in.');
            showLogin.click();
        } else {
            const errorData = await response.json();
            showErrorMessage(errorData.detail || 'Registration failed');
        }
    } catch (error) {
        showErrorMessage('An error occurred. Please try again.');
    }
});

function showErrorMessage(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    gsap.from(errorMessage, { y: -20, opacity: 0, duration: 0.5 });
    setTimeout(() => {
        gsap.to(errorMessage, { opacity: 0, duration: 0.5, onComplete: () => errorMessage.style.display = 'none' });
    }, 3000);
}

function showSuccessMessage(message) {
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    gsap.from(successMessage, { y: -20, opacity: 0, duration: 0.5 });
    setTimeout(() => {
        gsap.to(successMessage, { opacity: 0, duration: 0.5, onComplete: () => successMessage.style.display = 'none' });
    }, 3000);
}

function showConverterInterface() {
    authContainer.style.display = 'none';
    converterBox.style.display = 'block';
    gsap.from(converterBox, { opacity: 0, y: 50, duration: 0.5 });
}

// File conversion functionality
const fileInput = document.getElementById('file-input');
const dragDropArea = document.getElementById('drag-drop-area');
const progressBar = document.getElementById('progress');
const progressText = document.querySelector('.progress-text');
const convertingText = document.querySelector('.converting-text');
const successfulConversions = document.getElementById('successful-conversions');
const failedConversions = document.getElementById('failed-conversions');

fileInput.addEventListener('change', handleFiles);
dragDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragDropArea.classList.add('dragover');
});
dragDropArea.addEventListener('dragleave', () => {
    dragDropArea.classList.remove('dragover');
});
dragDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDropArea.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

async function handleFiles(files) {
    for (const file of files) {
        try {
            await convertFile(file);
            successfulConversions.textContent = parseInt(successfulConversions.textContent) + 1;
        } catch (error) {
            failedConversions.textContent = parseInt(failedConversions.textContent) + 1;
            console.error('Conversion failed:', error);
        }
    }
}

async function convertFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    convertingText.style.display = 'block';
    progressBar.style.width = '0%';
    progressText.textContent = '0%';

    try {
        const response = await fetch(${API_URL}/convert, {
            method: 'POST',
            headers: {
                'Authorization': Bearer ,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Conversion failed');
        }

        const reader = response.body.getReader();
        const contentLength = +response.headers.get('Content-Length');
        let receivedLength = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            receivedLength += value.length;
            const percentage = (receivedLength / contentLength * 100).toFixed(2);
            progressBar.style.width = ${percentage}%;
            progressText.textContent = ${percentage}%;
        }

        const result = await response.json();
        offerDownload(result, file.name);
    } finally {
        convertingText.style.display = 'none';
    }
}

function offerDownload(data, originalFilename) {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = converted_.json;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        showConverterInterface();
    }
});

// Upgrade to Pro functionality
document.getElementById('upgradePro').addEventListener('click', async () => {
    try {
        const response = await fetch(${API_URL}/upgrade, {
            method: 'POST',
            headers: {
                'Authorization': Bearer ,
                'Content-Type': 'application/json'
            },
        });

        if (response.ok) {
            showSuccessMessage('Upgraded to Pro successfully!');
            // You might want to update the UI to reflect the new Pro status
        } else {
            const errorData = await response.json();
            showErrorMessage(errorData.detail || 'Upgrade failed');
        }
    } catch (error) {
        showErrorMessage('An error occurred. Please try again.');
    }
});
