const { Router } = require('express');
const router = Router();
const db = require('../database');

// Ruta base para verificar el servidor
router.get('/', (req, res) => {
  res.status(200).json('Server on port 8082 and database is connected');
  res.status(200).json('Server on port 8082 and database is connected');
});

// Ruta para obtener todos los códigos
router.get('/codigoszonas', (req, res) => {
  db.query('SELECT id, nombre FROM codigo;', (error, rows) => {
    if (error) {
      console.error('Error al obtener los sectores:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(rows);
  });
});
// Ruta para obtener todas las zonas
router.get('/zonas', (req, res) => {
  db.query('SELECT id, nombre FROM zona;', (error, rows) => {
    if (error) {
      console.error('Error al obtener las zonas:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(rows);
  });
});

// Ruta para obtener todos los sectores
router.get('/sectores', (req, res) => {
  db.query('SELECT id, nombre FROM sector;', (error, rows) => {
    if (error) {
      console.error('Error al obtener los sectores:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(rows);
  });
});



// Ruta para obtener todas las categorías
router.get('/categorias', (req, res) => {
  db.query('SELECT id, nombre FROM categoria;', (error, rows) => {
    if (error) {
      console.error('Error al obtener las categorías:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(rows);
  });
});


//insercion de farmacia si tiene medicamentos controlados
// Ruta para insertar la relación entre farmacia y sustancias controladas
router.post('/farmacia_sustancias', (req, res) => {
  const { farmacia_id } = req.body;

  const query = `
    INSERT INTO farmacia_sustancias (farmacia_id, sustancia_id) 
    VALUES (?, ?);
  `;

  const values = [farmacia_id, 1]; // Aquí puedes ajustar el `sustancia_id` si necesitas más lógica

  db.query(query, values, (error, result) => {
    if (error) {
      console.error('Error al insertar la relación en farmacia_sustancias:', error);
      return res.status(500).json({ error: 'Error interno del servidor al registrar la relación' });
    }
    res.status(201).json({ message: 'Relación registrada exitosamente' });
  });
});

//registra nueva farmacia y dueno asignandole su id del dueno a la farmacia
router.post('/nuevafarmacia', (req, res) => {
  try {
    const {
      nombre, 
      numero_registro,
      direccion,
      latitud,
      longitud,
      fecha_registro,
      razon_social,
      nit,
      zona_id,
      sector_id,
      observaciones,
      tipo_id,
      codigo_id,
      imagen,
      nombreDueno,
      primer_apellido,
      segundo_apellido,
      carnet_identidad,
      celular
    } = req.body;

    // Depuración: Imprimir los valores recibidos antes de las validaciones
    console.log({
      nombre,
      nombreDueno,
      primer_apellido,
      carnet_identidad,
      celular
    });

    const queryDueno = `
      INSERT INTO Dueno (nombre, primer_apellido, segundo_apellido, carnet_identidad, celular, status)
      VALUES (?, ?, ?, ?, ?, 1);
    `;

    const valuesDueno = [nombreDueno, primer_apellido, segundo_apellido, carnet_identidad, celular];

    db.query(queryDueno, valuesDueno, (error, result) => {
      if (error) {
        console.error('Error al registrar el dueño:', error);
        return res.status(500).json({ error: 'Error interno del servidor al registrar el dueño', details: error.message });
      }

      const dueno_id = result.insertId;

      // Paso 2: Registrar la farmacia
      const imagenBuffer = imagen ? Buffer.from(imagen.split(',')[1], 'base64') : null;

      const queryFarmacia = `
        INSERT INTO Farmacia (
          nombre, 
          numero_registro, 
          direccion, 
          latitud, 
          longitud, 
          fecha_registro, 
          razon_social, 
          nit, 
          zona_id, 
          sector_id, 
          observaciones, 
          imagen, 
          dueno_id, 
          tipo_id, 
          codigo_id, 
          usuario_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;

      const valuesFarmacia = [
        nombre,
        numero_registro,
        direccion,
        latitud,
        longitud,
        fecha_registro,
        razon_social,
        nit,
        zona_id,
        sector_id,
        observaciones,
        imagenBuffer,
        dueno_id,  // ID del dueño registrado
        tipo_id,
        codigo_id,
        2 // Usuario fijo con ID 2
      ];

      db.query(queryFarmacia, valuesFarmacia, (error, result) => {
        if (error) {
          console.error('Error al registrar la farmacia:', error);
          return res.status(500).json({ error: 'Error interno del servidor al registrar la farmacia', details: error.message });
        }

        res.status(201).json({ message: 'Farmacia registrada exitosamente', id: result.insertId });
      });
    });
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

//update 
//obtener farmacia 
// Ruta para obtener los detalles de una farmacia por ID
router.get('/cargarfarmacia/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM Farmacia WHERE id = ?';

  db.query(query, [id], (error, results) => {
    if (error) {
      console.error('Error al obtener los datos de la farmacia:', error);
      return res.status(500).json({ error: 'Error al obtener los datos de la farmacia' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Farmacia no encontrada' });
    }

    res.status(200).json(results[0]);
  });
});
//detalles dueno
// Ruta para obtener los datos del dueño por ID
router.get('/duenofarmacia/:id', (req, res) => {
  const duenoId = req.params.id;

  // Consulta para obtener los datos del dueño por su ID
  const query = `SELECT * FROM Dueno WHERE id = ?`;
  
  db.query(query, [duenoId], (error, results) => {
    if (error) {
      console.error('Error al obtener los datos del dueño:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Dueño no encontrado' });
    }

    // Devolver los datos del dueño en formato JSON
    res.status(200).json(results[0]);
  });
});
//cargar medicamentos controlados en el editar 
router.get('/farmacia_sustancias/:farmacia_id', (req, res) => {
  const { farmacia_id } = req.params;

  const query = `
    SELECT COUNT(*) as count 
    FROM farmacia_sustancias 
    WHERE farmacia_id = ?;
  `;

  db.query(query, [farmacia_id], (error, result) => {
    if (error) {
      console.error('Error al verificar farmacia_sustancias:', error);
      return res.status(500).json({ error: 'Error interno del servidor al verificar la relación' });
    }

    const hasSustancias = result[0].count > 0;
    res.status(200).json({ tiene_sustancias: hasSustancias });
  });
});

// Ruta para actualizar la farmacia, dueño y sustancias controladas
router.put('/actualizarfarmacia/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      numero_registro,
      direccion,
      latitud,
      longitud,
      fecha_registro,
      razon_social,
      nit,
      zona_id,
      sector_id,
      observaciones,
      tipo_id,
      codigo_id,
      imagen,
      nombreDueno,
      primer_apellido,
      segundo_apellido,
      carnet_identidad,
      celular,
      medicamentosControlados
    } = req.body;

    // Paso 1: Actualizar el dueño
    const queryDueno = `
      UPDATE Dueno 
      SET nombre = ?, primer_apellido = ?, segundo_apellido = ?, carnet_identidad = ?, celular = ? 
      WHERE id = (SELECT dueno_id FROM Farmacia WHERE id = ?);
    `;

    const valuesDueno = [nombreDueno, primer_apellido, segundo_apellido, carnet_identidad, celular, id];

    db.query(queryDueno, valuesDueno, (error, result) => {
      if (error) {
        console.error('Error al actualizar el dueño:', error);
        return res.status(500).json({ error: 'Error interno del servidor al actualizar el dueño' });
      }

      // Paso 2: Actualizar la farmacia
      const imagenBuffer = imagen ? Buffer.from(imagen.split(',')[1], 'base64') : null;
      const queryFarmacia = `
        UPDATE Farmacia 
        SET nombre = ?, numero_registro = ?, direccion = ?, latitud = ?, longitud = ?, 
        fecha_registro = ?, razon_social = ?, nit = ?, zona_id = ?, sector_id = ?, 
        observaciones = ?, imagen = ?, tipo_id = ?, codigo_id = ? 
        WHERE id = ?;
      `;

      const valuesFarmacia = [
        nombre, numero_registro, direccion, latitud, longitud, fecha_registro, razon_social, 
        nit, zona_id, sector_id, observaciones, imagenBuffer, tipo_id, codigo_id, id
      ];

      db.query(queryFarmacia, valuesFarmacia, (error, result) => {
        if (error) {
          console.error('Error al actualizar la farmacia:', error);
          return res.status(500).json({ error: 'Error interno del servidor al actualizar la farmacia' });
        }

        // Paso 3: Actualizar las sustancias controladas
        if (medicamentosControlados === 'Si') {
          const querySustancias = `
            INSERT INTO farmacia_sustancias (farmacia_id, sustancia_id) 
            VALUES (?, 1)
            ON DUPLICATE KEY UPDATE sustancia_id = 1;
          `;

          db.query(querySustancias, [id], (error, result) => {
            if (error) {
              console.error('Error al actualizar las sustancias controladas:', error);
              return res.status(500).json({ error: 'Error interno del servidor al actualizar las sustancias' });
            }

            res.status(200).json({ message: 'Farmacia y datos actualizados exitosamente' });
          });
        } else if (medicamentosControlados === 'No') {
          // Eliminar las sustancias controladas asociadas a la farmacia
          const queryEliminarSustancias = `
            DELETE FROM farmacia_sustancias WHERE farmacia_id = ?;
          `;

          db.query(queryEliminarSustancias, [id], (error, result) => {
            if (error) {
              console.error('Error al eliminar las sustancias controladas:', error);
              return res.status(500).json({ error: 'Error interno del servidor al eliminar las sustancias' });
            }

            res.status(200).json({ message: 'Farmacia actualizada exitosamente y sustancias eliminadas' });
          });
        } else {
          res.status(200).json({ message: 'Farmacia actualizada exitosamente' });
        }
      });
    });
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});


//eliminacion logica farmacia 
// Ruta para la eliminación lógica de la farmacia
router.put('/farmacia/eliminar/:id', (req, res) => {
  const { id } = req.params;

  const query = `UPDATE Farmacia SET status = 0 WHERE id = ?`;

  db.query(query, [id], (error, result) => {
    if (error) {
      console.error('Error al eliminar farmacia:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    res.status(200).json({ message: 'Farmacia eliminada lógicamente' });
  });
});




// Obtener todas las farmacias activas
router.get('/all', (req, res) => {
  db.query('SELECT * FROM Farmacia WHERE status = 1;', (error, rows) => {
    if (error) {
      console.error('Error fetching farmacias:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(rows);
  });
});
// Obtener todas las farmacias con sustancias controladas
router.get('/farmacias-con-sustancias', (req, res) => {
  db.query(`
    SELECT f.id, f.nombre, f.latitud, f.longitud
    FROM farmacia f
    JOIN farmacia_sustancias fs ON f.id = fs.farmacia_id
    WHERE f.status = 1;
  `, (error, rows) => {
    if (error) {
      console.error('Error fetching farmacias con sustancias:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron farmacias con sustancias controladas' });
    }
    
    res.json(rows);
  });
});

// Buscar farmacias por nombre o letras iniciales
router.get('/buscar-farmacias', (req, res) => {
  const { nombre } = req.query;

  if (!nombre) {
    return res.status(400).json({ error: 'Debe proporcionar un nombre o parte del nombre para buscar farmacias' });
  }

  const searchQuery = `%${nombre}%`; // Esto permitirá buscar por letras iniciales o cualquier parte del nombre

  db.query(`
    SELECT id, nombre, latitud, longitud
    FROM farmacia
    WHERE nombre LIKE ? AND status = 1;
  `, [searchQuery], (error, rows) => {
    if (error) {
      console.error('Error fetching farmacias:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron farmacias con ese nombre' });
    }

    res.json(rows);
  });
});


// Ruta para obtener horas de entrada y salida para una farmacia específica
router.get('/:id/horas', (req, res) => {
  const { id } = req.params;

  // Consulta SQL ajustada
  db.query(`
    SELECT h.id, h.nombre, h.hora_entrada, h.hora_salida
    FROM Horas h
    INNER JOIN Farmacia_Horas fh ON h.id = fh.hora_id
    WHERE fh.farmacia_id = ? AND h.status = 1;
  `, [id], (error, rows) => {
      if (error) {
          console.error('Error al obtener las horas:', error);
          return res.status(500).json({ error: 'Internal server error' });
      }

      if (rows.length === 0) {
          return res.status(404).json({ error: 'No se encontraron horas para esta farmacia' });
      }

      res.json(rows);
  });
});



// Obtener una farmacia por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM Farmacia WHERE id = ? AND status = 1;', [id], (error, rows) => {
    if (error) {
      console.error(`Error fetching farmacia with ID ${id}:`, error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Farmacia not found' });
    }
    res.json(rows[0]);
  });
});








// Actualizar una farmacia por ID
router.put('/:id', (req, res) => {
  const { nombre, numero_registro, direccion, latitud, longitud, fecha_registro, razon_social, nit, zona_id, sector_id, observaciones, dueno_id, tipo_id, codigo_id, usuario_id } = req.body;
  const { id } = req.params;
  db.query(
    'UPDATE Farmacia SET nombre = ?, numero_registro = ?, direccion = ?, latitud = ?, longitud = ?, fecha_registro = ?, razon_social = ?, nit = ?, zona_id = ?, sector_id = ?, observaciones = ?, dueno_id = ?, tipo_id = ?, codigo_id = ?, usuario_id = ?, last_update = CURRENT_TIMESTAMP WHERE id = ? AND status = 1;',
    [nombre, numero_registro, direccion, latitud, longitud, fecha_registro, razon_social, nit, zona_id, sector_id, observaciones, dueno_id, tipo_id, codigo_id, usuario_id, id], 
    (error, result) => {
      if (error) {
        console.error(`Error updating farmacia with ID ${id}:`, error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Farmacia not found' });
      }
      res.json({ Status: 'Farmacia updated' });
    }
  
  );
});

// Eliminar una farmacia por ID (marcar como inactiva)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('UPDATE Farmacia SET status = 0 WHERE id = ?;', [id], (error, result) => {
    if (error) {
      console.error(`Error deleting farmacia with ID ${id}:`, error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Farmacia not found' });
    }
    res.json({ Status: 'Farmacia deleted' });
  });
});

// Obtener horas de entrada y salida para una farmacia específica
router.get('/:id/horas', (req, res) => {
  const { id } = req.params;

  db.query(`
    SELECT h.id, h.nombre, h.hora_entrada, h.hora_salida
    FROM Horas h
    INNER JOIN Farmacia_Horas fh ON h.id = fh.hora_id
    WHERE fh.farmacia_id = ? AND h.status = 1;
  `, [id], (error, rows) => {
    if (error) {
      console.error('Error al obtener las horas:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron horas para esta farmacia' });
    }

    res.json(rows);
  });
});

// Obtener farmacias con el nombre del dueño
router.get('/farmacias-con-duenos', (req, res) => {
  db.query(`
    SELECT 
        f.id AS farmacia_id,
        f.nombre AS farmacia_nombre,
        d.nombre AS dueno_nombre,
        d.primer_apellido AS dueno_primer_apellido,
        d.segundo_apellido AS dueno_segundo_apellido
    FROM 
        Farmacia f
    JOIN 
        Dueno d ON f.dueno_id = d.id
    WHERE 
        f.status = 1 AND d.status = 1;
  `, (error, rows) => {
    if (error) {
      console.error('Error fetching farmacias with owners:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    res.json(rows);
  });
});



// Archivo: farmacia.js (o similar en el backend)
router.get('/por-zona', (req, res) => {
  const { zona } = req.query;
  
  if (!zona) {
    return res.status(400).json({ error: 'Se requiere el parámetro zona' });
  }

  // Consulta para obtener farmacias activas con el nombre de la zona (código)
  db.query(`
    SELECT 
      f.id AS farmacia_id,
      f.nombre AS farmacia_nombre,
      f.direccion,
      f.latitud,
      f.longitud,
      c.id AS codigo_id,
      c.nombre AS codigo_nombre
    FROM 
      Farmacia f
    JOIN 
      Codigo c ON f.codigo_id = c.id
    WHERE 
      f.codigo_id = ? AND f.status = 1;
  `, [zona], (error, rows) => {
    if (error) {
      console.error('Error al obtener farmacias:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: `No se encontraron farmacias activas en la zona con código ${zona}` });
    }

    res.json(rows);
  });
});

// Obtener horas de entrada y salida para una farmacia específica
router.get('/:id/horas', (req, res) => {
  const { id } = req.params;

  db.query(`
    SELECT h.id, h.nombre, h.hora_entrada, h.hora_salida
    FROM Horas h
    INNER JOIN Farmacia_Horas fh ON h.id = fh.hora_id
    WHERE fh.farmacia_id = ? AND h.status = 1;
  `, [id], (error, rows) => {
    if (error) {
      console.error('Error al obtener las horas:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron horas para esta farmacia' });
    }

    res.json(rows);
  });
});




module.exports = router;
