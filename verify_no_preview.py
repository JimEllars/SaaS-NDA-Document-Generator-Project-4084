from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Navigate to the app
        page.goto("http://localhost:5173")

        # Wait for the form to load
        page.wait_for_selector("form, input")

        # Fill out the form to ensure validation passes (just in case buttons are conditional on validation)
        page.fill("input[name='disclosing']", "Alice Corp")
        page.fill("input[name='receiving']", "Bob Inc")
        page.fill("input[name='effectiveDate']", "2024-01-01")

        # Scroll to the bottom to see the buttons
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")

        # Wait a bit for animations
        page.wait_for_timeout(1000)

        # Take a screenshot
        page.screenshot(path="verification_no_preview.png")

        # Check if Preview button exists (it should not)
        preview_btn = page.query_selector("button:has-text('Preview Document')")
        if preview_btn:
            print("FAILURE: Preview button found!")
        else:
            print("SUCCESS: Preview button not found.")

        browser.close()

if __name__ == "__main__":
    run()
