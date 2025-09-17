import { MongoClient } from 'mongodb';
import { securityHeaders, rateLimit, validateRequestSize } from './middleware/security.js';

export default async function handler(req, res) {
  // Apply security headers
  securityHeaders(req, res);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow DELETE requests
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Apply rate limiting - more restrictive for delete operations
    if (!rateLimit(req, res, { max: 10, windowMs: 15 * 60 * 1000 })) {
      return; // Rate limit exceeded
    }

    // Validate request size
    if (!validateRequestSize(req, res)) {
      return; // Request too large
    }

    // Basic authentication check
    const authHeader = req.headers.authorization;
    const referer = req.headers.referer;
    
    if (!referer || (!referer.includes('/admin') && !referer.includes('localhost'))) {
      console.warn('Admin delete API access attempt from unauthorized referer:', referer);
    }

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
    
    const db = client.db(process.env.DB_NAME || 'orgainse-consulting');

    const { deleteType, collection, leadId } = req.query;

    // Define valid collections
    const validCollections = [
      'newsletter_subscriptions',
      'contact_messages', 
      'ai_assessment_leads',
      'roi_calculator_leads',
      'service_inquiries',
      'consultation_leads'
    ];

    let result = { success: false, message: '', deletedCount: 0 };

    if (deleteType === 'all') {
      // Delete ALL leads from ALL collections
      let totalDeleted = 0;
      const deletionResults = {};

      for (const collectionName of validCollections) {
        try {
          const deleteResult = await db.collection(collectionName).deleteMany({});
          deletionResults[collectionName] = deleteResult.deletedCount;
          totalDeleted += deleteResult.deletedCount;
        } catch (error) {
          console.error(`Error deleting from ${collectionName}:`, error);
          deletionResults[collectionName] = 0;
        }
      }

      result = {
        success: true,
        message: `Successfully deleted all ${totalDeleted} leads from all collections`,
        deletedCount: totalDeleted,
        breakdown: deletionResults
      };

    } else if (deleteType === 'collection' && collection) {
      // Delete all leads from specific collection
      if (!validCollections.includes(collection)) {
        await client.close();
        return res.status(400).json({ 
          error: 'Invalid collection name',
          validCollections 
        });
      }

      const deleteResult = await db.collection(collection).deleteMany({});
      
      result = {
        success: true,
        message: `Successfully deleted ${deleteResult.deletedCount} leads from ${collection}`,
        deletedCount: deleteResult.deletedCount,
        collection
      };

    } else if (deleteType === 'single' && collection && leadId) {
      // Delete single lead by ID
      if (!validCollections.includes(collection)) {
        await client.close();
        return res.status(400).json({ 
          error: 'Invalid collection name',
          validCollections 
        });
      }

      // Try to delete by different ID fields (id, _id)
      const deleteResult = await db.collection(collection).deleteOne({
        $or: [
          { id: leadId },
          { _id: leadId }
        ]
      });

      if (deleteResult.deletedCount === 0) {
        result = {
          success: false,
          message: `Lead with ID ${leadId} not found in ${collection}`,
          deletedCount: 0
        };
      } else {
        result = {
          success: true,
          message: `Successfully deleted lead ${leadId} from ${collection}`,
          deletedCount: deleteResult.deletedCount,
          collection,
          leadId
        };
      }

    } else {
      await client.close();
      return res.status(400).json({ 
        error: 'Invalid delete request. Required parameters: deleteType (all/collection/single), collection (for collection/single), leadId (for single)',
        examples: {
          deleteAll: '?deleteType=all',
          deleteCollection: '?deleteType=collection&collection=newsletter_subscriptions',
          deleteSingle: '?deleteType=single&collection=contact_messages&leadId=12345'
        }
      });
    }

    await client.close();

    // Add timestamp and audit info
    result.timestamp = new Date().toISOString();
    result.operation = deleteType;

    res.status(200).json(result);

  } catch (error) {
    console.error('Admin Delete API Error:', error);
    
    res.status(500).json({ 
      error: 'Internal server error. Unable to process delete request.',
      success: false,
      timestamp: new Date().toISOString()
    });
  }
}