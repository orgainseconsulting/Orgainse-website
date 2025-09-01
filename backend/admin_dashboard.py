#!/usr/bin/env python3
"""
Orgainse Consulting - Admin Dashboard
Simple script to view captured leads from MongoDB
"""

import os
from pymongo import MongoClient
from datetime import datetime
import json

def get_database():
    """Get MongoDB database connection"""
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = MongoClient(mongo_url)
    db = client['orgainse_consulting']
    return db, client

def display_newsletter_leads():
    """Display all newsletter subscribers"""
    db, client = get_database()
    collection = db['newsletter']
    
    leads = list(collection.find().sort('timestamp', -1))
    
    print("📧 NEWSLETTER SUBSCRIBERS")
    print("=" * 60)
    
    if not leads:
        print("📝 No newsletter subscribers yet")
        return
    
    print(f"📊 Total Subscribers: {len(leads)}")
    print("-" * 60)
    
    for i, lead in enumerate(leads, 1):
        timestamp = lead.get('timestamp', 'Unknown')
        if isinstance(timestamp, datetime):
            timestamp = timestamp.strftime('%Y-%m-%d %H:%M:%S')
        
        print(f"{i:2d}. Email: {lead.get('email', 'N/A')}")
        print(f"    ID: {lead.get('id', 'N/A')}")
        print(f"    Date: {timestamp}")
        print(f"    Status: {lead.get('status', 'N/A')}")
        print("-" * 40)
    
    client.close()

def display_all_collections():
    """Display data from all collections"""
    db, client = get_database()
    
    collections = ['newsletter', 'contacts', 'leads', 'assessments', 'consultations']
    
    print("🎯 ORGAINSE CONSULTING - LEAD DASHBOARD")
    print("=" * 70)
    
    for collection_name in collections:
        collection = db[collection_name]
        count = collection.count_documents({})
        
        print(f"📊 {collection_name.upper()}: {count} entries")
        
        if count > 0:
            recent = list(collection.find().sort('timestamp', -1).limit(3))
            for entry in recent:
                email = entry.get('email', 'N/A')
                timestamp = entry.get('timestamp', 'N/A')
                if isinstance(timestamp, datetime):
                    timestamp = timestamp.strftime('%Y-%m-%d %H:%M')
                print(f"   • {email} - {timestamp}")
        print()
    
    client.close()

def export_leads_to_csv():
    """Export newsletter leads to CSV file"""
    import csv
    db, client = get_database()
    collection = db['newsletter']
    
    leads = list(collection.find().sort('timestamp', -1))
    
    if not leads:
        print("📝 No leads to export")
        return
    
    filename = f"orgainse_leads_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['id', 'email', 'timestamp', 'status']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        writer.writeheader()
        for lead in leads:
            timestamp = lead.get('timestamp', '')
            if isinstance(timestamp, datetime):
                timestamp = timestamp.strftime('%Y-%m-%d %H:%M:%S')
            
            writer.writerow({
                'id': lead.get('id', ''),
                'email': lead.get('email', ''),
                'timestamp': timestamp,
                'status': lead.get('status', '')
            })
    
    print(f"✅ Exported {len(leads)} leads to {filename}")
    client.close()

def main():
    """Main dashboard function"""
    print("🎯 ORGAINSE CONSULTING - ADMIN DASHBOARD")
    print("=" * 50)
    print("1. View Newsletter Subscribers")
    print("2. View All Collections Summary")
    print("3. Export Leads to CSV")
    print("-" * 50)
    
    choice = input("Enter choice (1-3): ").strip()
    
    if choice == '1':
        display_newsletter_leads()
    elif choice == '2':
        display_all_collections()
    elif choice == '3':
        export_leads_to_csv()
    else:
        print("Invalid choice")

if __name__ == "__main__":
    main()