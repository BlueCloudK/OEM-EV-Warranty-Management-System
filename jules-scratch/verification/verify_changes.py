from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173/login")
        page.get_by_placeholder("Username").fill("evmstaff")
        page.get_by_placeholder("Password").fill("password")
        page.get_by_role("button", name="Đăng nhập").click()
        page.wait_for_timeout(3000) # wait for 3 seconds
        page.screenshot(path="jules-scratch/verification/screenshot.png")
        browser.close()

run()