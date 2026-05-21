// Scripture 365 Application Logic

// Initialize UI
document.getElementById('year').innerText = new Date().getFullYear();

// LocalStorage Keys
const STORAGE_KEY = 'scripture365_data';
const COMPLETED_KEY = 'scripture365_completed';

// Default data structure
const defaultData = {
    startDate: new Date().toISOString(),
    completedDays: []
};

// Load user data from localStorage
function loadUserData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultData;
}

// Save user data to localStorage
function saveUserData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Get day of year (1-365)
function getDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

// Format date for display
function formatDate(date = new Date()) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Display today's reading
function displayTodaysReading() {
    const dayOfYear = getDayOfYear();
    const todayReading = readingPlan.find(plan => plan.day === dayOfYear);
    
    document.getElementById('date-display').innerText = formatDate();
    
    if (todayReading) {
        document.getElementById('ot-reading').innerText = todayReading.ot;
        document.getElementById('nt-reading').innerText = todayReading.nt;
    } else {
        document.getElementById('ot-reading').innerText = "Check back tomorrow!";
        document.getElementById('nt-reading').innerText = "Check back tomorrow!";
    }
}

// Mark reading as complete
function markReadingComplete() {
    const userData = loadUserData();
    const dayOfYear = getDayOfYear();
    
    // Check if already marked for today
    if (!userData.completedDays.includes(dayOfYear)) {
        userData.completedDays.push(dayOfYear);
        userData.completedDays.sort((a, b) => a - b);
        saveUserData(userData);
        
        showToast("✓ Reading marked as complete! Great job!");
        updateProgressUI();
        updateStreak();
    } else {
        showToast("Today's reading is already marked complete!");
    }
}

// Calculate streak
function calculateStreak() {
    const userData = loadUserData();
    let streak = 0;
    let currentDay = getDayOfYear();
    
    // Check consecutive days backwards from today
    for (let i = 0; i < 365; i++) {
        if (userData.completedDays.includes(currentDay)) {
            streak++;
            currentDay--;
        } else {
            break;
        }
    }
    
    return streak;
}

// Update progress UI
function updateProgressUI() {
    const userData = loadUserData();
    const completed = userData.completedDays.length;
    const total = 365;
    const percentage = Math.round((completed / total) * 100);
    
    // Main progress bar
    document.getElementById('progress-fill').style.width = percentage + '%';
    document.getElementById('progress-text').innerText = `${percentage}% Complete (${completed} of ${total} days)`;
    
    // OT Progress (assuming 3 chapters per day = 1089 total chapters)
    const otChaptersRead = completed * 3;
    const otPercentage = Math.round((otChaptersRead / 1189) * 100);
    document.getElementById('ot-progress-fill').style.width = otPercentage + '%';
    document.getElementById('ot-progress').innerText = `${otChaptersRead} of 1,189 chapters`;
    
    // NT Progress (assuming 1 chapter per day = 260 total chapters)
    const ntChaptersRead = completed;
    const ntPercentage = Math.round((ntChaptersRead / 260) * 100);
    document.getElementById('nt-progress-fill').style.width = ntPercentage + '%';
    document.getElementById('nt-progress').innerText = `${ntChaptersRead} of 260 chapters`;
    
    // Days completed
    document.getElementById('days-completed').innerText = `${completed} of 365`;
}

// Update streak display
function updateStreak() {
    const streak = calculateStreak();
    document.getElementById('streak-count').innerText = `${streak} day${streak !== 1 ? 's' : ''}`;
}

// Display reading history
function displayReadingHistory() {
    const userData = loadUserData();
    const historyList = document.getElementById('history-list');
    
    if (userData.completedDays.length === 0) {
        historyList.innerHTML = '<p class="empty-state">No readings logged yet. Start your journey today!</p>';
        return;
    }
    
    // Show last 10 completed readings
    const recentReadings = userData.completedDays.slice(-10).reverse();
    
    historyList.innerHTML = recentReadings.map(dayNum => {
        const reading = readingPlan.find(p => p.day === dayNum);
        if (!reading) return '';
        
        // Calculate date from day number
        const date = new Date();
        date.setDate(date.getDate() - (getDayOfYear() - dayNum));
        
        return `
            <div class="history-item">
                <span class="history-date">${formatDate(date)}</span>
                <span class="history-reading">${reading.ot} / ${reading.nt}</span>
            </div>
        `;
    }).join('');
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Share reading
function shareReading() {
    const dayOfYear = getDayOfYear();
    const todayReading = readingPlan.find(plan => plan.day === dayOfYear);
    
    if (!todayReading) {
        showToast("No reading for today");
        return;
    }
    
    const text = `I'm reading Scripture 365 today!\n\nOld Testament: ${todayReading.ot}\nNew Testament: ${todayReading.nt}\n\nJoin me in reading the entire Bible in one year! #Scripture365 #TrueWorship`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Scripture 365',
            text: text
        }).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            showToast("Reading copied to clipboard!");
        }).catch(err => {
            showToast("Unable to share");
        });
    }
}

// Event Listeners
document.getElementById('mark-read-btn').addEventListener('click', markReadingComplete);
document.getElementById('share-btn').addEventListener('click', shareReading);

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    displayTodaysReading();
    updateProgressUI();
    updateStreak();
    displayReadingHistory();
});

// Update when tab becomes visible (handles date changes)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        displayTodaysReading();
        updateProgressUI();
        updateStreak();
        displayReadingHistory();
    }
});
