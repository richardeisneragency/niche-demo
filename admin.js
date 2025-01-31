let keywordEntries = [];

function addKeywordEntry() {
    const entry = {
        id: Date.now(),
        keyword: '',
        targetSuggestion: ''
    };
    keywordEntries.push(entry);
    renderEntries();
    updateGeneratedUrl();
}

function removeKeywordEntry(id) {
    keywordEntries = keywordEntries.filter(entry => entry.id !== id);
    renderEntries();
    updateGeneratedUrl();
}

function updateEntry(id, field, value) {
    const entry = keywordEntries.find(e => e.id === id);
    if (entry) {
        entry[field] = value;
        updateGeneratedUrl();
    }
}

function renderEntries() {
    const container = document.getElementById('keywordEntries');
    container.innerHTML = keywordEntries.map(entry => `
        <div class="keyword-entry">
            <div class="entry-header">
                <h3>Keyword Entry</h3>
                <button class="remove-btn" onclick="removeKeywordEntry(${entry.id})">Remove</button>
            </div>
            <div>
                <label>Keyword:</label>
                <input type="text" 
                    value="${entry.keyword}" 
                    onchange="updateEntry(${entry.id}, 'keyword', this.value)"
                    placeholder="Enter keyword">
            </div>
            <div>
                <label>Target Suggestion:</label>
                <input type="text" 
                    value="${entry.targetSuggestion}" 
                    onchange="updateEntry(${entry.id}, 'targetSuggestion', this.value)"
                    placeholder="Enter the suggestion you want to appear">
            </div>
        </div>
    `).join('');
}

async function shortenUrl(longUrl) {
    try {
        const response = await fetch('https://tinyurl.com/api-create.php?url=' + encodeURIComponent(longUrl));
        if (response.ok) {
            return await response.text();
        }
    } catch (error) {
        console.error('Error shortening URL:', error);
    }
    return longUrl; // Fallback to long URL if shortening fails
}

async function updateGeneratedUrl() {
    const baseUrl = window.location.href.replace('admin.html', 'index.html');
    const data = keywordEntries.map(entry => ({
        k: entry.keyword,
        t: entry.targetSuggestion
    }));
    const encoded = encodeURIComponent(JSON.stringify(data));
    const longUrl = `${baseUrl}?data=${encoded}`;
    
    // Get shortened URL
    const shortUrl = await shortenUrl(longUrl);
    document.getElementById('generatedUrl').value = shortUrl;
}

function copyUrl() {
    const urlInput = document.getElementById('generatedUrl');
    urlInput.select();
    document.execCommand('copy');
    
    // Change button text temporarily
    const copyBtn = document.querySelector('.copy-btn');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
}

// Add initial entry
addKeywordEntry();
