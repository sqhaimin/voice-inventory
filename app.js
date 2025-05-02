class VoiceInventory {
    constructor() {
        // Configuration settings
        this.config = {
            timing: {
                failSoundDelay: 300,    // Delay before fail sound (ms)
                responseDelay: 300,     // Delay after initial sound (ms)
                starsDuration: 3000,    // Duration of stars animation (ms)
                blurDuration: 12000     // Duration of blur animation (ms)
            },
            audio: {
                failSoundVolume: 0.8,   // Volume for fail sound (0-1)
                initialSoundVolume: 1.0  // Volume for initial sound (0-1)
            }
        };

        this.micButton = document.getElementById('micButton');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.transcriptText = document.getElementById('transcriptText');
        this.responseText = document.getElementById('responseText');
        this.queryHistory = document.getElementById('queryHistory');
        
        if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
            this.transcriptText.textContent = 'Speech recognition is not supported in this browser. Please try Chrome.';
            return;
        }
        
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        
        this.synthesis = window.speechSynthesis;
        this.voice = null;
        
        this.audioContext = null;
        this.isListening = false;
        this.setupVoice();
        this.setupEventListeners();
        this.initializeMockData();
    }
    
    initializeMockData() {
        this.mockInventory = {
            'bananas': 0,
            'apples': 75,
            'oranges': 60,
            'lemons': 30,
            'strawberries': 100,
            'mangoes': 45
        };
        
        const now = new Date();
        this.mockSales = {
            hourly: {
                amount: 500,
                transactions: 23,
                timestamp: now.getTime()
            },
            daily: {
                amount: 3000,
                transactions: 162,
                timestamp: now.setHours(0,0,0,0)
            },
            weekly: {
                amount: 23000,
                transactions: 1134,
                timestamp: now.setDate(now.getDate() - now.getDay())
            },
            monthly: {
                amount: 97000,
                transactions: 4872,
                timestamp: now.setDate(1)
            },
            quarterly: {
                amount: 286000,
                transactions: 14268,
                timestamp: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1).getTime()
            },
            yearly: {
                amount: 1158000,
                transactions: 57864,
                timestamp: new Date(now.getFullYear(), 0, 1).getTime()
            }
        };
    }
    
    setupVoice() {
        if (!this.synthesis) return;
        
        this.synthesis.onvoiceschanged = () => {
            const voices = this.synthesis.getVoices();
            this.voice = voices.find(voice => 
                voice.lang.includes('en') && voice.name.includes('Samantha')) ||
                voices.find(voice => 
                    voice.lang.includes('en') && voice.name.includes('Google')) ||
                voices.find(voice => 
                    voice.lang.includes('en')) ||
                voices[0];
        };
    }
    
    setupEventListeners() {
        this.micButton.addEventListener('click', async () => {
            if (!this.audioContext) {
                try {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                } catch (error) {
                    console.error('Audio context initialization error:', error);
                }
            }
            
            if (this.isListening) {
                this.stopListening();
            } else {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    stream.getTracks().forEach(track => track.stop());
                    this.startListening();
                } catch (error) {
                    this.transcriptText.textContent = 'Please allow microphone access to use voice features.';
                    this.statusIndicator.classList.add('error');
                    setTimeout(() => {
                        this.statusIndicator.classList.remove('error');
                    }, 2000);
                }
            }
        });
        
        this.recognition.onstart = () => {
            this.isListening = true;
            this.statusIndicator.classList.add('listening');
            this.transcriptText.textContent = 'Listening...';
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.statusIndicator.classList.remove('listening');
        };
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.transcriptText.textContent = `"${transcript}"`;
            this.processQuery(transcript);
        };
        
        this.recognition.onerror = (event) => {
            this.statusIndicator.classList.add('error');
            this.transcriptText.textContent = 'Error: ' + event.error;
            setTimeout(() => {
                this.statusIndicator.classList.remove('error');
            }, 2000);
        };
    }
    
    startListening() {
        try {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            if (this.synthesis) {
                this.synthesis.cancel();
            }
            
            this.recognition.start();
        } catch (error) {
            this.transcriptText.textContent = 'Error starting speech recognition. Please try again.';
        }
    }
    
    stopListening() {
        try {
            this.recognition.stop();
        } catch (error) {
            console.error('Speech recognition stop error:', error);
        }
    }
    
    playDoodoodoo() {
        if (!this.audioContext) return Promise.resolve();
        
        return new Promise((resolve) => {
            const now = this.audioContext.currentTime;
            
            fetch('bang-140381.mp3')
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    const bangSource = this.audioContext.createBufferSource();
                    const bangGain = this.audioContext.createGain();
                    bangSource.buffer = audioBuffer;
                    
                    const compressor = this.audioContext.createDynamicsCompressor();
                    compressor.threshold.value = -24;
                    compressor.knee.value = 30;
                    compressor.ratio.value = 12;
                    compressor.attack.value = 0.003;
                    compressor.release.value = 0.25;
                    
                    const filter = this.audioContext.createBiquadFilter();
                    filter.type = 'lowshelf';
                    filter.frequency.value = 150;
                    filter.gain.value = 3;
                    
                    bangGain.gain.setValueAtTime(0, now);
                    bangGain.gain.linearRampToValueAtTime(1.0, now + 0.01);
                    bangGain.gain.setValueAtTime(1.0, now + audioBuffer.duration - 0.1);
                    bangGain.gain.linearRampToValueAtTime(0, now + audioBuffer.duration);
                    
                    bangSource.connect(filter);
                    filter.connect(bangGain);
                    bangGain.connect(compressor);
                    compressor.connect(this.audioContext.destination);
                    
                    bangSource.start(now);
                    
                    setTimeout(resolve, audioBuffer.duration * 1000);
                })
                .catch(error => {
                    console.error('Error loading bang sound:', error);
                    resolve();
                });
        });
    }
    
    playFailSound() {
        if (!this.audioContext) return Promise.resolve();
        
        return new Promise((resolve) => {
            const now = this.audioContext.currentTime;
            
            fetch('cartoon-fail-trumpet-278822.mp3')
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    const failSource = this.audioContext.createBufferSource();
                    const failGain = this.audioContext.createGain();
                    failSource.buffer = audioBuffer;
                    
                    // Set volume for fail sound using config
                    failGain.gain.setValueAtTime(0, now);
                    failGain.gain.linearRampToValueAtTime(this.config.audio.failSoundVolume, now + 0.1);
                    failGain.gain.setValueAtTime(this.config.audio.failSoundVolume, now + audioBuffer.duration - 0.2);
                    failGain.gain.linearRampToValueAtTime(0, now + audioBuffer.duration);
                    
                    failSource.connect(failGain);
                    failGain.connect(this.audioContext.destination);
                    
                    failSource.start(now);
                    
                    setTimeout(resolve, audioBuffer.duration * 1000);
                })
                .catch(error => {
                    console.error('Error loading fail sound:', error);
                    resolve();
                });
        });
    }
    
    createStars() {
        const existingContainer = document.querySelector('.stars-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars-container';
        document.body.appendChild(starsContainer);

        const createSingleStar = () => {
            const star = document.createElement('div');
            star.className = 'star';
            
            const pathType = Math.floor(Math.random() * 4) + 1;
            star.classList.add(`path${pathType}`);
            
            const startX = Math.random() * window.innerWidth;
            const endOffset = (Math.random() - 0.5) * 300;
            const endX = startX + endOffset;
            const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 200;
            const curveAngle = (Math.random() - 0.5) * 60;
            
            star.style.setProperty('--start-x', `${startX}px`);
            star.style.setProperty('--end-x', `${endX}px`);
            star.style.setProperty('--mid-x', `${midX}px`);
            star.style.setProperty('--curve-angle', `${curveAngle}deg`);
            
            const size = Math.random() * 4 + 2;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            
            const brightness = Math.random() * 0.5 + 0.5;
            star.style.opacity = brightness;
            
            starsContainer.appendChild(star);
            
            setTimeout(() => star.remove(), 2000);
        };

        for (let i = 0; i < 100; i++) {
            setTimeout(() => createSingleStar(), Math.random() * 1000);
        }

        let starInterval = setInterval(() => {
            for (let i = 0; i < 5; i++) {
                createSingleStar();
            }
        }, 50);

        setTimeout(() => {
            clearInterval(starInterval);
            setTimeout(() => starsContainer.remove(), 2000);
        }, 3000);
    }

    async processQuery(query) {
        try {
            const lowerQuery = query.toLowerCase();
            let response;
            let isOutOfStock = false;
            
            if (this.isSalesQuery(lowerQuery) || this.containsTimePeriod(lowerQuery)) {
                response = this.processSalesQuery(lowerQuery);
            } else {
                const inventoryResponse = await this.querySquareInventory(lowerQuery);
                response = inventoryResponse.text;
                isOutOfStock = inventoryResponse.isOutOfStock;
            }
            
            this.responseText.textContent = response;
            this.responseText.style.opacity = '0';
            this.responseText.classList.remove('dramatic-fade-in');
            
            void this.responseText.offsetWidth;
            
            this.createStars();
            this.responseText.classList.add('dramatic-fade-in');
            
            await this.playDoodoodoo();
            
            await new Promise(resolve => setTimeout(resolve, this.config.timing.responseDelay));
            
            await this.speakResponse(response);
            
            if (isOutOfStock) {
                await new Promise(resolve => setTimeout(resolve, this.config.timing.failSoundDelay));
                await this.playFailSound();
            }
            
            this.addToHistory(query, response);
            
        } catch (error) {
            console.error('Error processing query:', error);
            const errorMessage = 'Sorry, I couldn\'t process your request.';
            this.responseText.textContent = errorMessage;
            this.speakResponse(errorMessage);
        }
    }
    
    async speakResponse(text) {
        return new Promise((resolve) => {
            if (!this.synthesis) {
                resolve();
                return;
            }
            
            this.synthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = this.voice;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            this.responseText.classList.add('speaking');
            
            const isHighRevenue = text.includes('yearly sales revenue') && 
                                text.includes('$') && 
                                parseFloat(text.replace(/[^0-9.-]+/g, '')) > 1000000;
            
            if (isHighRevenue) {
                utterance.onend = () => {
                    this.responseText.classList.remove('speaking');
                    setTimeout(() => {
                        this.playCelebration();
                        resolve();
                    }, 300);
                };
            } else {
                utterance.onend = () => {
                    this.responseText.classList.remove('speaking');
                    resolve();
                };
            }
            
            this.synthesis.speak(utterance);
        });
    }
    
    playCelebration() {
        if (!this.audioContext) return Promise.resolve();
        
        return new Promise((resolve) => {
            const now = this.audioContext.currentTime;
            
            fetch('crowd-cheers-314919.mp3')
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    const crowdSource = this.audioContext.createBufferSource();
                    const crowdGain = this.audioContext.createGain();
                    crowdSource.buffer = audioBuffer;
                    
                    crowdGain.gain.setValueAtTime(0, now);
                    crowdGain.gain.linearRampToValueAtTime(0.8, now + 0.3);
                    crowdGain.gain.setValueAtTime(0.8, now + 3.0);
                    crowdGain.gain.linearRampToValueAtTime(0, now + 4.0);
                    
                    crowdSource.connect(crowdGain);
                    crowdGain.connect(this.audioContext.destination);
                    
                    crowdSource.start();
                    
                    setTimeout(resolve, 4000);
                })
                .catch(error => {
                    console.error('Error loading crowd sound:', error);
                    resolve();
                });
        });
    }
    
    isSalesQuery(query) {
        const salesKeywords = ['sales', 'revenue', 'earn', 'made', 'make', 'making', 'income', 'transactions', 'money'];
        return salesKeywords.some(keyword => query.includes(keyword));
    }
    
    containsTimePeriod(query) {
        const timeKeywords = ['today', 'hour', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'week', 'month', 'quarter', 'year', 'day', 'annual', 'annually'];
        return timeKeywords.some(keyword => query.includes(keyword));
    }
    
    processSalesQuery(query) {
        const timeKeywords = {
            hour: ['hour', 'hourly', 'last hour'],
            day: ['day', 'daily', 'today'],
            week: ['week', 'weekly', 'this week'],
            month: ['month', 'monthly', 'this month'],
            quarter: ['quarter', 'quarterly', 'this quarter'],
            year: ['year', 'yearly', 'annual', 'annually', 'this year']
        };
        
        let timePeriod = null;
        for (const [period, keywords] of Object.entries(timeKeywords)) {
            if (keywords.some(keyword => query.includes(keyword))) {
                timePeriod = period;
                break;
            }
        }
        
        let salesData;
        switch (timePeriod) {
            case 'hour':
                salesData = this.mockSales.hourly;
                break;
            case 'day':
                salesData = this.mockSales.daily;
                break;
            case 'week':
                salesData = this.mockSales.weekly;
                break;
            case 'month':
                salesData = this.mockSales.monthly;
                break;
            case 'quarter':
                salesData = this.mockSales.quarterly;
                break;
            case 'year':
                salesData = this.mockSales.yearly;
                break;
            default:
                return "I'm not sure which time period you're asking about. You can ask about hourly, daily, weekly, monthly, quarterly, or yearly sales.";
        }
        
        const formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(salesData.amount);
        
        return `Your ${timePeriod}ly sales revenue is ${formattedAmount}.`;
    }
    
    async querySquareInventory(query) {
        const words = query.toLowerCase().split(' ');
        for (const item in this.mockInventory) {
            if (words.includes(item)) {
                const quantity = this.mockInventory[item];
                return {
                    text: `You have ${quantity} ${item} in stock.`,
                    isOutOfStock: quantity === 0
                };
            }
        }
        
        return {
            text: "I couldn't find that item in the inventory.",
            isOutOfStock: false
        };
    }
    
    addToHistory(query, response) {
        const li = document.createElement('li');
        const time = new Date().toLocaleTimeString();
        li.innerHTML = `
            <span>
                <strong>${query}</strong>
                <br>
                <small>${response}</small>
            </span>
            <small>${time}</small>
        `;
        
        if (this.queryHistory.firstChild) {
            this.queryHistory.insertBefore(li, this.queryHistory.firstChild);
        } else {
            this.queryHistory.appendChild(li);
        }
        
        while (this.queryHistory.children.length > 10) {
            this.queryHistory.removeChild(this.queryHistory.lastChild);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.voiceInventory = new VoiceInventory();
});