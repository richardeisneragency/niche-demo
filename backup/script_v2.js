// Initialize variables
let keywords = [];
let currentKeywordIndex = 0;
let typingInterval;
let customData = null;

// Get DOM elements
const searchBox = document.getElementById('searchBox');
const suggestionsContainer = document.getElementById('suggestions');
const keywordInput = document.getElementById('keywordInput');

// Initialize from URL parameters
function initFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    if (dataParam) {
        try {
            customData = JSON.parse(decodeURIComponent(dataParam));
            keywords = customData.map(item => item.k);
            // Auto-populate keywords
            keywordInput.value = keywords.join('\n');
            // Start simulation
            setTimeout(simulateTyping, 500);
        } catch (e) {
            console.error('Error parsing URL data:', e);
        }
    }
}

function simulateTyping() {
    if (currentKeywordIndex >= keywords.length) {
        currentKeywordIndex = 0;
        return;
    }

    const keyword = keywords[currentKeywordIndex];
    let currentChar = 0;

    // Clear previous interval if exists
    if (typingInterval) clearInterval(typingInterval);

    // Clear search box
    searchBox.value = '';
    
    // Simulate typing
    typingInterval = setInterval(() => {
        if (currentChar <= keyword.length) {
            const currentText = keyword.substring(0, currentChar);
            searchBox.value = currentText;
            
            if (currentText.length > 0) {
                // Fetch suggestions for the current text
                fetchSuggestions(currentText, currentChar === keyword.length);
            }
            
            currentChar++;
        } else {
            clearInterval(typingInterval);
            // Wait 2 seconds before moving to next keyword
            setTimeout(() => {
                currentKeywordIndex++;
                simulateTyping();
            }, 2000);
        }
    }, 200); // Type a character every 200ms
}

function fetchSuggestions(query, isComplete) {
    // If we have custom data, use it
    if (customData) {
        const currentEntry = customData.find(item => item.k === keywords[currentKeywordIndex]);
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
    suggestionsContainer.innerHTML = '';
    suggestionsContainer.style.display = 'block';
    
    suggestions.forEach(suggestion => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        
        if (targetToHighlight && suggestion === targetToHighlight) {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(suggestion)}`;
            div.innerHTML = `<a href="${searchUrl}" target="_blank" style="text-decoration:none; color:inherit;"><span class="highlight">${suggestion}</span></a>`;
        } else {
            div.textContent = suggestion;
        }
        
        suggestionsContainer.appendChild(div);
    });
}

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!suggestionsContainer.contains(e.target) && e.target !== searchBox) {
        suggestionsContainer.style.display = 'none';
    }
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initFromUrl);
