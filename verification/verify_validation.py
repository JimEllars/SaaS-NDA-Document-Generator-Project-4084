from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:5173")

    # Fill invalid data (short names)
    page.fill('input[name="disclosing"]', "A")
    page.fill('input[name="receiving"]', "B")

    # Wait a bit for state updates
    page.wait_for_timeout(500)

    # Take full page screenshot
    page.screenshot(path="verification/validation_error_full.png", full_page=True)

    # Now fill valid data
    page.fill('input[name="disclosing"]', "Alice Corp")
    page.fill('input[name="receiving"]', "Bob Inc")

    page.wait_for_timeout(500)

    # Take full page screenshot
    page.screenshot(path="verification/valid_form_full.png", full_page=True)

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
