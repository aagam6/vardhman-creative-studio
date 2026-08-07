import os
import sys
import traceback

print("Python version:", sys.version)

try:
    from selenium import webdriver
    print("Selenium version:", webdriver.__version__ if hasattr(webdriver, '__version__') else "unknown")
except ImportError:
    print("Selenium not installed!")
    sys.exit(1)

options = webdriver.ChromeOptions()
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--disable-gpu")

print("\n--- TEST 1: Launching Chrome WITHOUT User Profile ---")
try:
    print("Initializing webdriver.Chrome(options)...")
    driver = webdriver.Chrome(options=options)
    print("SUCCESS: Chrome launched successfully!")
    driver.quit()
except Exception as e:
    print("FAILED direct launch:")
    traceback.print_exc()

print("\n--- TEST 2: Launching Chrome WITH User Profile ---")
profile_path = os.path.join(os.environ.get("APPDATA", "C:"), "WhatsAppPassSender", "chrome_profile")
print(f"Profile path: {profile_path}")
options_with_profile = webdriver.ChromeOptions()
options_with_profile.add_argument(f"--user-data-dir={os.path.abspath(profile_path)}")
options_with_profile.add_argument("--no-sandbox")
options_with_profile.add_argument("--disable-dev-shm-usage")
options_with_profile.add_argument("--disable-gpu")

try:
    print("Initializing webdriver.Chrome(options) with profile...")
    driver = webdriver.Chrome(options=options_with_profile)
    print("SUCCESS: Chrome launched successfully with profile!")
    driver.quit()
except Exception as e:
    print("FAILED launch with profile:")
    traceback.print_exc()
