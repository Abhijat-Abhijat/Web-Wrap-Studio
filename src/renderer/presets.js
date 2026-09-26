/* Starting points for the Advanced panel. Generic categories, same schema as the createProject options. */
window.PANESHELL_PRESETS = [
  { id: "reading", label: "Reading and notes", description: "Standard window that remembers where you left it.", options: {} },
  { id: "chat", label: "Chat app", description: "Tray icon, closes to tray, allows notifications.",
    options: { tray: { enabled: true, minimizeToTray: true }, permissions: { allow: ["notifications"] } } },
  { id: "media", label: "Music or video player", description: "Allows media and fullscreen, remembers position.",
    options: { permissions: { allow: ["media", "fullscreen"] } } },
  { id: "kiosk", label: "Kiosk or dashboard", description: "Large, frameless and always on top.",
    options: { window: { width: 1920, height: 1080, frameless: true, alwaysOnTop: true }, permissions: { allow: ["fullscreen"] } } },
  { id: "menubar", label: "Menubar helper", description: "Small window, tray icon, starts on login.",
    options: { window: { width: 420, height: 640, alwaysOnTop: true }, tray: { enabled: true, minimizeToTray: true }, startOnLogin: true } },
  { id: "calls", label: "Video calls", description: "Camera, microphone, notifications and fullscreen.",
    options: { permissions: { allow: ["notifications", "media", "fullscreen"] } } },
  { id: "maps", label: "Maps and location", description: "Allows location and fullscreen.",
    options: { permissions: { allow: ["geolocation", "fullscreen"] } } },
];
