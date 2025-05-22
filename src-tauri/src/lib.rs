/* ------------------------------------------------------------------
 * MIT License
 * Copyright (c) 2025  Sesh Ragavachari
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the “Software”), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN
 * AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * ------------------------------------------------------------------
 * File   : lib.rs
 * Author : Sesh Ragavachari
 * Date   : 2025-04-30
 * Version: 1.0
 * ------------------------------------------------------------------
 * Purpose
 *  Tauri-side Rust library for the desktop wrapper.  Exposes:
 *    • `greet`  – example command callable from the front-end
 *    • `run`    – shared entry (mobile/desktop) initialising the
 *                 opener plugin and the invoke handler.
 * ------------------------------------------------------------------ */

#![forbid(unsafe_code)] // ✨ compiler fails if any `unsafe` sneaks in
#[allow(unused_imports)]
use tauri::Manager;

/// Example Tauri command.
///
/// Called via `window.__TAURI__.invoke("greet", { name })` on the
/// JavaScript side.
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Shared entry-point used by both desktop and mobile builds.
///
/// The `mobile_entry_point` attribute turns this into the correct
/// startup function on Android/iOS while remaining a normal Rust
/// function on desktop platforms.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
