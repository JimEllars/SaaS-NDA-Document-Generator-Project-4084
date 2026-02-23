from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to app...")
            page.goto("http://localhost:5173")

            # Wait for form to load
            page.wait_for_selector('h1:has-text("AXiM NDA Generator")', timeout=10000)
            print("App loaded.")

            # Check Preview button is GONE
            print("Checking for Preview button (should be absent)...")
            preview_btn = page.locator('button:has-text("Preview Document")')
            if preview_btn.count() > 0:
                print("FAIL: Preview button FOUND!")
            else:
                print("PASS: Preview button NOT found.")

            # Fill form to enable purchase
            print("Filling form...")
            page.fill('input[name="disclosing"]', 'My Company')
            page.fill('input[name="receiving"]', 'Other Company')
            page.fill('input[name="effectiveDate"]', '2023-10-27')

            # Wait for validation
            page.wait_for_timeout(500)

            # Click Purchase
            print("Clicking Purchase...")
            page.click('button:has-text("Purchase & Generate")')

            # Wait for modal
            page.wait_for_selector('h3:has-text("Complete Purchase")', timeout=5000)
            print("Payment modal open.")

            page.screenshot(path="verification_removed_preview.png")
            print("Screenshot saved: verification_removed_preview.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
