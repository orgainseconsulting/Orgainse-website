import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  try {
    const testId = uuidv4();
    
    res.status(200).json({
      success: true,
      test_id: testId,
      message: "UUID import working correctly"
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}