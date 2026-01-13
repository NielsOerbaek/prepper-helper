export type Language = "da" | "en";

export const translations = {
  // App
  "app.name": {
    da: "Prepperhjælper",
    en: "Prepper Helper",
  },

  // Navigation
  "nav.dashboard": {
    da: "Oversigt",
    en: "Dashboard",
  },
  "nav.scanner": {
    da: "Scanner",
    en: "Scanner",
  },
  "nav.inventory": {
    da: "Beholdning",
    en: "Inventory",
  },
  "nav.checklist": {
    da: "Tjekliste",
    en: "Checklist",
  },
  "nav.expiringSoon": {
    da: "Udløber snart",
    en: "Expiring Soon",
  },
  "nav.settings": {
    da: "Indstillinger",
    en: "Settings",
  },

  // Auth
  "auth.welcomeBack": {
    da: "Velkommen tilbage",
    en: "Welcome back",
  },
  "auth.signIn": {
    da: "Log ind",
    en: "Sign in",
  },
  "auth.signInDescription": {
    da: "Log ind på din Emergency Food Tracker konto",
    en: "Sign in to your Emergency Food Tracker account",
  },
  "auth.signInWithPromise": {
    da: "Log ind med Promise",
    en: "Sign in with Promise",
  },
  "auth.signUpWithPromise": {
    da: "Opret konto med Promise",
    en: "Sign up with Promise",
  },
  "auth.orContinueWith": {
    da: "Eller fortsæt med email",
    en: "Or continue with email",
  },
  "auth.email": {
    da: "Email",
    en: "Email",
  },
  "auth.password": {
    da: "Adgangskode",
    en: "Password",
  },
  "auth.enterPassword": {
    da: "Indtast din adgangskode",
    en: "Enter your password",
  },
  "auth.createPassword": {
    da: "Opret en adgangskode",
    en: "Create a password",
  },
  "auth.noAccount": {
    da: "Har du ikke en konto?",
    en: "Don't have an account?",
  },
  "auth.signUp": {
    da: "Opret konto",
    en: "Sign up",
  },
  "auth.createAccount": {
    da: "Opret konto",
    en: "Create account",
  },
  "auth.createAccountDescription": {
    da: "Opret en konto for at starte med at tracke dine forsyninger",
    en: "Create an account to start tracking your emergency supplies",
  },
  "auth.name": {
    da: "Navn",
    en: "Name",
  },
  "auth.yourName": {
    da: "Dit navn",
    en: "Your name",
  },
  "auth.confirmPassword": {
    da: "Bekræft adgangskode",
    en: "Confirm password",
  },
  "auth.confirmYourPassword": {
    da: "Bekræft din adgangskode",
    en: "Confirm your password",
  },
  "auth.haveAccount": {
    da: "Har du allerede en konto?",
    en: "Already have an account?",
  },
  "auth.signOut": {
    da: "Log ud",
    en: "Sign out",
  },
  "auth.invalidCredentials": {
    da: "Ugyldig email eller adgangskode",
    en: "Invalid email or password",
  },
  "auth.unexpectedError": {
    da: "Der opstod en uventet fejl",
    en: "An unexpected error occurred",
  },
  "auth.promiseFailed": {
    da: "Kunne ikke forbinde til Promise Authentication",
    en: "Failed to connect to Promise Authentication",
  },
  "auth.registrationFailed": {
    da: "Registrering fejlede",
    en: "Registration failed",
  },
  "auth.registrationSuccessLoginFailed": {
    da: "Registrering lykkedes, men login fejlede. Prøv at logge ind igen.",
    en: "Registration successful, but login failed. Please try logging in.",
  },

  // Dashboard
  "dashboard.title": {
    da: "Oversigt",
    en: "Dashboard",
  },
  "dashboard.welcome": {
    da: "Velkommen",
    en: "Welcome",
  },
  "dashboard.totalItems": {
    da: "Antal varer",
    en: "Total Items",
  },
  "dashboard.itemsInInventory": {
    da: "Varer i dit lager",
    en: "Items in your inventory",
  },
  "dashboard.expiringThisWeek": {
    da: "Udløber denne uge",
    en: "Expiring This Week",
  },
  "dashboard.itemsExpiring7Days": {
    da: "Varer der udløber inden for 7 dage",
    en: "Items expiring within 7 days",
  },
  "dashboard.expired": {
    da: "Udløbet",
    en: "Expired",
  },
  "dashboard.categories": {
    da: "Kategorier",
    en: "Categories",
  },
  "dashboard.checklistProgress": {
    da: "Tjekliste fremgang",
    en: "Checklist Progress",
  },
  "dashboard.itemsChecked": {
    da: "varer afkrydset",
    en: "items checked",
  },
  "dashboard.quickActions": {
    da: "Hurtige handlinger",
    en: "Quick Actions",
  },
  "dashboard.quickActionsDescription": {
    da: "Almindelige opgaver du kan udføre",
    en: "Common tasks you can perform",
  },
  "dashboard.scanItem": {
    da: "Scan vare",
    en: "Scan Item",
  },
  "dashboard.scanAnItem": {
    da: "Scan en vare",
    en: "Scan an item",
  },
  "dashboard.scanNewItem": {
    da: "Scan ny vare",
    en: "Scan new item",
  },
  "dashboard.startScanner": {
    da: "Start scanner",
    en: "Start scanner",
  },
  "dashboard.addManually": {
    da: "Tilføj manuelt",
    en: "Add Manually",
  },
  "dashboard.viewChecklist": {
    da: "Se tjekliste",
    en: "View Checklist",
  },
  "dashboard.reviewChecklist": {
    da: "Gennemgå tjekliste",
    en: "Review checklist",
  },
  "dashboard.checkExpiringItems": {
    da: "Tjek udløbende varer",
    en: "Check expiring items",
  },
  "dashboard.scanDescription": {
    da: "Tag et billede af en vare for at tilføje den til dit lager",
    en: "Take a photo of an item to add it to your inventory",
  },
  "dashboard.recentItems": {
    da: "Seneste varer",
    en: "Recent Items",
  },
  "dashboard.recentItemsDescription": {
    da: "Dine senest tilføjede varer",
    en: "Your most recently added items",
  },
  "dashboard.viewAllItems": {
    da: "Se alle varer",
    en: "View all items",
  },
  "dashboard.noItemsYet": {
    da: "Ingen varer endnu",
    en: "No items yet",
  },
  "dashboard.addFirstItem": {
    da: "Tilføj din første vare",
    en: "Add your first item",
  },

  // Inventory
  "inventory.title": {
    da: "Beholdning",
    en: "Inventory",
  },
  "inventory.addItem": {
    da: "Tilføj vare",
    en: "Add Item",
  },
  "inventory.search": {
    da: "Søg i varer...",
    en: "Search items...",
  },
  "inventory.allCategories": {
    da: "Alle kategorier",
    en: "All categories",
  },
  "inventory.noItems": {
    da: "Ingen varer i din beholdning endnu",
    en: "No items in your inventory yet",
  },
  "inventory.noMatch": {
    da: "Ingen varer matcher dine filtre",
    en: "No items match your filters",
  },
  "inventory.addFirstItem": {
    da: "Tilføj din første vare",
    en: "Add your first item",
  },
  "inventory.editItem": {
    da: "Rediger vare",
    en: "Edit Item",
  },
  "inventory.scan": {
    da: "Scan",
    en: "Scan",
  },
  "inventory.scannedItem": {
    da: "Scannet vare",
    en: "Scanned Item",
  },
  "inventory.deleteItem": {
    da: "Slet vare",
    en: "Delete Item",
  },
  "inventory.confirmDelete": {
    da: "Er du sikker på at du vil slette denne vare?",
    en: "Are you sure you want to delete this item?",
  },

  // Item form
  "item.name": {
    da: "Navn",
    en: "Name",
  },
  "item.description": {
    da: "Beskrivelse",
    en: "Description",
  },
  "item.category": {
    da: "Kategori",
    en: "Category",
  },
  "item.quantity": {
    da: "Antal",
    en: "Quantity",
  },
  "item.expirationDate": {
    da: "Udløbsdato",
    en: "Expiration Date",
  },
  "item.addPhoto": {
    da: "Tilføj foto",
    en: "Add Photo",
  },
  "item.save": {
    da: "Gem",
    en: "Save",
  },
  "item.cancel": {
    da: "Annuller",
    en: "Cancel",
  },

  // Categories
  "category.WATER": {
    da: "Vand",
    en: "Water",
  },
  "category.CANNED_FOOD": {
    da: "Dåsemad",
    en: "Canned Food",
  },
  "category.DRY_GOODS": {
    da: "Tørvarer",
    en: "Dry Goods",
  },
  "category.FIRST_AID": {
    da: "Førstehjælp",
    en: "First Aid",
  },
  "category.TOOLS": {
    da: "Værktøj",
    en: "Tools",
  },
  "category.HYGIENE": {
    da: "Hygiejne",
    en: "Hygiene",
  },
  "category.DOCUMENTS": {
    da: "Dokumenter",
    en: "Documents",
  },
  "category.OTHER": {
    da: "Andet",
    en: "Other",
  },

  // Camera
  "camera.title": {
    da: "Tag foto",
    en: "Capture Photo",
  },
  "camera.description": {
    da: "Tag et foto af din vare eller upload et eksisterende billede.",
    en: "Take a photo of your item or upload an existing image.",
  },
  "camera.captured": {
    da: "Taget",
    en: "Captured",
  },
  "camera.clickStartOrUpload": {
    da: "Klik \"Start kamera\" eller upload et billede",
    en: "Click \"Start Camera\" or upload an image",
  },
  "camera.startCamera": {
    da: "Start kamera",
    en: "Start Camera",
  },
  "camera.upload": {
    da: "Upload",
    en: "Upload",
  },
  "camera.retake": {
    da: "Tag nyt",
    en: "Retake",
  },
  "camera.usePhoto": {
    da: "Brug foto",
    en: "Use Photo",
  },
  "camera.capture": {
    da: "Tag foto",
    en: "Capture",
  },
  "camera.error": {
    da: "Kunne ikke få adgang til kameraet. Tillad venligst kameraadgang eller upload en fil.",
    en: "Unable to access camera. Please allow camera permissions or upload a file.",
  },
  "camera.addManually": {
    da: "Tilføj manuelt",
    en: "Add manually",
  },
  "camera.stepFront": {
    da: "Forside af vare",
    en: "Front of item",
  },
  "camera.stepFrontDesc": {
    da: "Tag et billede af varens forside/etiket",
    en: "Take a photo of the item's front label",
  },
  "camera.stepExpiration": {
    da: "Udløbsdato",
    en: "Expiration date",
  },
  "camera.stepExpirationDesc": {
    da: "Tag et billede hvor udløbsdatoen er synlig",
    en: "Take a photo where the expiration date is visible",
  },
  "camera.frontPhoto": {
    da: "Forside",
    en: "Front",
  },
  "camera.next": {
    da: "Næste",
    en: "Next",
  },
  "camera.skip": {
    da: "Spring over",
    en: "Skip",
  },
  "camera.processingError": {
    da: "Kunne ikke behandle billede. Prøv igen.",
    en: "Failed to process image. Please try again.",
  },
  "camera.addItem": {
    da: "Tilføj vare",
    en: "Add Item",
  },
  "camera.twoStepDescription": {
    da: "Tag billeder af varens forside og udløbsdato",
    en: "Take photos of the item's front and expiration date",
  },
  "camera.frontLabel": {
    da: "Forside",
    en: "Front",
  },
  "camera.expirationLabel": {
    da: "Udløbsdato",
    en: "Expiration",
  },
  "camera.tapToCapture": {
    da: "Tryk for at tage billede",
    en: "Tap to capture",
  },
  "camera.optional": {
    da: "Valgfri",
    en: "Optional",
  },
  "camera.expirationPhoto": {
    da: "Udløbsdato",
    en: "Expiration date",
  },
  "camera.saveItem": {
    da: "Gem vare",
    en: "Save Item",
  },
  "camera.snapFront": {
    da: "Tag billede af forsiden",
    en: "Snap the front of the item",
  },
  "camera.snapExpiration": {
    da: "Tag billede af udløbsdatoen",
    en: "Snap the expiration date",
  },
  "camera.snap": {
    da: "Tag billede",
    en: "Snap",
  },
  "camera.addExpiration": {
    da: "Tilføj udløbsdato",
    en: "Add expiration",
  },

  // Scan verification
  "scan.verifyTitle": {
    da: "Bekræft vareinfo",
    en: "Verify Item Info",
  },
  "scan.confirmSave": {
    da: "Gem vare",
    en: "Save Item",
  },
  "scan.saveAndAddNew": {
    da: "Gem og tilføj ny",
    en: "Save & Add New",
  },

  // Scanner
  "scanner.title": {
    da: "Scanner",
    en: "Scanner",
  },
  "scanner.description": {
    da: "Scan varer med kameraet",
    en: "Scan items with your camera",
  },
  "scanner.captureItem": {
    da: "Tag foto af vare",
    en: "Capture Item",
  },
  "scanner.captureDescription": {
    da: "Tag et foto eller upload et billede af din forsyningsvare",
    en: "Take a photo or upload an image of your supply item",
  },
  "scanner.step1Front": {
    da: "Trin 1: Tag billede af forsiden",
    en: "Step 1: Capture front of item",
  },
  "scanner.step2Expiration": {
    da: "Trin 2: Tag billede af udløbsdato",
    en: "Step 2: Capture expiration date",
  },
  "scanner.frontPhotoDescription": {
    da: "Tag et billede af produktets forside/etiket",
    en: "Take a photo of the product's front label",
  },
  "scanner.expirationPhotoDescription": {
    da: "Tag et billede af hvor udløbsdatoen er synlig",
    en: "Take a photo where the expiration date is visible",
  },
  "scanner.analyzing": {
    da: "Analyserer...",
    en: "Analyzing...",
  },
  "scanner.analyzingWithAI": {
    da: "Analyserer med AI...",
    en: "Analyzing with AI...",
  },
  "scanner.reviewSave": {
    da: "Gennemse & Gem",
    en: "Review & Save",
  },
  "scanner.reviewDescription": {
    da: "Gennemse de fundne detaljer og foretag evt. rettelser",
    en: "Review the extracted details and make any corrections",
  },
  "scanner.startCamera": {
    da: "Start kamera",
    en: "Start Camera",
  },
  "scanner.upload": {
    da: "Upload",
    en: "Upload",
  },
  "scanner.capture": {
    da: "Tag foto",
    en: "Capture",
  },
  "scanner.retake": {
    da: "Tag nyt foto",
    en: "Retake",
  },
  "scanner.saveToInventory": {
    da: "Gem i beholdning",
    en: "Save to Inventory",
  },
  "scanner.aiConfidence": {
    da: "AI Sikkerhed",
    en: "AI Confidence",
  },
  "scanner.cameraError": {
    da: "Kunne ikke få adgang til kameraet. Tillad venligst kameraadgang eller upload en fil.",
    en: "Unable to access camera. Please allow camera permissions or upload a file.",
  },
  "scanner.startCameraOrUpload": {
    da: "Start kameraet eller upload et billede for at scanne din vare",
    en: "Start the camera or upload an image to scan your item",
  },
  "scanner.aiDetected": {
    da: "AI fandt",
    en: "AI detected",
  },
  "scanner.back": {
    da: "Tilbage",
    en: "Back",
  },
  "scanner.skip": {
    da: "Spring over",
    en: "Skip",
  },
  "scanner.front": {
    da: "Forside",
    en: "Front",
  },
  "scanner.expiration": {
    da: "Udløbsdato",
    en: "Expiration",
  },
  "scanner.fillManually": {
    da: "Udfyld venligst detaljerne manuelt.",
    en: "Please fill in the details manually.",
  },
  "scanner.itemName": {
    da: "Varens navn",
    en: "Item name",
  },
  "scanner.optionalDescription": {
    da: "Valgfri beskrivelse",
    en: "Optional description",
  },

  // Checklist
  "checklist.title": {
    da: "Tjekliste",
    en: "Checklist",
  },
  "checklist.description": {
    da: "Hold styr på dine nødforsyninger",
    en: "Keep track of your emergency supplies",
  },
  "checklist.addItem": {
    da: "Tilføj punkt",
    en: "Add Item",
  },
  "checklist.resetDefaults": {
    da: "Nulstil til standard",
    en: "Reset to Defaults",
  },
  "checklist.progress": {
    da: "Fremskridt",
    en: "Progress",
  },

  // Expiring
  "expiring.title": {
    da: "Udløber snart",
    en: "Expiring Soon",
  },
  "expiring.description": {
    da: "Varer der snart udløber eller allerede er udløbet",
    en: "Items expiring soon or already expired",
  },
  "expiring.noItems": {
    da: "Ingen varer udløber snart",
    en: "No items expiring soon",
  },
  "expiring.expired": {
    da: "Udløbet",
    en: "Expired",
  },
  "expiring.today": {
    da: "Udløber i dag",
    en: "Expires today",
  },
  "expiring.tomorrow": {
    da: "Udløber i morgen",
    en: "Expires tomorrow",
  },
  "expiring.daysLeft": {
    da: "dage tilbage",
    en: "days left",
  },

  // Settings
  "settings.title": {
    da: "Indstillinger",
    en: "Settings",
  },
  "settings.account": {
    da: "Konto",
    en: "Account",
  },
  "settings.accountDescription": {
    da: "Dine kontooplysninger",
    en: "Your account information",
  },
  "settings.notifications": {
    da: "Notifikationer",
    en: "Notifications",
  },
  "settings.notificationsDescription": {
    da: "Administrer notifikationspræferencer",
    en: "Manage notification preferences",
  },
  "settings.pushNotifications": {
    da: "Push-notifikationer",
    en: "Push Notifications",
  },
  "settings.pushDescription": {
    da: "Modtag advarsler om udløbende varer",
    en: "Receive alerts about expiring items",
  },
  "settings.enable": {
    da: "Aktivér",
    en: "Enable",
  },
  "settings.disable": {
    da: "Deaktivér",
    en: "Disable",
  },
  "settings.expirationAlerts": {
    da: "Udløbsadvarsler",
    en: "Expiration Alerts",
  },
  "settings.expirationAlertsDescription": {
    da: "Få besked når varer snart udløber",
    en: "Get notified when items are expiring soon",
  },
  "settings.alertThreshold": {
    da: "Advarselsgrænse (dage før udløb)",
    en: "Alert Threshold (days before expiration)",
  },
  "settings.testNotification": {
    da: "Test notifikation",
    en: "Test Notification",
  },
  "settings.testNotificationDescription": {
    da: "Send en test notifikation med dit nærmeste udløbende produkt",
    en: "Send a test notification with your closest expiring item",
  },
  "settings.sendTest": {
    da: "Send test",
    en: "Send Test",
  },
  "settings.testNotificationSent": {
    da: "Test notifikation sendt!",
    en: "Test notification sent!",
  },
  "settings.testNotificationFailed": {
    da: "Kunne ikke sende test notifikation",
    en: "Failed to send test notification",
  },
  "settings.security": {
    da: "Sikkerhed",
    en: "Security",
  },
  "settings.securityDescription": {
    da: "Sikkerhedsindstillinger og privatliv",
    en: "Security settings and privacy",
  },
  "settings.authMethod": {
    da: "Godkendelsesmetode",
    en: "Authentication Method",
  },
  "settings.authMethodDescription": {
    da: "Hvordan du logger ind på din konto",
    en: "How you sign in to your account",
  },
  "settings.about": {
    da: "Om",
    en: "About",
  },
  "settings.aboutDescription": {
    da: "Applikationsoplysninger",
    en: "Application information",
  },
  "settings.version": {
    da: "Version",
    en: "Version",
  },
  "settings.aiProvider": {
    da: "AI-udbyder",
    en: "AI Provider",
  },
  "settings.storage": {
    da: "Lagring",
    en: "Storage",
  },
  "settings.language": {
    da: "Sprog",
    en: "Language",
  },
  "settings.languageDescription": {
    da: "Vælg dit foretrukne sprog",
    en: "Choose your preferred language",
  },
  "settings.notificationsBlocked": {
    da: "Notifikationer er blokeret. Aktivér dem venligst i dine browserindstillinger.",
    en: "Notifications are blocked. Please enable them in your browser settings.",
  },
  "settings.notificationsNotSupported": {
    da: "Notifikationer understøttes ikke i din browser.",
    en: "Notifications are not supported in your browser.",
  },

  // Common
  "common.loading": {
    da: "Indlæser...",
    en: "Loading...",
  },
  "common.error": {
    da: "Fejl",
    en: "Error",
  },
  "common.success": {
    da: "Succes",
    en: "Success",
  },
  "common.save": {
    da: "Gem",
    en: "Save",
  },
  "common.cancel": {
    da: "Annuller",
    en: "Cancel",
  },
  "common.delete": {
    da: "Slet",
    en: "Delete",
  },
  "common.edit": {
    da: "Rediger",
    en: "Edit",
  },
  "common.close": {
    da: "Luk",
    en: "Close",
  },
  "common.yes": {
    da: "Ja",
    en: "Yes",
  },
  "common.no": {
    da: "Nej",
    en: "No",
  },
  "common.of": {
    da: "af",
    en: "of",
  },

  // Toasts
  "toast.itemAdded": {
    da: "Vare tilføjet",
    en: "Item added successfully",
  },
  "toast.itemUpdated": {
    da: "Vare opdateret",
    en: "Item updated successfully",
  },
  "toast.itemDeleted": {
    da: "Vare slettet",
    en: "Item deleted successfully",
  },
  "toast.photoAdded": {
    da: "Foto tilføjet og analyseret!",
    en: "Photo added and analyzed!",
  },
  "toast.aiAnalyzing": {
    da: "Analyserer billede med AI...",
    en: "Analyzing image with AI...",
  },
  "toast.aiComplete": {
    da: "AI-analyse fuldført!",
    en: "AI analysis complete!",
  },
  "toast.aiFailed": {
    da: "AI-analyse fejlede",
    en: "AI analysis failed",
  },
  "toast.notificationsEnabled": {
    da: "Notifikationer aktiveret!",
    en: "Notifications enabled!",
  },
  "toast.notificationsDisabled": {
    da: "Notifikationer deaktiveret",
    en: "Notifications disabled",
  },
  "toast.notificationsFailed": {
    da: "Kunne ikke aktivere notifikationer. Tjek browserindstillinger.",
    en: "Could not enable notifications. Please check browser permissions.",
  },
  "toast.savedToInventory": {
    da: "Gemt i beholdning!",
    en: "Saved to inventory!",
  },
  "toast.saveFailed": {
    da: "Kunne ikke gemme vare",
    en: "Failed to save item",
  },
  "toast.enterName": {
    da: "Indtast venligst et navn til varen",
    en: "Please enter a name for the item",
  },
  "toast.loadFailed": {
    da: "Kunne ikke indlæse data",
    en: "Failed to load data",
  },
  "toast.updateFailed": {
    da: "Kunne ikke opdatere",
    en: "Failed to update",
  },
  "toast.deleteFailed": {
    da: "Kunne ikke slette",
    en: "Failed to delete",
  },
  "toast.itemDeletedSuccess": {
    da: "Vare slettet",
    en: "Item deleted",
  },
  "toast.addedToChecklist": {
    da: "Tilføjet til tjekliste",
    en: "Item added to checklist",
  },
  "toast.photoUploadFailed": {
    da: "Kunne ikke uploade foto",
    en: "Failed to upload photo",
  },
  "toast.photoAddedAnalysisFailed": {
    da: "Foto tilføjet (AI-analyse fejlede)",
    en: "Photo added (AI analysis failed)",
  },
  "toast.itemScanned": {
    da: "Vare scannet og tilføjet!",
    en: "Item scanned and added!",
  },
  "toast.scanFailed": {
    da: "Scanning fejlede",
    en: "Scan failed",
  },

  // Inventory page
  "inventory.description": {
    da: "Administrer dine nødforsyninger",
    en: "Manage your emergency supplies",
  },

  // Item form
  "item.formDescription": {
    da: "Tilføj detaljer om din nødforsyningsvare",
    en: "Add details about your emergency supply item",
  },
  "item.descriptionOptional": {
    da: "Beskrivelse (valgfri)",
    en: "Description (optional)",
  },
  "item.namePlaceholder": {
    da: "f.eks. Dåsebønner",
    en: "e.g., Canned Beans",
  },
  "item.descriptionPlaceholder": {
    da: "f.eks. 400g dåse, kidneybønner",
    en: "e.g., 15 oz can, kidney beans",
  },
  "item.nameRequired": {
    da: "Navn er påkrævet",
    en: "Name is required",
  },
  "item.quantityMin": {
    da: "Antal skal være mindst 1",
    en: "Quantity must be at least 1",
  },

  // Expiration badge
  "expiration.ok": {
    da: "OK",
    en: "OK",
  },
  "expiration.expiringSoon": {
    da: "Udløber snart",
    en: "Expiring Soon",
  },
  "expiration.expiresSoon": {
    da: "Udløber snart!",
    en: "Expires Soon!",
  },
  "expiration.expired": {
    da: "Udløbet",
    en: "Expired",
  },
  "expiration.noExpiration": {
    da: "Ingen udløbsdato",
    en: "No expiration",
  },
  "expiration.daysAgo": {
    da: "dage siden",
    en: "days ago",
  },
  "expiration.today": {
    da: "I dag",
    en: "Today",
  },
  "expiration.tomorrow": {
    da: "I morgen",
    en: "Tomorrow",
  },
  "expiration.days": {
    da: "dage",
    en: "days",
  },

  // Expiring page
  "expiring.itemsWithDates": {
    da: "varer med udløbsdato",
    en: "items with expiration dates",
  },
  "expiring.noItemsWithDates": {
    da: "Ingen varer med udløbsdato",
    en: "No items with expiration dates",
  },
  "expiring.addToInventory": {
    da: "Tilføj varer til beholdning",
    en: "Add items to inventory",
  },
  "expiring.expiredCount": {
    da: "Udløbet",
    en: "Expired",
  },
  "expiring.passedDate": {
    da: "Disse varer har overskredet udløbsdatoen",
    en: "These items have passed their expiration date",
  },
  "expiring.within3Days": {
    da: "Udløber inden for 3 dage",
    en: "Expiring Within 3 Days",
  },
  "expiring.useImmediately": {
    da: "Brug eller erstat disse varer med det samme",
    en: "Use or replace these items immediately",
  },
  "expiring.within7Days": {
    da: "Udløber inden for 7 dage",
    en: "Expiring Within 7 Days",
  },
  "expiring.planToReplace": {
    da: "Planlæg at bruge eller erstatte disse varer snart",
    en: "Plan to use or replace these items soon",
  },
  "expiring.goodForNow": {
    da: "OK for nu",
    en: "Good for Now",
  },
  "expiring.notExpiringSoon": {
    da: "Disse varer udløber ikke snart",
    en: "These items are not expiring soon",
  },
  "expiring.andMoreItems": {
    da: "Og flere varer...",
    en: "And more items...",
  },

  // Checklist page
  "checklist.emergencyChecklist": {
    da: "Nød-tjekliste",
    en: "Emergency Checklist",
  },
  "checklist.itemsChecked": {
    da: "varer afkrydset",
    en: "items checked",
  },
  "checklist.addChecklistItem": {
    da: "Tilføj tjeklistepunkt",
    en: "Add Checklist Item",
  },
  "checklist.addCustomItem": {
    da: "Tilføj et brugerdefineret punkt til din nødtjekliste",
    en: "Add a custom item to your emergency checklist",
  },
  "checklist.itemName": {
    da: "Punktnavn",
    en: "Item Name",
  },
  "checklist.namePlaceholder": {
    da: "f.eks. Bærbar oplader",
    en: "e.g., Portable Charger",
  },
  "checklist.enterName": {
    da: "Indtast venligst et navn",
    en: "Please enter an item name",
  },

  // Settings page (additional keys)
  "settings.emailLabel": {
    da: "Email",
    en: "Email",
  },
  "settings.notSetPromise": {
    da: "Ikke angivet (Promise Auth bruger)",
    en: "Not set (Promise Auth user)",
  },
  "settings.nameLabel": {
    da: "Navn",
    en: "Name",
  },
  "settings.notSet": {
    da: "Ikke angivet",
    en: "Not set",
  },
  "settings.userId": {
    da: "Bruger-ID",
    en: "User ID",
  },
  "settings.emailPassword": {
    da: "Email/Adgangskode",
    en: "Email/Password",
  },
  "settings.promiseAuth": {
    da: "Promise Auth",
    en: "Promise Auth",
  },

  // Confirm dialogs
  "confirm.deleteItem": {
    da: "Er du sikker på at du vil slette denne vare?",
    en: "Are you sure you want to delete this item?",
  },
  "confirm.deleteTitle": {
    da: "Slet vare",
    en: "Delete Item",
  },
  "confirm.delete": {
    da: "Slet",
    en: "Delete",
  },
  "common.confirm": {
    da: "Bekræft",
    en: "Confirm",
  },
  "common.create": {
    da: "Opret",
    en: "Create",
  },
  "common.creating": {
    da: "Opretter...",
    en: "Creating...",
  },
  "common.leave": {
    da: "Forlad",
    en: "Leave",
  },
  "common.invite": {
    da: "Inviter",
    en: "Invite",
  },
  "common.pending": {
    da: "Afventer",
    en: "Pending",
  },
  "common.accept": {
    da: "Accepter",
    en: "Accept",
  },
  "common.decline": {
    da: "Afvis",
    en: "Decline",
  },

  // Stash
  "stash.title": {
    da: "Stash",
    en: "Stash",
  },
  "stash.loading": {
    da: "Indlæser...",
    en: "Loading...",
  },
  "stash.noStash": {
    da: "Ingen stash",
    en: "No stash",
  },
  "stash.selectStash": {
    da: "Vælg stash",
    en: "Select stash",
  },
  "stash.createStash": {
    da: "Opret stash",
    en: "Create stash",
  },
  "stash.createDescription": {
    da: "Opret en ny stash til at organisere dine forsyninger",
    en: "Create a new stash to organize your supplies",
  },
  "stash.manageStash": {
    da: "Administrer stash",
    en: "Manage stash",
  },
  "stash.name": {
    da: "Navn",
    en: "Name",
  },
  "stash.namePlaceholder": {
    da: "f.eks. Sommerhus, Kontor",
    en: "e.g., Summer house, Office",
  },
  "stash.members": {
    da: "Medlemmer",
    en: "Members",
  },
  "stash.invitations": {
    da: "Invitationer",
    en: "Invitations",
  },
  "stash.invite": {
    da: "Inviter",
    en: "Invite",
  },
  "stash.inviteByEmail": {
    da: "Inviter med email",
    en: "Invite by email",
  },
  "stash.inviteDescription": {
    da: "Inviter nogen til at deltage i denne stash",
    en: "Invite someone to join this stash",
  },
  "stash.emailPlaceholder": {
    da: "Email adresse",
    en: "Email address",
  },
  "stash.pendingInvitations": {
    da: "Afventende invitationer",
    en: "Pending invitations",
  },
  "stash.noPendingInvitations": {
    da: "Ingen afventende invitationer",
    en: "No pending invitations",
  },
  "stash.cancelInvitation": {
    da: "Annuller invitation",
    en: "Cancel invitation",
  },
  "stash.role.owner": {
    da: "Ejer",
    en: "Owner",
  },
  "stash.role.admin": {
    da: "Admin",
    en: "Admin",
  },
  "stash.role.member": {
    da: "Medlem",
    en: "Member",
  },
  "stash.leave": {
    da: "Forlad stash",
    en: "Leave stash",
  },
  "stash.leaveConfirm": {
    da: "Er du sikker på at du vil forlade denne stash? Du mister adgang til alle varerne.",
    en: "Are you sure you want to leave this stash? You will lose access to all items.",
  },
  "stash.delete": {
    da: "Slet stash",
    en: "Delete stash",
  },
  "stash.deleteConfirm": {
    da: "Er du sikker? Alle varer i denne stash vil blive slettet permanent.",
    en: "Are you sure? All items in this stash will be permanently deleted.",
  },
  "stash.cannotDeleteOnly": {
    da: "Du kan ikke slette din eneste stash",
    en: "You cannot delete your only stash",
  },
  "stash.removeMember": {
    da: "Fjern medlem",
    en: "Remove member",
  },
  "stash.removeMemberConfirm": {
    da: "Er du sikker på at du vil fjerne dette medlem?",
    en: "Are you sure you want to remove this member?",
  },
  "stash.changeRole": {
    da: "Skift rolle",
    en: "Change role",
  },
  "stash.you": {
    da: "(dig)",
    en: "(you)",
  },
  "stash.settings": {
    da: "Stash indstillinger",
    en: "Stash settings",
  },
  "stash.settingsDescription": {
    da: "Administrer din stash, medlemmer og invitationer",
    en: "Manage your stash, members, and invitations",
  },
  "stash.yourInvitations": {
    da: "Dine invitationer",
    en: "Your invitations",
  },
  "stash.invitedTo": {
    da: "Du er inviteret til",
    en: "You have been invited to",
  },
  "stash.noInvitations": {
    da: "Ingen invitationer",
    en: "No invitations",
  },
  "stash.expiresAt": {
    da: "Udløber",
    en: "Expires",
  },
  "stash.invitationAccepted": {
    da: "Invitation accepteret!",
    en: "Invitation accepted!",
  },
  "stash.invitationDeclined": {
    da: "Invitation afvist",
    en: "Invitation declined",
  },
  "stash.invitationSent": {
    da: "Invitation sendt!",
    en: "Invitation sent!",
  },
  "stash.invitationCanceled": {
    da: "Invitation annulleret",
    en: "Invitation canceled",
  },
  "stash.memberRemoved": {
    da: "Medlem fjernet",
    en: "Member removed",
  },
  "stash.leftStash": {
    da: "Du har forladt stashen",
    en: "You have left the stash",
  },
  "stash.stashDeleted": {
    da: "Stash slettet",
    en: "Stash deleted",
  },
  "stash.stashCreated": {
    da: "Stash oprettet!",
    en: "Stash created!",
  },
  "stash.stashUpdated": {
    da: "Stash opdateret",
    en: "Stash updated",
  },
  "stash.itemCount": {
    da: "varer",
    en: "items",
  },
} as const;

export type TranslationKey = keyof typeof translations;

// Type-safe category key helper
export type CategoryKey =
  | "category.WATER"
  | "category.CANNED_FOOD"
  | "category.DRY_GOODS"
  | "category.FIRST_AID"
  | "category.TOOLS"
  | "category.HYGIENE"
  | "category.DOCUMENTS"
  | "category.OTHER";

export function getCategoryKey(category: string): CategoryKey {
  return `category.${category}` as CategoryKey;
}

// Type-safe stash role key helper
export type RoleKey =
  | "stash.role.owner"
  | "stash.role.admin"
  | "stash.role.member";

export function getRoleKey(role: string): RoleKey {
  return `stash.role.${role.toLowerCase()}` as RoleKey;
}
