import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegistroFarmacia.css'; // Importamos el archivo de estilos
import MapViewRegistro from './MapViewRegistro';

const RegistroFarmacia = () => {
  
  const navigate = useNavigate(); // Inicializa useNavigate

  const handleMenu = () => {
    navigate('/menu-admin'); // Redirige a la ruta de MenuAdmin
  };

  // Estados para los datos de los pickers
  const [zonas, setZonas] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [categoriasEstablecimiento, setCategoriasEstablecimiento] = useState([]);
  const [codigosZona, setCodigosZona] = useState([]);


  // Estados del formulario
  const [nombreFarmacia, setNombreFarmacia] = useState('');
  const [categoriaEstablecimiento, setCategoriaEstablecimiento] = useState('');
  const [nroResolucion, setNroResolucion] = useState('');
  
  const hoy = new Date().toISOString().split('T')[0];
  const [fechaResolucion, setFechaResolucion] = useState(hoy);

  const [departamento, setDepartamento] = useState('Cochabamba');
  const [municipio, setMunicipio] = useState('Sacaba');
  const [zona, setZona] = useState('');
  const [codigozona, setCodigoZona] = useState('');
  const [red, setRed] = useState('');
  const [sector, setSector] = useState('');
  const [direccion, setDireccion] = useState('');
  const [latitud, setLatitud] = useState(null);
  const [longitud, setLongitud] = useState(null);

  const handleLocationSelect = (lat, lng) => {
    setLatitud(lat);
    setLongitud(lng);
  };

  const [nombre, setNombre] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [ci, setCi] = useState('');
  const [nit, setNit] = useState('');
  const [celular, setCelular] = useState('');
  const [correo, setCorreo] = useState('');

  const [horasFarmacia, setHorasFarmacia] = useState('8h');
  const [tipoFarmacia, setTipoFarmacia] = useState('Farmacia Privada');
  const [obs, setObs] = useState('');
  const [medicamentosControlados, setMedicamentosControlados] = useState('');
  const [fileBase64, setFileBase64] = useState(null);

  // Manejar la carga de archivos y convertir a base64
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result); // Guarda el archivo en base64
      };
      reader.readAsDataURL(file); // Convierte el archivo a base64
    }
  };

  // Cargar datos para los pickers al montar el componente
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [zonasRes, sectoresRes, categoriasRes, codigosRes] = await Promise.all([
          fetch('http://localhost:8082/farmacia/zonas'),
          fetch('http://localhost:8082/farmacia/sectores'),
          fetch('http://localhost:8082/farmacia/categorias'),
          fetch('http://localhost:8082/farmacia/codigoszonas')
        ]);

        const zonasData = await zonasRes.json();
        const sectoresData = await sectoresRes.json();
        const categoriasData = await categoriasRes.json();
        const codigosData = await codigosRes.json();

        setZonas(zonasData);
        setSectores(sectoresData);
        setCategoriasEstablecimiento(categoriasData);
        setCodigosZona(codigosData);
      } catch (error) {
        console.error('Error fetching data for pickers:', error);
      }
    };

    fetchOptions();
  }, []);

  const handleSubmit = async () => {
    // Crear el objeto de datos para enviar al backend
    const farmaciaData = {
      nombre: nombreFarmacia, 
      numero_registro: nroResolucion,
      direccion: direccion,
      latitud: latitud,
      longitud: longitud,
      fecha_registro: fechaResolucion,
      razon_social: nombre, 
      nit: nit,
      zona_id: zona.id, 
      sector_id: sector.id, 
      observaciones: obs,
      tipo_id: categoriaEstablecimiento.id, 
      codigo_id: codigozona.id,  
      imagen: fileBase64, 
      nombreDueno: nombre, 
      primer_apellido: apellidoPaterno,
      segundo_apellido: apellidoMaterno,
      carnet_identidad: ci,
      celular: celular
    };
  
    console.log("Datos enviados al backend:", farmaciaData);
  
    try {
      const response = await fetch('http://localhost:8082/farmacia/nuevafarmacia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(farmaciaData)
      });
  
      console.log('Response status:', response.status);
      const responseData = await response.text(); 
      console.log('Response data:', responseData);
  
      if (response.ok) {
        const result = JSON.parse(responseData); 
        const farmaciaId = result.id; // Obtener el ID de la farmacia registrada
  
        // Verificar si medicamentos controlados es "Sí"
        if (medicamentosControlados === 'Si') {
          // Hacer una segunda solicitud para insertar en farmacia_sustancias
          const sustanciasData = {
            farmacia_id: farmaciaId
          };
          
          const sustanciasResponse = await fetch('http://localhost:8082/farmacia/farmacia_sustancias', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(sustanciasData)
          });
  
          if (sustanciasResponse.ok) {
            console.log('Relación de farmacia con sustancias controladas registrada');
          } else {
            console.error('Error al registrar la relación en farmacia_sustancias');
          }
        }
  
        alert('Farmacia registrada exitosamente con ID: ' + farmaciaId);
        navigate('/menu-admin');
      } else {
        alert('Error al registrar la farmacia');
      }
    } catch (error) {
      console.error('Error en la solicitud de registro de farmacia:', error);
      alert('Ocurrió un error al registrar la farmacia.');
    }
  };
  
  
  
  
  
  

  return (
    <div className="container1">
      <h1 className="title1">Registro Farmacia</h1>

      <h2 className="subtitle1">Datos Farmacia:</h2>
      
      <label className="label1">Nombre Farmacia:</label>
      <input
        placeholder="Nombre Farmacia"
        value={nombreFarmacia}
        onChange={(e) => setNombreFarmacia(e.target.value)}
        className="input1"
      />
      
      <label className="label1">Categoría de Establecimiento:</label>
<select
  value={categoriaEstablecimiento.id} // Seleccionas por id
  onChange={(e) => {
    const selectedCategoria = categoriasEstablecimiento.find(c => c.id === parseInt(e.target.value));
    setCategoriaEstablecimiento(selectedCategoria); // Guardas el objeto completo
  }}
  className="picker1"
>
  {categoriasEstablecimiento.map((cat) => (
    <option key={cat.id} value={cat.id}>{cat.nombre}</option> // El valor es el id, pero se muestra el nombre
  ))}
</select>
      
      <label className="label1">Nro Resolución:</label>
      <input
        placeholder="Nro Resolución"
        value={nroResolucion}
        onChange={(e) => setNroResolucion(e.target.value)}
        className="input1"
      />
      
      <label className="label1">Fecha Resolución:</label>
      <input
        type="date"
        value={fechaResolucion}
        onChange={(e) => setFechaResolucion(e.target.value)}
        className="input1"
      />

      
      <h2 className="subtitle1">Dirección Farmacia:</h2>
      
      <label className="label1">Departamento:</label>
      <select
        value={departamento}
        onChange={(e) => setDepartamento(e.target.value)}
        className="picker1"
      >
        <option value="Cochabamba">Cochabamba</option>
        <option value="La Paz">La Paz</option>
      </select>
      
      <label className="label1">Municipio:</label>
      <select
        value={municipio}
        onChange={(e) => setMunicipio(e.target.value)}
        className="picker1"
      >
        <option value="Sacaba">Sacaba</option>
        <option value="Cercado">Cercado</option>
      </select>
      
      <label className="label1">Zona:</label>
<select
  value={zona.id} // Aquí seleccionas por id
  onChange={(e) => {
    const selectedZona = zonas.find(z => z.id === parseInt(e.target.value));
    setZona(selectedZona); // Guardas el objeto completo con el id y nombre
  }}
  className="picker1"
>
  {zonas.map((zona) => (
    <option key={zona.id} value={zona.id}>{zona.nombre}</option> // El valor es el id, pero se muestra el nombre
  ))}
</select>

<label className="label1">Codigo Zona:</label>
<select
  value={codigozona.id} // Seleccionas por id
  onChange={(e) => {
    const selectedCodigo = codigosZona.find(c => c.id === parseInt(e.target.value));
    setCodigoZona(selectedCodigo); // Guardas el objeto completo
  }}
  className="picker1"
>
  {codigosZona.map((codigo) => (
    <option key={codigo.id} value={codigo.id}>{codigo.nombre}</option> // El valor es el id, pero se muestra el nombre
  ))}
</select>

      <label className="label1">Red:</label>
      <input
        placeholder="Red"
        value={red}
        onChange={(e) => setRed(e.target.value)}
        className="input1"
      />
      
      <label className="label1">Sector:</label>
<select
  value={sector.id} // Seleccionas por id
  onChange={(e) => {
    const selectedSector = sectores.find(s => s.id === parseInt(e.target.value));
    setSector(selectedSector); // Guardas el objeto completo con el id y nombre
  }}
  className="picker1"
>
  {sectores.map((sector) => (
    <option key={sector.id} value={sector.id}>{sector.nombre}</option> // El valor es el id, pero se muestra el nombre
  ))}
</select>
      
      <label className="label1">Dirección:</label>
      <input
        placeholder="Dirección"
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
        className="input1"
      />

      <h2 className="subtitle1">Seleccionar Ubicación:</h2>
      <MapViewRegistro onLocationSelect={handleLocationSelect} />

      {latitud && longitud && (
        <p>Ubicación seleccionada - Latitud: {latitud}, Longitud: {longitud}</p>
      )}

      <button onClick={() => console.log('Ubicación Confirmada')} className="bottomButton2">
        <span className="buttonText2">Confirmar Ubicación</span>
      </button>

      <h2 className="subtitle1">Cargar Imagen</h2>

      {fileBase64 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <img src={fileBase64} alt="Archivo Cargado" style={{ width: '200px', height: '200px', borderRadius: '10px' }} />
        </div>
      )}

      <div className="button-group" style={{ display: 'flex', justifyContent: 'center' }}>
        <input type="file" onChange={handleFileChange} style={{ display: 'none' }} id="file-input" />
        <label htmlFor="file-input" className="bottomButton2" style={{ textAlign: 'center' }}>
          <span className="buttonText2">Abrir Galería</span>
        </label>
      </div>

      <h2 className="subtitle1">Datos Propietario:</h2>
      
      <label className="label1">Nombre:</label>
      <input
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="input1"
      />
      
      <label className="label1">Apellido Materno:</label>
      <input
        placeholder="Apellido Materno"
        value={apellidoMaterno}
        onChange={(e) => setApellidoMaterno(e.target.value)}
        className="input1"
      />
      
      <label className="label1">Apellido Paterno:</label>
      <input
        placeholder="Apellido Paterno"
        value={apellidoPaterno}
        onChange={(e) => setApellidoPaterno(e.target.value)}
        className="input1"
      />
      
      <label className="label1">CI:</label>
      <input
        placeholder="CI"
        value={ci}
        onChange={(e) => setCi(e.target.value)}
        className="input1"
      />
      
      <label className="label1">NIT:</label>
      <input
        placeholder="NIT"
        value={nit}
        onChange={(e) => setNit(e.target.value)}
        className="input1"
      />
      
      <label className="label1">Celular:</label>
      <input
        placeholder="Celular"
        value={celular}
        onChange={(e) => setCelular(e.target.value)}
        className="input1"
      />
      
      <label className="label1">Correo Electrónico:</label>
      <input
        placeholder="Correo Electrónico"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        className="input1"
      />

      <label className="label1">Horas de Farmacia:</label>
      <select
        value={horasFarmacia}
        onChange={(e) => setHorasFarmacia(e.target.value)}
        className="picker1"
      >
        <option value="8h">8h</option>
        <option value="12h">12h</option>
        <option value="24h">24h</option>
      </select>
      
      <label className="label1">Tipo de Farmacia:</label>
      <select
        value={tipoFarmacia}
        onChange={(e) => setTipoFarmacia(e.target.value)}
        className="picker1"
      >
        <option value="Farmacia Privada">Farmacia Privada</option>
        <option value="Farmacia Pública">Farmacia Pública</option>
      </select>
      
      <label className="label1">Observaciones:</label>
      <input
        placeholder="OBS"
        value={obs}
        onChange={(e) => setObs(e.target.value)}
        className="input1"
      />

      <div className="checkboxContainer11">
        <div className="checkboxContainer1">
          <label className="label1">Medicamentos Controlados</label>
          <div className="checkboxWrapper1">
            <input
              type="checkbox"
              checked={medicamentosControlados === 'Si'}
              onChange={() => setMedicamentosControlados(medicamentosControlados === 'Si' ? 'No' : 'Si')}
              className="checkbox1"
            />
            <span className="checkboxLabel1">Sí</span>
          </div>
          <div className="checkboxWrapper1">
            <input
              type="checkbox"
              checked={medicamentosControlados === 'No'}
              onChange={() => setMedicamentosControlados(medicamentosControlados === 'No' ? 'Si' : 'No')}
              className="checkbox1"
            />
            <span className="checkboxLabel1">No</span>
          </div>
        </div>
      </div>

      <div className="buttonContainer1">
        <button className="homeButton" onClick={handleMenu}>
          <span className="homeButtonText">Cancelar</span>
        </button>
        <button className="loginButton" onClick={handleSubmit}>
          <span className="loginButtonText">Registrar</span>
        </button>
      </div>
    </div>
  );
};

export default RegistroFarmacia;
