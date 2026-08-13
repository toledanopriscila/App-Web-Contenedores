from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SECRET_KEY'] = 'clave-secreta-maipu-2026'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///servicios_maipu.db'
db = SQLAlchemy(app)

# Modelo de Empresa (Administrador del sistema)
class Empresa(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre_empresa = db.Column(db.String(100), nullable=False)
    nombre_propietario = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method='scrypt')

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

with app.app_context():
    db.create_all()

# Ruta principal (Panel de contenedores)
@app.route('/')
def index():
    if 'empresa_id' not in session:
        return redirect(url_for('login'))
    
    # Recuperamos el nombre de la empresa logueada para pasarlo a la plantilla
    nombre_empresa = session.get('nombre_empresa', 'Servicios Maipú')
    return render_template('index.html', nombre_empresa=nombre_empresa)

# Ruta de Registro del Administrador / Empresa
@app.route('/registro', methods=['GET', 'POST'])
def registro():
    if request.method == 'POST':
        nombre_empresa = request.form.get('nombre_empresa')
        nombre_propietario = request.form.get('nombre_propietario')
        email = request.form.get('email')
        password = request.form.get('password')

        # Verificar si el email ya existe
        empresa_existente = Empresa.query.filter_by(email=email).first()
        if empresa_existente:
            flash('El correo electrónico ya está registrado.', 'danger')
            return redirect(url_for('registro'))

        nueva_empresa = Empresa(
            nombre_empresa=nombre_empresa,
            nombre_propietario=nombre_propietario,
            email=email
        )
        nueva_empresa.set_password(password)
        
        db.session.add(nueva_empresa)
        db.session.commit()

        flash('Registro exitoso. Ahora puedes iniciar sesión.', 'success')
        return redirect(url_for('login'))

    return render_template('registro.html')

# Ruta de Inicio de Sesión
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        empresa = Empresa.query.filter_by(email=email).first()
        if empresa and empresa.check_password(password):
            session['empresa_id'] = empresa.id
            session['nombre_empresa'] = empresa.nombre_empresa
            return redirect(url_for('index'))
        else:
            flash('Correo o contraseña incorrectos.', 'danger')

    return render_template('login.html')

# Ruta para Cerrar Sesión
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

if __name__ == '__main__':
    print("==================================================")
    print("    SERVICIOS MAIPÚ - GESTIÓN DE CONTENEDORES   ")
    print("==================================================")
    print("🚀 Iniciando servidor Flask en http://localhost:5000")
    app.run(debug=True, port=5000)