// Global variables
let selectedTheme = 'modern';
let selectedMethod = null;
let currentStep = 1;
let cvData = {
    personal: {},
    experience: [],
    education: [],
    skills: [],
    languages: [],
    photo: null
};

// Chatbot conversation state
let chatState = 'name';
let chatData = {};

// DOM Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const themeCards = document.querySelectorAll('.theme-card');
const methodCards = document.querySelectorAll('.method-card');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendMessage');
const chatMessages = document.getElementById('chatMessages');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('CV Generator loaded!');
    initializeEventListeners();
});

// Initialize all event listeners
function initializeEventListeners() {
    // Tab navigation
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });

    // Theme selection
    themeCards.forEach(card => {
        card.addEventListener('click', () => {
            selectTheme(card.dataset.theme);
        });
    });

    // Method selection
    methodCards.forEach(card => {
        card.addEventListener('click', () => {
            selectMethod(card.dataset.method);
        });
    });

    // Chatbot
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Form navigation
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) prevBtn.style.display = 'none';
}

// Tab switching functionality
function switchTab(tabName) {
    // Update tab buttons
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // Update tab contents
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabName) {
            content.classList.add('active');
        }
    });
}

function nextTab(tabName) {
    switchTab(tabName);
}

// Theme selection
function selectTheme(theme) {
    selectedTheme = theme;
    themeCards.forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.theme === theme) {
            card.classList.add('selected');
        }
    });
}

// Method selection
function selectMethod(method) {
    selectedMethod = method;
    methodCards.forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.method === method) {
            card.classList.add('selected');
        }
    });

    // Show appropriate interface
    const chatbotInterface = document.getElementById('chatbot-interface');
    const formInterface = document.getElementById('form-interface');
    const goToPreviewBtn = document.getElementById('goToPreview');

    chatbotInterface.classList.add('hidden');
    formInterface.classList.add('hidden');

    if (method === 'chatbot') {
        chatbotInterface.classList.remove('hidden');
        goToPreviewBtn.style.display = 'none';
    } else if (method === 'form') {
        formInterface.classList.remove('hidden');
        goToPreviewBtn.style.display = 'none';
    }
}

// Chatbot functionality
function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, 'user');
    chatInput.value = '';

    // Process message and generate bot response
    setTimeout(() => {
        const response = processChatMessage(message);
        addMessage(response, 'bot');
    }, 1000);
}

function addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function processChatMessage(message) {
    let response = '';
    
    switch (chatState) {
        case 'name':
            chatData.fullName = message;
            chatState = 'title';
            response = `Parfait, ${message} ! Quel est votre titre professionnel ou le poste que vous visez ?`;
            break;
        
        case 'title':
            chatData.title = message;
            chatState = 'email';
            response = `Excellent ! Maintenant, quelle est votre adresse email ?`;
            break;
        
        case 'email':
            chatData.email = message;
            chatState = 'phone';
            response = `Merci ! Quel est votre numéro de téléphone ?`;
            break;
        
        case 'phone':
            chatData.phone = message;
            chatState = 'address';
            response = `Parfait ! Quelle est votre adresse ?`;
            break;
        
        case 'address':
            chatData.address = message;
            chatState = 'summary';
            response = `Bien ! Pouvez-vous me donner un résumé de votre profil professionnel en quelques phrases ?`;
            break;
        
        case 'summary':
            chatData.summary = message;
            chatState = 'experience';
            response = `Excellent ! Maintenant, parlez-moi de votre expérience professionnelle la plus récente. Quel était votre poste, dans quelle entreprise, et quelles étaient vos principales responsabilités ?`;
            break;
        
        case 'experience':
            if (!chatData.experience) chatData.experience = [];
            chatData.experience.push(message);
            chatState = 'more_experience';
            response = `Merci ! Avez-vous d'autres expériences professionnelles à ajouter ? (Répondez "oui" pour ajouter une autre expérience ou "non" pour passer à la formation)`;
            break;
        
        case 'more_experience':
            if (message.toLowerCase().includes('oui') || message.toLowerCase().includes('yes')) {
                chatState = 'experience';
                response = `Parfait ! Décrivez-moi votre expérience suivante.`;
            } else {
                chatState = 'education';
                response = `Bien ! Maintenant, parlez-moi de votre formation. Quel est votre diplôme le plus élevé et dans quelle institution l'avez-vous obtenu ?`;
            }
            break;
        
        case 'education':
            if (!chatData.education) chatData.education = [];
            chatData.education.push(message);
            chatState = 'skills';
            response = `Parfait ! Maintenant, quelles sont vos principales compétences ? (techniques, linguistiques, personnelles)`;
            break;
        
        case 'skills':
            chatData.skills = message;
            chatState = 'complete';
            response = `Excellent ! J'ai toutes les informations nécessaires. Votre CV va être généré. Vous pouvez maintenant passer à l'aperçu pour voir le résultat !`;
            
            // Convert chat data to CV format
            convertChatDataToCvData();
            document.getElementById('goToPreview').style.display = 'inline-flex';
            break;
        
        default:
            response = `Merci pour ces informations ! Vous pouvez maintenant voir l'aperçu de votre CV.`;
    }
    
    return response;
}

function convertChatDataToCvData() {
    const nameParts = chatData.fullName.split(' ');
    cvData.personal = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: chatData.email || '',
        phone: chatData.phone || '',
        address: chatData.address || '',
        title: chatData.title || '',
        summary: chatData.summary || ''
    };
    
    cvData.experience = chatData.experience ? chatData.experience.map(exp => ({
        title: 'Poste extrait du chat',
        company: 'Entreprise mentionnée',
        description: exp,
        startDate: '',
        endDate: ''
    })) : [];
    
    cvData.education = chatData.education ? chatData.education.map(edu => ({
        degree: 'Formation mentionnée',
        school: 'Institution',
        description: edu,
        year: ''
    })) : [];
    
    cvData.skills = chatData.skills ? chatData.skills.split(',').map(skill => skill.trim()) : [];
}

// Form functionality
function changeStep(direction) {
    const steps = document.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const goToPreviewBtn = document.getElementById('goToPreview');
    
    // Hide current step
    steps[currentStep - 1].classList.remove('active');
    progressSteps[currentStep - 1].classList.remove('active');
    
    // Update step
    currentStep += direction;
    
    // Show new step
    if (currentStep >= 1 && currentStep <= 4) {
        steps[currentStep - 1].classList.add('active');
        progressSteps[currentStep - 1].classList.add('active');
    }
    
    // Update button visibility
    prevBtn.style.display = currentStep === 1 ? 'none' : 'inline-flex';
    
    if (currentStep === 4) {
        nextBtn.textContent = 'Terminer';
        nextBtn.innerHTML = 'Terminer <i class="fas fa-check"></i>';
    } else {
        nextBtn.innerHTML = 'Suivant <i class="fas fa-arrow-right"></i>';
    }
    
    // If we've completed all steps
    if (currentStep > 4) {
        collectFormData();
        goToPreviewBtn.style.display = 'inline-flex';
        nextBtn.style.display = 'none';
    }
}

function collectFormData() {
    const form = document.getElementById('cvForm');
    const formData = new FormData(form);
    
    // Personal information
    cvData.personal = {
        firstName: formData.get('firstName') || '',
        lastName: formData.get('lastName') || '',
        email: formData.get('email') || '',
        phone: formData.get('phone') || '',
        address: formData.get('address') || '',
        title: formData.get('title') || '',
        summary: formData.get('summary') || ''
    };
    
    // Experience
    cvData.experience = [];
    let expIndex = 0;
    while (formData.get(`jobTitle${expIndex}`) !== null) {
        if (formData.get(`jobTitle${expIndex}`)) {
            cvData.experience.push({
                title: formData.get(`jobTitle${expIndex}`),
                company: formData.get(`company${expIndex}`),
                startDate: formData.get(`startDate${expIndex}`),
                endDate: formData.get(`endDate${expIndex}`),
                description: formData.get(`jobDescription${expIndex}`)
            });
        }
        expIndex++;
    }
    
    // Education
    cvData.education = [];
    let eduIndex = 0;
    while (formData.get(`degree${eduIndex}`) !== null) {
        if (formData.get(`degree${eduIndex}`)) {
            cvData.education.push({
                degree: formData.get(`degree${eduIndex}`),
                school: formData.get(`school${eduIndex}`),
                year: formData.get(`graduationYear${eduIndex}`)
            });
        }
        eduIndex++;
    }
    
    // Skills
    const skillsText = formData.get('skills') || '';
    cvData.skills = skillsText.split(',').map(skill => skill.trim()).filter(skill => skill);
    
    const languagesText = formData.get('languages') || '';
    cvData.languages = languagesText.split(',').map(lang => lang.trim()).filter(lang => lang);
}

// Photo upload functionality
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            cvData.photo = e.target.result;
            const previewImage = document.getElementById('previewImage');
            const photoPreview = document.getElementById('photoPreview');
            
            previewImage.src = e.target.result;
            photoPreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

function removePhoto() {
    cvData.photo = null;
    document.getElementById('photo').value = '';
    document.getElementById('photoPreview').classList.add('hidden');
}

function addExperience() {
    const container = document.getElementById('experienceContainer');
    const index = container.children.length;
    
    const expDiv = document.createElement('div');
    expDiv.className = 'experience-item';
    expDiv.innerHTML = `
        <div class="form-grid">
            <div class="form-group">
                <label for="jobTitle${index}">Poste</label>
                <input type="text" id="jobTitle${index}" name="jobTitle${index}">
            </div>
            <div class="form-group">
                <label for="company${index}">Entreprise</label>
                <input type="text" id="company${index}" name="company${index}">
            </div>
            <div class="form-group">
                <label for="startDate${index}">Date de début</label>
                <input type="date" id="startDate${index}" name="startDate${index}">
            </div>
            <div class="form-group">
                <label for="endDate${index}">Date de fin</label>
                <input type="date" id="endDate${index}" name="endDate${index}">
            </div>
            <div class="form-group full-width">
                <label for="jobDescription${index}">Description</label>
                <textarea id="jobDescription${index}" name="jobDescription${index}" rows="3"></textarea>
            </div>
        </div>
        <button type="button" class="btn-secondary" onclick="removeExperience(this)" style="margin-top: 1rem;">
            <i class="fas fa-trash"></i> Supprimer
        </button>
    `;
    
    container.appendChild(expDiv);
}

function removeExperience(button) {
    button.parentElement.remove();
}

function addEducation() {
    const container = document.getElementById('educationContainer');
    const index = container.children.length;
    
    const eduDiv = document.createElement('div');
    eduDiv.className = 'education-item';
    eduDiv.innerHTML = `
        <div class="form-grid">
            <div class="form-group">
                <label for="degree${index}">Diplôme</label>
                <input type="text" id="degree${index}" name="degree${index}">
            </div>
            <div class="form-group">
                <label for="school${index}">École/Université</label>
                <input type="text" id="school${index}" name="school${index}">
            </div>
            <div class="form-group">
                <label for="graduationYear${index}">Année d'obtention</label>
                <input type="number" id="graduationYear${index}" name="graduationYear${index}" min="1950" max="2030">
            </div>
        </div>
        <button type="button" class="btn-secondary" onclick="removeEducation(this)" style="margin-top: 1rem;">
            <i class="fas fa-trash"></i> Supprimer
        </button>
    `;
    
    container.appendChild(eduDiv);
}

function removeEducation(button) {
    button.parentElement.remove();
}

// CV Generation
function generateCV() {
    const cvPreview = document.getElementById('cvPreview');
    let cvHTML = '';
    
    switch (selectedTheme) {
        case 'modern':
            cvHTML = generateModernCV();
            break;
        case 'classic':
            cvHTML = generateClassicCV();
            break;
        case 'creative':
            cvHTML = generateCreativeCV();
            break;
        case 'minimal':
            cvHTML = generateMinimalCV();
            break;
        case 'executive':
            cvHTML = generateExecutiveCV();
            break;
        case 'tech':
            cvHTML = generateTechCV();
            break;
        case 'elegant':
            cvHTML = generateElegantCV();
            break;
        case 'corporate':
            cvHTML = generateCorporateCV();
            break;
        default:
            cvHTML = generateModernCV();
    }
    
    cvPreview.innerHTML = cvHTML;
}

function generateModernCV() {
    return `
        <div class="cv-modern">
            <div class="cv-header">
                ${cvData.photo ? `
                    <div class="cv-photo-container">
                        <img src="${cvData.photo}" alt="Photo de profil" class="cv-photo">
                    </div>
                ` : ''}
                <div class="cv-name">${cvData.personal.firstName} ${cvData.personal.lastName}</div>
                <div class="cv-title">${cvData.personal.title}</div>
                <div class="cv-contact-info">
                    ${cvData.personal.email ? `<div class="cv-contact-item"><i class="fas fa-envelope"></i> ${cvData.personal.email}</div>` : ''}
                    ${cvData.personal.phone ? `<div class="cv-contact-item"><i class="fas fa-phone"></i> ${cvData.personal.phone}</div>` : ''}
                    ${cvData.personal.address ? `<div class="cv-contact-item"><i class="fas fa-map-marker-alt"></i> ${cvData.personal.address}</div>` : ''}
                </div>
            </div>
            <div class="cv-body">
                ${cvData.personal.summary ? `
                    <div class="cv-section">
                        <h3>Profil Professionnel</h3>
                        <p>${cvData.personal.summary}</p>
                    </div>
                ` : ''}
                
                ${cvData.experience.length > 0 ? `
                    <div class="cv-section">
                        <h3>Expérience Professionnelle</h3>
                        ${cvData.experience.map(exp => `
                            <div class="cv-item">
                                <h4>${exp.title}</h4>
                                <div class="cv-meta">${exp.company} ${exp.startDate && exp.endDate ? `• ${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}` : ''}</div>
                                ${exp.description ? `<p>${exp.description}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${cvData.education.length > 0 ? `
                    <div class="cv-section">
                        <h3>Formation</h3>
                        ${cvData.education.map(edu => `
                            <div class="cv-item">
                                <h4>${edu.degree}</h4>
                                <div class="cv-meta">${edu.school} ${edu.year ? `• ${edu.year}` : ''}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${cvData.skills.length > 0 ? `
                    <div class="cv-section">
                        <h3>Compétences</h3>
                        <div class="cv-skills-list">
                            ${cvData.skills.map(skill => `<span class="cv-skill-tag">${skill}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${cvData.languages.length > 0 ? `
                    <div class="cv-section">
                        <h3>Langues</h3>
                        <p>${cvData.languages.join(', ')}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function generateClassicCV() {
    return `
        <div class="cv-classic">
            <div class="cv-header">
                <div class="cv-name">${cvData.personal.firstName} ${cvData.personal.lastName}</div>
                <div class="cv-title">${cvData.personal.title}</div>
                <div class="cv-contact-info">
                    ${cvData.personal.email ? `<div class="cv-contact-item">${cvData.personal.email}</div>` : ''}
                    ${cvData.personal.phone ? `<div class="cv-contact-item">${cvData.personal.phone}</div>` : ''}
                    ${cvData.personal.address ? `<div class="cv-contact-item">${cvData.personal.address}</div>` : ''}
                </div>
            </div>
            <div class="cv-body">
                ${cvData.personal.summary ? `
                    <div class="cv-section">
                        <h3>Résumé</h3>
                        <p>${cvData.personal.summary}</p>
                    </div>
                ` : ''}
                
                ${cvData.experience.length > 0 ? `
                    <div class="cv-section">
                        <h3>Expérience Professionnelle</h3>
                        ${cvData.experience.map(exp => `
                            <div class="cv-item">
                                <h4>${exp.title} - ${exp.company}</h4>
                                <div class="cv-meta">${exp.startDate && exp.endDate ? `${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}` : ''}</div>
                                ${exp.description ? `<p>${exp.description}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${cvData.education.length > 0 ? `
                    <div class="cv-section">
                        <h3>Formation</h3>
                        ${cvData.education.map(edu => `
                            <div class="cv-item">
                                <h4>${edu.degree}</h4>
                                <div class="cv-meta">${edu.school} ${edu.year ? `(${edu.year})` : ''}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${cvData.skills.length > 0 ? `
                    <div class="cv-section">
                        <h3>Compétences</h3>
                        <p>${cvData.skills.join(' • ')}</p>
                    </div>
                ` : ''}
                
                ${cvData.languages.length > 0 ? `
                    <div class="cv-section">
                        <h3>Langues</h3>
                        <p>${cvData.languages.join(' • ')}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function generateCreativeCV() {
    return `
        <div class="cv-creative">
            <div class="cv-header">
                <div class="cv-name">${cvData.personal.firstName} ${cvData.personal.lastName}</div>
                <div class="cv-title">${cvData.personal.title}</div>
                <div class="cv-contact-info">
                    ${cvData.personal.email ? `<div class="cv-contact-item"><i class="fas fa-envelope"></i> ${cvData.personal.email}</div>` : ''}
                    ${cvData.personal.phone ? `<div class="cv-contact-item"><i class="fas fa-phone"></i> ${cvData.personal.phone}</div>` : ''}
                    ${cvData.personal.address ? `<div class="cv-contact-item"><i class="fas fa-map-marker-alt"></i> ${cvData.personal.address}</div>` : ''}
                </div>
            </div>
            <div class="cv-body">
                ${cvData.personal.summary ? `
                    <div class="cv-section">
                        <h3>À Propos</h3>
                        <p>${cvData.personal.summary}</p>
                    </div>
                ` : ''}
                
                ${cvData.experience.length > 0 ? `
                    <div class="cv-section">
                        <h3>Parcours Professionnel</h3>
                        ${cvData.experience.map(exp => `
                            <div class="cv-item">
                                <h4>${exp.title}</h4>
                                <div class="cv-meta">${exp.company} ${exp.startDate && exp.endDate ? `• ${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}` : ''}</div>
                                ${exp.description ? `<p>${exp.description}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${cvData.education.length > 0 ? `
                    <div class="cv-section">
                        <h3>Éducation</h3>
                        ${cvData.education.map(edu => `
                            <div class="cv-item">
                                <h4>${edu.degree}</h4>
                                <div class="cv-meta">${edu.school} ${edu.year ? `• ${edu.year}` : ''}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${cvData.skills.length > 0 ? `
                    <div class="cv-section">
                        <h3>Expertise</h3>
                        <div class="cv-skills-list">
                            ${cvData.skills.map(skill => `<span class="cv-skill-tag">${skill}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${cvData.languages.length > 0 ? `
                    <div class="cv-section">
                        <h3>Langues</h3>
                        <p>${cvData.languages.join(' • ')}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function generateMinimalCV() {
    return `
        <div class="cv-minimal">
            <div class="cv-header">
                <div class="cv-name">${cvData.personal.firstName} ${cvData.personal.lastName}</div>
                <div class="cv-title">${cvData.personal.title}</div>
                <div class="cv-contact-info">
                    ${cvData.personal.email ? `<div class="cv-contact-item">${cvData.personal.email}</div>` : ''}
                    ${cvData.personal.phone ? `<div class="cv-contact-item">${cvData.personal.phone}</div>` : ''}
                    ${cvData.personal.address ? `<div class="cv-contact-item">${cvData.personal.address}</div>` : ''}
                </div>
            </div>
            <div class="cv-body">
                ${cvData.personal.summary ? `
                    <div class="cv-section">
                        <h3>Profil</h3>
                        <p>${cvData.personal.summary}</p>
                    </div>
                ` : ''}
                
                ${cvData.experience.length > 0 ? `
                    <div class="cv-section">
                        <h3>Expérience</h3>
                        ${cvData.experience.map(exp => `
                            <div class="cv-item">
                                <h4>${exp.title}</h4>
                                <div class="cv-meta">${exp.company} ${exp.startDate && exp.endDate ? `${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}` : ''}</div>
                                ${exp.description ? `<p>${exp.description}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${cvData.education.length > 0 ? `
                    <div class="cv-section">
                        <h3>Formation</h3>
                        ${cvData.education.map(edu => `
                            <div class="cv-item">
                                <h4>${edu.degree}</h4>
                                <div class="cv-meta">${edu.school} ${edu.year ? `${edu.year}` : ''}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${cvData.skills.length > 0 ? `
                    <div class="cv-section">
                        <h3>Compétences</h3>
                        <p>${cvData.skills.join(', ')}</p>
                    </div>
                ` : ''}
                
                ${cvData.languages.length > 0 ? `
                    <div class="cv-section">
                        <h3>Langues</h3>
                        <p>${cvData.languages.join(', ')}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

// When switching to preview tab, generate CV
function nextTab(tabName) {
    if (tabName === 'preview') {
        generateCV();
    }
    switchTab(tabName);
}

// PDF Download functionality
async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const cvElement = document.getElementById('cvPreview');
    
    try {
        // Generate canvas from CV element
        const canvas = await html2canvas(cvElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        // Create PDF
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add image to PDF
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
        
        // Download PDF
        const fileName = `CV_${cvData.personal.firstName}_${cvData.personal.lastName}.pdf`;
        pdf.save(fileName);
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
}

function editCV() {
    switchTab('input');
}
function generateCorporateCV() {
    return `
        <div class="cv-corporate">
            <div class="cv-header">
                ${cvData.photo ? `
                    <div class="cv-photo-container">
                        <img src="${cvData.photo}" alt="Photo de profil" class="cv-photo">
                    </div>
                ` : ''}
                <div class="cv-name">${cvData.personal.firstName} ${cvData.personal.lastName}</div>
                <div class="cv-title">${cvData.personal.title}</div>
                <div class="cv-contact-info">
                    ${cvData.personal.email ? `<div class="cv-contact-item">${cvData.personal.email}</div>` : ''}
                    ${cvData.personal.phone ? `<div class="cv-contact-item">${cvData.personal.phone}</div>` : ''}
                    ${cvData.personal.address ? `<div class="cv-contact-item">${cvData.personal.address}</div>` : ''}
                </div>
            </div>
            <div class="cv-body">
                ${cvData.personal.summary ? `
                    <div class="cv-section">
                        <h3>Résumé Exécutif</h3>
                        <p>${cvData.personal.summary}</p>
                    </div>
                ` : ''}
                
                ${cvData.experience.length > 0 ? `
                    <div class="cv-section">
                        <h3>Expérience Professionnelle</h3>
                        ${cvData.experience.map(exp => `
                            <div class="cv-item">
                                <h4>${exp.title}</h4>
                                <div class="cv-meta">${exp.company} ${exp.startDate && exp.endDate ? `• ${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}` : ''}</div>
                                ${exp.description ? `<p>${exp.description}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${cvData.education.length > 0 ? `
                    <div class="cv-section">
                        <h3>Formation</h3>
                        ${cvData.education.map(edu => `
                            <div class="cv-item">
                                <h4>${edu.degree}</h4>
                                <div class="cv-meta">${edu.school} ${edu.year ? `• ${edu.year}` : ''}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${cvData.skills.length > 0 ? `
                    <div class="cv-section">
                        <h3>Compétences Techniques</h3>
                        <div class="cv-skills-list">
                            ${cvData.skills.map(skill => `<span class="cv-skill-tag">${skill}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${cvData.languages.length > 0 ? `
                    <div class="cv-section">
                        <h3>Langues</h3>
                        <p>${cvData.languages.join(' • ')}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Update existing CV functions to include photo support
function generateClassicCV() {
    return `
        <div class="cv-classic">
            <div class="cv-header">
                ${cvData.photo ? `
                    <div class="cv-photo-container">
                        <img src="${cvData.photo}" alt="Photo de profil" class="cv-photo">
                    </div>
                ` : ''}
                <div class="cv-name">${cvData.personal.firstName} ${cvData.personal.lastName}</div>
                <div class="cv-title">${cvData.personal.title}</div>
                <div class="cv-contact-info">
                    ${cvData.personal.email ? `<div class="cv-contact-item">${cvData.personal.email}</div>` : ''}
                    ${cvData.personal.phone ? `<div class="cv-contact-item">${cvData.personal.phone}</div>` : ''}
                    ${cvData.personal.address ? `<div class="cv-contact-item">${cvData.personal.address}</div>` : ''}
                </div>
            </div>
            <div class="cv-body">
                ${cvData.personal.summary ? `
                    <div class="cv-section">
                        <h3>Résumé</h3>
                        <p>${cvData.personal.summary}</p>
                    </div>
                ` : ''}
                
                ${cvData.experience.length > 0 ? `
                    <div class="cv-section">
                        <h3>Expérience Professionnelle</h3>
                        ${cvData.experience.map(exp => `
                            <div class="cv-item">
                                <h4>${exp.title} - ${exp.company}</h4>
                                <div class="cv-meta">${exp.startDate && exp.endDate ? `${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}` : ''}</div>
                                ${exp.description ? `<p>${exp.description}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${cvData.education.length > 0 ? `
                    <div class="cv-section">
                        <h3>Formation</h3>
                        ${cvData.education.map(edu => `
                            <div class="cv-item">
                                <h4>${edu.degree}</h4>
                                <div class="cv-meta">${edu.school} ${edu.year ? `(${edu.year})` : ''}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${cvData.skills.length > 0 ? `
                    <div class="cv-section">
                        <h3>Compétences</h3>
                        <p>${cvData.skills.join(' • ')}</p>
                    </div>
                ` : ''}
                
                ${cvData.languages.length > 0 ? `
                    <div class="cv-section">
                        <h3>Langues</h3>
                        <p>${cvData.languages.join(' • ')}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function generateCreativeCV() {
    return `
        <div class="cv-creative">
            <div class="cv-header">
                ${cvData.photo ? `
                    <div class="cv-photo-container">
                        <img src="${cvData.photo}" alt="Photo de profil" class="cv-photo">
                    </div>
                ` : ''}
                <div class="cv-name">${cvData.personal.firstName} ${cvData.personal.lastName}</div>
                <div class="cv-title">${cvData.personal.title}</div>
                <div class="cv-contact-info">
                    ${cvData.personal.email ? `<div class="cv-contact-item"><i class="fas fa-envelope"></i> ${cvData.personal.email}</div>` : ''}
                    ${cvData.personal.phone ? `<div class="cv-contact-item"><i class="fas fa-phone"></i> ${cvData.personal.phone}</div>` : ''}
                    ${cvData.personal.address ? `<div class="cv-contact-item"><i class="fas fa-map-marker-alt"></i> ${cvData.personal.address}</div>` : ''}
                </div>
            </div>
            <div class="cv-body">
                ${cvData.personal.summary ? `
                    <div class="cv-section">
                        <h3>À Propos</h3>
                        <p>${cvData.personal.summary}</p>
                    </div>
                ` : ''}
                
                ${cvData.experience.length > 0 ? `
                    <div class="cv-section">
                        <h3>Parcours Professionnel</h3>
                        ${cvData.experience.map(exp => `
                            <div class="cv-item">
                                <h4>${exp.title}</h4>
                                <div class="cv-meta">${exp.company} ${exp.startDate && exp.endDate ? `• ${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}` : ''}</div>
                                ${exp.description ? `<p>${exp.description}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${cvData.education.length > 0 ? `
                    <div class="cv-section">
                        <h3>Éducation</h3>
                        ${cvData.education.map(edu => `
                            <div class="cv-item">
                                <h4>${edu.degree}</h4>
                                <div class="cv-meta">${edu.school} ${edu.year ? `• ${edu.year}` : ''}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${cvData.skills.length > 0 ? `
                    <div class="cv-section">
                        <h3>Expertise</h3>
                        <div class="cv-skills-list">
                            ${cvData.skills.map(skill => `<span class="cv-skill-tag">${skill}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${cvData.languages.length > 0 ? `
                    <div class="cv-section">
                        <h3>Langues</h3>
                        <p>${cvData.languages.join(' • ')}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function generateMinimalCV() {
    return `
        <div class="cv-minimal">
            <div class="cv-header">
                ${cvData.photo ? `
                    <div class="cv-photo-container">
                        <img src="${cvData.photo}" alt="Photo de profil" class="cv-photo">
                    </div>
                ` : ''}
                <div class="cv-name">${cvData.personal.firstName} ${cvData.personal.lastName}</div>
                <div class="cv-title">${cvData.personal.title}</div>
                <div class="cv-contact-info">
                    ${cvData.personal.email ? `<div class="cv-contact-item">${cvData.personal.email}</div>` : ''}
                    ${cvData.personal.phone ? `<div class="cv-contact-item">${cvData.personal.phone}</div>` : ''}
                    ${cvData.personal.address ? `<div class="cv-contact-item">${cvData.personal.address}</div>` : ''}
                </div>
            </div>
            <div class="cv-body">
                ${cvData.personal.summary ? `
                    <div class="cv-section">
                        <h3>Profil</h3>
                        <p>${cvData.personal.summary}</p>
                    </div>
                ` : ''}
                
                ${cvData.experience.length > 0 ? `
                    <div class="cv-section">
                        <h3>Expérience</h3>
                        ${cvData.experience.map(exp => `
                            <div class="cv-item">
                                <h4>${exp.title}</h4>
                                <div class="cv-meta">${exp.company} ${exp.startDate && exp.endDate ? `${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}` : ''}</div>
                                ${exp.description ? `<p>${exp.description}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${cvData.education.length > 0 ? `
                    <div class="cv-section">
                        <h3>Formation</h3>
                        ${cvData.education.map(edu => `
                            <div class="cv-item">
                                <h4>${edu.degree}</h4>
                                <div class="cv-meta">${edu.school} ${edu.year ? `${edu.year}` : ''}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${cvData.skills.length > 0 ? `
                    <div class="cv-section">
                        <h3>Compétences</h3>
                        <p>${cvData.skills.join(', ')}</p>
                    </div>
                ` : ''}
                
                ${cvData.languages.length > 0 ? `
                    <div class="cv-section">
                        <h3>Langues</h3>
                        <p>${cvData.languages.join(', ')}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}
