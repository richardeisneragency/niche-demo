// Initialize variables
window.keywords = [];
window.currentKeywordIndex = 0;
window.typingInterval;
window.customData = null;
window.titleElement = document.getElementById('title');
window.businessCategoryElement = document.getElementById('business-category');

// Get DOM elements
window.searchBox = document.getElementById('searchBox');
window.suggestionsContainer = document.getElementById('suggestions');
window.keywordInput = document.getElementById('keywordInput');

// Initialize from URL parameters and start demo
function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    if (dataParam) {
        try {
            window.customData = JSON.parse(decodeURIComponent(dataParam));
            window.keywords = window.customData.map(item => item.k);
            // Auto-populate keywords
            window.keywordInput.value = window.keywords.join('\n');
            // Start simulation after a short delay
            setTimeout(simulateTyping, 500);
        } catch (e) {
            console.error('Error parsing URL data:', e);
        }
    }
}

function simulateTyping() {
    // Reset index if we've reached the end
    if (window.currentKeywordIndex >= window.keywords.length) {
        window.currentKeywordIndex = 0;
        // Start over immediately
        simulateTyping();
        return;
    }

    const keyword = window.keywords[window.currentKeywordIndex];
    let currentChar = 0;

    // Clear previous interval if exists
    if (window.typingInterval) clearInterval(window.typingInterval);

    // Clear search box
    window.searchBox.value = '';
    
    // Simulate typing
    window.typingInterval = setInterval(() => {
        if (currentChar <= keyword.length) {
            const currentText = keyword.substring(0, currentChar);
            window.searchBox.value = currentText;
            
            if (currentText.length > 0) {
                // Fetch suggestions for the current text
                fetchSuggestions(currentText, currentChar === keyword.length);
            }
            
            currentChar++;
        } else {
            clearInterval(window.typingInterval);
            // Wait 2 seconds before moving to next keyword
            setTimeout(() => {
                window.currentKeywordIndex++;
                simulateTyping();
            }, 2000);
        }
    }, 200); // Type a character every 200ms
}

function fetchSuggestions(query, isComplete) {
    // If we have custom data, use it
    if (window.customData) {
        const currentEntry = window.customData.find(item => item.k === window.keywords[window.currentKeywordIndex]);
        if (currentEntry) {
            // Get organic suggestions
            let suggestions = generateOrganicSuggestions(query);
            
            // Insert the target suggestion at a random position
            const randomPosition = Math.floor(Math.random() * 6) + 1; // Random position between 1-6
            suggestions.splice(randomPosition - 1, 0, currentEntry.t);
            
            // Limit to 8 suggestions
            suggestions = suggestions.slice(0, 8);
            
            // Only pass the target suggestion if typing is complete
            const targetToHighlight = isComplete ? currentEntry.t : null;
            displaySuggestions(suggestions, targetToHighlight);
            return;
        }
    }

    // Fallback to organic suggestions if no custom data
    const suggestions = generateOrganicSuggestions(query).slice(0, 8);
    displaySuggestions(suggestions, null);
}

function generateOrganicSuggestions(query) {
    const suggestions = [
        `what is ${query}`,
        `${query} near me`,
        `best ${query}`,
        `${query} reviews`,
        `${query} vs`,
        `${query} cost`,
        `${query} online`,
        `${query} tutorial`,
        `how to ${query}`,
        `why ${query}`,
        `when to use ${query}`,
        `${query} for beginners`
    ];
    
    // Shuffle array
    return suggestions.sort(() => Math.random() - 0.5);
}

function displaySuggestions(suggestions, targetToHighlight) {
    window.suggestionsContainer.innerHTML = '';
    window.suggestionsContainer.style.display = 'block';
    
    suggestions.forEach(suggestion => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        
        if (targetToHighlight && suggestion === targetToHighlight) {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(suggestion)}`;
            div.innerHTML = `<a href="${searchUrl}" target="_blank"><span class="highlight">${suggestion}</span></a>`;
        } else {
            div.textContent = suggestion;
        }
        
        window.suggestionsContainer.appendChild(div);
    });
}

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!window.suggestionsContainer.contains(e.target) && e.target !== window.searchBox) {
        window.suggestionsContainer.style.display = 'none';
    }
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
