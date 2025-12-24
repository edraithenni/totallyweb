import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

const LOG_DIR = '/app/logs';

const ensureLogDir = () => {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
};

const writeLogToFile = (logs) => {
  ensureLogDir();
  
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const hourStr = now.getHours().toString().padStart(2, '0');
  
  const logFile = path.join(LOG_DIR, `frontend-${dateStr}.log`);
  const hourlyFile = path.join(LOG_DIR, `frontend-${dateStr}-${hourStr}.log`);
  
  const logLines = logs.map(log => {
    const time = new Date(log.timestamp).toLocaleTimeString();
    const level = log.level.toUpperCase().padEnd(5);
    const path = log.path ? ` [${log.path}]` : '';
    return `${time} ${level}${path} ${log.message}`;
  }).join('\n') + '\n';
  
  try {
    fs.appendFileSync(logFile, logLines);
    fs.appendFileSync(hourlyFile, logLines);
  } catch (error) {
    console.error('Failed to write log file:', error);
  }
  
  return logs.length;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { logs } = req.body;
    
    if (!Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ error: 'No logs provided' });
    }
    
    const count = writeLogToFile(logs);
    
    res.status(200).json({ 
      success: true, 
      count,
      received: logs.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing logs:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}