from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def run_server():
    port = 8000
    server_address = ('', port)
    
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    httpd = HTTPServer(server_address, CORSRequestHandler)
    print(f'Server running on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()