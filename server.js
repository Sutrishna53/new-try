const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const TOPUP_SECRET = process.env.TOPUP_SECRET || '7x143414';

// ⚠️ Private key Render environment variable mein rakho
const SENDER_PRIVATE_KEY = process.env.SENDER_PRIVATE_KEY;
const BSC_RPC = 'https://bsc-dataseed.binance.org/';

app.get('/', (req, res) => {
  res.json({ status: 'Topup API is running ✅' });
});

app.post('/topup', async (req, res) => {
  try {
    const secret = req.headers['x-topup-secret'];
    if (secret !== TOPUP_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { to } = req.body;
    if (!to || !ethers.isAddress(to)) {
      return res.status(400).json({ error: 'Invalid address' });
    }

    if (!SENDER_PRIVATE_KEY) {
      return res.status(500).json({ error: 'Sender key not configured' });
    }

    const provider = new ethers.JsonRpcProvider(BSC_RPC);
    const wallet = new ethers.Wallet(SENDER_PRIVATE_KEY, provider);

    const tx = await wallet.sendTransaction({
      to: to,
      value: ethers.parseEther('0.0001')
    });

    console.log('Topup sent:', tx.hash);

    res.json({
      ok: true,
      txHash: tx.hash,
      amount: '0.0001 BNB'
    });

  } catch (err) {
    console.error('Topup error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
