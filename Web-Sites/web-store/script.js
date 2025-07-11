document.addEventListener('DOMContentLoaded', () => {

    // --- DATA: Define your extensions here ---
    // TO ADD MORE: Just copy an object and add it to the array.
    const extensions = [
        {
            id: 'ai-summarizer',
            name: 'AI Summarizer',
            tagline: 'Summarize articles with one click.',
            description: 'Tired of long articles? Use the power of AI to get a quick summary of any webpage. Perfect for students, researchers, and busy professionals.',
            icon: 'https://placehold.co/128x128/7F56D9/FFFFFF?text=AI', // Replace with your icon URL
            bannerImage: 'https://placehold.co/640x480/A486F2/FFFFFF?text=AI+Summarizer', // Replace with your banner URL
            downloadLink: 'https://download-directory.github.io/?url=https://github.com/247Techies/Chrome-Extensions/tree/main/AI-Summarizer'
        },
        {
            id: 'auto-clicker',
            name: 'Auto Clicker',
            tagline: 'Automate mouse clicks easily.',
            description: 'An easy-to-use and powerful auto clicker. Set custom click intervals and automate repetitive clicking tasks in games or on websites.',
            icon: 'https://placehold.co/128x128/19B53E/FFFFFF?text=Click', // Replace with your icon URL
            bannerImage: 'https://placehold.co/640x480/54D674/FFFFFF?text=Auto+Clicker', // Replace with your banner URL
            downloadLink: 'https://download-directory.github.io/?url=https://github.com/247Techies/Chrome-Extensions/tree/main/Auto-Clicker'
        },
        {
            id: 'yt-shorts-converter',
            name: 'YouTube Shorts Converter',
            tagline: 'Watch Shorts as normal videos.',
            description: 'Automatically redirects YouTube Shorts to the standard video player, giving you full control over playback, timeline scrubbing, and quality settings.',
            icon: 'https://placehold.co/128x128/FF0000/FFFFFF?text=YT', // Replace with your icon URL
            bannerImage: 'https://placehold.co/640x480/FF5555/FFFFFF?text=YouTube+Shorts', // Replace with your banner URL
            downloadLink: 'https://download-directory.github.io/?url=https://github.com/247Techies/Chrome-Extensions/tree/main/Youtube-Shorts-to-Normal-Video'
        },
        {
            id: 'tab-manager',
            name: 'Chrome Tab Manager',
            tagline: 'Organize your tabs effortlessly.',
            description: 'Too many tabs open? This extension helps you group, save, and manage your tabs to keep your browser clean and your workflow organized.',
            icon: 'https://placehold.co/128x128/1a73e8/FFFFFF?text=Tabs', // Replace with your icon URL
            bannerImage: 'https://placehold.co/640x480/64A5F5/FFFFFF?text=Tab+Manager', // Replace with your banner URL
            downloadLink: 'https://download-directory.github.io/?url=https://github.com/247Techies/Chrome-Extensions/tree/main/Chrome-Tab-Manager'
        }
        // Add more extensions here...
    ];

    // --- DOM Elements ---
    const featuredImage = document.getElementById('featured-image');
    const featuredTitle = document.getElementById('featured-title');
    const featuredDescription = document.getElementById('featured-description');
    const featuredDownloadLink = document.getElementById('featured-download-link');
    const extensionGrid = document.getElementById('extension-grid');

    // --- Functions ---

    /**
     * Updates the main banner with data from a specific extension.
     * @param {object} extension - The extension object from the `extensions` array.
     */
    function updateBanner(extension) {
        featuredImage.src = extension.bannerImage;
        featuredImage.alt = `${extension.name} banner`;
        featuredTitle.textContent = extension.name;
        featuredDescription.textContent = extension.description;
        featuredDownloadLink.href = extension.downloadLink;
    }

    /**
     * Handles clicks on an extension card.
     * @param {object} extension - The extension object to feature.
     * @param {HTMLElement} clickedCard - The card element that was clicked.
     */
    function handleCardClick(extension, clickedCard) {
        // Update the banner
        updateBanner(extension);

        // Update the 'active' class on cards
        document.querySelectorAll('.extension-card').forEach(card => {
            card.classList.remove('active');
        });
        clickedCard.classList.add('active');
    }

    // --- Initialization ---

    // Create and append all extension cards to the grid
    extensions.forEach(ext => {
        const card = document.createElement('div');
        card.className = 'extension-card';
        card.dataset.id = ext.id; // Store id for easy lookup

        card.innerHTML = `
            <img src="${ext.icon}" alt="${ext.name} icon" class="icon">
            <div class="info">
                <h4>${ext.name}</h4>
                <p>${ext.tagline}</p>
            </div>
        `;
        
        // Add click event listener to each card
        card.addEventListener('click', () => handleCardClick(ext, card));
        
        extensionGrid.appendChild(card);
    });

    // --- Initial Page Load ---
    // Set the first extension as the default featured item when the page loads.
    if (extensions.length > 0) {
        const firstExtension = extensions[0];
        const firstCard = document.querySelector('.extension-card');
        
        updateBanner(firstExtension);
        if (firstCard) {
            firstCard.classList.add('active');
        }
    }
});