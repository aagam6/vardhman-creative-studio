#!/usr/bin/env python3
"""
Vardhman Creative Studio - WhatsApp PDF Event Pass Sender
Production-ready Windows Desktop Application using PySide6 and Selenium.
For automatically sending personalized PDF event passes.
"""

import os
import sys
import re
import csv
import json
import time
import random
import datetime
import winsound
import threading
import traceback
import pyperclip
import pyautogui

# GUI Imports
from PySide6.QtCore import Qt, QThread, Signal, Slot, QMutex, QWaitCondition
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QGridLayout, QLabel, QPushButton, QLineEdit, QFileDialog,
    QProgressBar, QPlainTextEdit, QCheckBox, QMessageBox, QFrame
)
from PySide6.QtGui import QFont, QIcon, QTextCursor, QColor, QPalette

# Selenium Imports
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# Fuzzy Matching & Excel Imports
import openpyxl
import pandas as pd
from rapidfuzz import fuzz

# Notifications
from plyer import notification

# Constants
MESSAGE_TEMPLATE = """Hi {Name},

Your Event Pass for *Paramveer Chakra – Shauryagatha* is attached.

📅 Date: 09 August 2026
🕘 Time: 9:00 AM
📍 Venue: Dinesh Hall, Navrangpura, Ahmedabad

Please join our official WhatsApp group for important updates:
https://chat.whatsapp.com/EdW9DBw8LeZCwCh7aLHVTA

Terms & Conditions:
• Entry is strictly through this valid Event Pass only.
• Seats are available on a First Come, First Served basis.
• Please arrive before 9:00 AM.
• Entry after 9:00 AM may not be permitted.
• Keep this pass available on your mobile or carry a printed copy.

Thank you,
Vardhman Creative Studio"""

# Ensure PyAutoGUI doesn't cause fast failures
pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0.5


class WhatsAppWorker(QThread):
    # Signals for communicating with UI
    log_signal = Signal(str, str)         # (message, level)
    progress_signal = Signal(int, int)    # (current, total)
    stats_signal = Signal(int, int, int)  # (sent, failed, remaining)
    countdown_signal = Signal(int)        # seconds remaining
    status_signal = Signal(str)           # status description
    test_mode_pause_signal = Signal()     # triggered when 5 test sends complete
    finished_signal = Signal(str)         # finished message

    def __init__(self, excel_path, pdf_folder, profile_path, is_test_mode=False, resend_failed_only=False):
        super().__init__()
        self.excel_path = excel_path
        self.pdf_folder = pdf_folder
        self.profile_path = profile_path
        self.is_test_mode = is_test_mode
        self.resend_failed_only = resend_failed_only

        # Worker state controls
        self._is_paused = False
        self._is_stopped = False
        self.mutex = QMutex()
        self.pause_cond = QWaitCondition()

        self.driver = None
        self.contacts = []
        self.skipped_contacts_export = []  # Store skipped contacts for export option
        
        # Logged stats
        self.sent_count = 0
        self.failed_count = 0

    def check_pause_stop(self):
        self.mutex.lock()
        try:
            if self._is_stopped:
                return True
            while self._is_paused:
                self.status_signal.emit("Paused")
                self.log_signal.emit("Process paused. Waiting to resume...", "WARNING")
                self.pause_cond.wait(self.mutex)
                if self._is_stopped:
                    return True
                self.log_signal.emit("Process resumed.", "INFO")
        finally:
            self.mutex.unlock()
        return False

    def pause(self):
        self.mutex.lock()
        self._is_paused = True
        self.mutex.unlock()

    def resume(self):
        self.mutex.lock()
        self._is_paused = False
        self.pause_cond.wakeAll()
        self.mutex.unlock()

    def stop(self):
        self.mutex.lock()
        self._is_stopped = True
        self._is_paused = False
        self.pause_cond.wakeAll()
        self.mutex.unlock()
        self.log_signal.emit("Stop command issued. Cleaning up...", "ERROR")

    def clean_phone_number(self, phone):
        if phone is None:
            return None
        phone_str = str(phone).strip()
        # Remove spaces, hyphens, and parentheses
        phone_clean = re.sub(r'[\s\-()]+', '', phone_str)
        
        # Remove +91
        if phone_clean.startswith('+91'):
            phone_clean = phone_clean[3:]
        # Remove leading 91 if length > 10
        elif phone_clean.startswith('91') and len(phone_clean) > 10:
            phone_clean = phone_clean[2:]
            
        # Remove leading zero
        phone_clean = phone_clean.lstrip('0')
        
        # Keep only digits
        phone_clean = re.sub(r'\D', '', phone_clean)
        
        # If more than 10 digits, keep last 10
        if len(phone_clean) > 10:
            phone_clean = phone_clean[-10:]
            
        # Validate length and Indian mobile numbering system (starts with 6,7,8,9)
        if len(phone_clean) == 10 and phone_clean[0] in '6789':
            return "91" + phone_clean
        return None

    def find_matching_pdf(self, name):
        if not name or not self.pdf_folder or not os.path.exists(self.pdf_folder):
            return None, 0.0
            
        # Clean Excel name
        clean_name = str(name).lower().strip()
        clean_name = re.sub(r'[^a-z0-9\s_]', '', clean_name)
        clean_name = re.sub(r'[\s_]+', '_', clean_name).strip('_')
        
        if not clean_name:
            return None, 0.0
            
        try:
            files = os.listdir(self.pdf_folder)
        except Exception as e:
            self.log_signal.emit(f"Failed to list PDF directory: {e}", "ERROR")
            return None, 0.0
            
        pdf_files = [f for f in files if f.lower().endswith('.pdf')]
        if not pdf_files:
            return None, 0.0
            
        # 1. Exact match / Contains match
        for pdf_file in pdf_files:
            pdf_name_only = os.path.splitext(pdf_file)[0].lower()
            pdf_clean = re.sub(r'[^a-z0-9\s_]', '', pdf_name_only)
            pdf_clean = re.sub(r'[\s_]+', '_', pdf_clean).strip('_')
            
            if clean_name == pdf_clean or clean_name in pdf_clean:
                return os.path.join(self.pdf_folder, pdf_file), 100.0

        # 2. Fuzzy match
        best_match = None
        best_score = 0.0
        for pdf_file in pdf_files:
            pdf_name_only = os.path.splitext(pdf_file)[0].lower()
            pdf_clean = re.sub(r'[^a-z0-9\s_]', '', pdf_name_only)
            pdf_clean = re.sub(r'[\s_]+', '_', pdf_clean).strip('_')
            
            score1 = fuzz.token_sort_ratio(clean_name, pdf_clean)
            score2 = fuzz.partial_ratio(clean_name, pdf_clean)
            score = max(score1, score2)
            
            if score > best_score:
                best_score = score
                best_match = pdf_file
                
        if best_score >= 90.0:
            return os.path.join(self.pdf_folder, best_match), best_score
            
        return None, best_score

    def get_sent_numbers(self):
        sent_numbers = set()
        log_file = "sent_log.csv"
        if os.path.exists(log_file):
            try:
                with open(log_file, mode='r', newline='', encoding='utf-8') as f:
                    reader = csv.reader(f)
                    next(reader, None)  # Skip header
                    for row in reader:
                        if len(row) >= 2:
                            num = row[1].strip()
                            if num:
                                sent_numbers.add(num)
            except Exception as e:
                self.log_signal.emit(f"Error reading sent logs: {e}", "WARNING")
        return sent_numbers

    def get_failed_numbers(self):
        failed_numbers = set()
        log_file = "failed_log.csv"
        if os.path.exists(log_file):
            try:
                with open(log_file, mode='r', newline='', encoding='utf-8') as f:
                    reader = csv.reader(f)
                    next(reader, None)  # Skip header
                    for row in reader:
                        if len(row) >= 2:
                            num = row[1].strip()
                            if num:
                                failed_numbers.add(num)
            except Exception as e:
                self.log_signal.emit(f"Error reading failed logs: {e}", "WARNING")
        return failed_numbers

    def log_sent(self, name, mobile, pdf_path):
        log_file = "sent_log.csv"
        file_exists = os.path.exists(log_file)
        try:
            with open(log_file, mode='a', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                if not file_exists:
                    writer.writerow(["Name", "Mobile", "PDF", "Time", "Status"])
                writer.writerow([
                    name, mobile, os.path.basename(pdf_path),
                    datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "Sent"
                ])
        except Exception as e:
            self.log_signal.emit(f"Failed to write to sent_log.csv: {e}", "ERROR")

    def log_failed(self, name, mobile, reason):
        log_file = "failed_log.csv"
        file_exists = os.path.exists(log_file)
        try:
            with open(log_file, mode='a', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                if not file_exists:
                    writer.writerow(["Name", "Mobile", "Reason"])
                writer.writerow([name, mobile, reason])
        except Exception as e:
            self.log_signal.emit(f"Failed to write to failed_log.csv: {e}", "ERROR")

    def save_resume_state(self, current_mobile):
        state = {
            "excel_path": self.excel_path,
            "pdf_folder": self.pdf_folder,
            "profile_path": self.profile_path,
            "last_processed_mobile": current_mobile,
            "sent_count": self.sent_count,
            "failed_count": self.failed_count,
            "is_test_mode": self.is_test_mode
        }
        try:
            with open("resume_state.json", "w", encoding="utf-8") as f:
                json.dump(state, f, indent=4)
        except Exception as e:
            self.log_signal.emit(f"Failed to save resume state: {e}", "WARNING")

    def load_contacts(self):
        self.log_signal.emit("Reading Excel file...", "INFO")
        try:
            # Read sheet using pandas
            df = pd.read_excel(self.excel_path, dtype=str)
        except Exception as e:
            self.log_signal.emit(f"Failed to read Excel file: {e}", "ERROR")
            return False

        columns = df.columns.tolist()
        name_col = None
        mobile_col = None

        # Auto-detect column names
        name_patterns = [r'name', r'full\s*name', r'participant\s*name', r'recipient']
        mobile_patterns = [r'mobile', r'phone', r'contact', r'number', r'whatsapp\s*number']

        for col in columns:
            col_lower = str(col).lower().strip()
            # Check Name match
            if not name_col:
                for pat in name_patterns:
                    if re.search(pat, col_lower):
                        name_col = col
                        break
            # Check Mobile match
            if not mobile_col:
                for pat in mobile_patterns:
                    if re.search(pat, col_lower):
                        mobile_col = col
                        break

        # Fallbacks if not auto-detected
        if not name_col and len(columns) > 0:
            name_col = columns[0]
        if not mobile_col and len(columns) > 1:
            mobile_col = columns[1]

        if not name_col or not mobile_col:
            self.log_signal.emit("Excel file must contain at least name and mobile columns.", "ERROR")
            return False

        self.log_signal.emit(f"Detected Name column: '{name_col}', Mobile column: '{mobile_col}'", "INFO")

        # Parse rows
        self.contacts = []
        for idx, row in df.iterrows():
            name = str(row[name_col]).strip() if pd.notna(row[name_col]) else ""
            mobile = str(row[mobile_col]).strip() if pd.notna(row[mobile_col]) else ""
            if name or mobile:
                self.contacts.append({
                    "name": name,
                    "mobile_raw": mobile,
                    "excel_idx": idx
                })

        self.log_signal.emit(f"Successfully loaded {len(self.contacts)} rows from Excel.", "INFO")
        return True

    def init_driver(self):
        self.status_signal.emit("Starting Chrome...")
        self.log_signal.emit("Initializing Chrome Driver via webdriver-manager...", "INFO")
        
        options = webdriver.ChromeOptions()
        # Add profile directory to reuse session
        options.add_argument(f"--user-data-dir={os.path.abspath(self.profile_path)}")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        
        # Prevent automation warning flag
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        try:
            self.log_signal.emit("Attempting standard Chrome launch using Selenium Manager...", "INFO")
            try:
                # Direct launch using Selenium 4's built-in driver manager
                self.driver = webdriver.Chrome(options=options)
            except Exception as e_direct:
                self.log_signal.emit(f"Direct launch failed ({e_direct}). Trying fallback with webdriver-manager...", "WARNING")
                service = ChromeService(ChromeDriverManager().install())
                self.driver = webdriver.Chrome(service=service, options=options)
            self.driver.maximize_window()
            
            # Navigate to WhatsApp and wait for QR or Chat List
            self.driver.get("https://web.whatsapp.com")
            self.status_signal.emit("Waiting for WhatsApp Login...")
            self.log_signal.emit("Please scan the QR code if not logged in. Waiting up to 120s...", "WARNING")
            
            # Wait for search box or chat layout to be visible (signifies log in)
            wait = WebDriverWait(self.driver, 120)
            wait.until(EC.presence_of_element_located((
                By.XPATH, '//div[@contenteditable="true"][@data-tab="3"] | //div[@id="pane-side"]'
            )))
            self.log_signal.emit("WhatsApp logged in successfully!", "SUCCESS")
            return True
        except Exception as e:
            self.log_signal.emit(f"Failed to initialize Chrome Browser: {e}", "ERROR")
            if "user data directory is already in use" in str(e).lower():
                self.log_signal.emit("CRITICAL: Another Chrome instance is using this profile path. Please close it first.", "ERROR")
            return False

    def attach_pdf_selenium(self, pdf_path):
        # Locate input[type=file]
        wait = WebDriverWait(self.driver, 10)
        file_input = wait.until(EC.presence_of_element_located((
            By.XPATH, '//input[@type="file" and @accept="*"] | //input[@type="file"]'
        )))
        file_input.send_keys(os.path.abspath(pdf_path))
        return True

    def attach_pdf_pyautogui(self, pdf_path):
        self.log_signal.emit("Selenium attachment failed. Attempting PyAutoGUI fallback...", "WARNING")
        
        # Click body to focus window
        self.driver.find_element(By.TAG_NAME, 'body').click()
        time.sleep(0.5)

        # 1. Click Attach button (Plus or Clip icon)
        attach_selectors = [
            '//div[@title="Attach"]',
            '//span[@data-icon="plus"]/ancestor::div[@role="button"]',
            '//button[@aria-label="Attach"]',
            '//span[@data-icon="attach-menu-plus"]'
        ]
        
        attach_btn = None
        for sel in attach_selectors:
            try:
                attach_btn = self.driver.find_element(By.XPATH, sel)
                attach_btn.click()
                break
            except Exception:
                continue

        if not attach_btn:
            raise RuntimeError("Attach button not found for PyAutoGUI fallback")
            
        time.sleep(1.0)
        
        # 2. Click "Document" option
        doc_selectors = [
            '//span[contains(text(), "Document")]/ancestor::div[@role="button"]',
            '//span[contains(text(), "Document")]/ancestor::li',
            '//span[@data-icon="attach-document"]/ancestor::div[@role="button"]'
        ]
        
        doc_btn = None
        for sel in doc_selectors:
            try:
                doc_btn = self.driver.find_element(By.XPATH, sel)
                doc_btn.click()
                break
            except Exception:
                continue
                
        if not doc_btn:
            # Try pressing Down Arrow and Enter to open document dialog
            pyautogui.press('down')
            time.sleep(0.2)
            pyautogui.press('enter')
        
        time.sleep(2.0) # Wait for Windows dialog
        
        # 3. Enter filepath and press Enter
        pyperclip.copy(os.path.abspath(pdf_path))
        pyautogui.hotkey('ctrl', 'v')
        time.sleep(0.5)
        pyautogui.press('enter')
        time.sleep(1.5)
        return True

    def run_send_cycle(self, name, clean_mobile, pdf_path):
        # 1. Open Chat
        self.status_signal.emit(f"Loading chat for {name}...")
        url = f"https://web.whatsapp.com/send?phone={clean_mobile}"
        self.driver.get(url)
        
        # 2. Wait for loading or invalid number popup
        chat_loaded = False
        invalid_popup = False
        start_wait = time.time()
        
        while time.time() - start_wait < 35:
            if self.check_pause_stop():
                return "STOPPED"
                
            # Check chat textbox
            try:
                chat_textbox = self.driver.find_elements(By.XPATH, '//footer//div[@contenteditable="true"][@role="textbox"]')
                if chat_textbox:
                    chat_loaded = True
                    break
            except Exception:
                pass
                
            # Check invalid number popup
            try:
                dialogs = self.driver.find_elements(By.XPATH, '//div[@role="dialog"]')
                for diag in dialogs:
                    diag_text = diag.text.lower()
                    if "invalid" in diag_text or "phone number" in diag_text or "url" in diag_text:
                        invalid_popup = True
                        # Click OK button to close the dialog
                        ok_btn = diag.find_element(By.XPATH, './/div[@role="button"]')
                        ok_btn.click()
                        break
                if invalid_popup:
                    break
            except Exception:
                pass
                
            time.sleep(0.5)
            
        if invalid_popup:
            raise ValueError("Phone number not registered on WhatsApp")
        if not chat_loaded:
            raise TimeoutError("Chat window loading timed out")

        # 3. Attach PDF
        self.status_signal.emit(f"Attaching PDF to {name}...")
        try:
            self.attach_pdf_selenium(pdf_path)
        except Exception:
            self.attach_pdf_pyautogui(pdf_path)

        # 4. Wait for Preview Dialog and Send PDF
        wait = WebDriverWait(self.driver, 12)
        send_btn_xpath = '//span[@data-icon="send"]/ancestor::div[@role="button"] | //div[@aria-label="Send"][@role="button"]'
        send_btn = wait.until(EC.element_to_be_clickable((By.XPATH, send_btn_xpath)))
        
        # Click PDF send button
        send_btn.click()
        self.log_signal.emit(f"PDF uploaded. Sending pass to {name}...", "INFO")
        time.sleep(3.5) # Wait for file transfer to complete

        # 5. Send Message
        self.status_signal.emit(f"Pasting message for {name}...")
        chat_textbox = wait.until(EC.presence_of_element_located((
            By.XPATH, '//footer//div[@contenteditable="true"][@role="textbox"]'
        )))
        
        formatted_message = MESSAGE_TEMPLATE.format(Name=name.title())
        pyperclip.copy(formatted_message)
        
        chat_textbox.click()
        chat_textbox.send_keys(Keys.CONTROL + 'v')
        time.sleep(1.0)
        chat_textbox.send_keys(Keys.ENTER)
        
        time.sleep(2.0) # Buffer to ensure transmission
        return "SUCCESS"

    def run(self):
        # 1. Load spreadsheet
        if not self.load_contacts():
            self.finished_signal.emit("Excel Loading Failed")
            return

        total_count = len(self.contacts)
        self.progress_signal.emit(0, total_count)
        self.stats_signal.emit(self.sent_count, self.failed_count, total_count)

        # Load logs and skip caches
        sent_numbers = self.get_sent_numbers()
        failed_numbers = self.get_failed_numbers() if self.resend_failed_only else set()
        
        # Clean & filter contacts
        active_contacts = []
        for c in self.contacts:
            name = c["name"]
            mobile_raw = c["mobile_raw"]
            
            clean_mobile = self.clean_phone_number(mobile_raw)
            if not clean_mobile:
                self.log_signal.emit(f"Row {c['excel_idx'] + 2}: Invalid mobile number format '{mobile_raw}' for '{name}'. Skipping.", "ERROR")
                self.log_failed(name, mobile_raw, "Invalid number")
                self.skipped_contacts_export.append([name, mobile_raw, "Invalid number"])
                self.failed_count += 1
                continue
                
            # Filter based on resend failed toggle
            if self.resend_failed_only and clean_mobile not in failed_numbers:
                continue
                
            # Auto-skip already sent
            if clean_mobile in sent_numbers:
                self.log_signal.emit(f"'{name}' ({clean_mobile}) already sent. Auto-skipping.", "INFO")
                continue
                
            c["clean_mobile"] = clean_mobile
            active_contacts.append(c)

        if not active_contacts:
            self.log_signal.emit("No contacts left to process.", "WARNING")
            self.finished_signal.emit("Completed: No Contacts to Process")
            return

        total_active = len(active_contacts)
        self.progress_signal.emit(0, total_active)
        self.log_signal.emit(f"Total contacts queue to process: {total_active}", "INFO")

        # Resume state check
        start_index = 0
        resume_mobile = None
        if os.path.exists("resume_state.json"):
            try:
                with open("resume_state.json", "r", encoding="utf-8") as f:
                    state = json.load(f)
                    if state.get("excel_path") == self.excel_path:
                        resume_mobile = state.get("last_processed_mobile")
                        self.sent_count = state.get("sent_count", 0)
                        self.failed_count = state.get("failed_count", 0)
            except Exception:
                pass

        if resume_mobile:
            for idx, c in enumerate(active_contacts):
                if c["clean_mobile"] == resume_mobile:
                    start_index = idx + 1 # Start from NEXT contact
                    self.log_signal.emit(f"Resuming from index {start_index} after contact: {c['name']} ({resume_mobile})", "INFO")
                    break

        # Start Chrome
        if not self.init_driver():
            self.finished_signal.emit("Browser Initialization Failed")
            return

        processed_this_run = 0

        for idx in range(start_index, total_active):
            if self.check_pause_stop():
                break

            c = active_contacts[idx]
            name = c["name"]
            clean_mobile = c["clean_mobile"]
            mobile_raw = c["mobile_raw"]
            
            self.log_signal.emit(f"----------------------------------------", "INFO")
            self.log_signal.emit(f"Processing ({idx+1}/{total_active}): {name} ({clean_mobile})", "INFO")
            self.status_signal.emit(f"Processing {name}...")

            # Match PDF Pass
            pdf_path, score = self.find_matching_pdf(name)
            if not pdf_path:
                self.log_signal.emit(f"Fuzzy Match failed for '{name}' (Max Confidence Score: {score:.1f}%). PDF Missing.", "ERROR")
                self.log_failed(name, clean_mobile, f"PDF missing (Score: {score:.1f}%)")
                self.skipped_contacts_export.append([name, mobile_raw, f"PDF missing (Score: {score:.1f}%)"])
                self.failed_count += 1
                self.stats_signal.emit(self.sent_count, self.failed_count, total_active - (idx + 1))
                self.progress_signal.emit(idx + 1, total_active)
                self.save_resume_state(clean_mobile)
                continue

            self.log_signal.emit(f"Matched PDF: '{os.path.basename(pdf_path)}' (Score: {score:.1f}%)", "INFO")

            # Try execution with retries
            success = False
            retry_delays = [10, 30, 60]
            
            for attempt in range(3):
                if self.check_pause_stop():
                    break
                
                try:
                    result = self.run_send_cycle(name, clean_mobile, pdf_path)
                    if result == "STOPPED":
                        break
                    
                    success = True
                    break
                except ValueError as e: # Catch registered invalid WhatsApp number
                    self.log_signal.emit(f"WhatsApp Error: {e}", "ERROR")
                    self.log_failed(name, clean_mobile, "Invalid number")
                    self.skipped_contacts_export.append([name, mobile_raw, "Invalid number"])
                    break
                except Exception as e:
                    self.log_signal.emit(f"Attempt {attempt+1} Failed: {e}", "WARNING")
                    if attempt < 2:
                        delay = retry_delays[attempt]
                        self.log_signal.emit(f"Retrying in {delay} seconds...", "WARNING")
                        # Sleep while checking for stop
                        for _ in range(delay):
                            if self.check_pause_stop():
                                break
                            time.sleep(1)
                    else:
                        self.log_signal.emit(f"All 3 attempts failed for '{name}'. Skipped.", "ERROR")
                        self.log_failed(name, clean_mobile, "WhatsApp failed / Timeout")
                        self.skipped_contacts_export.append([name, mobile_raw, "WhatsApp failed / Timeout"])

            if self._is_stopped:
                break

            if success:
                self.sent_count += 1
                self.log_sent(name, clean_mobile, pdf_path)
                self.log_signal.emit(f"Pass sent successfully to {name}!", "SUCCESS")
                
                processed_this_run += 1
                # Trigger desktop notification every 50 successful sends
                if processed_this_run % 50 == 0:
                    try:
                        notification.notify(
                            title="WhatsApp Pass Sender",
                            message=f"Success! {processed_this_run} passes sent in this run.",
                            app_name="WhatsApp Pass Sender",
                            timeout=8
                        )
                    except Exception:
                        pass
            else:
                if not success and not invalid_popup:
                    self.failed_count += 1

            self.stats_signal.emit(self.sent_count, self.failed_count, total_active - (idx + 1))
            self.progress_signal.emit(idx + 1, total_active)
            self.save_resume_state(clean_mobile)

            # Test mode check after sending first 5 contacts
            if self.is_test_mode and processed_this_run == 5:
                self.log_signal.emit("Test Mode: Successfully sent passes to first 5 contacts.", "SUCCESS")
                self.test_mode_pause_signal.emit()
                self.pause()
                self.check_pause_stop() # Block worker thread

            # Trigger randomized safety delay before opening next contact (except for last one)
            if idx < total_active - 1:
                delay = random.randint(38, 45)
                self.log_signal.emit(f"Waiting safety delay of {delay}s before next contact...", "INFO")
                for s in range(delay, 0, -1):
                    if self.check_pause_stop():
                        break
                    self.countdown_signal.emit(s)
                    time.sleep(1)
                self.countdown_signal.emit(0)

        # Cleanup driver
        if self.driver:
            self.status_signal.emit("Closing Chrome...")
            try:
                self.driver.quit()
            except Exception:
                pass
            self.driver = None

        if self._is_stopped:
            self.status_signal.emit("Stopped")
            self.finished_signal.emit("Process Stopped by User")
        else:
            # Delete resume state since run finished successfully
            if os.path.exists("resume_state.json"):
                try:
                    os.remove("resume_state.json")
                except Exception:
                    pass
            self.status_signal.emit("Completed")
            self.finished_signal.emit("Completed: All Contacts Processed")
            
            # Sound notification upon completion
            try:
                winsound.Beep(523, 200) # C5
                winsound.Beep(659, 200) # E5
                winsound.Beep(784, 200) # G5
                winsound.Beep(1046, 400) # C6
            except Exception:
                pass


class ModernWhatsAppSenderApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Paramveer Chakra - WhatsApp Pass Sender")
        self.resize(1000, 750)
        
        # Default Chrome Profile path
        self.default_profile = os.path.join(os.environ.get("APPDATA", "C:"), "WhatsAppPassSender", "chrome_profile")
        os.makedirs(os.path.dirname(self.default_profile), exist_ok=True)

        self.worker = None
        self.setup_ui()
        self.apply_theme()
        
        # Check if saved resume state exists to offer resume option on start
        self.check_resume_state_exists()

    def setup_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(15, 15, 15, 15)
        main_layout.setSpacing(15)

        # ================= HEADER =================
        header_frame = QFrame()
        header_frame.setObjectName("headerFrame")
        header_layout = QVBoxLayout(header_frame)
        header_layout.setContentsMargins(15, 12, 15, 12)
        
        title_label = QLabel("PARAMVEER CHAKRA – SHAURYAGATHA")
        title_label.setObjectName("titleLabel")
        title_label.setAlignment(Qt.AlignCenter)
        
        subtitle_label = QLabel("Official Event PDF Pass Sender (Vardhman Creative Studio)")
        subtitle_label.setObjectName("subtitleLabel")
        subtitle_label.setAlignment(Qt.AlignCenter)
        
        header_layout.addWidget(title_label)
        header_layout.addWidget(subtitle_label)
        main_layout.addWidget(header_frame)

        # ================= BODY (Split Left/Right) =================
        body_layout = QHBoxLayout()
        body_layout.setSpacing(15)

        # Left Panel (Configurations)
        left_panel = QFrame()
        left_panel.setObjectName("cardFrame")
        left_layout = QVBoxLayout(left_panel)
        left_layout.setSpacing(12)
        
        config_title = QLabel("Configuration Settings")
        config_title.setFont(QFont("Segoe UI", 12, QFont.Bold))
        config_title.setStyleSheet("color: #FFD700;")
        left_layout.addWidget(config_title)

        # Excel Selector
        left_layout.addWidget(QLabel("Select Excel Contact List (.xlsx):"))
        excel_row = QHBoxLayout()
        self.excel_input = QLineEdit()
        self.excel_input.setPlaceholderText("Path to contacts excel...")
        self.excel_btn = QPushButton("Browse")
        self.excel_btn.clicked.connect(self.browse_excel)
        excel_row.addWidget(self.excel_input)
        excel_row.addWidget(self.excel_btn)
        left_layout.addLayout(excel_row)

        # PDF Folder Selector
        left_layout.addWidget(QLabel("Select PDF Event Passes Folder:"))
        pdf_row = QHBoxLayout()
        self.pdf_input = QLineEdit()
        self.pdf_input.setPlaceholderText("Path to PDF folder...")
        self.pdf_btn = QPushButton("Browse")
        self.pdf_btn.clicked.connect(self.browse_pdf_folder)
        pdf_row.addWidget(self.pdf_input)
        pdf_row.addWidget(self.pdf_btn)
        left_layout.addLayout(pdf_row)

        # Chrome Profile Path Selector
        left_layout.addWidget(QLabel("Chrome Profile Directory (For keeping session):"))
        profile_row = QHBoxLayout()
        self.profile_input = QLineEdit(self.default_profile)
        self.profile_btn = QPushButton("Change")
        self.profile_btn.clicked.connect(self.browse_profile_folder)
        profile_row.addWidget(self.profile_input)
        profile_row.addWidget(self.profile_btn)
        left_layout.addLayout(profile_row)

        # Message Preview Box
        left_layout.addWidget(QLabel("Event Message Template (Automatic):"))
        self.template_preview = QPlainTextEdit()
        self.template_preview.setPlainText(MESSAGE_TEMPLATE)
        self.template_preview.setReadOnly(True)
        self.template_preview.setStyleSheet("background-color: #10141D; border: 1px solid #232D3F; color: #8892B0;")
        left_layout.addWidget(self.template_preview)

        # Right Panel (Status & Controls)
        right_panel = QFrame()
        right_panel.setObjectName("cardFrame")
        right_layout = QVBoxLayout(right_panel)
        right_layout.setSpacing(15)

        controls_title = QLabel("Dashboard & Controls")
        controls_title.setFont(QFont("Segoe UI", 12, QFont.Bold))
        controls_title.setStyleSheet("color: #FFD700;")
        right_layout.addWidget(controls_title)

        # Controls Buttons
        btn_grid = QGridLayout()
        btn_grid.setSpacing(10)
        
        self.start_btn = QPushButton("START SENDING")
        self.start_btn.setObjectName("startBtn")
        self.start_btn.clicked.connect(self.start_sending)
        
        self.pause_btn = QPushButton("PAUSE")
        self.pause_btn.setObjectName("pauseBtn")
        self.pause_btn.setEnabled(False)
        self.pause_btn.clicked.connect(self.pause_sending)

        self.resume_btn = QPushButton("RESUME")
        self.resume_btn.setObjectName("resumeBtn")
        self.resume_btn.setEnabled(False)
        self.resume_btn.clicked.connect(self.resume_sending)

        self.stop_btn = QPushButton("STOP")
        self.stop_btn.setObjectName("stopBtn")
        self.stop_btn.setEnabled(False)
        self.stop_btn.clicked.connect(self.stop_sending)

        btn_grid.addWidget(self.start_btn, 0, 0, 1, 2)
        btn_grid.addWidget(self.pause_btn, 1, 0)
        btn_grid.addWidget(self.resume_btn, 1, 1)
        btn_grid.addWidget(self.stop_btn, 2, 0, 1, 2)
        right_layout.addLayout(btn_grid)

        # Options
        options_layout = QHBoxLayout()
        self.test_mode_chk = QCheckBox("Test Mode (First 5 contacts only)")
        self.test_mode_chk.setChecked(True)
        self.resend_failed_chk = QCheckBox("Target FAILED contacts only")
        options_layout.addWidget(self.test_mode_chk)
        options_layout.addWidget(self.resend_failed_chk)
        right_layout.addLayout(options_layout)

        # Stats Cards
        stats_frame = QFrame()
        stats_frame.setStyleSheet("background-color: #10141D; border: 1px solid #232D3F; border-radius: 8px;")
        stats_layout = QGridLayout(stats_frame)
        stats_layout.setContentsMargins(10, 10, 10, 10)
        
        self.lbl_total = QLabel("Total: 0")
        self.lbl_total.setFont(QFont("Segoe UI", 11, QFont.Bold))
        self.lbl_sent = QLabel("Sent: 0")
        self.lbl_sent.setFont(QFont("Segoe UI", 11, QFont.Bold))
        self.lbl_sent.setStyleSheet("color: #25D366;") # WhatsApp Green
        self.lbl_failed = QLabel("Failed: 0")
        self.lbl_failed.setFont(QFont("Segoe UI", 11, QFont.Bold))
        self.lbl_failed.setStyleSheet("color: #FF5A5A;") # Red
        self.lbl_rem = QLabel("Remaining: 0")
        self.lbl_rem.setFont(QFont("Segoe UI", 11, QFont.Bold))
        
        stats_layout.addWidget(self.lbl_total, 0, 0)
        stats_layout.addWidget(self.lbl_sent, 0, 1)
        stats_layout.addWidget(self.lbl_failed, 1, 0)
        stats_layout.addWidget(self.lbl_rem, 1, 1)
        right_layout.addWidget(stats_frame)

        # Progress / Timer Card
        progress_card = QFrame()
        progress_card.setStyleSheet("background-color: #10141D; border: 1px solid #232D3F; border-radius: 8px;")
        prog_card_layout = QVBoxLayout(progress_card)
        prog_card_layout.setSpacing(8)
        
        self.progress_bar = QProgressBar()
        self.progress_bar.setValue(0)
        self.progress_bar.setTextVisible(True)
        self.progress_bar.setFixedHeight(22)
        
        timer_layout = QHBoxLayout()
        self.lbl_status = QLabel("Status: Idle")
        self.lbl_status.setFont(QFont("Segoe UI", 10, QFont.Bold))
        self.lbl_countdown = QLabel("Next in: --s")
        self.lbl_countdown.setFont(QFont("Segoe UI", 10, QFont.Bold))
        self.lbl_countdown.setStyleSheet("color: #FFD700;") # Gold
        self.lbl_countdown.setAlignment(Qt.AlignRight)
        
        timer_layout.addWidget(self.lbl_status)
        timer_layout.addWidget(self.lbl_countdown)
        
        prog_card_layout.addLayout(timer_layout)
        prog_card_layout.addWidget(self.progress_bar)
        right_layout.addWidget(progress_card)

        # Action Buttons (Export/Resend Actions)
        action_layout = QHBoxLayout()
        self.export_skips_btn = QPushButton("Export Skipped List")
        self.export_skips_btn.clicked.connect(self.export_skipped_contacts)
        self.export_skips_btn.setEnabled(False)
        self.open_logs_btn = QPushButton("Explore Directory")
        self.open_logs_btn.clicked.connect(self.open_app_directory)
        action_layout.addWidget(self.export_skips_btn)
        action_layout.addWidget(self.open_logs_btn)
        right_layout.addLayout(action_layout)

        body_layout.addWidget(left_panel, 1)
        body_layout.addWidget(right_panel, 1)
        main_layout.addLayout(body_layout)

        # ================= LIVE CONSOLE LOGS =================
        log_frame = QFrame()
        log_frame.setObjectName("cardFrame")
        log_layout = QVBoxLayout(log_frame)
        log_layout.setContentsMargins(12, 10, 12, 10)
        
        console_title = QLabel("System Log Console")
        console_title.setFont(QFont("Segoe UI", 10, QFont.Bold))
        console_title.setStyleSheet("color: #FFD700;")
        log_layout.addWidget(console_title)
        
        self.log_console = QPlainTextEdit()
        self.log_console.setObjectName("logConsole")
        self.log_console.setReadOnly(True)
        self.log_console.setUndoRedoEnabled(False)
        log_layout.addWidget(self.log_console)
        
        main_layout.addWidget(log_frame, 2)

    def apply_theme(self):
        # High quality premium dark stylesheet
        qss = """
            QMainWindow {
                background-color: #080A0E;
            }
            QWidget {
                font-family: 'Segoe UI', Arial, sans-serif;
                color: #CDD6F4;
                font-size: 13px;
            }
            QFrame#headerFrame {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #111A24, stop:0.5 #1C120C, stop:1 #0A1C16);
                border: 1px solid #1E293B;
                border-radius: 10px;
            }
            QFrame#cardFrame {
                background-color: #0E131F;
                border: 1px solid #1E293B;
                border-radius: 10px;
            }
            QLabel {
                color: #A6ADBB;
            }
            QLabel#titleLabel {
                font-size: 22px;
                font-weight: bold;
                color: #FF9933; /* Saffron Saffron */
                letter-spacing: 2px;
            }
            QLabel#subtitleLabel {
                font-size: 12px;
                color: #FFD700; /* Gold */
                font-weight: bold;
                letter-spacing: 1px;
            }
            QLineEdit {
                background-color: #07090E;
                border: 1px solid #1E293B;
                border-radius: 6px;
                padding: 6px 10px;
                color: #FFFFFF;
            }
            QLineEdit:focus {
                border: 1px solid #FF9933;
            }
            QPushButton {
                background-color: #1E293B;
                border: 1px solid #334155;
                border-radius: 6px;
                padding: 6px 12px;
                color: #E2E8F0;
                font-weight: 600;
            }
            QPushButton:hover {
                background-color: #334155;
                border-color: #475569;
            }
            QPushButton:pressed {
                background-color: #0F172A;
            }
            QPushButton:disabled {
                background-color: #0B0E14;
                border-color: #1E293B;
                color: #64748B;
            }
            QPushButton#startBtn {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #FF9933, stop:1 #FFD700);
                border: none;
                color: #080A0E;
                font-size: 14px;
                font-weight: bold;
                padding: 10px;
            }
            QPushButton#startBtn:hover {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #FFA34D, stop:1 #FFE033);
            }
            QPushButton#startBtn:disabled {
                background: #111A24;
                color: #475569;
            }
            QPushButton#stopBtn {
                background-color: #A30000;
                border: none;
                color: #FFFFFF;
                font-weight: bold;
            }
            QPushButton#stopBtn:hover {
                background-color: #DC0000;
            }
            QPushButton#pauseBtn {
                background-color: #EAB308;
                border: none;
                color: #000000;
                font-weight: bold;
            }
            QPushButton#pauseBtn:hover {
                background-color: #FACC15;
            }
            QPushButton#resumeBtn {
                background-color: #22C55E;
                border: none;
                color: #FFFFFF;
                font-weight: bold;
            }
            QPushButton#resumeBtn:hover {
                background-color: #4ADE80;
            }
            QCheckBox {
                color: #A6ADBB;
            }
            QCheckBox::indicator {
                width: 16px;
                height: 16px;
                background-color: #07090E;
                border: 1px solid #1E293B;
                border-radius: 4px;
            }
            QCheckBox::indicator:checked {
                background-color: #25D366;
                border-color: #25D366;
            }
            QProgressBar {
                background-color: #07090E;
                border: 1px solid #1E293B;
                border-radius: 6px;
                text-align: center;
                color: #FFFFFF;
                font-weight: bold;
            }
            QProgressBar::chunk {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #FF9933, stop:0.5 #FFD700, stop:1 #25D366);
                border-radius: 5px;
            }
            QPlainTextEdit#logConsole {
                background-color: #04060A;
                border: 1px solid #1E293B;
                border-radius: 6px;
                font-family: 'Consolas', 'Courier New', monospace;
                font-size: 12px;
                color: #A6ADBB;
                padding: 8px;
            }
        """
        self.setStyleSheet(qss)

    def browse_excel(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Select Contacts Excel File", "", "Excel Files (*.xlsx)")
        if file_path:
            self.excel_input.setText(file_path)
            self.log("Selected Excel file: " + file_path, "INFO")
            self.check_resume_state_exists()

    def browse_pdf_folder(self):
        dir_path = QFileDialog.getExistingDirectory(self, "Select PDF passes Folder")
        if dir_path:
            self.pdf_input.setText(dir_path)
            self.log("Selected PDF folder: " + dir_path, "INFO")

    def browse_profile_folder(self):
        dir_path = QFileDialog.getExistingDirectory(self, "Select Custom Chrome Profile Path")
        if dir_path:
            self.profile_input.setText(dir_path)
            self.log("Selected Custom Chrome Profile Path: " + dir_path, "INFO")

    def log(self, message, level="INFO"):
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        colored_msg = f"[{timestamp}] [{level}] {message}"
        
        # Color codes based on level
        color = "#CDD6F4" # Default light grey
        if level == "SUCCESS":
            color = "#25D366" # Green
        elif level == "WARNING":
            color = "#FFD700" # Gold / Yellow
        elif level == "ERROR":
            color = "#FF5A5A" # Red
        elif level == "INFO":
            color = "#A6ADBB" # Slate grey

        self.log_console.appendHtml(f"<span style='color: {color};'>{colored_msg}</span>")
        self.log_console.moveCursor(QTextCursor.End)

    def check_resume_state_exists(self):
        if os.path.exists("resume_state.json"):
            try:
                with open("resume_state.json", "r", encoding="utf-8") as f:
                    state = json.load(f)
                    # Check if paths match to enable resume
                    if state.get("excel_path") == self.excel_input.text():
                        self.resume_btn.setEnabled(True)
                        self.log("Saved execution session found. Click RESUME to pick up from mobile: " + str(state.get("last_processed_mobile")), "WARNING")
            except Exception:
                pass

    @Slot(str, str)
    def handle_worker_log(self, message, level):
        self.log(message, level)

    @Slot(int, int)
    def handle_worker_progress(self, current, total):
        self.progress_bar.setMaximum(total)
        self.progress_bar.setValue(current)
        percent = int((current / total) * 100) if total > 0 else 0
        self.progress_bar.setFormat(f"{current}/{total} Contacts ({percent}%)")

    @Slot(int, int, int)
    def handle_worker_stats(self, sent, failed, remaining):
        self.lbl_sent.setText(f"Sent: {sent}")
        self.lbl_failed.setText(f"Failed: {failed}")
        self.lbl_rem.setText(f"Remaining: {remaining}")

    @Slot(int)
    def handle_worker_countdown(self, seconds):
        if seconds > 0:
            self.lbl_countdown.setText(f"Next in: {seconds}s")
        else:
            self.lbl_countdown.setText("Next in: --s")

    @Slot(str)
    def handle_worker_status(self, status):
        self.lbl_status.setText(f"Status: {status}")

    @Slot()
    def handle_test_mode_pause(self):
        # Prompts verification to continue after first 5 contacts are done
        msg_box = QMessageBox(self)
        msg_box.setWindowTitle("Test Mode Verification")
        msg_box.setText("Test Mode: The first 5 passes have been sent successfully.\n\n"
                        "Please verify on WhatsApp Web if the passes and messages were delivered correctly.\n\n"
                        "Would you like to CONTINUE sending to all remaining contacts?")
        msg_box.setStandardButtons(QMessageBox.Yes | QMessageBox.No)
        msg_box.setDefaultButton(QMessageBox.Yes)
        
        # Style MessageBox to match theme
        msg_box.setStyleSheet("QLabel{ color: #CDD6F4; } QMessageBox{ background-color: #0E131F; }")
        
        response = msg_box.exec()
        if response == QMessageBox.Yes:
            self.log("Test Mode approved by user. Resuming full sending list...", "SUCCESS")
            # Disable test mode and resume worker
            if self.worker:
                self.worker.is_test_mode = False
                self.test_mode_chk.setChecked(False)
                self.worker.resume()
        else:
            self.log("Test Mode aborted. Stopping operations.", "WARNING")
            self.stop_sending()

    @Slot(str)
    def handle_worker_finished(self, final_msg):
        self.log("Worker Finished: " + final_msg, "SUCCESS" if "Completed" in final_msg else "WARNING")
        self.lbl_status.setText("Status: Idle")
        
        # Reset buttons state
        self.start_btn.setEnabled(True)
        self.pause_btn.setEnabled(False)
        self.resume_btn.setEnabled(False)
        self.stop_btn.setEnabled(False)
        self.excel_btn.setEnabled(True)
        self.pdf_btn.setEnabled(True)
        self.profile_btn.setEnabled(True)

        if self.worker and self.worker.skipped_contacts_export:
            self.export_skips_btn.setEnabled(True)
            
        self.worker = None

    def start_sending(self, resume=False):
        excel_p = self.excel_input.text().strip()
        pdf_p = self.pdf_input.text().strip()
        profile_p = self.profile_input.text().strip()

        if not excel_p or not os.path.exists(excel_p):
            QMessageBox.warning(self, "Invalid Path", "Please select a valid Excel file.")
            return
        if not pdf_p or not os.path.exists(pdf_p):
            QMessageBox.warning(self, "Invalid Path", "Please select a valid PDF passes directory.")
            return
        if not profile_p:
            QMessageBox.warning(self, "Invalid Path", "Please specify a Chrome profile directory.")
            return

        self.start_btn.setEnabled(False)
        self.pause_btn.setEnabled(True)
        self.resume_btn.setEnabled(False)
        self.stop_btn.setEnabled(True)
        
        # Lock inputs
        self.excel_btn.setEnabled(False)
        self.pdf_btn.setEnabled(False)
        self.profile_btn.setEnabled(False)
        self.export_skips_btn.setEnabled(False)

        # Retrieve settings
        test_mode = self.test_mode_chk.isChecked()
        resend_failed = self.resend_failed_chk.isChecked()

        # If not resuming and resume_state.json exists, remove it
        if not resume and os.path.exists("resume_state.json"):
            try:
                os.remove("resume_state.json")
            except Exception:
                pass

        # Load contact count to show total beforehand
        try:
            temp_df = pd.read_excel(excel_p, dtype=str)
            self.lbl_total.setText(f"Total: {len(temp_df)}")
        except Exception:
            pass

        self.worker = WhatsAppWorker(
            excel_path=excel_p, pdf_folder=pdf_p, profile_path=profile_p,
            is_test_mode=test_mode, resend_failed_only=resend_failed
        )

        # Connect slots
        self.worker.log_signal.connect(self.handle_worker_log)
        self.worker.progress_signal.connect(self.handle_worker_progress)
        self.worker.stats_signal.connect(self.handle_worker_stats)
        self.worker.countdown_signal.connect(self.handle_worker_countdown)
        self.worker.status_signal.connect(self.handle_worker_status)
        self.worker.test_mode_pause_signal.connect(self.handle_test_mode_pause)
        self.worker.finished_signal.connect(self.handle_worker_finished)

        self.worker.start()

    def pause_sending(self):
        if self.worker:
            self.worker.pause()
            self.pause_btn.setEnabled(False)
            self.resume_btn.setEnabled(True)
            self.log("Pause requested. Operation will halt after current contact completes...", "WARNING")

    def resume_sending(self):
        # Checks if resume button was clicked for standard running pause
        if self.worker and self.worker.isRunning() and self.worker._is_paused:
            self.pause_btn.setEnabled(True)
            self.resume_btn.setEnabled(False)
            self.worker.resume()
        else:
            # Re-trigger sending thread starting from saved index
            self.start_sending(resume=True)

    def stop_sending(self):
        if self.worker:
            self.worker.stop()
            self.stop_btn.setEnabled(False)
            self.pause_btn.setEnabled(False)
            self.resume_btn.setEnabled(False)

    def export_skipped_contacts(self):
        if not self.worker or not self.worker.skipped_contacts_export:
            # Check if we have logs on disk
            QMessageBox.information(self, "No Records", "No skipped contacts to export in this run.")
            return

        file_path, _ = QFileDialog.getSaveFileName(self, "Save Skipped Contacts", "", "CSV Files (*.csv)")
        if file_path:
            try:
                with open(file_path, mode='w', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    writer.writerow(["Name", "Mobile", "Reason"])
                    writer.writerows(self.worker.skipped_contacts_export)
                self.log(f"Skipped contacts exported successfully to: {file_path}", "SUCCESS")
                QMessageBox.information(self, "Export Successful", "Skipped contacts exported successfully.")
            except Exception as e:
                self.log(f"Failed to export skipped contacts: {e}", "ERROR")
                QMessageBox.critical(self, "Export Failed", f"Failed to export: {e}")

    def open_app_directory(self):
        try:
            os.startfile(os.getcwd())
        except Exception as e:
            self.log(f"Could not open application directory: {e}", "ERROR")

    def closeEvent(self, event):
        # Stop worker if running before exit
        if self.worker and self.worker.isRunning():
            reply = QMessageBox.question(
                self, 'Confirm Exit',
                "Sending process is active. Do you want to stop and exit the application?",
                QMessageBox.Yes | QMessageBox.No, QMessageBox.No
            )
            if reply == QMessageBox.Yes:
                self.worker.stop()
                self.worker.wait() # wait until worker thread finishes Chrome teardown
                event.accept()
            else:
                event.ignore()
        else:
            event.accept()


if __name__ == '__main__':
    import multiprocessing
    multiprocessing.freeze_support()
    app = QApplication(sys.argv)
    
    # Premium Dark Palette fallbacks
    palette = QPalette()
    palette.setColor(QPalette.Window, QColor("#080A0E"))
    palette.setColor(QPalette.WindowText, QColor("#CDD6F4"))
    palette.setColor(QPalette.Base, QColor("#04060A"))
    palette.setColor(QPalette.AlternateBase, QColor("#0E131F"))
    palette.setColor(QPalette.ToolTipBase, QColor("#CDD6F4"))
    palette.setColor(QPalette.ToolTipText, QColor("#080A0E"))
    palette.setColor(QPalette.Text, QColor("#CDD6F4"))
    palette.setColor(QPalette.Button, QColor("#1E293B"))
    palette.setColor(QPalette.ButtonText, QColor("#E2E8F0"))
    palette.setColor(QPalette.BrightText, QColor("#FF9933"))
    palette.setColor(QPalette.Link, QColor("#25D366"))
    palette.setColor(QPalette.Highlight, QColor("#FFD700"))
    palette.setColor(QPalette.HighlightedText, QColor("#080A0E"))
    app.setPalette(palette)
    
    window = ModernWhatsAppSenderApp()
    window.show()
    sys.exit(app.exec())
