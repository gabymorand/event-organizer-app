function getSpreadsheet() {
  try {
    let spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    
    if (!spreadsheetId) {
      // Créer un nouveau spreadsheet
      const ss = SpreadsheetApp.create('Event Organizer Data');
      spreadsheetId = ss.getId();
      PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', spreadsheetId);
      
      // Configurer les feuilles
      setupSheets(ss);
      
      Logger.log('Nouveau spreadsheet créé: ' + spreadsheetId);
      return ss;
    }
    
    // Ouvrir le spreadsheet existant
    const ss = SpreadsheetApp.openById(spreadsheetId);
    
    // Vérifier que les feuilles existent
    if (!ss.getSheetByName('Events')) {
      setupSheets(ss);
    }
    
    return ss;
  } catch (error) {
    Logger.log('Erreur getSpreadsheet: ' + error.toString());
    
    // En cas d'erreur, créer un nouveau spreadsheet
    try {
      const ss = SpreadsheetApp.create('Event Organizer Data - Recovery');
      const newId = ss.getId();
      PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', newId);
      setupSheets(ss);
      return ss;
    } catch (recoveryError) {
      Logger.log('Erreur de récupération: ' + recoveryError.toString());
      throw new Error('Impossible de créer le spreadsheet');
    }
  }
}

function setupSheets(ss) {
  try {
    // Supprimer la feuille par défaut si elle existe
    const sheets = ss.getSheets();
    const defaultSheet = ss.getSheetByName('Feuille 1') || ss.getSheetByName('Sheet1');
    
    // Créer les feuilles nécessaires
    let eventsSheet = ss.getSheetByName('Events');
    if (!eventsSheet) {
      eventsSheet = ss.insertSheet('Events');
      eventsSheet.getRange(1, 1, 1, 7).setValues([['ID', 'Title', 'Date', 'Author', 'Description', 'Status', 'CalendarEventId']]);
    }
    
    let barsSheet = ss.getSheetByName('Bars');
    if (!barsSheet) {
      barsSheet = ss.insertSheet('Bars');
      barsSheet.getRange(1, 1, 1, 5).setValues([['ID', 'Name', 'Location', 'Description', 'AddedBy']]);
    }
    
    let karaokeSheet = ss.getSheetByName('Karaoke');
    if (!karaokeSheet) {
      karaokeSheet = ss.insertSheet('Karaoke');
      karaokeSheet.getRange(1, 1, 1, 5).setValues([['ID', 'Name', 'Location', 'Description', 'AddedBy']]);
    }
    
    let activitiesSheet = ss.getSheetByName('Activities');
    if (!activitiesSheet) {
      activitiesSheet = ss.insertSheet('Activities');
      activitiesSheet.getRange(1, 1, 1, 6).setValues([['ID', 'Name', 'Location', 'Duration', 'MaxPlayers', 'AddedBy']]);
    }
    
    let votesSheet = ss.getSheetByName('Votes');
    if (!votesSheet) {
      votesSheet = ss.insertSheet('Votes');
      votesSheet.getRange(1, 1, 1, 5).setValues([['ItemType', 'ItemID', 'VoteType', 'Timestamp', 'UserEmail']]);
    }
    
    // Supprimer la feuille par défaut après avoir créé les autres
    if (defaultSheet && ss.getSheets().length > 1) {
      try {
        ss.deleteSheet(defaultSheet);
      } catch (e) {
        Logger.log('Impossible de supprimer la feuille par défaut: ' + e.toString());
      }
    }
    
    Logger.log('Feuilles configurées avec succès');
  } catch (error) {
    Logger.log('Erreur setupSheets: ' + error.toString());
    throw error;
  }
}

function generateId() {
  return 'id_' + Utilities.getUuid().substring(0, 8);
}

// Fonction de test pour forcer l'initialisation
function initializeSpreadsheet() {
  try {
    const ss = getSpreadsheet();
    Logger.log('Spreadsheet initialisé: ' + ss.getUrl());
    return { success: true, url: ss.getUrl() };
  } catch (error) {
    Logger.log('Erreur initialisation: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}