// GitHub API Configuration
const GITHUB_CONFIG = {
    owner: 'arcanth00',
    repo: 'arcanthproject',
    branch: 'main',
    token: localStorage.getItem('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') || ''
};
};

const DATA_FILE_PATH = 'data.json';
const API_URL = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${DATA_FILE_PATH}`;
const RAW_URL = `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${DATA_FILE_PATH}`;

// Fetch data from GitHub
async function fetchData() {
    try {
        const response = await fetch(RAW_URL + '?t=' + Date.now());
        if (!response.ok) throw new Error('Data fetch failed');
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        return getDefaultData();
    }
}

// Save data to GitHub (Admin only)
async function saveDataToGitHub(data) {
    try {
        // Get current file SHA
        const fileResponse = await fetch(API_URL, {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        const fileData = await fileResponse.json();
        const sha = fileData.sha;

        // Update file
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update data via admin panel',
                content: btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2)))),
                sha: sha,
                branch: GITHUB_CONFIG.branch
            })
        });

        if (!response.ok) {
            throw new Error('GitHub update failed');
        }

        return true;
    } catch (error) {
        console.error('Error saving to GitHub:', error);
        return false;
    }
}

// Default data structure
function getDefaultData() {
    return {
        announcements: [],
        projects: [],
        downloads: [],
        cms_content: {
            hero: {
                badge: "Carbonium Beta Yayında!",
                title: "YENİ BİR VİZYON",
                subtitle: "Sıradanlığı sorgulayan, geleceği bugünden inşa edenlerin kalesi."
            }
        },
        cookie_settings: {
            title: "Bu site temel çerezler kullanır",
            description: "Deneyiminizi geliştirmek için temel çerezleri kullanıyoruz.",
            acceptText: "ANLADIM"
        }
    };
}