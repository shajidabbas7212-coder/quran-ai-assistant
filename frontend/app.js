const API_URL = 'http://localhost:5000/api';

const questionInput = document.getElementById('questionInput');
const sendBtn = document.getElementById('sendBtn');
const chatBox = document.getElementById('chatBox');
const languageRadios = document.querySelectorAll('input[name="language"]');

let currentLanguage = 'urdu';
let conversationHistory = [];

// Event Listeners
sendBtn.addEventListener('click', sendQuestion);
questionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendQuestion();
    }
});

languageRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentLanguage = e.target.value;
    });
});

async function sendQuestion() {
    const question = questionInput.value.trim();
    
    if (!question) {
        alert(currentLanguage === 'urdu' ? 'براہِ کرم سوال لکھیں' : 'Please write a question');
        return;
    }
    
    // Add user message
    addMessage(question, 'user');
    conversationHistory.push({ role: 'user', message: question });
    questionInput.value = '';
    
    // Show loading
    const loadingMsg = addMessage(
        currentLanguage === 'urdu' ? 'جواب تلاش ہو رہا ہے...' : 'Finding answer...',
        'ai'
    );
    
    try {
        const response = await fetch(`${API_URL}/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: question,
                language: currentLanguage
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
            loadingMsg.remove();
            
            // Add AI response
            addMessage(data.answer, 'ai');
            conversationHistory.push({ role: 'ai', message: data.answer });
            
            // Add verses with styling
            if (data.verses && data.verses.length > 0) {
                data.verses.forEach((verse) => {
                    const verseText = `${verse.verse_id}: ${verse.text_urdu}`;
                    const verseMsg = addMessage(verseText, 'ai');
                    verseMsg.classList.add('verse-message');
                });
            }
        } else {
            loadingMsg.textContent = data.error || (currentLanguage === 'urdu' ? 'خرابی آئی' : 'Error occurred');
        }
    } catch (error) {
        loadingMsg.textContent = currentLanguage === 'urdu' 
            ? 'سرور سے رابطہ نہیں ہو سکا' 
            : 'Could not connect to server';
        console.error('Error:', error);
    }
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    // Add text with proper formatting
    const textContent = document.createElement('div');
    textContent.textContent = text;
    textContent.style.whiteSpace = 'pre-wrap';
    textContent.style.wordWrap = 'break-word';
    
    messageDiv.appendChild(textContent);
    
    // Add download button for AI responses
    if (sender === 'ai') {
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'message-download-btn';
        downloadBtn.innerHTML = '📥 ڈاؤن لوڈ | Download';
        downloadBtn.onclick = () => downloadMessage(text);
        messageDiv.appendChild(downloadBtn);
    }
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    return messageDiv;
}

function downloadMessage(text) {
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `mehdi-hashmi-answer-${new Date().getTime()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Download all conversation
function downloadConversation() {
    let content = 'مہدی ہاشمیؑ AI - گفتگو کی تاریخ\n';
    content += 'Mehdi Hashmi AI - Conversation History\n';
    content += '='.repeat(50) + '\n\n';
    
    conversationHistory.forEach((item, index) => {
        content += `${index + 1}. ${item.role.toUpperCase()}:\n`;
        content += item.message + '\n\n';
        content += '-'.repeat(50) + '\n\n';
    });
    
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `mehdi-hashmi-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Add download all button to page
window.addEventListener('load', () => {
    console.log('🕌 مہدی ہاشمیؑ AI لوڈ ہو گیا');
});