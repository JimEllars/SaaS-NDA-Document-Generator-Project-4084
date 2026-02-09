from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:5173/")

    # Wait for the page to load, especially the header which uses SafeIcon
    page.wait_for_selector("text=AXiM NDA Generator")

    # Take a screenshot
    page.screenshot(path="verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
