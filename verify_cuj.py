from playwright.sync_api import sync_playwright
import os
import glob

def run_cuj(page):
    page.goto("http://localhost:5173")
    page.wait_for_timeout(1000)

    # Take screenshot of the initial dark theme form
    page.screenshot(path="/home/jules/verification/screenshots/verification_dark_theme.png")
    page.wait_for_timeout(500)

    # Fill out some form details
    page.get_by_label("Disclosing Party").fill("Cyberdyne Systems")
    page.wait_for_timeout(500)

    page.get_by_label("Receiving Party").fill("John Connor")
    page.wait_for_timeout(500)

    page.get_by_label("Effective Date").fill("2024-04-18")
    page.wait_for_timeout(500)

    # Click "Purchase & Generate"
    page.get_by_role("button", name="Purchase & Generate").click()
    page.wait_for_timeout(1000)

    # Since we mocked it out and it just redirects (or shows a toast for now and logs it), let's wait to see the Toast
    page.screenshot(path="/home/jules/verification/screenshots/verification_after_purchase.png")
    page.wait_for_timeout(1500)

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()

    # Find the generated video
    videos = glob.glob("/home/jules/verification/videos/*.webm")
    if videos:
        print(f"Video saved to {videos[0]}")
    else:
        print("No video found.")
