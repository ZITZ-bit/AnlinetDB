import "./CrearCajas.css";

export default function CrearCajas() {
  return (
    <div className="cx-wrapper">
      <div className="cx-panel">

        <h1>Registrar Caja</h1>
        <p className="cx-description">
          Ingresa los datos de la caja de distribución
        </p>

        <form className="cx-grid">

          {/* COLUMNA IZQUIERDA */}
          <div className="cx-side-left">

            <div className="cx-field">
              <label>
                <input type="text" required placeholder=" " />
                <span>ID de Caja</span>
              </label>
            </div>

            <div className="cx-field">
              <label>
                <input type="text" required placeholder=" " />
                <span>Dirección</span>
              </label>
            </div>

            <div className="cx-inline">
              <div className="cx-field">
                <label>
                  <select required defaultValue="">
                    <option value="" disabled hidden></option>
                    <option value="norte">Zona Norte</option>
                    <option value="sur">Zona Sur</option>
                    <option value="este">Zona Este</option>
                    <option value="oeste">Zona Oeste</option>
                    <option value="centro">Centro</option>
                  </select>
                  <span>Zona</span>
                </label>
              </div>

              <div className="cx-field">
                <label>
                  <select required defaultValue="">
                    <option value="" disabled hidden></option>
                    <option value="distribucion">Distribución</option>
                    <option value="empalme">Empalme</option>
                    <option value="terminal">Terminal</option>
                    <option value="hermetica">Hermética</option>
                  </select>
                  <span>Tipo</span>
                </label>
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA */}
          <div className="cx-side-right">

            <div className="cx-inline">
              <div className="cx-field">
                <label>
                  <select required defaultValue="">
                    <option value="" disabled hidden></option>
                    <option value="8">8 Puertos</option>
                    <option value="16">16 Puertos</option>
                    <option value="24">24 Puertos</option>
                    <option value="32">32 Puertos</option>
                    <option value="48">48 Puertos</option>
                    <option value="64">64 Puertos</option>
                    <option value="128">128 Puertos</option>
                  </select>
                  <span>Capacidad</span>
                </label>
              </div>

              <div className="cx-field">
                <label>
                  <input type="number" required placeholder=" " min="0" />
                  <span>Puertos Libres</span>
                </label>
              </div>
            </div>

            <div className="cx-field">
              <label>
                <select required defaultValue="">
                  <option value="" disabled hidden></option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo / Dada de Baja</option>
                  <option value="mantenimiento">En mantenimiento</option>
                  <option value="averiada">Averiada</option>
                </select>
                <span>Estado</span>
              </label>
            </div>

            <div className="cx-field">
              <label>
                <input type="text" placeholder=" " />
                <span>Observaciones (opcional)</span>
              </label>
            </div>

          </div>

          <div className="cx-full">
            <button type="submit" className="cx-button">
              Registrar Caja
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
