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

// Test function
function test() {
  Logger.log('App is working!');
}