// Auto Countdown Power-Up pour Trello - Version 4.0
// Code unifié et cohérent entre vue tableau et vue détails

// Paramètres par défaut
var DEFAULT_SETTINGS = {
    thresholds: {
        urgent: 24,
        warning: 72
    },
    // Couleurs disponibles: 
    // Base: red, orange, yellow, green, blue, purple, pink, sky, lime, black, light-gray
    // Variantes (non documentées mais peuvent fonctionner): 
    // red_dark, red_light, orange_dark, orange_light, etc.
    colors: {
        overdue: 'red_dark',      // Rouge vif (comme les étiquettes)
        urgent: 'orange_dark',    // Orange vif
        warning: 'yellow_dark',   // Jaune vif
        normal: 'blue'
    },
    texts: {
        overdue: 'En retard',
        urgent: 'Urgent',
        warning: 'Attention',
        normal: 'Reste',
        days: 'j',
        daysLong: 'jour',
        daysLongPlural: 'jours',
        hours: 'h',
        hoursLong: 'heure',
        hoursLongPlural: 'heures',
        minutes: 'm',
        minutesLong: 'minute',
        minutesLongPlural: 'minutes'
    },
    format: 'short',
    overdueAlert: {
        enabled: true,
        text: '⚠️ EN RETARD',
        color: 'red_dark'    // Rouge vif
    }
};

// Récupérer les paramètres
function getSettings(t) {
    return t.get('board', 'shared', 'countdownSettings')
        .then(function(settings) {
            if (settings) {
                var merged = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
                if (settings.thresholds) {
                    merged.thresholds = Object.assign({}, merged.thresholds, settings.thresholds);
                }
                if (settings.colors) {
                    merged.colors = Object.assign({}, merged.colors, settings.colors);
                }
                if (settings.texts) {
                    merged.texts = Object.assign({}, merged.texts, settings.texts);
                }
                if (settings.overdueAlert) {
                    merged.overdueAlert = Object.assign({}, merged.overdueAlert, settings.overdueAlert);
                }
                if (settings.format) {
                    merged.format = settings.format;
                }
                return merged;
            }
            return DEFAULT_SETTINGS;
        });
}

// FONCTION UNIQUE pour calculer le temps restant
// Retourne les valeurs TOTALES en minutes pour éviter toute incohérence
function calculateTimeData(dueDate) {
    var now = new Date().getTime();
    var due = new Date(dueDate).getTime();
    var diffMs = due - now;
    
    var isOverdue = diffMs < 0;
    var absDiffMs = Math.abs(diffMs);
    
    // Calculer en minutes totales d'abord pour précision
    var totalMinutes = Math.floor(absDiffMs / (1000 * 60));
    
    // Puis décomposer
    var days = Math.floor(totalMinutes / (60 * 24));
    var remainingAfterDays = totalMinutes % (60 * 24);
    var hours = Math.floor(remainingAfterDays / 60);
    var minutes = remainingAfterDays % 60;
    
    return {
        days: days,
        hours: hours,
        minutes: minutes,
        totalMinutes: totalMinutes,
        totalMs: diffMs,
        isOverdue: isOverdue
    };
}

// FONCTION UNIQUE pour formater le temps
// Utilisée par les DEUX vues pour garantir la cohérence
function formatTime(timeData, settings, isDetailView) {
    var d = timeData.days;
    var h = timeData.hours;
    var m = timeData.minutes;
    var prefix = timeData.isOverdue ? '-' : '';
    var format = settings.format;
    var texts = settings.texts;
    
    // Format COURT : "2j 5h" ou "3h 25m" ou "45m"
    if (format === 'short') {
        if (d > 0) {
            return prefix + d + texts.days + ' ' + h + texts.hours;
        } else if (h > 0) {
            return prefix + h + texts.hours + ' ' + m + texts.minutes;
        } else {
            return prefix + m + texts.minutes;
        }
    }
    
    // Format LONG : "2 jours 5 heures" ou "3 heures 25 minutes"
    var dayText = d === 1 ? texts.daysLong : texts.daysLongPlural;
    var hourText = h === 1 ? texts.hoursLong : texts.hoursLongPlural;
    var minText = m === 1 ? texts.minutesLong : texts.minutesLongPlural;
    
    if (d > 0) {
        if (isDetailView) {
            // Vue détails : afficher jours, heures ET minutes
            return prefix + d + ' ' + dayText + ' ' + h + ' ' + hourText + ' ' + m + ' ' + minText;
        } else {
            // Vue tableau : afficher jours et heures seulement (plus compact)
            return prefix + d + ' ' + dayText + ' ' + h + ' ' + hourText;
        }
    } else if (h > 0) {
        return prefix + h + ' ' + hourText + ' ' + m + ' ' + minText;
    } else {
        return prefix + m + ' ' + minText;
    }
}

// Déterminer couleur et statut
function getStatus(timeData, settings) {
    var hoursRemaining = timeData.totalMs / (1000 * 60 * 60);
    
    if (timeData.isOverdue) {
        return { color: settings.colors.overdue, status: settings.texts.overdue, isOverdue: true };
    } else if (hoursRemaining <= settings.thresholds.urgent) {
        return { color: settings.colors.urgent, status: settings.texts.urgent, isOverdue: false };
    } else if (hoursRemaining <= settings.thresholds.warning) {
        return { color: settings.colors.warning, status: settings.texts.warning, isOverdue: false };
    } else {
        return { color: settings.colors.normal, status: settings.texts.normal, isOverdue: false };
    }
}

// Fonction commune pour générer les badges
// MÊME LOGIQUE pour les deux vues !
function generateBadges(t, isDetailView) {
    return Promise.all([
        t.card('due', 'dueComplete'),
        getSettings(t)
    ]).then(function(results) {
        var card = results[0];
        var settings = results[1];
        
        // Pas de date d'échéance ou déjà complétée
        if (!card.due || card.dueComplete) {
            return [];
        }
        
        // Calculer le temps UNE SEULE FOIS
        var timeData = calculateTimeData(card.due);
        var status = getStatus(timeData, settings);
        var timeText = formatTime(timeData, settings, isDetailView);
        
        var badges = [];
        var refreshRate = 30; // Même taux de rafraîchissement pour les deux vues
        
        // Badge EN RETARD (si activé et en retard)
        if (status.isOverdue && settings.overdueAlert && settings.overdueAlert.enabled) {
            if (isDetailView) {
                badges.push({
                    title: '🚨 Alerte',
                    text: settings.overdueAlert.text,
                    color: settings.overdueAlert.color,
                    refresh: refreshRate
                });
            } else {
                badges.push({
                    text: settings.overdueAlert.text,
                    color: settings.overdueAlert.color,
                    refresh: refreshRate
                });
            }
        }
        
        // Badge countdown
        if (isDetailView) {
            var icon = timeData.isOverdue ? '⏰' : '⏱️';
            badges.push({
                title: icon + ' ' + status.status,
                text: timeText,
                color: status.color,
                refresh: refreshRate
            });
        } else {
            badges.push({
                text: timeText,
                color: status.color,
                refresh: refreshRate
            });
        }
        
        return badges;
    });
}

// Initialisation du Power-Up
TrelloPowerUp.initialize({
    // Badge sur les cartes (vue tableau)
    'card-badges': function(t, options) {
        return generateBadges(t, false);
    },
    
    // Badge détaillé (vue carte ouverte)
    'card-detail-badges': function(t, options) {
        return generateBadges(t, true);
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
