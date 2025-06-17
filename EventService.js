function getAllEvents() {
  try {
    const ss = getSpreadsheet();
    const eventsSheet = ss.getSheetByName('Events');
    
    const lastRow = eventsSheet.getLastRow();
    if (lastRow <= 1) {
      return [];
    }
    
    const data = eventsSheet.getRange(1, 1, lastRow, 7).getValues();
    const events = [];
    
    // Récupérer les votes
    const voteCounts = getVoteCounts();
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      let eventDate = row[2];
      if (eventDate instanceof Date) {
        eventDate = eventDate.toISOString().split('T')[0];
      }
      
      const eventId = row[0];
      const voteKey = 'event_' + eventId;
      const votes = voteCounts[voteKey] || {};
      
      events.push({
        id: eventId,
        title: row[1],
        date: eventDate,
        author: row[3],
        description: row[4],
        status: row[5],
        calendarEventId: row[6],
        votes: {
          yes: votes.yes || 0,
          no: votes.no || 0,
          maybe: votes.maybe || 0
        }
      });
    }
    
    return events;
  } catch (error) {
    Logger.log('Erreur getAllEvents: ' + error.toString());
    return [];
  }
}

function getAllBars() {
  try {
    const ss = getSpreadsheet();
    const barsSheet = ss.getSheetByName('Bars');
    
    const lastRow = barsSheet.getLastRow();
    if (lastRow <= 1) {
      return [];
    }
    
    const data = barsSheet.getRange(1, 1, lastRow, 5).getValues();
    const bars = [];
    
    // Récupérer les votes
    const voteCounts = getVoteCounts();
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const barId = row[0];
      const voteKey = 'bar_' + barId;
      const votes = voteCounts[voteKey] || {};
      
      bars.push({
        id: barId,
        name: row[1],
        location: row[2],
        description: row[3],
        addedBy: row[4],
        votes: {
          up: votes.up || 0,
          down: votes.down || 0
        }
      });
    }
    
    return bars;
  } catch (error) {
    Logger.log('Erreur getAllBars: ' + error.toString());
    return [];
  }
}

function getAllKaraoke() {
  try {
    const ss = getSpreadsheet();
    const karaokeSheet = ss.getSheetByName('Karaoke');
    
    const lastRow = karaokeSheet.getLastRow();
    if (lastRow <= 1) {
      return [];
    }
    
    const data = karaokeSheet.getRange(1, 1, lastRow, 5).getValues();
    const karaokes = [];
    
    // Récupérer les votes
    const voteCounts = getVoteCounts();
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const karaokeId = row[0];
      const voteKey = 'karaoke_' + karaokeId;
      const votes = voteCounts[voteKey] || {};
      
      karaokes.push({
        id: karaokeId,
        name: row[1],
        location: row[2],
        description: row[3],
        addedBy: row[4],
        votes: {
          up: votes.up || 0,
          down: votes.down || 0
        }
      });
    }
    
    return karaokes;
  } catch (error) {
    Logger.log('Erreur getAllKaraoke: ' + error.toString());
    return [];
  }
}

function getAllActivities() {
  try {
    const ss = getSpreadsheet();
    const activitiesSheet = ss.getSheetByName('Activities');
    
    const lastRow = activitiesSheet.getLastRow();
    if (lastRow <= 1) {
      return [];
    }
    
    const data = activitiesSheet.getRange(1, 1, lastRow, 6).getValues();
    const activities = [];
    
    // Récupérer les votes
    const voteCounts = getVoteCounts();
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const activityId = row[0];
      const voteKey = 'activity_' + activityId;
      const votes = voteCounts[voteKey] || {};
      
      activities.push({
        id: activityId,
        name: row[1],
        location: row[2],
        duration: row[3],
        maxPlayers: row[4],
        addedBy: row[5],
        votes: {
          up: votes.up || 0,
          down: votes.down || 0
        }
      });
    }
    
    return activities;
  } catch (error) {
    Logger.log('Erreur getAllActivities: ' + error.toString());
    return [];
  }
}

function createEvent(title, date, description) {
  try {
    const ss = getSpreadsheet();
    const eventsSheet = ss.getSheetByName('Events');
    const userEmail = Session.getActiveUser().getEmail() || 'Anonymous';
    
    const eventId = generateId();
    
    // Créer l'événement Google Calendar
    let calendarEventId = null;
    try {
      calendarEventId = createCalendarEvent(title, date, description);
      
      // Ajouter le créateur comme participant "OUI"
      if (calendarEventId && userEmail !== 'Anonymous') {
        addGuestToEvent(calendarEventId, userEmail, 'yes');
      }
    } catch (error) {
      Logger.log('Calendrier non accessible: ' + error.toString());
    }
    
    eventsSheet.appendRow([eventId, title, date, userEmail, description, 'active', calendarEventId]);
    
    Logger.log('Événement créé: ' + title + ' - Calendar ID: ' + calendarEventId);
    
    return {
      success: true,
      eventId: eventId,
      calendarEventId: calendarEventId
    };
  } catch (error) {
    Logger.log('Erreur createEvent: ' + error.toString());
    throw new Error('Erreur lors de la création de l\'événement');
  }
}

function getEventCalendarId(eventId) {
  try {
    const ss = getSpreadsheet();
    const eventsSheet = ss.getSheetByName('Events');
    const data = eventsSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === eventId) {
        return data[i][6]; // ColonneG = CalendarEventId
      }
    }
    return null;
  } catch (error) {
    Logger.log('Erreur getEventCalendarId: ' + error.toString());
    return null;
  }
}

function getEventParticipants(eventId) {
  try {
    const ss = getSpreadsheet();
    const votesSheet = ss.getSheetByName('Votes');
    const data = votesSheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return [];
    }
    
    // Récupérer seulement le DERNIER vote de chaque utilisateur
    const userVotes = new Map();
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      if (row && row.length >= 5 && row[0] === 'event' && String(row[1]) === String(eventId)) {
        const email = row[4];
        const vote = row[2];
        const timestamp = row[3];
        
        const currentTime = new Date(timestamp).getTime();
        const existingTime = userVotes.has(email) ? new Date(userVotes.get(email).timestamp).getTime() : 0;
        
        if (!userVotes.has(email) || currentTime > existingTime) {
          userVotes.set(email, {
            email: email,
            vote: vote,
            timestamp: new Date(timestamp).toISOString()
          });
        }
      }
    }
    
    // Convertir la Map en Array avec sérialisation
    const result = Array.from(userVotes.values()).map(p => ({
      email: String(p.email),
      vote: String(p.vote),
      timestamp: String(p.timestamp)
    }));
    
    return result;
  } catch (error) {
    Logger.log('❌ Erreur getEventParticipants: ' + error.toString());
    return [];
  }
}

function deleteEvent(eventId) {
  try {
    const ss = getSpreadsheet();
    const eventsSheet = ss.getSheetByName('Events');
    const votesSheet = ss.getSheetByName('Votes');
    const userEmail = Session.getActiveUser().getEmail();
    
    // Vérifier si l'utilisateur peut supprimer cet événement
    let canDelete = false;
    let calendarEventId = null;
    const eventsData = eventsSheet.getDataRange().getValues();
    
    for (let i = 1; i < eventsData.length; i++) {
      if (eventsData[i][0] === eventId) {
        if (eventsData[i][3] === userEmail) { // Vérifier si c'est le créateur
          canDelete = true;
          calendarEventId = eventsData[i][6];
          eventsSheet.deleteRow(i + 1);
          break;
        }
      }
    }
    
    if (!canDelete) {
      throw new Error('Vous ne pouvez supprimer que vos propres événements');
    }
    
    // Supprimer les votes associés
    const votesData = votesSheet.getDataRange().getValues();
    for (let i = votesData.length - 1; i >= 1; i--) {
      if (votesData[i][0] === 'event' && votesData[i][1] === eventId) {
        votesSheet.deleteRow(i + 1);
      }
    }
    
    // Supprimer l'événement Calendar
    if (calendarEventId) {
      try {
        const event = CalendarApp.getEventById(calendarEventId);
        if (event) {
          event.deleteEvent();
          Logger.log('Événement Calendar supprimé: ' + calendarEventId);
        }
      } catch (error) {
        Logger.log('Erreur suppression Calendar: ' + error.toString());
      }
    }
    
    Logger.log('Événement supprimé: ' + eventId);
    return { success: true };
  } catch (error) {
    Logger.log('Erreur deleteEvent: ' + error.toString());
    throw new Error(error.message || 'Erreur lors de la suppression');
  }
}

function canDeleteEvent(eventId) {
  try {
    const ss = getSpreadsheet();
    const eventsSheet = ss.getSheetByName('Events');
    const userEmail = Session.getActiveUser().getEmail();
    const data = eventsSheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === eventId) {
        return data[i][3] === userEmail; // Vérifier si c'est le créateur
      }
    }
    return false;
  } catch (error) {
    Logger.log('Erreur canDeleteEvent: ' + error.toString());
    return false;
  }
}

function addBar(name, location, description) {
  try {
    const ss = getSpreadsheet();
    const barsSheet = ss.getSheetByName('Bars');
    const userEmail = Session.getActiveUser().getEmail() || 'Anonymous';
    
    const barId = generateId();
    barsSheet.appendRow([barId, name, location, description, userEmail]);
    
    return { success: true, barId: barId };
  } catch (error) {
    Logger.log('Erreur addBar: ' + error.toString());
    throw new Error('Erreur lors de l\'ajout du bar');
  }
}

function addKaraoke(name, location, description) {
  try {
    const ss = getSpreadsheet();
    const karaokeSheet = ss.getSheetByName('Karaoke');
    const userEmail = Session.getActiveUser().getEmail() || 'Anonymous';
    
    const karaokeId = generateId();
    karaokeSheet.appendRow([karaokeId, name, location, description, userEmail]);
    
    return { success: true, karaokeId: karaokeId };
  } catch (error) {
    Logger.log('Erreur addKaraoke: ' + error.toString());
    throw new Error('Erreur lors de l\'ajout du karaoké');
  }
}

function addActivity(name, location, duration, maxPlayers) {
  try {
    const ss = getSpreadsheet();
    const activitiesSheet = ss.getSheetByName('Activities');
    const userEmail = Session.getActiveUser().getEmail() || 'Anonymous';
    
    const activityId = generateId();
    activitiesSheet.appendRow([activityId, name, location, duration, maxPlayers, userEmail]);
    
    return { success: true, activityId: activityId };
  } catch (error) {
    Logger.log('Erreur addActivity: ' + error.toString());
    throw new Error('Erreur lors de l\'ajout de l\'activité');
  }
}