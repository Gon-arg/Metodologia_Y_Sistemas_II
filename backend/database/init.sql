CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

CREATE TABLE movimientos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    categoria_id INT NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('gasto','ingreso')),
    monto DECIMAL(10, 2) NOT NULL,
    descripcion VARCHAR(255),
    fecha DATE NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE metas_ahorro (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    monto_objetivo DECIMAL(10, 2) NOT NULL,
    monto_actual DECIMAL(10, 2) DEFAULT 0.00,
    estado VARCHAR(20) DEFAULT 'en proceso' CHECK (estado IN ('en proceso', 'completada')),
    fecha_limite DATE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE aportes_metas (
    id SERIAL PRIMARY KEY,
    meta_id INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL CHECK (monto > 0),  
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    descripcion VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meta_id) REFERENCES metas_ahorro(id) ON DELETE CASCADE
);


CREATE OR REPLACE FUNCTION actualizar_monto_meta()
RETURNS TRIGGER AS $$
DECLARE
    v_meta_id INT;
    v_nuevo_total DECIMAL(10,2);
    v_monto_objetivo DECIMAL(10,2);
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_meta_id := OLD.meta_id;
    ELSE
        v_meta_id := NEW.meta_id;
    END IF;

    SELECT COALESCE(SUM(monto), 0) INTO v_nuevo_total
    FROM aportes_metas
    WHERE meta_id = v_meta_id;

    SELECT monto_objetivo INTO v_monto_objetivo
    FROM metas_ahorro
    WHERE id = v_meta_id;

    UPDATE metas_ahorro
    SET 
        monto_actual = v_nuevo_total,
        estado = CASE 
            WHEN v_nuevo_total >= v_monto_objetivo THEN 'completada'
            ELSE 'en proceso'
        END
    WHERE id = v_meta_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 1. Se dispara al AGREGAR un aporte
CREATE TRIGGER trg_aportes_insert
AFTER INSERT ON aportes_metas
FOR EACH ROW EXECUTE FUNCTION actualizar_monto_meta();

-- 2. Se dispara al EDITAR un aporte (por si se corrige un monto)
CREATE TRIGGER trg_aportes_update
AFTER UPDATE ON aportes_metas
FOR EACH ROW EXECUTE FUNCTION actualizar_monto_meta();

-- 3. Se dispara al BORRAR un aporte (para restar el monto y revertir estado si es necesario)
CREATE TRIGGER trg_aportes_delete
AFTER DELETE ON aportes_metas
FOR EACH ROW EXECUTE FUNCTION actualizar_monto_meta();

