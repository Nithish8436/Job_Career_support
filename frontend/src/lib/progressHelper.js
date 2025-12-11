// Helper function to award XP for user actions
export const awardXP = async (action, metadata = {}, token) => {
    try {
        const response = await fetch('http://localhost:5000/api/progress/award-xp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
            },
            body: JSON.stringify({
                action,
                metadata
            })
        });

        const data = await response.json();
        if (data.success) {
            // Dispatch event to notify components to refresh
            window.dispatchEvent(new Event('progress_updated'));
            return data;
        }
        return null;
    } catch (error) {
        console.error('Error awarding XP:', error);
        return null;
    }
};
