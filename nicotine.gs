/**
 * @OnlyCurrentDoc
 * Enregistre un timestamp et/ou renvoie les statistiques du jour.
 */
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    
    // Si l'appel n'est pas une simple demande de données, on enregistre un nouveau clic.
    if (e.parameter.action !== 'getData') {
        const columnAValues = sheet.getRange("A1:A").getValues();
        const nextRow = columnAValues.filter(String).length + 1;
        sheet.getRange(nextRow, 1).setValue(new Date());
    }

    // --- Calcul des statistiques (fait à chaque appel) ---
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Met l'heure à minuit pour la comparaison

    // Récupère toutes les valeurs de la colonne A et les filtre
    const allTimestamps = sheet.getRange("A1:A").getValues().flat().filter(Boolean);
    const todayTimestamps = allTimestamps.filter(ts => new Date(ts) >= today);

    let averageDurationInSeconds = 3600; // Valeur par défaut de 1 heure
    let lastClickTimestamp = null;

    // Trouve le dernier clic du jour
    if (todayTimestamps.length > 0) {
        lastClickTimestamp = new Date(todayTimestamps[todayTimestamps.length - 1]).toISOString();
    }

    // Calcule la moyenne des intervalles s'il y a eu au moins 2 clics aujourd'hui
    if (todayTimestamps.length > 1) {
      const intervals = [];
      for (let i = 1; i < todayTimestamps.length; i++) {
        const previous = new Date(todayTimestamps[i-1]);
        const current = new Date(todayTimestamps[i]);
        const diffInSeconds = (current.getTime() - previous.getTime()) / 1000;
        intervals.push(diffInSeconds);
      }
      const totalIntervals = intervals.reduce((sum, value) => sum + value, 0);
      averageDurationInSeconds = Math.round(totalIntervals / intervals.length);
    }

    // --- Réponse ---
    const response = {
      status: "success",
      lastClickTimestamp: lastClickTimestamp,
      averageDuration: averageDurationInSeconds
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
