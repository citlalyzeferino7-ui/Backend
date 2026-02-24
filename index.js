const express = require('express');
const cors = require('cors');
const { pool } = require('./src/db');
const { sign, authMiddleware } = require('./src/auth');
const { router: productosRouter } = require('./src/routes/productos.routes')

const PORT = process.env.PORT || 3000
const app = express()

app.use(cors())
app.use(express.json())
app.get('/', (req, res) => {
  res.send('API OK');
})
app.use('/productos', productosRouter);

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  

  if (email !== 'admin@test.com' || password !== '1234') {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const token = sign({ email, role: 'admin' });

  return res.json({ token });
});

app.get('/privado', authMiddleware, (req, res) => {
  return res.json({
    ok: true,
    user: req.user
  })
});


app.listen(PORT, () => {
  console.log(`Servidor Corriendo en http://localhost:${PORT}`)
})

app.get('/health', async(req,res))

app.get('/health', (req, res) => {
  res.json({ok:true, service:'api'})
})

app.get('/health/db', async (req, res) => {
  try {
    const r = await pool.query('select 1 as ok');
    return res.json({ok:true, db:r.rows[0].ok})
  } catch (err) {
    console.log('DB Error', err.message)
    return res.status(500).json({ok:false, error:'DB no disponible'})
  }
})

const { errorHandler } = require('./src/middlewares/error.middleware');
app.use(errorHandler);