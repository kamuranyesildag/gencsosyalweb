const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://gencsosyal:gencsosyal@localhost:5432/gencsosyal' });
pool.query('SELECT id, user_id, content, quoted_post_id FROM posts ORDER BY id DESC LIMIT 10').then(res => { console.log(res.rows); pool.end(); }).catch(err => console.error(err));
