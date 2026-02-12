// GitHub API Configuration
const GITHUB_CONFIG = {
    owner: 'arcanth00',
    repo: 'arcanthproject',
    branch: 'main',
    token: ''  // Token admin panelden girilecek
};

const DATA_FILE_PATH = 'data.json';
const API_URL = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${DATA_FILE_PATH}`;
const RAW_URL = `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${DATA_FILE_PATH}`;

// Get token from localStorage
function getToken() {
    return localStorage.getItem('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') || '';
}

// Fetch data from GitHub
async function fetchDataFromGitHub() {
    try {
        const response = await fetch(RAW_URL + '?t=' + Date.now());
        if (!response.ok) throw new Error('Data fetch failed');
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// Save data to GitHub
async function saveDataToGitHub(data) {
    const token = getToken();
    if (!token) {
        alert('⚠️ GitHub token girilmemiş! Admin ayarlarından token ekleyin.');
        return false;
    }

    try {
        // Get current file SHA
        const fileResponse = await fetch(API_URL, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!fileResponse.ok) throw new Error('File fetch failed');
        const fileData = await fileResponse.json();
        const sha = fileData.sha;

        // Update file
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update from admin panel - ' + new Date().toLocaleString('tr-TR'),
                content: btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2)))),
                sha: sha,
                branch: GITHUB_CONFIG.branch
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'GitHub update failed');
        }

        return true;
    } catch (error) {
        console.error('Error saving to GitHub:', error);
        alert('❌ GitHub kaydetme hatası: ' + error.message);
        return false;
    }
}

// Load data on site
async function loadSiteData() {
    const data = await fetchDataFromGitHub();
    if (!data) return;
    
    // Load announcements
    if (data.announcements) {
        displayAnnouncements(data.announcements);
    }
    
    // Load projects
    if (data.projects) {
        displayProjects(data.projects);
    }
    
    // Load downloads
    if (data.downloads) {
        displayDownloads(data.downloads);
    }
    
    // Load CMS content
    if (data.cms_content) {
        loadCMSContent(data.cms_content);
    }
}
