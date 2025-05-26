mod tray;

use rdev::{listen, Button, Event, EventType};
use serde_json::json;
use std::sync::{Arc, Mutex};
use tauri::{App, Emitter, Manager};

fn setup_init(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let handle = app.handle();

    tray::create_tray(handle)?;

    let position = Arc::new(Mutex::new((0.0, 0.0)));
    let position_clone = Arc::clone(&position);

    tauri::async_runtime::spawn({
        let handle = handle.clone();
        async move {
            if let Err(error) = listen(move |event: Event| match event.event_type {
                EventType::MouseMove { x, y } => {
                    let mut pos = position_clone.lock().unwrap();
                    *pos = (x, y);
                }
                EventType::ButtonPress(button) => {
                    let pos = position_clone.lock().unwrap();

                    let button_str = match button {
                        Button::Left => "Left".to_string(),
                        Button::Right => "Right".to_string(),
                        Button::Middle => "Middle".to_string(),
                        Button::Unknown(code) => format!("Unknown({})", code),
                    };

                    handle
                        .emit(
                            "mouse-click",
                            json!({
                                "x": pos.0,
                                "y": pos.1,
                                "button": button_str
                            }),
                        )
                        .unwrap_or_else(|e| {
                            eprintln!("[Input Logger] Error emitting event: {:?}", e);
                        });
                }
                EventType::KeyPress(_key) => {}
                EventType::KeyRelease(_key) => {}
                EventType::ButtonRelease(_button) => {}
                EventType::Wheel {
                    delta_x: _,
                    delta_y: _,
                } => {}
            }) {
                println!("Error: {:?}", error);
            }
        }
    });

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(setup_init)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
