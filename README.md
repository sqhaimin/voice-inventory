# Voice Inventory Assistant

A voice-controlled inventory and sales dashboard that responds to natural language queries with audio and visual feedback.

## Live Demo

Try it out here: [Voice Inventory Assistant](https://sqhaimin.github.io/voice-inventory/)

## Features

- 🎙️ Voice Recognition: Ask questions naturally
- 🔊 Sound Effects: Custom audio feedback
- 💰 Sales Tracking: Query revenue across different time periods
- 📦 Inventory Management: Check stock levels
- 🎉 Celebration Effects: Special effects for high revenue reports

## Example Queries

### Inventory
- "How many bananas do we have?"
- "Check apple inventory"
- "How many mangoes are in stock?"

### Sales
- "What's our hourly revenue?"
- "How much did we make today?"
- "Show me monthly sales"
- "What's our yearly revenue?"

## Setup

1. Clone the repository
```bash
git clone [repository-url]
```

2. Navigate to the project directory
```bash
cd voice-inventory
```

3. Start a local server (using Python)
```bash
python3 -m http.server 8000
```

4. Open in your browser
```
http://localhost:8000
```

## Requirements

- Modern web browser (Chrome recommended for best speech recognition)
- Microphone access
- Python 3 (for local development server)

## Technologies Used

- Web Speech API
- Web Audio API
- HTML5
- CSS3
- JavaScript