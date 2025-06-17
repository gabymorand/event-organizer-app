function createCalendarEvent(title, date, description) {
  try {
    const calendar = CalendarApp.getDefaultCalendar();
    
    // Convertir la date en objet Date et créer les heures
    const eventDate = new Date(date);
    const startTime = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 18, 0, 0); // 18h
    const endTime = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), 22, 0, 0);   // 22h
    
    const event = calendar.createEvent(title, startTime, endTime, {
      description: description || 'Événement organisé via Event Organizer App\n\n--- PARTICIPANTS ---',
      location: 'À définir'
    });
    
    Logger.log('Événement Calendar créé: ' + event.getId());
    return event.getId();
  } catch (error) {
    Logger.log('Erreur création événement Calendar: ' + error.toString());
    return null;
  }
}

function addGuestToEvent(calendarEventId, guestEmail, voteType) {
  try {
    if (!calendarEventId) {
      Logger.log('Pas d\'ID d\'événement Calendar');
      return false;
    }
    
    const event = CalendarApp.getEventById(calendarEventId);
    if (!event) {
      Logger.log('Événement Calendar introuvable: ' + calendarEventId);
      return false;
    }
    
    // Récupérer la liste actuelle des invités
    const currentGuests = event.getGuestList();
    const existingGuest = currentGuests.find(guest => guest.getEmail() === guestEmail);
    
    if (!existingGuest) {
      // Ajouter l'invité s'il n'existe pas
      event.addGuest(guestEmail);
      Logger.log('Invité ajouté comme participant: ' + guestEmail);
    } else {
      Logger.log('Invité déjà présent, mise à jour du vote: ' + guestEmail);
    }
    
    // Attendre que l'ajout soit effectif
    Utilities.sleep(1000);
    
    // Mettre à jour la description avec les votes (mais l'invité est vraiment participant)
    updateEventDescriptionWithVotes(event, guestEmail, voteType);
    
    return true;
  } catch (error) {
    Logger.log('Erreur ajout invité: ' + error.toString());
    return false;
  }
}

function updateEventDescriptionWithVotes(event, guestEmail, voteType) {
  try {
    let description = event.getDescription() || '';
    
    // Créer la base de la description si elle n'existe pas
    if (!description.includes('Event Organizer App')) {
      description = 'Événement organisé via Event Organizer App\n\n--- PARTICIPANTS ---\n';
    }
    
    const voteIcons = {
      'yes': '✅ OUI',
      'no': '❌ NON', 
      'maybe': '🤔 PEUT-ÊTRE'
    };
    
    // Supprimer l'ancienne entrée de cet utilisateur s'il y en a une
    const lines = description.split('\n');
    const filteredLines = lines.filter(line => !line.includes(guestEmail));
    
    // Reconstruire la description
    let newDescription = filteredLines.join('\n');
    
    // Ajouter la section participants si elle n'existe pas
    if (!newDescription.includes('--- PARTICIPANTS ---')) {
      newDescription += '\n--- PARTICIPANTS ---\n';
    }
    
    // Ajouter le nouveau vote
    const voteText = `${voteIcons[voteType]} ${guestEmail}`;
    newDescription += voteText + '\n';
    
    event.setDescription(newDescription);
    Logger.log('Description mise à jour avec vote: ' + voteText);
  } catch (error) {
    Logger.log('Erreur mise à jour description: ' + error.toString());
  }
}

function removeGuestFromEvent(calendarEventId, guestEmail) {
  try {
    if (!calendarEventId) return false;
    
    const event = CalendarApp.getEventById(calendarEventId);
    if (!event) return false;
    
    event.removeGuest(guestEmail);
    
    // Mettre à jour la description pour supprimer le vote
    let description = event.getDescription() || '';
    const lines = description.split('\n');
    const filteredLines = lines.filter(line => !line.includes(guestEmail));
    event.setDescription(filteredLines.join('\n'));
    
    Logger.log('Invité supprimé: ' + guestEmail);
    return true;
  } catch (error) {
    Logger.log('Erreur suppression invité: ' + error.toString());
    return false;
  }
}