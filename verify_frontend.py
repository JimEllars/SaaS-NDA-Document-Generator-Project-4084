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

            # Fill form
            print("Filling form...")
            page.fill('input[name="disclosing"]', 'My Company')
            page.fill('input[name="receiving"]', 'Other Company')
            page.fill('input[name="effectiveDate"]', '2023-10-27')

            # Wait for validation to pass (Preview button enabled)
            page.wait_for_timeout(500)

            # Click Preview
            print("Clicking Preview...")
            page.click('button:has-text("Preview Document")')

            # Wait for modal
            page.wait_for_selector('h3:has-text("Document Preview")', timeout=5000)
            print("Preview modal open.")

            # Check for Print button
            print("Checking for Print button...")
            print_btn = page.locator('button:has-text("Print")')
            if print_btn.count() > 0:
                print("Print button found.")
            else:
                print("Print button NOT found.")

            # Take screenshot of preview modal
            page.screenshot(path="preview_modal.png")
            print("Screenshot saved: preview_modal.png")

            # Check content for numbering
            # Article 1 should have definition (paragraph) then robust clause if robust selected?
            # Default is standard. So Article 1 has 1 paragraph.
            # Let's switch to robust to test numbering.

            # Close modal
            page.click('button:has-text("Close")')

            # Select Robust
            page.select_option('select[name="strictness"]', 'robust')

            # Preview again
            page.click('button:has-text("Preview Document")')
            page.wait_for_selector('h3:has-text("Document Preview")', timeout=5000)

            # Check Article 1 content
            # Article 1 should have 2 items.
            # Item 1: Paragraph
            # Item 2: Clause 1. Broad Interpretation...

            # Wait for content to render
            page.wait_for_selector('#document-render', timeout=5000)

            content = page.inner_text('#document-render')

            if "1. Broad Interpretation of Confidential Information" in content:
                 print("Robust clause numbering verified.")
            else:
                 print("Robust clause numbering FAILED.")

            page.screenshot(path="preview_robust.png")
            print("Screenshot saved: preview_robust.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
