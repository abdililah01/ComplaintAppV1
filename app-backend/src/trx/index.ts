// ➊ Load env first (only once)
// files: src/trx/index.ts
import '../common/load-env';

// ➋ Then bring in the rest
import app from './app';

const PORT = Number(process.env.PORT || process.env.TRX_API_PORT || 3000);

app.listen(PORT, () => {
  console.log(`🚀 Transactional API listening on http://localhost:${PORT}`);
});
