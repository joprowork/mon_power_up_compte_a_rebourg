// Auto Countdown Power-Up pour Trello - Version 3.0
// Avec badge EN RETARD configurable

// Paramètres par défaut
var DEFAULT_SETTINGS = {
    // Seuils en heures
    thresholds: {
        urgent: 24,      // Moins de 24h → couleur urgente
        warning: 72,     // Moins de 72h (3 jours) → couleur warning
        normal: 168      // Moins de 168h (7 jours) → couleur normale
    },
    // Couleurs (red, orange, yellow, blue, green, purple, pink, sky, lime)
    colors: {
        overdue: 'red',      // En retard
        urgent: 'orange',    // Urgent
        warning: 'yellow',   // Attention
        normal: 'blue'       // Normal
    },
    // Textes de statut
    texts: {
        overdue: 'En retard de',
        urgent: 'Urgent',
        warning: 'Attention',
        normal: 'Reste',
        days: 'jour',
        daysPlural: 'jours',
        hours: 'heure',
        hoursPlural: 'heures',
        minutes: 'minute',
        minutesPlural: 'minutes'
    },
    // Format d'affichage : 'short' (1j 5h) ou 'long' (1 jour 5 heures)
    format: 'long',
    // Badge EN RETARD
    overdueAlert: {
        enabled: true,
        text: '⚠️ EN RETARD',
        color: 'red'
    }
};

// Récupérer les paramètres sauvegardés ou utiliser les défauts
function getSettings(t) {
    return t.get('board', 'shared', 'countdownSettings')
        .then(function(settings) {
            if (settings) {
                // Fusionner avec les défauts pour s'assurer que toutes les clés existent
                var merged = Object.assign({}, DEFAULT_SETTINGS, settings);
                merged.thresholds = Object.assign({}, DEFAULT_SETTINGS.thresholds, settings.thresholds);
                merged.colors = Object.assign({}, DEFAULT_SETTINGS.colors, settings.colors);
                merged.texts = Object.assign({}, DEFAULT_SETTINGS.texts, settings.texts);
                merged.overdueAlert = Object.assign({}, DEFAULT_SETTINGS.overdueAlert, settings.overdueAlert);
                return merged;
            }
            return DEFAULT_SETTINGS;
        });
}

// Fonction pour calculer le temps restant
function getTimeRemaining(dueDate) {
    var now = new Date();
    var due = new Date(dueDate);
    var diff = due - now;
    
    var isPast = diff < 0;
    var absDiff = Math.abs(diff);
    
    var days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days: days, hours: hours, minutes: minutes, isPast: isPast, totalMs: diff };
}

// Fonction pour formater le texte du countdown (version courte pour badge)
function formatCountdownShort(timeRemaining, settings) {
    var days = timeRemaining.days;
    var hours = timeRemaining.hours;
    var minutes = timeRemaining.minutes;
    var isPast = timeRemaining.isPast;
    var prefix = isPast ? '-' : '';
    
    if (settings.format === 'long') {
        if (days > 0) {
            var dayText = days === 1 ? settings.texts.days : settings.texts.daysPlural;
            var hourText = hours === 1 ? settings.texts.hours : settings.texts.hoursPlural;
            return prefix + days + ' ' + dayText + ' ' + hours + ' ' + hourText;
        } else if (hours > 0) {
            var hourText = hours === 1 ? settings.texts.hours : settings.texts.hoursPlural;
            var minText = minutes === 1 ? settings.texts.minutes : settings.texts.minutesPlural;
            return prefix + hours + ' ' + hourText + ' ' + minutes + ' ' + minText;
        } else {
            var minText = minutes === 1 ? settings.texts.minutes : settings.texts.minutesPlural;
            return prefix + minutes + ' ' + minText;
        }
    } else {
        // Format court
        if (days > 0) {
            return prefix + days + 'j ' + hours + 'h';
        } else if (hours > 0) {
            return prefix + hours + 'h ' + minutes + 'm';
        } else {
            return prefix + minutes + 'm';
        }
    }
}

// Fonction pour formater le texte détaillé
function formatCountdownLong(timeRemaining, settings) {
    var days = timeRemaining.days;
    var hours = timeRemaining.hours;
    var minutes = timeRemaining.minutes;
    
    var dayText = days === 1 ? settings.texts.days : settings.texts.daysPlural;
    var hourText = hours === 1 ? settings.texts.hours : settings.texts.hoursPlural;
    var minText = minutes === 1 ? settings.texts.minutes : settings.texts.minutesPlural;
    
    if (days > 0) {
        return days + ' ' + dayText + ', ' + hours + ' ' + hourText + ', ' + minutes + ' ' + minText;
    } else if (hours > 0) {
        return hours + ' ' + hourText + ', ' + minutes + ' ' + minText;
    } else {
        return minutes + ' ' + minText;
    }
}

// Fonction pour déterminer la couleur et le statut selon l'urgence
function getColorAndStatus(timeRemaining, settings) {
    var totalMs = timeRemaining.totalMs;
    var hoursRemaining = totalMs / (1000 * 60 * 60);
    
    if (totalMs < 0) {
        return { color: settings.colors.overdue, status: settings.texts.overdue, isOverdue: true };
    } else if (hoursRemaining <= settings.thresholds.urgent) {
        return { color: settings.colors.urgent, status: settings.texts.urgent, isOverdue: false };
    } else if (hoursRemaining <= settings.thresholds.warning) {
        return { color: settings.colors.warning, status: settings.texts.warning, isOverdue: false };
    } else {
        return { color: settings.colors.normal, status: settings.texts.normal, isOverdue: false };
    }
}

// Initialisation du Power-Up
TrelloPowerUp.initialize({
    // Badge sur les cartes (vue tableau)
    'card-badges': function(t, options) {
        return Promise.all([
            t.card('due', 'dueComplete'),
            getSettings(t)
        ]).then(function(results) {
            var card = results[0];
            var settings = results[1];
            
            if (!card.due || card.dueComplete) {
                return [];
            }
            
            var timeRemaining = getTimeRemaining(card.due);
            var text = formatCountdownShort(timeRemaining, settings);
            var colorAndStatus = getColorAndStatus(timeRemaining, settings);
            
            var badges = [];
            
            // Ajouter le badge EN RETARD si activé et en retard
            if (colorAndStatus.isOverdue && settings.overdueAlert && settings.overdueAlert.enabled) {
                badges.push({
                    text: settings.overdueAlert.text,
                    color: settings.overdueAlert.color,
                    refresh: 60
                });
            }
            
            // Ajouter le badge countdown
            badges.push({
                text: text,
                color: colorAndStatus.color,
                refresh: 60
            });
            
            return badges;
        });
    },
    
    // Badge détaillé (vue carte ouverte)
    'card-detail-badges': function(t, options) {
        return Promise.all([
            t.card('due', 'dueComplete'),
            getSettings(t)
        ]).then(function(results) {
            var card = results[0];
            var settings = results[1];
            
            if (!card.due || card.dueComplete) {
                return [];
            }
            
            var timeRemaining = getTimeRemaining(card.due);
            var colorAndStatus = getColorAndStatus(timeRemaining, settings);
            var text = formatCountdownLong(timeRemaining, settings);
            
            var badges = [];
            
            // Ajouter le badge EN RETARD si activé et en retard
            if (colorAndStatus.isOverdue && settings.overdueAlert && settings.overdueAlert.enabled) {
                badges.push({
                    title: '🚨 Alerte',
                    text: settings.overdueAlert.text,
                    color: settings.overdueAlert.color,
                    refresh: 30
                });
            }
            
            var icon = timeRemaining.isPast ? '⏰' : '⏱️';
            
            badges.push({
                title: icon + ' ' + colorAndStatus.status,
                text: text,
                color: colorAndStatus.color,
                refresh: 30
            });
            
            return badges;
        });
    },
    
    // Bouton sur le tableau pour les paramètres
    'board-buttons': function(t, options) {
        return [{
            icon: {
                dark: 'https://cdn-icons-png.flaticon.com/512/2972/2972531.png',
                light: 'https://cdn-icons-png.flaticon.com/512/2972/2972531.png'
            },
            text: 'Auto Countdown',
            callback: function(t) {
                return t.popup({
                    title: '⏱️ Auto Countdown - Paramètres',
                    url: 'settings.html',
                    height: 550
                });
            }
        }];
    }
}, {
    appKey: 'auto-countdown-powerup',
    appName: 'Auto Countdown'
});
