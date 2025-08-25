/**
 * @OnlyCurrentDoc
 * Enregistre un timestamp et/ou renvoie les statistiques du jour.
 * La moyenne du jour est initialisée avec la moyenne de la veille.
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
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const allTimestamps = sheet.getRange("A1:A").getValues().flat().filter(Boolean);

    // 1. Calculer la moyenne de la veille pour l'utiliser comme valeur par défaut
    let defaultAverage = 3600; // Valeur par défaut de 1 heure si la veille est vide
    const yesterdayTimestamps = allTimestamps.filter(ts => {
        const d = new Date(ts);
        return d >= yesterday && d < today;
    });

    if (yesterdayTimestamps.length > 1) {
        const intervals = [];
        for (let i = 1; i < yesterdayTimestamps.length; i++) {
            const previous = new Date(yesterdayTimestamps[i-1]);
            const current = new Date(yesterdayTimestamps[i]);
            intervals.push((current.getTime() - previous.getTime()) / 1000);
        }
        const totalIntervals = intervals.reduce((sum, value) => sum + value, 0);
        defaultAverage = Math.round(totalIntervals / intervals.length);
    }

    // 2. Calculer les statistiques du jour
    const todayTimestamps = allTimestamps.filter(ts => new Date(ts) >= today);
    
    let averageDurationInSeconds = defaultAverage; // Initialise avec la moyenne de la veille
    let lastClickTimestamp = null;
    let dailyCount = todayTimestamps.length;

    if (dailyCount > 0) {
        lastClickTimestamp = new Date(todayTimestamps[dailyCount - 1]).toISOString();
    }

    // Calcule et écrase la moyenne si on a assez de données pour aujourd'hui
    if (dailyCount > 1) {
      const intervals = [];
      for (let i = 1; i < todayTimestamps.length; i++) {
        const previous = new Date(todayTimestamps[i-1]);
        const current = new Date(todayTimestamps[i]);
        intervals.push((current.getTime() - previous.getTime()) / 1000);
      }
      const totalIntervals = intervals.reduce((sum, value) => sum + value, 0);
      averageDurationInSeconds = Math.round(totalIntervals / intervals.length);
    }

    // --- Réponse ---
    const response = {
      status: "success",
      dailyCount: dailyCount,
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
