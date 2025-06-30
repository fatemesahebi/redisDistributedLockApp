const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');

// Create Express app
const app = express();
app.use(express.json());

// PostgreSQL setup
const pool = new Pool({
  user: 'fateme',             // ✅ your postgres username
  host: 'localhost',
  database: 'redisdistributedlock',  // ✅ your db name
  port: 5432,
});

// Redis setup (v4 client)
const redisClient = redis.createClient();

redisClient.on('error', (err) => console.error('❌ Redis error:', err));

// Connect Redis before anything else
(async () => {
  await redisClient.connect();
  console.log('✅ Redis connected');
})();

// Lock functions
async function acquireLockWithRetry(key, timeout = 5000, retryDelay = 100, maxRetries = 50) {
  for (let i = 0; i < maxRetries; i++) {
    const result = await redisClient.set(key, 'locked', {
      NX: true,
      PX: timeout,
    });
    if (result === 'OK') return true;
    await new Promise(resolve => setTimeout(resolve, retryDelay));
  }
  return false;
}

async function releaseLock(key) {
  await redisClient.del(key);
}

// Buy product endpoint
app.post('/buy/:id', async (req, res) => {
  const productId = req.params.id;
  const requestedAmount = req.body.amount;
  const lockKey = `lock:product:${productId}`;

  try {
    const lockAcquired = await acquireLockWithRetry(lockKey);
    if (!lockAcquired) {
      return res.status(423).json({ message: 'Could not acquire lock. Try again later.' });
    }

    const result = await pool.query('SELECT amount FROM products WHERE id = $1', [productId]);
    if (result.rows.length === 0) {
      await releaseLock(lockKey);
      return res.status(404).json({ message: 'Product not found' });
    }

    const currentAmount = result.rows[0].amount;
    if (currentAmount < requestedAmount) {
      await releaseLock(lockKey);
      return res.status(400).json({ message: 'Not enough stock' });
    }

    await pool.query('UPDATE products SET amount = amount - $1 WHERE id = $2', [requestedAmount, productId]);

    await releaseLock(lockKey);
    res.json({ message: 'Purchase successful' });

  } catch (err) {
    await releaseLock(lockKey);
    console.error('❌ Error:', err);
    res.status(500).json({ message: 'Internal error' });
  }
});

// Start server
app.listen(3000, () => {
  console.log('🚀 Server running on http://localhost:3000');
});
