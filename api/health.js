export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Orgainse Consulting API',
    version: '2.0.0'
  });
}