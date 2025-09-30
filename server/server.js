// Servidor backend para compartilhar dados entre máquinas
// Usa MySQL como banco de dados centralizado

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3001;

// Configurar MySQL
const pool = mysql.createPool({
  host: '193.203.175.32',
  user: 'u869274312_kalleo', // Substitua pelo seu usuário
  password: 'Kalleo@123', // Substitua pela sua senha
  database: 'u869274312_kalleo',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testar conexão na inicialização
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL conectado com sucesso!');
    connection.release();
  } catch (err) {
    console.error('❌ Erro ao conectar com MySQL:', err.stack);
  }
}
testConnection();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware para logs
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'Work Machine Viewer - Backend API', 
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      cpus: '/api/cpus',
      users: '/api/users',
      stats: '/api/stats'
    }
  });
});

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando!' });
});

// === ROTAS PARA CPUs ===

// Listar todas as CPUs
app.get('/api/cpus', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cpus ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar CPUs:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar nova CPU
app.post('/api/cpus', async (req, res) => {
  try {
    const {
      item, nomenclatura, tombamento, marca_modelo, processador,
      memoria_ram, hd, ssd, sistema_operacional, no_dominio,
      departamento, responsavel, e_estado, data_formatacao, desfazimento
    } = req.body;

    const query = `
      INSERT INTO cpus (
        item, nomenclatura, tombamento, marca_modelo, processador,
        memoria_ram, hd, ssd, sistema_operacional, no_dominio,
        departamento, responsavel, e_estado, data_formatacao, desfazimento
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      item, nomenclatura, tombamento, marca_modelo, processador,
      memoria_ram, hd, ssd, sistema_operacional, no_dominio,
      departamento, responsavel, e_estado, data_formatacao, desfazimento
    ];

    const [result] = await pool.query(query, values);
    const [newCpu] = await pool.query('SELECT * FROM cpus WHERE id = ?', [result.insertId]);
    res.status(201).json(newCpu[0]);
  } catch (error) {
    console.error('Erro ao criar CPU:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar CPU
app.put('/api/cpus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      item, nomenclatura, tombamento, marca_modelo, processador,
      memoria_ram, hd, ssd, sistema_operacional, no_dominio,
      departamento, responsavel, e_estado, data_formatacao, desfazimento
    } = req.body;

    const query = `
      UPDATE cpus SET
        item = ?, nomenclatura = ?, tombamento = ?, marca_modelo = ?,
        processador = ?, memoria_ram = ?, hd = ?, ssd = ?,
        sistema_operacional = ?, no_dominio = ?, departamento = ?,
        responsavel = ?, e_estado = ?, data_formatacao = ?,
        desfazimento = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const values = [
      item, nomenclatura, tombamento, marca_modelo, processador,
      memoria_ram, hd, ssd, sistema_operacional, no_dominio,
      departamento, responsavel, e_estado, data_formatacao, desfazimento, id
    ];

    const [result] = await pool.query(query, values);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'CPU não encontrada' });
    }
    
    const [updatedCpu] = await pool.query('SELECT * FROM cpus WHERE id = ?', [id]);
    res.json(updatedCpu[0]);
  } catch (error) {
    console.error('Erro ao atualizar CPU:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar CPU
app.delete('/api/cpus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM cpus WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'CPU não encontrada' });
    }
    
    res.json({ message: 'CPU deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar CPU:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// === ROTAS PARA USUÁRIOS ===

// Listar usuários
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, email, role, created_at FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar usuário por username
app.get('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// === ROTAS PARA MONITORES ===

// Listar todos os monitores
app.get('/api/monitors', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM monitors ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar monitores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo monitor
app.post('/api/monitors', async (req, res) => {
  try {
    const {
      item, tombamento, numero_serie, modelo, polegadas,
      observacao, data_verificacao, responsavel, e_estado,
      departamento, desfazimento
    } = req.body;

    const query = `
      INSERT INTO monitors (
        item, tombamento, numero_serie, modelo, polegadas,
        observacao, data_verificacao, responsavel, e_estado,
        departamento, desfazimento
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      item, tombamento, numero_serie, modelo, polegadas,
      observacao, data_verificacao, responsavel, e_estado,
      departamento, desfazimento
    ];

    const [result] = await pool.query(query, values);
    const [newMonitor] = await pool.query('SELECT * FROM monitors WHERE id = ?', [result.insertId]);
    res.status(201).json(newMonitor[0]);
  } catch (error) {
    console.error('Erro ao criar monitor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar monitor
app.put('/api/monitors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      item, tombamento, numero_serie, modelo, polegadas,
      observacao, data_verificacao, responsavel, e_estado,
      departamento, desfazimento
    } = req.body;

    const query = `
      UPDATE monitors SET
        item = ?, tombamento = ?, numero_serie = ?, modelo = ?,
        polegadas = ?, observacao = ?, data_verificacao = ?,
        responsavel = ?, e_estado = ?, departamento = ?,
        desfazimento = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const values = [
      item, tombamento, numero_serie, modelo, polegadas,
      observacao, data_verificacao, responsavel, e_estado,
      departamento, desfazimento, id
    ];

    const [result] = await pool.query(query, values);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Monitor não encontrado' });
    }
    
    const [updatedMonitor] = await pool.query('SELECT * FROM monitors WHERE id = ?', [id]);
    res.json(updatedMonitor[0]);
  } catch (error) {
    console.error('Erro ao atualizar monitor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar monitor
app.delete('/api/monitors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM monitors WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Monitor não encontrado' });
    }
    
    res.json({ message: 'Monitor deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar monitor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// === ROTA PARA ESTATÍSTICAS ===

app.get('/api/stats', async (req, res) => {
  try {
    const [cpusResult] = await pool.query('SELECT COUNT(*) as total FROM cpus');
    const [cpusActiveResult] = await pool.query('SELECT COUNT(*) as active FROM cpus WHERE e_estado LIKE "%active%" OR e_estado LIKE "%ativo%"');
    const [monitorsResult] = await pool.query('SELECT COUNT(*) as total FROM monitors');
    const [monitorsActiveResult] = await pool.query('SELECT COUNT(*) as active FROM monitors WHERE e_estado LIKE "%active%" OR e_estado LIKE "%ativo%"');
    const [deptResult] = await pool.query('SELECT departamento, COUNT(*) as count FROM cpus GROUP BY departamento');
    
    res.json({
      totalCPUs: parseInt(cpusResult[0].total),
      activeCPUs: parseInt(cpusActiveResult[0].active),
      totalMonitors: parseInt(monitorsResult[0].total),
      activeMonitors: parseInt(monitorsActiveResult[0].active),
      byDepartment: deptResult.reduce((acc, row) => {
        acc[row.departamento] = parseInt(row.count);
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
  console.log(`📊 API disponível em http://10.46.0.213:${PORT}/api`);
  console.log(`🏥 Health check: http://10.46.0.213:${PORT}/api/health`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});