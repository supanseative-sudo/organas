#!/usr/bin/env python3
"""Start the Organas site on your own computer.

Run it from anywhere:   python3 serve.py
It always serves the folder this file lives in, listens on this computer only,
picks a free port, and opens the site in your browser.
"""
import http.server, os, socketserver, sys, threading, webbrowser

root = os.path.dirname(os.path.abspath(__file__))
os.chdir(root)

needed = ["index.html", "css/style.css", "js/main.js", "js/panel.js", "js/shop.js", "js/defaults.js",
          "vendor/gsap.min.js", "vendor/dialkit/browser.global.js", "assets/mango.png", "fonts/figtree-latin-400-normal.woff2"]
missing = [f for f in needed if not os.path.exists(f)]
if missing:
    print("These files are missing next to serve.py:\n  " + "\n  ".join(missing))
    print("\nUnzip the whole organas-site.zip and keep every folder together, then run this again.")
    sys.exit(1)


class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


port = 8765
while True:
    try:
        server = Server(("127.0.0.1", port), Handler)
        break
    except OSError:
        port += 1

url = "http://127.0.0.1:%d/index.html" % port
print("Organas is running at  " + url)
print("Serving: " + root)
print("Press Ctrl+C to stop.")
threading.Timer(0.6, lambda: webbrowser.open(url)).start()
try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\nStopped.")
