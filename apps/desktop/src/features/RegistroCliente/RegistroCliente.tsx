import "./RegistroCliente.css";

export default function RegistroCliente() {
  return (
    <div className="rc-container">
      <div className="rc-card">

        <h1>Registro de Cliente</h1>
        <p className="rc-subtitle">
          Registro de cliente para servicio de fibra óptica
        </p>

        <form className="rc-form-grid">

          {/* LADO IZQUIERDO */}
          <div className="rc-left-column">

            <div className="rc-row">
              <div className="rc-input-group">
                <label>
                  <input type="text" required />
                  <span>Nombre</span>
                </label>
              </div>

              <div className="rc-input-group">
                <label>
                  <input type="text" required />
                  <span>Apellido</span>
                </label>
              </div>
            </div>

            <div className="rc-input-group">
              <label>
                <input type="text" required />
                <span>Cédula</span>
              </label>
            </div>

          </div>

          {/* LADO DERECHO */}
          <div className="rc-right-column">

            <div className="rc-input-group">
              <label>
                <input type="text" required />
                <span>Zona</span>
              </label>
            </div>

            <div className="rc-row">
              <div className="rc-input-group">
                <label>
                  <input type="text" required />
                  <span>Caja</span>
                </label>
              </div>

              <div className="rc-input-group">
                <label>
                  <input type="number" required />
                  <span>Mensualidad</span>
                </label>
              </div>
            </div>

            <div className="rc-input-group">
              <label>
                <input type="text" required />
                <span>Plan</span>
              </label>
            </div>

          </div>

          <div className="rc-full-width">
            <button className="rc-btn-primary">
              Guardar Cliente
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
