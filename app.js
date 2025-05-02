class VoiceInventory {
    constructor() {
        this.micButton = document.getElementById('micButton');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.transcriptText = document.getElementById('transcriptText');
        this.responseText = document.getElementById('responseText');
        this.queryHistory = document.getElementById('queryHistory');
        
        // Initialize speech recognition
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        
        // Initialize speech synthesis
        this.synthesis = window.speechSynthesis;
        this.voice = null;
        
        // Initialize audio context for sound effects
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        this.isListening = false;
        this.setupVoice();
        this.setupEventListeners();
        
        // Initialize mock data
        this.initializeMockData();
    }
    
    initializeMockData() {
        // Mock inventory data
        this.mockInventory = {
            'bananas': 50,
            'apples': 75,
            'oranges': 60,
            'lemons': 30,
            'strawberries': 100,
            'mangoes': 45
        };
        
        // Mock sales data with rounded figures
        const now = new Date();
        this.mockSales = {
            hourly: {
                amount: 500,         // Rounded from 458.75
                transactions: 23,
                timestamp: now.getTime()
            },
            daily: {
                amount: 3000,        // Rounded from 3245.90
                transactions: 162,
                timestamp: now.setHours(0,0,0,0)
            },
            weekly: {
                amount: 23000,       // Rounded from 22678.50
                transactions: 1134,
                timestamp: now.setDate(now.getDate() - now.getDay())
            },
            monthly: {
                amount: 97000,       // Rounded from 97456.80
                transactions: 4872,
                timestamp: now.setDate(1)
            },
            quarterly: {
                amount: 286000,      // Rounded from 285789.50
                transactions: 14268,
                timestamp: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1).getTime()
            },
            yearly: {
                amount: 1158000,     // Rounded from 1157892.75
                transactions: 57864,
                timestamp: new Date(now.getFullYear(), 0, 1).getTime()
            }
        };
    }
    
    setupVoice() {
        // Wait for voices to be loaded
        window.speechSynthesis.onvoiceschanged = () => {
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
        this.micButton.addEventListener('click', () => {
            if (this.isListening) {
                this.stopListening();
            } else {
                this.startListening();
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
            console.error('Speech recognition error:', event.error);
            this.statusIndicator.classList.add('error');
            this.transcriptText.textContent = 'Error: ' + event.error;
            setTimeout(() => {
                this.statusIndicator.classList.remove('error');
            }, 2000);
        };
    }
    
    startListening() {
        try {
            // Resume audio context if it's suspended
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            this.synthesis.cancel();
            this.recognition.start();
        } catch (error) {
            console.error('Speech recognition start error:', error);
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
        return new Promise((resolve) => {
            const now = this.audioContext.currentTime;
            
            // Load and play the bang sound
            fetch('bang-140381.mp3')
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    const bangSource = this.audioContext.createBufferSource();
                    const bangGain = this.audioContext.createGain();
                    bangSource.buffer = audioBuffer;
                    
                    // Create a compressor to handle the loud sound safely
                    const compressor = this.audioContext.createDynamicsCompressor();
                    compressor.threshold.value = -24;
                    compressor.knee.value = 30;
                    compressor.ratio.value = 12;
                    compressor.attack.value = 0.003;
                    compressor.release.value = 0.25;
                    
                    // Create a filter to enhance the bang
                    const filter = this.audioContext.createBiquadFilter();
                    filter.type = 'lowshelf';
                    filter.frequency.value = 150;
                    filter.gain.value = 3;
                    
                    // Set volume for maximum impact while preventing distortion
                    bangGain.gain.setValueAtTime(0, now);
                    bangGain.gain.linearRampToValueAtTime(1.0, now + 0.01);  // Quick fade in
                    bangGain.gain.setValueAtTime(1.0, now + audioBuffer.duration - 0.1); // Hold full volume
                    bangGain.gain.linearRampToValueAtTime(0, now + audioBuffer.duration); // Quick fade out
                    
                    // Connect the audio processing chain
                    bangSource.connect(filter);
                    filter.connect(bangGain);
                    bangGain.connect(compressor);
                    compressor.connect(this.audioContext.destination);
                    
                    // Play the bang sound
                    bangSource.start(now);
                    
                    // Resolve after the full sound has played
                    setTimeout(resolve, audioBuffer.duration * 1000);
                })
                .catch(error => {
                    console.error('Error loading bang sound:', error);
                    resolve(); // Resolve even if there's an error
                });
        });
    }
    
    createStars() {
        // Clear any existing stars container
        const existingContainer = document.querySelector('.stars-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Create new stars container
        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars-container';
        document.body.appendChild(starsContainer);

        // Function to create a single star
        const createSingleStar = () => {
            const star = document.createElement('div');
            star.className = 'star';
            
            // Random path type
            const pathType = Math.floor(Math.random() * 4) + 1;
            star.classList.add(`path${pathType}`);
            
            // Random starting and ending positions
            const startX = Math.random() * window.innerWidth;
            const endOffset = (Math.random() - 0.5) * 300; // Random offset for end position
            const endX = startX + endOffset;
            const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 200; // Middle point for curved path
            const curveAngle = (Math.random() - 0.5) * 60; // Random curve angle
            
            star.style.setProperty('--start-x', `${startX}px`);
            star.style.setProperty('--end-x', `${endX}px`);
            star.style.setProperty('--mid-x', `${midX}px`);
            star.style.setProperty('--curve-angle', `${curveAngle}deg`);
            
            // Random size (bigger range)
            const size = Math.random() * 4 + 2; // 2-6px
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            
            // Random brightness variation
            const brightness = Math.random() * 0.5 + 0.5; // 50-100% brightness
            star.style.opacity = brightness;
            
            starsContainer.appendChild(star);
            
            // Remove star after animation
            setTimeout(() => star.remove(), 2000);
        };

        // Create initial batch of stars
        for (let i = 0; i < 100; i++) {
            setTimeout(() => createSingleStar(), Math.random() * 1000);
        }

        // Continue creating stars during the audio
        let starInterval = setInterval(() => {
            for (let i = 0; i < 5; i++) { // Create 5 stars every interval
                createSingleStar();
            }
        }, 50); // Create new stars every 50ms (more frequent)

        // Stop creating stars and cleanup after audio duration
        setTimeout(() => {
            clearInterval(starInterval);
            setTimeout(() => starsContainer.remove(), 2000);
        }, 3000); // Adjust this to match your audio duration
    }

    async processQuery(query) {
        try {
            const lowerQuery = query.toLowerCase();
            let response;
            
            // Check if it's a sales query by looking for sales keywords or time periods
            if (this.isSalesQuery(lowerQuery) || this.containsTimePeriod(lowerQuery)) {
                response = this.processSalesQuery(lowerQuery);
            } else {
                // If not a sales query, check inventory
                response = await this.querySquareInventory(lowerQuery);
            }
            
            // Set the response text but keep it invisible and blurred
            this.responseText.textContent = response;
            this.responseText.style.opacity = '0';
            this.responseText.classList.remove('dramatic-fade-in');
            
            // Force a reflow to ensure animation restarts
            void this.responseText.offsetWidth;
            
            // Start stars and trigger dramatic fade-in
            this.createStars();
            this.responseText.classList.add('dramatic-fade-in');
            
            // Play the intro audio (12 seconds)
            await this.playDoodoodoo();
            
            // Add a small pause after intro audio (0.5 seconds)
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Start speaking the response
            await this.speakResponse(response);
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
            this.synthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = this.voice;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            this.responseText.classList.add('speaking');
            
            // Check if this is a yearly revenue response over $1 million
            const isHighRevenue = text.includes('yearly sales revenue') && 
                                text.includes('$') && 
                                parseFloat(text.replace(/[^0-9.-]+/g, '')) > 1000000;
            
            // If it's high revenue, play celebration after speech with a small delay
            if (isHighRevenue) {
                utterance.onend = () => {
                    this.responseText.classList.remove('speaking');
                    setTimeout(() => {
                        this.playCelebration();
                        resolve();
                    }, 300); // 0.3 second delay before celebration
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
    }
    
    playCelebration() {
        return new Promise((resolve) => {
            const now = this.audioContext.currentTime;
            
            // Load and play crowd cheering sound
            fetch('crowd-cheers-314919.mp3')
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    const crowdSource = this.audioContext.createBufferSource();
                    const crowdGain = this.audioContext.createGain();
                    crowdSource.buffer = audioBuffer;
                    
                    // Set volume for crowd sound
                    crowdGain.gain.setValueAtTime(0, now);
                    crowdGain.gain.linearRampToValueAtTime(0.8, now + 0.3); // Quick fade in
                    crowdGain.gain.setValueAtTime(0.8, now + 3.0);          // Hold volume
                    crowdGain.gain.linearRampToValueAtTime(0, now + 4.0);   // Fade out
                    
                    crowdSource.connect(crowdGain);
                    crowdGain.connect(this.audioContext.destination);
                    
                    // Play the crowd sound
                    crowdSource.start();
                    
                    // Resolve after the sound has played
                    setTimeout(resolve, 4000); // 4 seconds total duration
                })
                .catch(error => {
                    console.error('Error loading crowd sound:', error);
                    resolve(); // Resolve even if there's an error
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
        // Time period keywords
        const timeKeywords = {
            hour: ['hour', 'hourly', 'last hour'],
            day: ['day', 'daily', 'today'],
            week: ['week', 'weekly', 'this week'],
            month: ['month', 'monthly', 'this month'],
            quarter: ['quarter', 'quarterly', 'this quarter'],
            year: ['year', 'yearly', 'annual', 'annually', 'this year']
        };
        
        // Determine time period from query
        let timePeriod = null;
        for (const [period, keywords] of Object.entries(timeKeywords)) {
            if (keywords.some(keyword => query.includes(keyword))) {
                timePeriod = period;
                break;
            }
        }
        
        // Get corresponding sales data
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
        
        // Format the response
        const formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(salesData.amount);
        
        return `Your ${timePeriod}ly sales revenue is ${formattedAmount}.`;
    }
    
    async querySquareInventory(query) {
        // Simple natural language processing for inventory queries
        const words = query.toLowerCase().split(' ');
        for (const item in this.mockInventory) {
            if (words.includes(item)) {
                return `You have ${this.mockInventory[item]} ${item} in stock.`;
            }
        }
        
        return "I couldn't find that item in the inventory.";
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

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const voiceInventory = new VoiceInventory();
});