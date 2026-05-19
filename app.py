import http.server
import socketserver
import webbrowser

PORT = 5000
Handler = http.server.SimpleHTTPRequestHandler

print("==================================================")
print("      SERVICIOS MAIPÚ - GESTIÓN DE CONTENEDORES   ")
print("==================================================")
print(f"🚀 Iniciando el servidor local...")
print(f"🔗 URL ACTIVA: http://localhost:{PORT}")
print("==================================================")
print("👉 Presioná CTRL + C en la terminal para apagar el servidor.")

# Esto abre automáticamente tu navegador en la URL correcta apenas ejecutás el comando
webbrowser.open(f"http://localhost:{PORT}")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()