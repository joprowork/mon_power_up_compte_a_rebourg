// Auto Countdown Power-Up for Trello
// Affiche automatiquement un countdown sur toutes les cartes avec une date d'échéance

// Fonction pour calculer le temps restant
function getTimeRemaining(dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    
    const isPast = diff < 0;
    const absDiff = Math.abs(diff);
    
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes, isPast, totalMs: diff };
}

// Fonction pour formater le texte du countdown
function formatCountdown(timeRemaining) {
    const { days, hours, minutes, isPast } = timeRemaining;
    const prefix = isPast ? '-' : '';
    
    if (days > 0) {
        return `${prefix}${days}j ${hours}h`;
    } else if (hours > 0) {
        return `${prefix}${hours}h ${minutes}m`;
    } else {
        return `${prefix}${minutes}m`;
    }
}

// Fonction pour déterminer la couleur selon l'urgence
function getColor(timeRemaining) {
    const { totalMs } = timeRemaining;
    const hoursRemaining = totalMs / (1000 * 60 * 60);
    
    if (totalMs < 0) {
        // En retard - Rouge
        return 'red';
    } else if (hoursRemaining <= 24) {
        // Moins de 24h - Orange
        return 'orange';
    } else if (hoursRemaining <= 72) {
        // Moins de 3 jours - Jaune
        return 'yellow';
    } else {
        // Plus de 3 jours - Bleu
        return 'blue';
    }
}

// Initialisation du Power-Up
TrelloPowerUp.initialize({
    // Badge sur les cartes (vue tableau)
    'card-badges': function(t, options) {
        return t.card('due', 'dueComplete')
            .then(function(card) {
                // Si pas de date d'échéance ou tâche terminée, pas de badge
                if (!card.due || card.dueComplete) {
                    return [];
                }
                
                const timeRemaining = getTimeRemaining(card.due);
                const text = formatCountdown(timeRemaining);
                const color = getColor(timeRemaining);
                
                return [{
                    text: text,
                    color: color,
                    refresh: 60 // Rafraîchir toutes les 60 secondes
                }];
            });
    },
    
    // Badge détaillé (vue carte ouverte)
    'card-detail-badges': function(t, options) {
        return t.card('due', 'dueComplete')
            .then(function(card) {
                if (!card.due || card.dueComplete) {
                    return [];
                }
                
                const timeRemaining = getTimeRemaining(card.due);
                const { days, hours, minutes, isPast } = timeRemaining;
                const color = getColor(timeRemaining);
                
                let title = isPast ? '⏰ En retard de' : '⏱️ Reste';
                let text;
                
                if (days > 0) {
                    text = `${days} jour${days > 1 ? 's' : ''}, ${hours}h ${minutes}m`;
                } else if (hours > 0) {
                    text = `${hours} heure${hours > 1 ? 's' : ''}, ${minutes}m`;
                } else {
                    text = `${minutes} minute${minutes > 1 ? 's' : ''}`;
                }
                
                return [{
                    title: title,
                    text: text,
                    color: color,
                    refresh: 30 // Rafraîchir toutes les 30 secondes
                }];
            });
    },
    
    // Bouton sur le tableau pour info
    'board-buttons': function(t, options) {
        return [{
            icon: {
                dark: 'https://cdn-icons-png.flaticon.com/512/2972/2972531.png',
                light: 'https://cdn-icons-png.flaticon.com/512/2972/2972531.png'
            },
            text: 'Auto Countdown',
            callback: function(t) {
                return t.popup({
                    title: 'Auto Countdown',
                    url: 'info.html',
                    height: 200
                });
            }
        }];
    }
}, {
    appKey: 'auto-countdown-powerup',
    appName: 'Auto Countdown'
});
