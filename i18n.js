'use strict';

// Sprachen der App. Deutsch ist die Grundsprache. Die deutschen Texte im Code und in index.html sind
// zugleich die Schlüssel für die Übersetzungen. tr('Gespeichert als {0}', 'v3.1') setzt Werte ein.

const LANGS_ALL = [['de', 'Deutsch'], ['en', 'English'], ['es', 'Español'], ['pt', 'Português'], ['fr', 'Français'], ['it', 'Italiano']];
// Zur Wahl stehen vorerst nur Deutsch und Englisch. Die übrigen Übersetzungen bleiben erhalten und lassen sich
// hier wieder freischalten, indem man ihr Kürzel in die Liste aufnimmt.
const LANGS_ON = ['de', 'en'];
const LANGS = LANGS_ALL.filter(([k]) => LANGS_ON.includes(k));
const LOCALE = { de: 'de-DE', en: 'en-GB', es: 'es-ES', pt: 'pt-BR', fr: 'fr-FR', it: 'it-IT' };
let lang = 'de';

// Jede Zeile: Deutsch, Englisch, Spanisch, Portugiesisch, Französisch, Italienisch
const TR_ROWS = [
  // Kopfzeile und Live
  ['Analyse', 'Analysis', 'Análisis', 'Análise', 'Analyse', 'Analisi'],
  ['Einstellungen', 'Settings', 'Ajustes', 'Configurações', 'Réglages', 'Impostazioni'],
  ['Start', 'Start', 'Iniciar', 'Iniciar', 'Démarrer', 'Avvia'],
  ['Stand', 'Build', 'Versión', 'Versão', 'Version', 'Versione'],
  ['Verzögerung', 'Delay', 'Retardo', 'Atraso', 'Délai', 'Ritardo'],
  ['Eine Sekunde weniger', 'One second less', 'Un segundo menos', 'Um segundo a menos', 'Une seconde de moins', 'Un secondo in meno'],
  ['Eine Sekunde mehr', 'One second more', 'Un segundo más', 'Um segundo a mais', 'Une seconde de plus', 'Un secondo in più'],
  ['Kamera', 'Camera', 'Cámara', 'Câmera', 'Caméra', 'Fotocamera'],
  ['Rückseite', 'Back', 'Trasera', 'Traseira', 'Arrière', 'Posteriore'],
  ['Vorderseite', 'Front', 'Frontal', 'Frontal', 'Avant', 'Anteriore'],
  ['Belichtung', 'Exposure', 'Exposición', 'Exposição', 'Exposition', 'Esposizione'],
  ['Manuell', 'Manual', 'Manual', 'Manual', 'Manuel', 'Manuale'],
  ['Helligkeit', 'Brightness', 'Brillo', 'Brilho', 'Luminosité', 'Luminosità'],
  ['Fokus', 'Focus', 'Enfoque', 'Foco', 'Mise au point', 'Messa a fuoco'],
  ['nah', 'near', 'cerca', 'perto', 'près', 'vicino'],
  ['fern', 'far', 'lejos', 'longe', 'loin', 'lontano'],
  ['Fokusabstand', 'Focus distance', 'Distancia de enfoque', 'Distância de foco', 'Distance de mise au point', 'Distanza di messa a fuoco'],
  ['Fokus Auto', 'Focus auto', 'Enfoque auto', 'Foco auto', 'Mise au point auto', 'Fuoco auto'],
  ['Fokus Manuell {0} m', 'Focus manual {0} m', 'Enfoque manual {0} m', 'Foco manual {0} m', 'Mise au point manuelle {0} m', 'Fuoco manuale {0} m'],
  ['EV Manuell', 'EV manual', 'EV manual', 'EV manual', 'EV manuel', 'EV manuale'],
  ['Kamera wird verbunden …', 'Connecting camera …', 'Conectando la cámara …', 'Conectando a câmera …', 'Connexion de la caméra …', 'Connessione alla fotocamera …'],
  ['Verbinde', 'Connecting', 'Conectando', 'Conectando', 'Connexion', 'Connessione'],
  ['Getrennt', 'Disconnected', 'Desconectada', 'Desconectada', 'Déconnectée', 'Disconnessa'],
  ['Dieser Browser unterstützt die nötigen Funktionen nicht.', 'This browser does not support the required features.', 'Este navegador no admite las funciones necesarias.', 'Este navegador não oferece os recursos necessários.', 'Ce navigateur ne prend pas en charge les fonctions nécessaires.', 'Questo browser non supporta le funzioni necessarie.'],
  ['Keine USB-Kamera erkannt.', 'No USB camera detected.', 'No se detectó ninguna cámara USB.', 'Nenhuma câmera USB detectada.', 'Aucune caméra USB détectée.', 'Nessuna fotocamera USB rilevata.'],
  ['Gefundene Kameras: {0}', 'Cameras found: {0}', 'Cámaras encontradas: {0}', 'Câmeras encontradas: {0}', 'Caméras trouvées : {0}', 'Fotocamere trovate: {0}'],
  ['ohne Namen', 'unnamed', 'sin nombre', 'sem nome', 'sans nom', 'senza nome'],
  ['keine', 'none', 'ninguna', 'nenhuma', 'aucune', 'nessuna'],
  ['Keine Verbindung zur Kamera. Der Zugriff ist nicht erlaubt.', 'No connection to the camera. Access is not allowed.', 'Sin conexión con la cámara. El acceso no está permitido.', 'Sem conexão com a câmera. O acesso não é permitido.', 'Pas de connexion à la caméra. L’accès n’est pas autorisé.', 'Nessuna connessione alla fotocamera. L’accesso non è consentito.'],
  ['Bitte in den Android-Einstellungen bei „{0}“ die Kamera erlauben.', 'Please allow the camera for “{0}” in the Android settings.', 'Permite la cámara para «{0}» en los ajustes de Android.', 'Permita a câmera para “{0}” nas configurações do Android.', 'Autorisez la caméra pour « {0} » dans les réglages Android.', 'Consenti la fotocamera per «{0}» nelle impostazioni di Android.'],
  ['Bitte in den Chrome-Einstellungen für diese Seite freigeben.', 'Please allow it for this page in the Chrome settings.', 'Permítelo para esta página en los ajustes de Chrome.', 'Permita para esta página nas configurações do Chrome.', 'Autorisez-la pour cette page dans les réglages de Chrome.', 'Consentila per questa pagina nelle impostazioni di Chrome.'],
  ['Keine Verbindung zur Kamera. Die App versucht es weiter.', 'No connection to the camera. The app keeps trying.', 'Sin conexión con la cámara. La app sigue intentándolo.', 'Sem conexão com a câmera. O app continua tentando.', 'Pas de connexion à la caméra. L’application continue d’essayer.', 'Nessuna connessione alla fotocamera. L’app continua a provare.'],
  ['Bild der USB-Kamera ließ sich nicht dekodieren.', 'The USB camera image could not be decoded.', 'No se pudo decodificar la imagen de la cámara USB.', 'Não foi possível decodificar a imagem da câmera USB.', 'Impossible de décoder l’image de la caméra USB.', 'Impossibile decodificare l’immagine della fotocamera USB.'],
  ['Die USB-Kamera antwortet nicht.', 'The USB camera does not respond.', 'La cámara USB no responde.', 'A câmera USB não responde.', 'La caméra USB ne répond pas.', 'La fotocamera USB non risponde.'],
  ['Bitte die Kamera anschließen.', 'Please connect the camera.', 'Conecta la cámara.', 'Conecte a câmera.', 'Veuillez brancher la caméra.', 'Collega la fotocamera.'],
  ['Die USB-Freigabe wurde abgelehnt.', 'USB access was denied.', 'Se denegó el acceso USB.', 'O acesso USB foi negado.', 'L’accès USB a été refusé.', 'L’accesso USB è stato negato.'],
  ['Die USB-Kamera ließ sich nicht öffnen.', 'The USB camera could not be opened.', 'No se pudo abrir la cámara USB.', 'Não foi possível abrir a câmera USB.', 'Impossible d’ouvrir la caméra USB.', 'Impossibile aprire la fotocamera USB.'],
  ['Die USB-Kamera wurde getrennt.', 'The USB camera was disconnected.', 'La cámara USB se desconectó.', 'A câmera USB foi desconectada.', 'La caméra USB a été déconnectée.', 'La fotocamera USB è stata scollegata.'],

  // Betrieb
  ['Zeitlupe', 'Slow motion', 'Cámara lenta', 'Câmera lenta', 'Ralenti', 'Rallentatore'],
  ['Video speichern', 'Save video', 'Guardar vídeo', 'Salvar vídeo', 'Enregistrer la vidéo', 'Salva video'],
  ['Puffer füllt sich noch', 'Buffer is still filling', 'El búfer aún se está llenando', 'O buffer ainda está enchendo', 'Le tampon se remplit encore', 'Il buffer si sta ancora riempiendo'],
  ['Nichts zu speichern', 'Nothing to save', 'Nada que guardar', 'Nada para salvar', 'Rien à enregistrer', 'Niente da salvare'],
  ['Gespeichert · {0}', 'Saved · {0}', 'Guardado · {0}', 'Salvo · {0}', 'Enregistré · {0}', 'Salvato · {0}'],
  ['Speichern fehlgeschlagen', 'Saving failed', 'Error al guardar', 'Falha ao salvar', 'Échec de l’enregistrement', 'Salvataggio non riuscito'],

  // Übersicht
  ['Videos', 'Videos', 'Vídeos', 'Vídeos', 'Vidéos', 'Video'],
  ['Bilder', 'Images', 'Imágenes', 'Imagens', 'Images', 'Immagini'],
  ['Nur mit Stern', 'Starred only', 'Solo con estrella', 'Só com estrela', 'Favoris uniquement', 'Solo con stella'],
  ['Name', 'Name', 'Nombre', 'Nome', 'Nom', 'Nome'],
  ['Stichwort', 'Keyword', 'Palabra clave', 'Palavra-chave', 'Mot-clé', 'Parola chiave'],
  ['Ansicht', 'View', 'Vista', 'Visualização', 'Affichage', 'Vista'],
  ['Tage', 'Days', 'Días', 'Dias', 'Jours', 'Giorni'],
  ['Wochen', 'Weeks', 'Semanas', 'Semanas', 'Semaines', 'Settimane'],
  ['Monate', 'Months', 'Meses', 'Meses', 'Mois', 'Mesi'],
  ['Diese Woche', 'This week', 'Esta semana', 'Esta semana', 'Cette semaine', 'Questa settimana'],
  ['Letzte Woche', 'Last week', 'La semana pasada', 'Semana passada', 'La semaine dernière', 'La settimana scorsa'],
  ['Dieser Monat', 'This month', 'Este mes', 'Este mês', 'Ce mois-ci', 'Questo mese'],
  ['Letzter Monat', 'Last month', 'El mes pasado', 'Mês passado', 'Le mois dernier', 'Il mese scorso'],
  ['KW {0}', 'Week {0}', 'Semana {0}', 'Semana {0}', 'Semaine {0}', 'Settimana {0}'],
  ['Vergleichen', 'Compare', 'Comparar', 'Comparar', 'Comparer', 'Confronta'],
  ['Vergleiche', 'Comparisons', 'Comparaciones', 'Comparações', 'Comparaisons', 'Confronti'],
  ['Öffnen ({0})', 'Open ({0})', 'Abrir ({0})', 'Abrir ({0})', 'Ouvrir ({0})', 'Apri ({0})'],
  ['Heute', 'Today', 'Hoy', 'Hoje', 'Aujourd’hui', 'Oggi'],
  ['Gestern', 'Yesterday', 'Ayer', 'Ontem', 'Hier', 'Ieri'],
  ['Keine Bilder für diese Auswahl.', 'No images for this selection.', 'No hay imágenes para esta selección.', 'Nenhuma imagem para esta seleção.', 'Aucune image pour cette sélection.', 'Nessuna immagine per questa selezione.'],
  ['Noch keine Bilder gespeichert.', 'No images saved yet.', 'Aún no hay imágenes guardadas.', 'Nenhuma imagem salva ainda.', 'Aucune image enregistrée pour l’instant.', 'Nessuna immagine salvata finora.'],
  ['Keine Videos für diese Auswahl.', 'No videos for this selection.', 'No hay vídeos para esta selección.', 'Nenhum vídeo para esta seleção.', 'Aucune vidéo pour cette sélection.', 'Nessun video per questa selezione.'],
  ['Noch keine Videos gespeichert.', 'No videos saved yet.', 'Aún no hay vídeos guardados.', 'Nenhum vídeo salvo ainda.', 'Aucune vidéo enregistrée pour l’instant.', 'Nessun video salvato finora.'],
  ['Stern', 'Star', 'Estrella', 'Estrela', 'Étoile', 'Stella'],
  ['1 Bild', '1 image', '1 imagen', '1 imagem', '1 image', '1 immagine'],
  ['{0} Bilder', '{0} images', '{0} imágenes', '{0} imagens', '{0} images', '{0} immagini'],

  // Videofenster
  ['‹ Übersicht', '‹ Overview', '‹ Lista', '‹ Lista', '‹ Liste', '‹ Elenco'],
  ['‹ Wiedergabe', '‹ Playback', '‹ Reproducción', '‹ Reprodução', '‹ Lecture', '‹ Riproduzione'],
  ['Video', 'Video', 'Vídeo', 'Vídeo', 'Vidéo', 'Video'],
  ['Herunterladen', 'Download', 'Descargar', 'Baixar', 'Télécharger', 'Scarica'],
  ['Löschen', 'Delete', 'Eliminar', 'Excluir', 'Supprimer', 'Elimina'],
  ['Ja, löschen', 'Yes, delete', 'Sí, eliminar', 'Sim, excluir', 'Oui, supprimer', 'Sì, elimina'],
  ['Zurück', 'Back', 'Atrás', 'Voltar', 'Retour', 'Indietro'],
  ['Weiter', 'Next', 'Siguiente', 'Próximo', 'Suivant', 'Avanti'],
  ['Stift', 'Pen', 'Lápiz', 'Caneta', 'Stylo', 'Penna'],
  ['Linie', 'Line', 'Línea', 'Linha', 'Ligne', 'Linea'],
  ['Winkel', 'Angle', 'Ángulo', 'Ângulo', 'Angle', 'Angolo'],
  ['Lot', 'Plumb', 'Plomada', 'Prumo', 'Aplomb', 'Piombo'],
  ['Waage', 'Level', 'Nivel', 'Nível', 'Niveau', 'Livella'],
  ['Bogen', 'Arc', 'Arco', 'Arco', 'Arc', 'Arco'],
  ['Kreis', 'Circle', 'Círculo', 'Círculo', 'Cercle', 'Cerchio'],
  ['Raster', 'Grid', 'Cuadrícula', 'Grade', 'Grille', 'Griglia'],
  ['Bewegungsanalyse', 'Motion Analysis', 'Análisis del movimiento', 'Análise de movimento', 'Analyse du mouvement', 'Analisi del movimento'],
  ['Filter zurücksetzen', 'Reset filters', 'Restablecer filtros', 'Repor filtros', 'Réinitialiser les filtres', 'Azzera filtri'],
  ['Farbe', 'Color', 'Color', 'Cor', 'Couleur', 'Colore'],
  ['Schneiden', 'Trim', 'Recortar', 'Cortar', 'Couper', 'Taglia'],
  ['Bildfolge', 'Sequence', 'Secuencia', 'Sequência', 'Séquence', 'Sequenza'],
  ['Rückgängig', 'Undo', 'Deshacer', 'Desfazer', 'Défaire', 'Annulla'],
  ['Leeren', 'Clear', 'Borrar', 'Limpar', 'Effacer', 'Cancella'],
  ['Speichern', 'Save', 'Guardar', 'Salvar', 'Enregistrer', 'Salva'],
  ['Weniger Bilder', 'Fewer images', 'Menos imágenes', 'Menos imagens', 'Moins d’images', 'Meno immagini'],
  ['Mehr Bilder', 'More images', 'Más imágenes', 'Mais imagens', 'Plus d’images', 'Più immagini'],
  ['Abbrechen', 'Cancel', 'Cancelar', 'Cancelar', 'Annuler', 'Interrompi'],
  ['Ein Bild zurück', 'One frame back', 'Un fotograma atrás', 'Um quadro para trás', 'Une image en arrière', 'Un fotogramma indietro'],
  ['Ein Bild vor', 'One frame forward', 'Un fotograma adelante', 'Um quadro para frente', 'Une image en avant', 'Un fotogramma avanti'],
  ['Abspielen', 'Play', 'Reproducir', 'Reproduzir', 'Lire', 'Riproduci'],
  ['Wiederholen', 'Repeat', 'Repetir', 'Repetir', 'Répéter', 'Ripeti'],
  ['Geschwindigkeit', 'Speed', 'Velocidad', 'Velocidade', 'Vitesse', 'Velocità'],
  ['Anhalten', 'Pause', 'Pausa', 'Pausar', 'Pause', 'Pausa'],
  ['Position', 'Position', 'Posición', 'Posição', 'Position', 'Posizione'],
  ['Erstellen', 'Create', 'Crear', 'Criar', 'Créer', 'Crea'],
  ['Länge {0}', 'Length {0}', 'Duración {0}', 'Duração {0}', 'Durée {0}', 'Durata {0}'],
  ['Wird geschnitten …', 'Trimming …', 'Recortando …', 'Cortando …', 'Découpage …', 'Taglio …'],
  ['Wird erstellt …', 'Creating …', 'Creando …', 'Criando …', 'Création …', 'Creazione …'],
  ['Fehler', 'Error', 'Error', 'Erro', 'Erreur', 'Errore'],
  ['Bildfolge · {0} Bilder', 'Sequence · {0} images', 'Secuencia · {0} imágenes', 'Sequência · {0} imagens', 'Séquence · {0} images', 'Sequenza · {0} immagini'],
  ['Wird gespeichert …', 'Saving …', 'Guardando …', 'Salvando …', 'Enregistrement …', 'Salvataggio …'],
  ['Gespeichert', 'Saved', 'Guardado', 'Salvo', 'Enregistré', 'Salvato'],
  ['Gespeichert als {0}', 'Saved as {0}', 'Guardado como {0}', 'Salvo como {0}', 'Enregistré sous {0}', 'Salvato come {0}'],
  ['Im Download-Ordner gespeichert', 'Saved to the Downloads folder', 'Guardado en la carpeta Descargas', 'Salvo na pasta Downloads', 'Enregistré dans le dossier Téléchargements', 'Salvato nella cartella Download'],
  ['Vergleich · {0}', 'Comparison · {0}', 'Comparación · {0}', 'Comparação · {0}', 'Comparaison · {0}', 'Confronto · {0}'],
  ['Stelle in {0}', 'Position in {0}', 'Posición en {0}', 'Posição em {0}', 'Position dans {0}', 'Posizione in {0}'],

  // Fenster Einstellungen
  ['Sprache', 'Language', 'Idioma', 'Idioma', 'Langue', 'Lingua'],
  ['Farbe frei wählen', 'Choose any color', 'Elegir un color', 'Escolher uma cor', 'Choisir une couleur', 'Scegli un colore'],
  ['Eigene Farbe', 'Custom color', 'Color propio', 'Cor própria', 'Couleur personnalisée', 'Colore personale'],
  ['Übernehmen', 'Apply', 'Aplicar', 'Aplicar', 'Appliquer', 'Applica'],
  ['Modus', 'Mode', 'Modo', 'Modo', 'Mode', 'Modalità'],
  ['Dunkel', 'Dark', 'Oscuro', 'Escuro', 'Sombre', 'Scuro'],
  ['Mittel', 'Medium', 'Medio', 'Médio', 'Moyen', 'Medio'],
  ['Hell', 'Light', 'Claro', 'Claro', 'Clair', 'Chiaro'],
  ['Größe', 'Size', 'Tamaño', 'Tamanho', 'Taille', 'Dimensione'],
  ['klein', 'small', 'pequeño', 'pequeno', 'petit', 'piccolo'],
  ['groß', 'large', 'grande', 'grande', 'grand', 'grande'],
  ['mittel', 'medium', 'mediano', 'médio', 'moyen', 'medio'],
  ['Größe der Bedienung', 'Size of the controls', 'Tamaño de los controles', 'Tamanho dos controles', 'Taille des commandes', 'Dimensione dei comandi'],
  ['Bildschirm', 'Screen', 'Pantalla', 'Tela', 'Écran', 'Schermo'],
  ['Anpassen …', 'Adjust …', 'Ajustar …', 'Ajustar …', 'Ajuster …', 'Regola …'],
  ['Videos ohne Stern löschen', 'Delete videos without star', 'Eliminar vídeos sin estrella', 'Excluir vídeos sem estrela', 'Supprimer les vidéos sans étoile', 'Elimina i video senza stella'],
  ['nach', 'after', 'tras', 'após', 'après', 'dopo'],
  ['nie', 'never', 'nunca', 'nunca', 'jamais', 'mai'],
  ['1 Tag', '1 day', '1 día', '1 dia', '1 jour', '1 giorno'],
  ['{0} Tagen', '{0} days', '{0} días', '{0} dias', '{0} jours', '{0} giorni'],
  ['Ein Tag weniger', 'One day less', 'Un día menos', 'Um dia a menos', 'Un jour de moins', 'Un giorno in meno'],
  ['Ein Tag mehr', 'One day more', 'Un día más', 'Um dia a mais', 'Un jour de plus', 'Un giorno in più'],
  ['Belegter Speicher {0} MB', 'Storage used {0} MB', 'Almacenamiento usado {0} MB', 'Armazenamento usado {0} MB', 'Stockage utilisé {0} Mo', 'Spazio occupato {0} MB'],
  ['Videos löschen …', 'Delete videos …', 'Eliminar vídeos …', 'Excluir vídeos …', 'Supprimer des vidéos …', 'Elimina video …'],
  ['Videos löschen', 'Delete videos', 'Eliminar vídeos', 'Excluir vídeos', 'Supprimer des vidéos', 'Elimina video'],
  ['Welche Videos sollen gelöscht werden?', 'Which videos should be deleted?', '¿Qué vídeos quieres eliminar?', 'Quais vídeos devem ser excluídos?', 'Quelles vidéos faut-il supprimer ?', 'Quali video vuoi eliminare?'],
  ['Ohne Stern löschen', 'Delete without star', 'Eliminar sin estrella', 'Excluir sem estrela', 'Supprimer sans étoile', 'Elimina senza stella'],
  ['Ohne Stern löschen ({0})', 'Delete without star ({0})', 'Eliminar sin estrella ({0})', 'Excluir sem estrela ({0})', 'Supprimer sans étoile ({0})', 'Elimina senza stella ({0})'],
  ['Alle löschen', 'Delete all', 'Eliminar todo', 'Excluir tudo', 'Tout supprimer', 'Elimina tutto'],
  ['Alle löschen ({0})', 'Delete all ({0})', 'Eliminar todo ({0})', 'Excluir tudo ({0})', 'Tout supprimer ({0})', 'Elimina tutto ({0})'],
  ['1 Video', '1 video', '1 vídeo', '1 vídeo', '1 vidéo', '1 video'],
  ['{0} Videos', '{0} videos', '{0} vídeos', '{0} vídeos', '{0} vidéos', '{0} video'],
  [' mit 1 Bild', ' with 1 image', ' con 1 imagen', ' com 1 imagem', ' avec 1 image', ' con 1 immagine'],
  [' mit {0} Bildern', ' with {0} images', ' con {0} imágenes', ' com {0} imagens', ' avec {0} images', ' con {0} immagini'],
  ['{0} ohne Stern{1} wirklich löschen? Das lässt sich nicht rückgängig machen.', 'Really delete {0} without star{1}? This cannot be undone.', '¿Eliminar de verdad {0} sin estrella{1}? No se puede deshacer.', 'Excluir mesmo {0} sem estrela{1}? Isso não pode ser desfeito.', 'Vraiment supprimer {0} sans étoile{1} ? Cette action est irréversible.', 'Eliminare davvero {0} senza stella{1}? L’operazione non si può annullare.'],
  ['{0}{1} wirklich löschen, auch mit Stern? Das lässt sich nicht rückgängig machen.', 'Really delete {0}{1}, even with a star? This cannot be undone.', '¿Eliminar de verdad {0}{1}, aunque tenga estrella? No se puede deshacer.', 'Excluir mesmo {0}{1}, mesmo com estrela? Isso não pode ser desfeito.', 'Vraiment supprimer {0}{1}, même avec une étoile ? Cette action est irréversible.', 'Eliminare davvero {0}{1}, anche con stella? L’operazione non si può annullare.'],
  ['Wirklich alle {0}{1} löschen, auch die mit Stern? Das lässt sich nicht rückgängig machen.', 'Really delete all {0}{1}, including starred ones? This cannot be undone.', '¿Eliminar de verdad los {0}{1}, también los que tienen estrella? No se puede deshacer.', 'Excluir mesmo todos os {0}{1}, inclusive os com estrela? Isso não pode ser desfeito.', 'Vraiment supprimer les {0}{1}, y compris ceux avec étoile ? Cette action est irréversible.', 'Eliminare davvero tutti i {0}{1}, anche quelli con stella? L’operazione non si può annullare.'],
  ['1 Video ohne Stern', '1 video without star', '1 vídeo sin estrella', '1 vídeo sem estrela', '1 vidéo sans étoile', '1 video senza stella'],
  ['{0} Videos ohne Stern', '{0} videos without star', '{0} vídeos sin estrella', '{0} vídeos sem estrela', '{0} vidéos sans étoile', '{0} video senza stella'],
  ['1 Vergleichsbild ohne Stern', '1 comparison image without star', '1 imagen de comparación sin estrella', '1 imagem de comparação sem estrela', '1 image de comparaison sans étoile', '1 immagine di confronto senza stella'],
  ['{0} Vergleichsbilder ohne Stern', '{0} comparison images without star', '{0} imágenes de comparación sin estrella', '{0} imagens de comparação sem estrela', '{0} images de comparaison sans étoile', '{0} immagini di confronto senza stella'],
  [' und ', ' and ', ' y ', ' e ', ' et ', ' e '],
  ['Bei {0} wird {1} sofort gelöscht, weil es älter ist. Das lässt sich nicht rückgängig machen.', 'With {0}, {1} will be deleted right away because it is older. This cannot be undone.', 'Con {0} se eliminará de inmediato {1}, porque es más antiguo. No se puede deshacer.', 'Com {0}, {1} será excluído imediatamente, porque é mais antigo. Isso não pode ser desfeito.', 'Avec {0}, {1} sera supprimé immédiatement, car plus ancien. Cette action est irréversible.', 'Con {0}, {1} verrà eliminato subito perché più vecchio. L’operazione non si può annullare.'],
  ['Bei {0} werden {1} sofort gelöscht, weil sie älter sind. Das lässt sich nicht rückgängig machen.', 'With {0}, {1} will be deleted right away because they are older. This cannot be undone.', 'Con {0} se eliminarán de inmediato {1}, porque son más antiguos. No se puede deshacer.', 'Com {0}, {1} serão excluídos imediatamente, porque são mais antigos. Isso não pode ser desfeito.', 'Avec {0}, {1} seront supprimés immédiatement, car plus anciens. Cette action est irréversible.', 'Con {0}, {1} verranno eliminati subito perché più vecchi. L’operazione non si può annullare.'],

  // Bildschirm anpassen
  ['Bildschirm anpassen', 'Adjust screen', 'Ajustar pantalla', 'Ajustar tela', 'Ajuster l’écran', 'Regola schermo'],
  ['Am Fernseher den Zoom einstellen. Dann den Rahmen verkleinern, bis auf dem Fernseher alle vier Ecken ganz zu sehen sind.', 'Set the zoom on the TV. Then shrink the frame until all four corners are fully visible on the TV.', 'Ajusta el zoom en el televisor. Luego reduce el marco hasta que las cuatro esquinas se vean completas en el televisor.', 'Ajuste o zoom na TV. Depois reduza a moldura até que os quatro cantos fiquem totalmente visíveis na TV.', 'Réglez le zoom sur le téléviseur. Réduisez ensuite le cadre jusqu’à ce que les quatre coins soient entièrement visibles sur le téléviseur.', 'Imposta lo zoom sul televisore. Poi riduci la cornice finché tutti e quattro gli angoli sono completamente visibili sul televisore.'],
  ['Breite', 'Width', 'Ancho', 'Largura', 'Largeur', 'Larghezza'],
  ['Höhe', 'Height', 'Alto', 'Altura', 'Hauteur', 'Altezza'],
  ['Links, rechts', 'Left, right', 'Izquierda, derecha', 'Esquerda, direita', 'Gauche, droite', 'Sinistra, destra'],
  ['Oben, unten', 'Up, down', 'Arriba, abajo', 'Cima, baixo', 'Haut, bas', 'Su, giù'],
  ['Breite weniger', 'Less width', 'Menos ancho', 'Menos largura', 'Moins de largeur', 'Meno larghezza'],
  ['Breite mehr', 'More width', 'Más ancho', 'Mais largura', 'Plus de largeur', 'Più larghezza'],
  ['Höhe weniger', 'Less height', 'Menos alto', 'Menos altura', 'Moins de hauteur', 'Meno altezza'],
  ['Höhe mehr', 'More height', 'Más alto', 'Mais altura', 'Plus de hauteur', 'Più altezza'],
  ['Links, rechts weniger', 'Further left', 'Más a la izquierda', 'Mais à esquerda', 'Plus à gauche', 'Più a sinistra'],
  ['Links, rechts mehr', 'Further right', 'Más a la derecha', 'Mais à direita', 'Plus à droite', 'Più a destra'],
  ['Oben, unten weniger', 'Further up', 'Más arriba', 'Mais para cima', 'Plus haut', 'Più su'],
  ['Oben, unten mehr', 'Further down', 'Más abajo', 'Mais para baixo', 'Plus bas', 'Più giù'],
  ['Zurücksetzen', 'Reset', 'Restablecer', 'Redefinir', 'Réinitialiser', 'Ripristina'],
  ['Fertig', 'Done', 'Listo', 'Concluído', 'Terminé', 'Fatto'],
];

const TR = {};
LANGS_ALL.forEach(([l], i) => {
  if (i === 0) return;
  TR[l] = {};
  for (const row of TR_ROWS) TR[l][row[0]] = row[i];
});
const TR_KEYS = new Set(TR_ROWS.map(r => r[0]));
// Von jeder Übersetzung zurück zum deutschen Schlüssel, für Texte, die schon übersetzt auf der Seite stehen
const TR_REV = new Map();
for (const row of TR_ROWS) for (const s of row) if (!TR_REV.has(s)) TR_REV.set(s, row[0]);

function tr(key, ...args) {
  const s = (TR[lang] && TR[lang][key]) || key;
  return args.length ? s.replace(/\{(\d)\}/g, (_, i) => args[i]) : s;
}

// Dezimalzeichen: Punkt im Englischen, sonst Komma
const dc = s => (lang === 'en' ? String(s) : String(s).replace('.', ','));

// Sprache des Geräts beim ersten Start, sonst Englisch
function deviceLang() {
  const l = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return LANGS.some(([k]) => k === l) ? l : 'en';
}

// Übersetzt alle festen Texte der Seite, auch Beschriftungen für Bildschirmleser und Platzhalter.
// Der deutsche Schlüssel jedes Textes wird gemerkt, damit ein späterer Wechsel wieder von ihm ausgeht.
const trNode = new WeakMap(), trAttr = new WeakMap();
const TR_ATTRS = ['aria-label', 'placeholder', 'title'];
function translatePage(root = document.body) {
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    // Namen und Stichwörter der Nutzer bleiben, wie sie sind, auch wenn eines wie ein Wort der App lautet
    acceptNode: n => (!n.parentElement || /^(SCRIPT|STYLE)$/.test(n.parentElement.tagName) || n.parentElement.closest('[data-notr]')
      ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const raw = n.nodeValue, txt = raw.trim();
    if (!txt) continue;
    const key = trNode.get(n) || (TR_KEYS.has(txt) ? txt : TR_REV.get(txt));
    if (!key) continue;
    trNode.set(n, key);
    const out = tr(key);
    if (out !== txt) n.nodeValue = raw.replace(txt, out);
  }
  for (const el of root.querySelectorAll('[aria-label], [placeholder], [title]')) {
    if (el.closest('[data-notr]') && !el.hasAttribute('data-notr')) continue;
    let keys = trAttr.get(el);
    if (!keys) { keys = {}; trAttr.set(el, keys); }
    for (const a of TR_ATTRS) {
      const v = el.getAttribute(a);
      if (!v) continue;
      const key = keys[a] || (TR_KEYS.has(v) ? v : TR_REV.get(v));
      if (!key) continue;
      keys[a] = key;
      el.setAttribute(a, tr(key));
    }
  }
  document.documentElement.lang = lang;
}
