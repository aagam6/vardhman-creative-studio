# WhatsApp PDF Event Pass Sender

A professional, high-reliability Windows desktop application developed in Python to automate the sending of personalized PDF Event Passes for **Paramveer Chakra – Shauryagatha** using WhatsApp Web. Built with **PySide6** (Qt) for a stunning modern dark GUI, **Selenium** for browser automation, and **RapidFuzz** for intelligent filename matching.

---

## Key Features

1. **Stunning Premium Dark UI**: Styled using an Indian Saffron, Gold, and WhatsApp Green aesthetic, built fully responsively in PySide6 with thread-safe UI updates.
2. **Auto Contact Parser**: Reads `.xlsx` spreadsheets and automatically detects name and mobile number columns using case-insensitive regex matching.
3. **Strict Phone Number Normalization**:
   - Strips spaces, hyphens, and formatting brackets.
   - Strips country prefix `+91` and leading zeroes.
   - Validates that numbers conform to the Indian mobile plan (starts with `6, 7, 8, or 9` and contains exactly 10 digits).
   - Generates the final prefix format `91xxxxxxxxxx`. Invalid numbers are skipped and logged immediately.
4. **Intelligent PDF Name Matching**:
   - Uses **RapidFuzz** for matching.
   - First attempts exact and substring contains matches to pair Excel names with file names (e.g. "Jay Joshi" matches `jay_joshi_pvc_pass.pdf`).
   - Falls back to fuzzy edit-distance token ratio matching. If the confidence is $\ge 90\%$, it proceeds. Otherwise, it logs "PDF Missing" and skips.
5. **Robust Browser Teardown & Reconnect**:
   - Reuses a standard Chrome profile (`chrome_profile` inside the application data dir) to maintain your login session.
   - Automatically detects and installs the matching ChromeDriver via `webdriver-manager`.
6. **Dual Attachment Method**:
   - Prefers fast, direct Selenium injection into the WhatsApp Web file upload element.
   - Falls back to clicking the Attach button and driving Windows native file dialogues via `PyAutoGUI` if the WhatsApp Web DOM changes.
7. **Execution Control**:
   - **Test Mode**: Halts processing after sending to the first 5 contacts, displaying a dialogue. You can inspect delivery and choose to continue to the remaining contacts or abort.
   - **Pause / Resume**: Suspends operations after the current contact completes. Resumes at the click of a button.
   - **Stop**: Gracefully kills the worker thread, closes Chrome, and updates status.
8. **Logging & Resumption**:
   - Logs successes with timestamps to `sent_log.csv`. Already sent contacts in this CSV are automatically skipped on restarts.
   - Logs failures with precise reasons to `failed_log.csv`.
   - Offers options to **Resend Failed Only** or **Export Skipped List**.
   - Maintains continuous checkpointing in `resume_state.json` keyed by mobile numbers, ensuring that you can resume exactly where you left off even after crashes or power outages.
9. **Desktop Notifications & Sound**:
   - Emits a Windows system tray toast notification after every 50 sends to show background progress.
   - Plays a custom 4-tone notification sound when the queue finishes.

---

## Technical Stack

- **Python 3.13**
- **PySide6** (GUI framework)
- **Selenium** (Browser Automation)
- **webdriver-manager** (ChromeDriver resolution)
- **RapidFuzz** (Fuzzy string comparison)
- **pandas** / **openpyxl** (Excel spreadsheet processing)
- **pyperclip** / **pyautogui** (Clipboards and Native UI Automation)
- **plyer** (Desktop Notifications)
- **PyInstaller** (EXE Compilation)

---

## Getting Started

### Prerequisites
- **Google Chrome** must be installed on your Windows system.

### One-Click Execution (run.bat)
Double-click `run.bat` in the root folder of the project.
This script will:
1. Initialize a Python virtual environment (`venv`).
2. Upgrade `pip` and install all required dependencies from `requirements.txt`.
3. Launch the desktop application.

### Manual Setup
If you prefer running manual commands:
```bash
# Create a virtual environment
python -m venv venv

# Activate it
call venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Launch application
python app.py
```

---

## Compiling to a Single Windows Executable (.exe)

The project includes build tools to compile the application into a single executable that requires no Python installation.

1. Double-click `build_exe.bat`.
2. PyInstaller will compile the code using the configured `whatsapp_sender.spec`.
3. Once completed, your executable file **`WhatsApp_PDF_Sender.exe`** will be located in the `dist/` folder.

---

## Important Operations Guide

- **Scan QR Code Once**: The first time you click "Start Sending", Chrome will launch and direct you to WhatsApp Web. Scan the QR code. On subsequent runs, it will read session data from the saved profile, taking you straight to your chat screen.
- **Closing Other Chrome Sessions**: Selenium will raise an error if another automated browser is running with the same profile path. Make sure you close any residual automation windows before starting a run.
- **Fail-Safe Warning**: Do not move your mouse to the extreme corners of the screen if the PyAutoGUI fallback starts (e.g. if Selenium fails to attach), as this will trigger PyAutoGUI's Fail-Safe mode and halt the application.
