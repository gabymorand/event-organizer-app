function recordVote(itemType, itemId, voteType) {
  try {
    const ss = getSpreadsheet();
    const votesSheet = ss.getSheetByName('Votes');
    const userEmail = Session.getActiveUser().getEmail() || 'anonymous';
    
    const data = votesSheet.getDataRange().getValues();
    let existingVoteRow = -1;
    
    // Chercher si l'utilisateur a déjà voté
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === itemType && data[i][1] === itemId && data[i][4] === userEmail) {
        existingVoteRow = i + 1;
        break;
      }
    }
    
    const timestamp = new Date();
    
    if (existingVoteRow > -1) {
      // Mettre à jour le vote existant
      votesSheet.getRange(existingVoteRow, 3).setValue(voteType);
      votesSheet.getRange(existingVoteRow, 4).setValue(timestamp);
    } else {
      // Nouveau vote
      votesSheet.appendRow([itemType, itemId, voteType, timestamp, userEmail]);
    }
    
    // Si c'est un vote pour un événement, mettre à jour Google Calendar
    if (itemType === 'event' && userEmail !== 'anonymous') {
      const calendarEventId = getEventCalendarId(itemId);
      if (calendarEventId) {
        try {
          addGuestToEvent(calendarEventId, userEmail, voteType);
          Logger.log(`Invité ajouté au Calendar: ${userEmail} - ${voteType}`);
        } catch (error) {
          Logger.log('Erreur ajout Calendar: ' + error.toString());
        }
      }
    }
    
    Logger.log(`Vote enregistré: ${itemType}_${itemId} = ${voteType} par ${userEmail}`);
    
    return { success: true };
  } catch (error) {
    Logger.log('Erreur recordVote: ' + error.toString());
    throw new Error('Erreur lors du vote');
  }
}

function getVoteCounts() {
  try {
    const ss = getSpreadsheet();
    const votesSheet = ss.getSheetByName('Votes');
    const data = votesSheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return {};
    }
    
    const allCounts = {};
    
    // 🔧 FIX: Compter seulement le dernier vote de chaque utilisateur
    const userLastVotes = new Map(); // "itemType_itemId_email" -> { vote, timestamp }
    
    // D'abord, trouver le dernier vote de chaque utilisateur pour chaque item
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row && row.length >= 5) {
        const itemType = row[0];
        const itemId = row[1];
        const vote = row[2];
        const timestamp = row[3];
        const email = row[4];
        
        const userKey = `${itemType}_${itemId}_${email}`;
        
        if (!userLastVotes.has(userKey) || new Date(timestamp) > new Date(userLastVotes.get(userKey).timestamp)) {
          userLastVotes.set(userKey, {
            itemType: itemType,
            itemId: itemId,
            vote: vote,
            timestamp: timestamp,
            email: email
          });
        }
      }
    }
    
    // Maintenant compter les votes finaux
    for (const voteData of userLastVotes.values()) {
      const key = voteData.itemType + '_' + voteData.itemId;
      const voteType = voteData.vote;
      
      if (!allCounts[key]) {
        allCounts[key] = {};
      }
      allCounts[key][voteType] = (allCounts[key][voteType] || 0) + 1;
    }
    
    Logger.log('Vote counts calculés:', JSON.stringify(allCounts));
    return allCounts;
  } catch (error) {
    Logger.log('Erreur getVoteCounts: ' + error.toString());
    return {};
  }
}