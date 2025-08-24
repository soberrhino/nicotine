/**
 * @OnlyCurrentDoc
 * Cette fonction est exécutée lorsqu'une requête GET est envoyée à l'URL de l'application web.
 */
function doGet(e) {
  try {
    // Ouvre la feuille de calcul active et sélectionne la première feuille.
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    
    // --- NOUVELLE LOGIQUE ---
    // Récupère toutes les valeurs de la colonne A.
    const columnAValues = sheet.getRange("A1:A").getValues();
    // Compte le nombre de cellules non vides pour trouver la prochaine ligne libre.
    // C'est la méthode la plus fiable pour ignorer les colonnes avec des formules.
    const nextRow = columnAValues.filter(String).length + 1;
    
    // Crée un nouvel objet Date pour obtenir l'heure et la date actuelles.
    const timestamp = new Date();
    
    // Insère le timestamp dans la colonne A de la prochaine ligne vide.
    sheet.getRange(nextRow, 1).setValue(timestamp);
    
    // Prépare une réponse JSON pour indiquer que l'opération a réussi.
    const response = {
      status: "success",
      message: "Timestamp ajouté avec succès à la ligne " + nextRow,
      timestamp: timestamp.toISOString()
    };
    
    // Renvoie la réponse au format JSON.
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // En cas d'erreur, prépare une réponse d'erreur.
    const errorResponse = {
      status: "error",
      message: error.message
    };
    
    // Renvoie la réponse d'erreur au format JSON.
    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
