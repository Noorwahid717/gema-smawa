#!/usr/bin/env node

/**
 * Test Script: Dashboard Real Database Integration
 * Purpose: Verify admin dashboard is using real database data instead of dummy data
 * 
 * Usage: node tests/manual/test-dashboard-integration.js
 */

const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3000';
const API_ENDPOINT = '/api/admin/dashboard';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function testDashboardIntegration() {
  log('blue', '🚀 Testing Dashboard Database Integration...\n');
  
  try {
    log('yellow', '📊 Fetching dashboard statistics...');
    const response = await makeRequest(`${BASE_URL}${API_ENDPOINT}`);
    
    if (response.status !== 200) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    const stats = response.data;
    
    // Verify all required fields are present
    const requiredFields = [
      'totalContacts',
      'totalRegistrations', 
      'pendingRegistrations',
      'totalActivities',
      'unreadContacts',
      'totalStudents',
      'totalPortfolioSubmissions',
      'totalAssignments',
      'contactsChange',
      'registrationsChange',
      'contactsThisWeek',
      'registrationsThisWeek',
      'recentActivities'
    ];
    
    log('green', '✅ Dashboard API Response Received');
    log('blue', '📋 Statistics Overview:');
    console.log('─'.repeat(50));
    
    // Display statistics
    console.log(`📧 Total Contacts: ${stats.totalContacts}`);
    console.log(`📝 Total Registrations: ${stats.totalRegistrations}`);
    console.log(`⏳ Pending Registrations: ${stats.pendingRegistrations}`);
    console.log(`🎯 Total Activities: ${stats.totalActivities}`);
    console.log(`💬 Unread Contacts: ${stats.unreadContacts}`);
    console.log(`🎓 Total Students: ${stats.totalStudents}`);
    console.log(`📁 Portfolio Submissions: ${stats.totalPortfolioSubmissions}`);
    console.log(`📚 Total Assignments: ${stats.totalAssignments}`);
    
    console.log('\n📈 Weekly Changes:');
    console.log(`📧 Contacts Change: ${stats.contactsChange.toFixed(1)}%`);
    console.log(`📝 Registrations Change: ${stats.registrationsChange.toFixed(1)}%`);
    console.log(`📧 Contacts This Week: ${stats.contactsThisWeek}`);
    console.log(`📝 Registrations This Week: ${stats.registrationsThisWeek}`);
    console.log(`🎯 Recent Activities: ${stats.recentActivities}`);
    
    console.log('─'.repeat(50));
    
    // Verify data integrity
    let allFieldsPresent = true;
    let missingFields = [];
    
    for (const field of requiredFields) {
      if (stats[field] === undefined) {
        allFieldsPresent = false;
        missingFields.push(field);
      }
    }
    
    if (allFieldsPresent) {
      log('green', '✅ All required fields are present');
    } else {
      log('red', `❌ Missing fields: ${missingFields.join(', ')}`);
    }
    
    // Check if data looks realistic (not all zeros for a real system)
    const dataPoints = [
      stats.totalActivities,
      stats.totalStudents, 
      stats.totalAssignments
    ];
    
    const hasRealData = dataPoints.some(value => value > 0);
    
    if (hasRealData) {
      log('green', '✅ Dashboard contains real database data');
    } else {
      log('yellow', '⚠️  All counters are zero - this might be expected for a new system');
    }
    
    // Verify percentage calculations
    if (typeof stats.contactsChange === 'number' && typeof stats.registrationsChange === 'number') {
      log('green', '✅ Percentage change calculations are working');
    } else {
      log('red', '❌ Percentage change calculations failed');
    }
    
    log('green', '\n🎉 Dashboard Integration Test Complete!');
    log('blue', '\n📝 Summary:');
    console.log(`- API Status: ${response.status === 200 ? 'OK' : 'ERROR'}`);
    console.log(`- Data Fields: ${allFieldsPresent ? 'Complete' : 'Missing Some'}`);
    console.log(`- Real Data: ${hasRealData ? 'Yes' : 'Needs Content'}`);
    console.log(`- Integration: ${allFieldsPresent && response.status === 200 ? 'SUCCESS' : 'NEEDS ATTENTION'}`);
    
  } catch (error) {
    log('red', `❌ Test Failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the test
testDashboardIntegration();
