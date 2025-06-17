function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setTitle('Organisateur de Soirées');
}

function initializeData() {
  try {
    const ss = getSpreadsheet(); // Cela va créer le spreadsheet et les feuilles
    return { success: true, message: 'Données initialisées' };
  } catch (error) {
    return { success: false, message: error.toString() };
  }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
function debugSpreadsheet() {
  try {
    const ss = getSpreadsheet();
    const eventsSheet = ss.getSheetByName('Events');
    const data = eventsSheet.getDataRange().getValues();
    
    Logger.log('=== DEBUG SPREADSHEET ===');
    Logger.log('URL du spreadsheet: ' + ss.getUrl());
    Logger.log('Nombre de lignes dans Events: ' + data.length);
    Logger.log('Données Events:');
    data.forEach((row, index) => {
      Logger.log(`Ligne ${index}: ${JSON.stringify(row)}`);
    });
    
    return {
      url: ss.getUrl(),
      rowCount: data.length,
      data: data
    };
  } catch (error) {
    Logger.log('Erreur debug: ' + error.toString());
    return { error: error.toString() };
  }
}
function testCalendarPermissions() {
  try {
    const calendar = CalendarApp.getDefaultCalendar();
    Logger.log('Calendar accessible: ' + calendar.getName());
    
    // Test création événement
    const testEvent = calendar.createEvent(
      'Test Event Organizer', 
      new Date(Date.now() + 24*60*60*1000), // Demain
      new Date(Date.now() + 24*60*60*1000 + 2*60*60*1000) // +2h
    );
    
    Logger.log('Événement test créé: ' + testEvent.getId());
    
    // Test ajout invité
    const userEmail = Session.getActiveUser().getEmail();
    testEvent.addGuest(userEmail);
    
    Logger.log('Invité ajouté avec succès');
    
    // Nettoyer
    testEvent.deleteEvent();
    Logger.log('Événement test supprimé');
    
    return { success: true, message: 'Calendar permissions OK' };
  } catch (error) {
    Logger.log('Erreur permissions Calendar: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

// Test function
function test() {
  Logger.log('App is working!');
}